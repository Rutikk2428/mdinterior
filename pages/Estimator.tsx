import React, { useState } from 'react';
import { useData, useToast } from '../store';
import { Search, Plus, Minus, Trash2, FileText, ArrowRight, ShoppingBag, Loader2, PackageX, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Item } from '../types';

const Estimator: React.FC = () => {
  const { items, loading, cart, addToCart, removeFromCart, updateCartQuantity, customerName, setCustomerName, cartTotal, clearCart } = useData();
  const { addToast } = useToast();
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddToCart = (item: Item) => {
    addToCart(item, 1);
    addToast(`${item.name} added to estimate`);
  };

  const handleRemoveFromCart = (itemId: string, name: string) => {
    removeFromCart(itemId);
    addToast(`${name} removed`, 'info');
  };

  const handleClearCart = () => {
    console.log("[Estimator] Clear Cart Clicked");
    // Removed window.confirm to ensure immediate execution
    clearCart();
    setSearch(''); // Reset search filter to show all items
    addToast('Estimate cleared', 'info');
  };

  return (
    // Mobile: Flex Column (Natural Scroll), Desktop: Grid with Fixed Height (Internal Scroll)
    <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8 lg:h-[calc(100vh-140px)]">
      
      {/* LEFT: Item Selection */}
      <div className="order-2 lg:order-1 lg:col-span-8 flex flex-col gap-5 lg:h-full">
        {/* Search Bar */}
        <div className="relative group z-10">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="text-gray-400 group-focus-within:text-black transition-colors" size={20} />
          </div>
          <input 
            type="text" 
            placeholder="Search items collection..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 text-gray-900 rounded-xl focus:ring-1 focus:ring-black focus:border-black transition-all shadow-sm placeholder:text-gray-400 outline-none text-base"
          />
          {search && (
            <button 
              onClick={() => setSearch('')}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-black cursor-pointer z-10"
              title="Clear Search"
            >
              <PackageX size={16} />
            </button>
          )}
        </div>

        {/* Scrollable Grid */}
        <div className="flex-1 lg:overflow-y-auto lg:pr-2 custom-scrollbar min-h-[300px] pb-4">
          {loading ? (
            <div className="flex h-64 items-center justify-center text-gray-400 font-light">
               <Loader2 className="animate-spin mr-3" size={24} /> 
               <span className="tracking-wide">Loading collection...</span>
            </div>
          ) : (
            <>
              {/* Grid Layout */}
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredItems.map(item => {
                  const cartItem = cart.find(ci => ci.id === item.id);
                  const quantity = cartItem ? cartItem.quantity : 0;

                  return (
                    <div 
                      key={item.id} 
                      onClick={() => !quantity && handleAddToCart(item)}
                      className={`group cursor-pointer bg-white rounded-xl p-5 border shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between h-full relative overflow-hidden ${quantity > 0 ? 'border-black ring-1 ring-black shadow-md' : 'border-gray-100 hover:border-gray-200'}`}
                    >
                      <div className="mb-4">
                        <h3 className="text-sm font-medium text-gray-900 leading-snug line-clamp-2 min-h-[2.5em] mb-2 group-hover:text-black">
                          {item.name}
                        </h3>
                        <div className="flex items-baseline gap-1">
                           <span className="text-xs text-gray-400 font-medium">₹</span>
                           <span className="font-serif text-2xl text-gray-900 font-medium tracking-tight">
                             {item.price.toLocaleString()}
                           </span>
                        </div>
                      </div>
                      
                      {quantity > 0 ? (
                         <div className="w-full py-2 bg-black text-white rounded-lg flex items-center justify-between px-3 mt-auto shadow-md" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => {
                                if (quantity === 1) {
                                   handleRemoveFromCart(item.id, item.name);
                                } else {
                                   updateCartQuantity(item.id, quantity - 1);
                                }
                              }}
                              className="p-1 hover:bg-gray-700 rounded transition-colors active:scale-90"
                            >
                              <Minus size={14} strokeWidth={3} />
                            </button>
                            <span className="font-bold text-sm tabular-nums">{quantity}</span>
                            <button
                               onClick={() => updateCartQuantity(item.id, quantity + 1)}
                               className="p-1 hover:bg-gray-700 rounded transition-colors active:scale-90"
                            >
                              <Plus size={14} strokeWidth={3} />
                            </button>
                         </div>
                      ) : (
                        <button 
                          className="w-full py-2.5 bg-black text-white text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-gray-800 active:scale-95 transition-all flex items-center justify-center gap-2 mt-auto shadow-md"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToCart(item);
                          }}
                        >
                           <Plus size={12} strokeWidth={3} /> Add
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
              
              {filteredItems.length === 0 && (
                <div className="h-64 flex flex-col items-center justify-center text-gray-300 border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50/50 mt-4">
                    <PackageX size={48} className="mb-4 opacity-20" />
                    <p className="text-sm font-medium uppercase tracking-widest text-gray-400">No matching items</p>
                    <button 
                      onClick={() => setSearch('')}
                      className="mt-4 text-xs font-bold text-black border-b border-black pb-0.5 hover:opacity-70"
                    >
                      Clear Search
                    </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* RIGHT: Estimate Cart */}
      <div className="order-1 lg:order-2 lg:col-span-4 flex flex-col lg:h-full">
        <div className="bg-white rounded-2xl shadow-[0_10px_40px_-15px_rgba(0,0,0,0.1)] border border-gray-100 flex flex-col lg:h-full overflow-hidden">
          
          {/* Cart Header */}
          <div className="p-6 bg-black text-white relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10">
               <FileText size={100} />
             </div>
             <div className="relative z-10">
               <div className="flex items-center justify-between mb-6">
                 <div className="flex items-center gap-2">
                   <ShoppingBag size={20} className="text-gray-300" />
                   <h2 className="text-sm font-bold tracking-widest uppercase">Current Estimate</h2>
                 </div>
                 {cart.length > 0 && (
                   <button 
                    onClick={handleClearCart}
                    className="flex items-center gap-1 text-[10px] bg-white/10 hover:bg-white/20 text-white px-2 py-1 rounded transition-colors"
                   >
                     <Trash2 size={12} /> Clear All
                   </button>
                 )}
               </div>
               
               <div className="space-y-2">
                 <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Client Reference</label>
                 <input 
                  type="text" 
                  placeholder="Enter Client Name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-white/10 border border-white/10 text-white placeholder-gray-500 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-white focus:bg-white/20 transition-all font-serif"
                 />
               </div>
             </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 lg:overflow-y-auto p-2 space-y-1 bg-gray-50/50">
            {cart.length === 0 ? (
              <div className="h-48 lg:h-full flex flex-col items-center justify-center text-center p-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                   <ShoppingBag size={24} className="text-gray-300" />
                </div>
                <h3 className="text-gray-900 font-serif font-medium mb-1">Your cart is empty</h3>
                <p className="text-xs text-gray-400 max-w-[200px]">Select items from the inventory to build your estimate.</p>
              </div>
            ) : (
              <div className="space-y-2 p-2">
                {cart.map(item => (
                  <div key={item.id} className="group bg-white p-3 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wide leading-relaxed pr-2">{item.name}</h4>
                      <button 
                        onClick={() => handleRemoveFromCart(item.id, item.name)}
                        className="text-gray-300 hover:text-red-500 transition-colors p-1 -mr-1"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    
                    <div className="flex items-end justify-between">
                      <p className="text-[10px] text-gray-500 font-serif">₹{item.price.toLocaleString()} unit</p>
                      
                      <div className="flex items-center gap-3">
                        <div className="flex items-center bg-gray-50 rounded-lg border border-gray-200 h-7">
                          <button 
                            onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                            className="px-2 hover:bg-gray-200 text-gray-500 hover:text-black transition-colors h-full rounded-l-lg"
                          >
                            <Minus size={10} />
                          </button>
                          <span className="text-xs font-bold w-6 text-center">{item.quantity}</span>
                          <button 
                            onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                            className="px-2 hover:bg-gray-200 text-gray-500 hover:text-black transition-colors h-full rounded-r-lg"
                          >
                            <Plus size={10} />
                          </button>
                        </div>
                        
                        <div className="text-right min-w-[70px]">
                          <span className="block font-serif font-bold text-gray-900 text-sm">
                            ₹{(item.price * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cart Footer */}
          <div className="p-6 bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.02)] z-10">
            <div className="flex justify-between items-end mb-6">
              <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Total Amount</span>
              <span className="text-3xl font-serif font-bold text-black tracking-tight">
                ₹{cartTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            
            <button
              onClick={() => navigate('/preview')}
              disabled={cart.length === 0 || !customerName}
              className={`w-full py-4 rounded-xl font-bold text-xs uppercase tracking-[0.15em] flex items-center justify-center gap-2 transition-all duration-300 ${
                cart.length === 0 || !customerName 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-black text-white hover:bg-gray-800 hover:shadow-lg hover:-translate-y-0.5'
              }`}
            >
              Generate PDF Estimate <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Estimator;