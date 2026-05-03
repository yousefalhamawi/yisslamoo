
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
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useAnalytics } from '../../hooks/useAnalytics';
import { cn } from '../../utils/cn';

const CATEGORY_DATA = [
  { name: 'هدايا نسائية', value: 45 },
  { name: 'هدايا رجالية', value: 25 },
  { name: 'صناديق المناسبات', value: 30 },
];

const COLORS = ['#4F46E5', '#3B82F6', '#8B5CF6'];

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
    { title: 'إجمالي الإيرادات', value: `${stats.totalRevenue.toLocaleString('ar-SA')} ل.س`, trend: stats.revenueTrend > 0 ? 'up' : 'down', trendValue: `${Math.abs(stats.revenueTrend)}٪`, icon: DollarSign, color: 'bg-indigo-600' },
    { title: 'متوسط قيمة الطلب', value: `${stats.averageOrderValue.toLocaleString('ar-SA')} ل.س`, trend: stats.aovTrend > 0 ? 'up' : 'down', trendValue: `${Math.abs(stats.aovTrend)}٪`, icon: TrendingUp, color: 'bg-blue-500' },
    { title: 'معدل التحويل', value: `${stats.conversionRate}٪`, trend: stats.conversionTrend > 0 ? 'up' : 'down', trendValue: `${Math.abs(stats.conversionTrend)}٪`, icon: ShoppingBag, color: 'bg-violet-500' },
    { title: 'العملاء الجدد', value: stats.newCustomers.toString(), trend: stats.customersTrend > 0 ? 'up' : 'down', trendValue: `${Math.abs(stats.customersTrend)}٪`, icon: Users, color: 'bg-emerald-500' },
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
            <span>١ مارس ٢٠٢٦ - ٣١ مارس ٢٠٢٦</span>
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
              <div className={cn(
                "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full",
                stat.trend === 'up' ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
              )}>
                {stat.trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {stat.trendValue}
              </div>
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

        {/* Category Distribution */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="font-black text-slate-900 text-lg mb-8">توزيع المبيعات حسب التصنيف</h3>
          <div className="h-[350px] flex flex-col md:flex-row items-center">
            <div className="flex-1 h-full w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={CATEGORY_DATA}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {CATEGORY_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-4 w-full md:w-48">
              {CATEGORY_DATA.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[CATEGORY_DATA.indexOf(item)] }} />
                    <span className="text-sm font-bold text-slate-600">{item.name}</span>
                  </div>
                  <span className="text-sm font-black text-slate-900">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
