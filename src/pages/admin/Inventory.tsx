
import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  AlertTriangle, 
  CheckCircle2,
  RefreshCw,
  Edit2,
  Loader2,
  X
} from 'lucide-react';
import { useProducts } from '../../hooks/useProducts';
import { Product } from '../../types/index';

const InventoryPage: React.FC = () => {
  const { products, loading, updateProduct, refresh } = useProducts();
  const [searchQuery, setSearchQuery] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newStock, setNewStock] = useState<number>(0);

  const filteredInventory = products.filter(item => {
    const name = item.name || '';
    const id = item.id ? item.id.toString() : '';
    const query = searchQuery.toLowerCase();
    
    return name.toLowerCase().includes(query) || 
           id.includes(searchQuery);
  });

  const handleUpdateStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      await updateProduct(editingProduct.id, { stock: newStock });
      setEditingProduct(null);
    }
  };

  if (loading && products.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  const totalStock = products.reduce((acc, p) => acc + p.stock, 0);
  const lowStockCount = products.filter(p => p.stock > 0 && p.stock <= 10).length;
  const outOfStockCount = products.filter(p => p.stock === 0).length;
  const healthyStockCount = products.filter(p => p.stock > 10).length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900">إدارة المخزون</h1>
          <p className="text-slate-500 font-bold text-sm">تتبع كميات المنتجات وتنبيهات النقص.</p>
        </div>
        <button 
          onClick={refresh}
          className="bg-white border border-slate-200 text-slate-700 px-6 py-3 rounded-xl font-black text-sm shadow-sm hover:bg-slate-50 transition-all flex items-center gap-2"
        >
          <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          تحديث المخزون
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-1">إجمالي القطع</p>
          <p className="text-2xl font-black text-slate-900">{totalStock.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-1 text-amber-600">مخزون منخفض</p>
          <p className="text-2xl font-black text-slate-900">{lowStockCount}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-1 text-red-600">نفذت الكمية</p>
          <p className="text-2xl font-black text-slate-900">{outOfStockCount}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-1 text-emerald-600">حالة جيدة</p>
          <p className="text-2xl font-black text-slate-900">{healthyStockCount}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row gap-4 justify-between">
          <div className="relative flex-1">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="البحث برقم SKU أو اسم المنتج..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pr-11 pl-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 flex items-center gap-2">
              <Filter className="w-4 h-4" />
              تصفية
            </button>
            <button className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4" />
              ترتيب
            </button>
          </div>
        </div>

        <table className="w-full text-right">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-xs font-black uppercase tracking-wider">
              <th className="px-6 py-4">المنتج</th>
              <th className="px-6 py-4">SKU</th>
              <th className="px-6 py-4">الكمية الحالية</th>
              <th className="px-6 py-4">الحد الأدنى</th>
              <th className="px-6 py-4">الحالة</th>
              <th className="px-6 py-4">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredInventory.map((item) => {
              const status = item.stock === 0 ? 'out' : item.stock <= 10 ? 'low' : 'ok';
              return (
                <tr key={item.id} className="hover:bg-slate-50 transition-all">
                  <td className="px-6 py-4">
                    <span className="text-sm font-black text-slate-900">{item.name}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-bold text-slate-400">SKU-{item.id}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "text-sm font-black",
                      status !== 'ok' ? "text-amber-600" : "text-slate-700"
                    )}>
                      {item.stock} قطعة
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-slate-500">10 قطعة</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 w-fit",
                      status === 'ok' ? "bg-emerald-50 text-emerald-600" : 
                      status === 'low' ? "bg-amber-50 text-amber-600" : "bg-red-50 text-red-600"
                    )}>
                      {status === 'ok' ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                      {status === 'ok' ? 'متوفر' : status === 'low' ? 'منخفض' : 'نافذ'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => {
                        setEditingProduct(item);
                        setNewStock(item.stock);
                      }}
                      className="p-2 hover:bg-indigo-50 rounded-lg text-slate-400 hover:text-indigo-600 transition-all"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Edit Stock Modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-lg font-black text-slate-900">تحديث المخزون</h3>
              <button onClick={() => setEditingProduct(null)} className="p-2 hover:bg-white rounded-xl text-slate-400 transition-all shadow-sm">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpdateStock} className="p-6 space-y-4">
              <div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-1">المنتج</p>
                <p className="text-sm font-black text-slate-900">{editingProduct.name}</p>
              </div>
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">الكمية الجديدة</label>
                <input 
                  type="number"
                  required
                  min="0"
                  value={newStock}
                  onChange={(e) => setNewStock(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
              <div className="pt-4">
                <button 
                  type="submit"
                  className="w-full bg-indigo-600 text-white py-3 rounded-xl font-black text-sm shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all"
                >
                  تحديث الكمية
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}

export default InventoryPage;
