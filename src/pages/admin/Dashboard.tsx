
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  ShoppingBag, 
  Package, 
  Users, 
  AlertTriangle, 
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  Eye,
  Loader2,
  RefreshCcw,
  Search,
  Plus,
  X,
  CheckCircle2,
  Clock,
  ArrowLeft
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { useDashboard } from '../../hooks/useDashboard';
import { dashboardService } from '../../services/dashboardService';
import { cn } from '../../utils/cn';

const StatCard = ({ title, value, trend, trendValue, icon: Icon, color }: any) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"
  >
    <div className="flex justify-between items-start mb-4">
      <div className={cn("p-3 rounded-xl", color)}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className={cn(
        "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full",
        trend === 'up' ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
      )}>
        {trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
        {trendValue}%
      </div>
    </div>
    <h3 className="text-slate-500 text-sm font-bold mb-1">{title}</h3>
    <p className="text-2xl font-black text-slate-900">{value}</p>
  </motion.div>
);

const Dashboard: React.FC = () => {
  const { 
    stats, 
    chartData, 
    topProducts, 
    recentOrders,
    loading, 
    error,
    chartRange, 
    setChartRange, 
    refresh 
  } = useDashboard();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [showAddProduct, setShowAddProduct] = React.useState(false);
  const [newProduct, setNewProduct] = React.useState({ name: '', price: '', description: '' });
  const [isSaving, setIsSaving] = React.useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refresh();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const filteredOrders = (recentOrders || []).filter(order => {
    const orderId = order.id || '';
    const customerName = order.customerName || '';
    const query = searchQuery.toLowerCase();
    
    return orderId.toLowerCase().includes(query) ||
           customerName.toLowerCase().includes(query);
  });

  const handleAddProduct = async () => {
    // Quick-add from dashboard not implemented — redirect to Products page instead
    setShowAddProduct(false);
  };

  if (loading && !isRefreshing) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center" dir="rtl">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-600 mb-4">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-slate-900 mb-2">حدث خطأ أثناء جلب البيانات</h2>
        <p className="text-slate-500 font-bold mb-6 max-w-md">{error}</p>
        <button 
          onClick={handleRefresh}
          className="bg-indigo-600 text-white px-8 py-2.5 rounded-xl font-black text-sm shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center gap-2"
        >
          <RefreshCcw className="w-4 h-4" />
          إعادة المحاولة
        </button>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 mb-2">مرحباً بك، أدمن يسلمو 👋</h1>
          <p className="text-slate-500 font-bold">إليك نظرة عامة على أداء متجرك اليوم.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className={cn(
              "p-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-all",
              isRefreshing && "animate-spin"
            )}
          >
            <RefreshCcw className="w-5 h-5" />
          </button>
          
          <button 
            onClick={() => setShowAddProduct(true)}
            className="flex-1 md:flex-none bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-black text-sm shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            إضافة منتج
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="إجمالي المبيعات" 
          value={`${stats.totalSales.toLocaleString('ar-SA')} ل.س`} 
          trend={stats.salesGrowth > 0 ? 'up' : 'down'} 
          trendValue={Math.abs(stats.salesGrowth)} 
          icon={DollarSign} 
          color="bg-indigo-600" 
        />
        <StatCard 
          title="إجمالي الطلبات" 
          value={stats.totalOrders.toLocaleString('ar-SA')} 
          trend={stats.ordersGrowth > 0 ? 'up' : 'down'} 
          trendValue={Math.abs(stats.ordersGrowth)} 
          icon={ShoppingBag} 
          color="bg-blue-500" 
        />
        <StatCard 
          title="إجمالي العملاء" 
          value={stats.totalCustomers.toLocaleString('ar-SA')} 
          trend={stats.customersGrowth > 0 ? 'up' : 'down'} 
          trendValue={Math.abs(stats.customersGrowth)} 
          icon={Users} 
          color="bg-violet-500" 
        />
        <StatCard 
          title="إجمالي المنتجات" 
          value={stats.totalProducts.toLocaleString('ar-SA')} 
          trend={stats.productsGrowth > 0 ? 'up' : 'down'} 
          trendValue={Math.abs(stats.productsGrowth)} 
          icon={Package} 
          color="bg-emerald-500" 
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-black text-slate-900 text-lg">تحليلات المبيعات</h3>
            <div className="flex bg-slate-100 p-1 rounded-xl">
              {[
                { label: '٧ أيام', value: '7d' },
                { label: '٣٠ يوم', value: '30d' },
                { label: 'سنة', value: '1y' },
              ].map(range => (
                <button 
                  key={range.value}
                  onClick={() => setChartRange(range.value)}
                  className={cn(
                    "px-4 py-1.5 rounded-lg text-xs font-black transition-all",
                    chartRange === range.value ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                  )}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 600 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 600 }} 
                  tickFormatter={(value) => `${(value / 1000).toLocaleString()}K`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  itemStyle={{ color: '#4F46E5', fontWeight: 700 }}
                  formatter={(value: any) => [`${value.toLocaleString()} ل.س`, 'المبيعات']}
                />
                <Area type="monotone" dataKey="sales" stroke="#4F46E5" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-black text-slate-900 text-lg mb-8">أفضل المنتجات مبيعاً</h3>
          <div className="space-y-6">
            {topProducts.length > 0 ? (
              topProducts.map(product => (
                <div key={product.id} className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-100 rounded-xl overflow-hidden shrink-0">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-black text-slate-900 truncate max-w-[120px]">{product.name}</p>
                    <p className="text-xs text-slate-500 font-bold">{product.ordersCount} طلب</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-indigo-600">{product.revenue.toLocaleString()} ل.س</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-slate-400 font-bold">
                لا توجد بيانات حالياً
              </div>
            )}
          </div>
          <button className="w-full mt-8 py-3 border border-slate-100 rounded-xl text-slate-500 text-sm font-bold hover:bg-slate-50 transition-all">عرض كل المنتجات</button>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h3 className="font-black text-slate-900 text-lg">آخر الطلبات</h3>
          <div className="relative w-full md:w-64">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="ابحث عن طلب..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-10 pl-4 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs font-black uppercase tracking-wider">
                <th className="px-6 py-4">رقم الطلب</th>
                <th className="px-6 py-4">العميل</th>
                <th className="px-6 py-4">التاريخ</th>
                <th className="px-6 py-4">الإجمالي</th>
                <th className="px-6 py-4">الحالة</th>
                <th className="px-6 py-4">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {filteredOrders.length > 0 ? (
                filteredOrders.slice(0, 10).map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50 transition-all group">
                    <td className="px-6 py-4 font-black text-slate-900 text-sm">{order.id}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 text-xs font-black">
                          {order.customerName ? order.customerName[0] : '?'}
                        </div>
                        <span className="text-sm font-bold text-slate-700">{order.customerName || 'عميل مجهول'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 font-medium">
                      {order.date ? new Date(order.date).toLocaleDateString('ar-SA') : '-'}
                    </td>
                    <td className="px-6 py-4 font-black text-slate-900 text-sm">
                      {(order.total || 0).toLocaleString()} ل.س
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 w-fit",
                        order.status === 'new' ? "bg-blue-50 text-blue-600" :
                        order.status === 'processing' ? "bg-amber-50 text-amber-600" :
                        "bg-emerald-50 text-emerald-600"
                      )}>
                        {order.status === 'new' ? <Clock className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                        {order.status === 'new' ? 'جديد' : order.status === 'processing' ? 'قيد التنفيذ' : 'تم الشحن'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button className="p-2 hover:bg-indigo-50 rounded-lg text-slate-400 hover:text-indigo-600 transition-all">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-all">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center text-slate-400 font-bold">
                    لا توجد نتائج للبحث...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal */}
      <AnimatePresence>
        {showAddProduct && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddProduct(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="text-xl font-black text-slate-900">إضافة منتج جديد</h3>
                <button 
                  onClick={() => setShowAddProduct(false)}
                  className="p-2 hover:bg-slate-200 rounded-full transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
                <div className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-black text-slate-700">اسم المنتج</label>
                    <input 
                      type="text" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20" 
                      placeholder="مثلاً: صندوق الهدايا الفاخر"
                      value={newProduct.name}
                      onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-black text-slate-700">السعر (ل.س)</label>
                    <input 
                      type="number" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20" 
                      placeholder="٠"
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-black text-slate-700">الوصف</label>
                  <textarea 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 h-32" 
                    placeholder="اكتب وصفاً للمنتج..."
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  ></textarea>
                </div>
                <div className="flex justify-end gap-4 pt-4">
                  <button 
                    onClick={() => setShowAddProduct(false)}
                    className="px-6 py-3 text-sm font-black text-slate-500 hover:text-slate-700 transition-all"
                    disabled={isSaving}
                  >
                    إلغاء
                  </button>
                  <button 
                    onClick={handleAddProduct}
                    disabled={isSaving}
                    className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-black text-sm shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center gap-2"
                  >
                    {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                    حفظ المنتج
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
