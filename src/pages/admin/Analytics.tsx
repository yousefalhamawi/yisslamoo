
import React from 'react';
import { 
  TrendingUp, 
  ShoppingBag, 
  Users, 
  DollarSign,
  Calendar,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  Loader2
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
  Bar,
} from 'recharts';
import { useAnalytics } from '../../hooks/useAnalytics';
import { cn } from '../../utils/cn';

const AnalyticsPage: React.FC = () => {
  const { stats, salesData, loading } = useAnalytics();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (!stats) return null;

  const statsCards = [
    { title: 'إجمالي الإيرادات', value: `${stats.totalRevenue.toLocaleString('ar-SA')} ل.س`, trend: stats.revenueTrend, icon: DollarSign, color: 'bg-indigo-600' },
    { title: 'متوسط قيمة الطلب', value: `${stats.averageOrderValue.toLocaleString('ar-SA')} ل.س`, trend: stats.aovTrend, icon: TrendingUp, color: 'bg-blue-500' },
    { title: 'معدل التحويل', value: `${stats.conversionRate}٪`, trend: stats.conversionTrend, icon: ShoppingBag, color: 'bg-violet-500' },
    { title: 'العملاء الجدد', value: stats.newCustomers.toString(), trend: stats.customersTrend, icon: Users, color: 'bg-emerald-500' },
  ];

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900 mb-2">التحليلات والتقارير</h1>
          <p className="text-slate-500 font-bold">نظرة عميقة على أداء متجرك ونمو أعمالك.</p>
        </div>
        <div className="flex gap-3">
          <div className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 flex items-center gap-2 text-sm font-bold text-slate-600">
            <Calendar className="w-4 h-4" />
            <span>آخر ٧ أيام</span>
          </div>
          <button className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-black text-sm shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center gap-2">
            <Download className="w-4 h-4" />
            تصدير البيانات
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat) => (
          <div key={stat.title} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className={cn("p-3 rounded-xl", stat.color)}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              {stat.trend !== 0 && (
                <div className={cn(
                  "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full",
                  stat.trend > 0 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                )}>
                  {stat.trend > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {Math.abs(stat.trend)}٪
                </div>
              )}
            </div>
            <h3 className="text-slate-500 text-sm font-bold mb-1">{stat.title}</h3>
            <p className="text-2xl font-black text-slate-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-black text-slate-900 text-lg">نمو الإيرادات</h3>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-black">يومي</button>
              <button className="px-3 py-1.5 text-slate-400 rounded-lg text-xs font-black hover:bg-slate-50">شهري</button>
            </div>
          </div>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12, fontWeight: 600 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12, fontWeight: 600 }} tickFormatter={(value) => `${value / 1000000}M`} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                <Area type="monotone" dataKey="sales" stroke="#4F46E5" strokeWidth={4} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution is intentionally omitted until category-level order data is available. */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="font-black text-slate-900 text-lg mb-3">توزيع المبيعات حسب التصنيف</h3>
          <p className="text-sm font-bold text-slate-400 leading-relaxed">
            سيظهر هذا التقرير عندما تتوفر بيانات تصنيفات فعلية ضمن عناصر الطلبات.
          </p>
          <div className="h-[290px] flex items-center justify-center text-slate-300">
            <ShoppingBag className="w-16 h-16" strokeWidth={1.25} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
