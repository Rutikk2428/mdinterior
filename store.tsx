import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User, Item, CartItem } from './types';
import { MOCK_USERS } from './constants';

// --- Toast Context ---
export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (message: string, type?: ToastType) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
};

// --- Auth Context ---
interface AuthContextType {
  user: User | null;
  login: (username: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('md_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (username: string) => {
    const foundUser = MOCK_USERS.find(u => u.username === username);
    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem('md_user', JSON.stringify(foundUser));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('md_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

// --- Data Context (Items & Estimate Cart) ---
interface DataContextType {
  items: Item[];
  loading: boolean;
  refreshItems: () => Promise<void>;
  addItem: (item: Omit<Item, 'id'>) => Promise<boolean>;
  updateItem: (item: Item) => Promise<boolean>;
  deleteItem: (id: string) => Promise<{ success: boolean; message: string }>;
  cart: CartItem[];
  addToCart: (item: Item, quantity: number) => void;
  removeFromCart: (itemId: string) => void;
  updateCartQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  customerName: string;
  setCustomerName: (name: string) => void;
  cartTotal: number;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState('');

  // Initial Data Fetch from API
  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      console.log("[Store] Fetching items...");
      const response = await fetch('https://mdinteriorchoice.com/api/items');
      if (response.ok) {
        const result = await response.json();
        // console.log("[Store] Raw API Response:", result);
        
        // Handle different API response structures
        let dataArray: any[] = [];
        if (Array.isArray(result)) {
          dataArray = result;
        } else if (result && result.data && Array.isArray(result.data)) {
          dataArray = result.data; // Laravel/standard pagination wrapper
        } else if (result && result.items && Array.isArray(result.items)) {
          dataArray = result.items;
        }

        // Format data safely
        // FIXED: Handle ID being 0 correctly (0 || 'str' evaluates to 'str')
        const formattedData = dataArray.map((i: any) => {
          const rawId = i.id !== undefined && i.id !== null ? i.id : i._id;
          const finalId = rawId !== undefined && rawId !== null ? String(rawId) : `temp_${Math.random().toString(36).substring(7)}`;

          return {
            ...i,
            id: finalId, 
            price: Number(i.price) || 0
          };
        });
        
        // console.log("[Store] Processed Items:", formattedData);
        setItems(formattedData);
      } else {
        console.error("[Store] Failed to fetch items, status:", response.status);
      }
    } catch (error) {
      console.error("[Store] Error loading items from API:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Item Management via API
  const addItem = async (newItem: Omit<Item, 'id'>) => {
    try {
      const response = await fetch('https://mdinteriorchoice.com/api/items', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(newItem)
      });

      if (response.ok) {
        await fetchItems();
        return true;
      }
      return false;
    } catch (error) {
      console.error("API Error (Add):", error);
      return false;
    }
  };

  const updateItem = async (updatedItem: Item) => {
    try {
      const response = await fetch(`https://mdinteriorchoice.com/api/items/${updatedItem.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name: updatedItem.name,
          price: updatedItem.price
        })
      });

      if (response.ok) {
        await fetchItems();
        return true;
      }
      return false;
    } catch (error) {
      console.error("API Error (Update):", error);
      return false;
    }
  };

  const deleteItem = async (id: string): Promise<{ success: boolean; message: string }> => {
    console.log(`[Store] Attempting to delete item with ID: ${id}`);
    
    // Check for temp IDs (optimistic UI artifacts) which can't be deleted from server
    if (String(id).startsWith('temp_')) {
      console.warn("[Store] Cannot delete temporary item (not saved to DB yet).");
      return { success: false, message: "Cannot delete unsaved item." };
    }

    try {
      const url = `https://mdinteriorchoice.com/api/items/${id}`;
      console.log(`[Store] DELETE Request URL: ${url}`);

      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json', // Re-adding as some servers require it
          'Accept': 'application/json'
        }
      });

      console.log(`[Store] DELETE Response Status: ${response.status}`);

      if (response.ok) {
        console.log("[Store] Delete successful, refreshing items...");
        await fetchItems();
        return { success: true, message: "Item deleted successfully" };
      }
      
      // Try to parse error message from server
      let errorMsg = `Server error (${response.status})`;
      try {
        const errorData = await response.json();
        if (errorData && errorData.message) {
          errorMsg = errorData.message;
        } else if (errorData && errorData.error) {
          errorMsg = errorData.error;
        }
      } catch (e) {
        // Fallback if not JSON
        const text = await response.text();
        if (text) errorMsg = `Server error: ${text.substring(0, 50)}...`;
      }
      
      console.error(`[Store] Delete failed: ${errorMsg}`);
      return { success: false, message: errorMsg };

    } catch (error: any) {
      console.error("[Store] API Error (Delete):", error);
      return { success: false, message: error.message || "Network error" };
    }
  };

  // Cart Management
  const addToCart = useCallback((item: Item, quantity: number) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + quantity } : i);
      }
      return [...prev, { ...item, quantity }];
    });
  }, []);

  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(i => i.id !== itemId));
  };

  const updateCartQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCart(prev => prev.map(i => i.id === itemId ? { ...i, quantity } : i));
  };

  const clearCart = () => {
    setCart([]);
    setCustomerName('');
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <DataContext.Provider value={{
      items, loading, refreshItems: fetchItems, addItem, updateItem, deleteItem,
      cart, addToCart, removeFromCart, updateCartQuantity, clearCart,
      customerName, setCustomerName, cartTotal
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error("useData must be used within DataProvider");
  return context;
};