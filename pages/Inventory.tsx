import React, { useState } from 'react';
import { useData, useToast } from '../store';
import { Plus, Trash2, Edit2, Search, X, Loader2, RefreshCw } from 'lucide-react';
import { Item } from '../types';

const Inventory: React.FC = () => {
  const { items, loading, refreshItems, addItem, updateItem, deleteItem } = useData();
  const { addToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [search, setSearch] = useState('');
  
  // Form State
  const [formData, setFormData] = useState({ name: '', price: '' });

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshItems();
    setIsRefreshing(false);
    addToast('Inventory refreshed', 'info');
  };

  const handleOpenModal = (item?: Item) => {
    if (item) {
      setEditingItem(item);
      setFormData({ 
        name: item.name, 
        price: item.price.toString()
      });
    } else {
      setEditingItem(null);
      setFormData({ name: '', price: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price) return;
    
    setIsSubmitting(true);
    let success = false;

    if (editingItem) {
      success = await updateItem({
        ...editingItem,
        name: formData.name,
        price: parseFloat(formData.price)
      });
      if (success) addToast('Item updated successfully', 'success');
    } else {
      success = await addItem({
        name: formData.name,
        price: parseFloat(formData.price)
      });
      if (success) addToast('New item added to inventory', 'success');
    }
    
    setIsSubmitting(false);

    if (success) {
      setIsModalOpen(false);
    } else {
      addToast('Operation failed. Please try again.', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    console.log("[Inventory] Delete clicked for ID:", id);
    if(window.confirm(`Are you sure you want to delete this item? (ID: ${id})`)) {
      const result = await deleteItem(id);
      if (result.success) {
        addToast(result.message, 'success');
      } else {
        // Show specific server error message to help debugging
        addToast(result.message, 'error');
      }
    }
  };

  if (loading && items.length === 0) {
    return (
      <div className="flex h-[50vh] items-center justify-center text-gray-400">
        <Loader2 className="animate-spin mr-2" /> Loading inventory...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 border-b border-gray-100 pb-8">
        <div>
          <h2 className="text-3xl font-serif font-bold text-gray-900 tracking-tight">Inventory</h2>
          <p className="text-gray-500 mt-2 text-sm max-w-md leading-relaxed">Manage your product catalog and pricing. Changes here will instantly reflect in the estimator tool.</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
           <button
            onClick={handleRefresh}
            className={`flex items-center justify-center p-3 rounded-xl border border-gray-200 text-gray-600 hover:text-black hover:border-black transition-colors ${isRefreshing ? 'opacity-50' : ''}`}
            title="Refresh List"
            disabled={isRefreshing}
          >
            <RefreshCw size={20} className={isRefreshing ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => handleOpenModal()}
            className="flex-1 flex items-center justify-center gap-2 bg-black text-white px-6 py-3 rounded-xl hover:bg-gray-800 transition-all shadow-xl hover:shadow-2xl shadow-black/10 font-bold text-sm tracking-wide uppercase"
          >
            <Plus size={18} strokeWidth={3} />
            Add Item
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Search Toolbar */}
        <div className="p-5 border-b border-gray-50 bg-white">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Filter items..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all text-sm"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[600px] border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/30">
                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em]">Product Name</th>
                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] text-right">Unit Price</th>
                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-8 py-5">
                    <span className="font-medium text-gray-900 text-sm">{item.name}</span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <span className="font-serif font-medium text-gray-900">₹{item.price.toFixed(2)}</span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-200 transform translate-x-2 md:group-hover:translate-x-0">
                      <button 
                        onClick={() => handleOpenModal(item)}
                        className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-8 py-16 text-center text-gray-400">
                    <p className="text-sm">No items found.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden transform transition-all scale-100">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-xl font-serif font-bold text-gray-900">
                {editingItem ? 'Edit Item' : 'New Item'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-black transition-colors bg-gray-50 hover:bg-gray-100 p-2 rounded-full"
                disabled={isSubmitting}
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Item Name</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-1 focus:ring-black focus:border-black outline-none transition-all disabled:opacity-50 text-sm font-medium"
                  placeholder="e.g. Teak Wood Panel"
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Price (INR)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-gray-500 font-serif">₹</span>
                  </div>
                  <input 
                    type="number" 
                    required
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={e => setFormData({...formData, price: e.target.value})}
                    className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-1 focus:ring-black focus:border-black outline-none transition-all disabled:opacity-50 text-sm font-medium"
                    placeholder="0.00"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
              <div className="pt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3.5 border border-gray-200 rounded-xl text-gray-700 font-bold text-xs uppercase tracking-wide hover:bg-gray-50 transition-colors disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3.5 bg-black text-white rounded-xl font-bold text-xs uppercase tracking-wide hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-70"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin" size={16} />
                      Saving...
                    </>
                  ) : (
                    'Save Item'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;