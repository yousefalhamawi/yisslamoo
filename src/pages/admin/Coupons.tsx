
import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Ticket, 
  Calendar, 
  Users as UsersIcon,
  Trash2,
  Edit2,
  CheckCircle2,
  Clock,
  Loader2,
  X
} from 'lucide-react';
import { useCoupons } from '../../hooks/useCoupons';
import { Coupon } from '../../types/admin';

const CouponsPage: React.FC = () => {
  const { coupons, loading, addCoupon, updateCoupon, deleteCoupon } = useCoupons();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [formData, setFormData] = useState<Partial<Coupon>>({
    code: '',
    type: 'percentage',
    value: 0,
    usageLimit: 100,
    usedCount: 0,
    expiryDate: '',
    minOrderAmount: 0,
    status: 'active'
  });

  const handleOpenModal = (coupon?: Coupon) => {
    if (coupon) {
      setEditingCoupon(coupon);
      setFormData(coupon);
    } else {
      setEditingCoupon(null);
      setFormData({
        code: '',
        type: 'percentage',
        value: 0,
        usageLimit: 100,
        usedCount: 0,
        expiryDate: '',
        minOrderAmount: 0,
        status: 'active'
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCoupon) {
      await updateCoupon(editingCoupon.id, formData);
    } else {
      await addCoupon(formData as Omit<Coupon, 'id'>);
    }
    setIsModalOpen(false);
  };

  if (loading && coupons.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  const activeCount = coupons.filter(c => c.status === 'active').length;
  const totalUsed = coupons.reduce((acc, c) => acc + c.usedCount, 0);
  const expiredCount = coupons.filter(c => c.status === 'expired').length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900">كوبونات الخصم</h1>
          <p className="text-slate-500 font-bold text-sm">أدر حملاتك التسويقية وخصوماتك من هنا.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-black text-sm shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          إنشاء كوبون جديد
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
              <Ticket className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-wider">الكوبونات النشطة</p>
              <p className="text-2xl font-black text-slate-900">{activeCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-wider">إجمالي الاستخدام</p>
              <p className="text-2xl font-black text-slate-900">{totalUsed}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-wider">كوبونات منتهية</p>
              <p className="text-2xl font-black text-slate-900">{expiredCount}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-right">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-xs font-black uppercase tracking-wider">
              <th className="px-6 py-4">الكود</th>
              <th className="px-6 py-4">الخصم</th>
              <th className="px-6 py-4">الاستخدام</th>
              <th className="px-6 py-4">تاريخ الانتهاء</th>
              <th className="px-6 py-4">الحالة</th>
              <th className="px-6 py-4">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {coupons.map((coupon) => (
              <tr key={coupon.id} className="hover:bg-slate-50 transition-all">
                <td className="px-6 py-4">
                  <span className="bg-slate-100 px-3 py-1 rounded-lg text-sm font-black text-slate-900" dir="ltr">
                    {coupon.code}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm font-black text-indigo-600">
                    {coupon.type === 'percentage' ? `${coupon.value}%` : `${coupon.value} ر.س`}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1">
                    <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-indigo-600 rounded-full" 
                        style={{ width: `${(coupon.usedCount / coupon.usageLimit) * 100}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400">
                      {coupon.usedCount} من {coupon.usageLimit}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs font-bold text-slate-500">{coupon.expiryDate}</span>
                </td>
                <td className="px-6 py-4">
                  <span className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                    coupon.status === 'active' ? "bg-emerald-50 text-emerald-600" : 
                    coupon.status === 'expired' ? "bg-red-50 text-red-600" : "bg-slate-100 text-slate-400"
                  )}>
                    {coupon.status === 'active' ? 'نشط' : coupon.status === 'expired' ? 'منتهي' : 'معطل'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleOpenModal(coupon)}
                      className="p-2 hover:bg-indigo-50 rounded-lg text-slate-400 hover:text-indigo-600 transition-all"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => deleteCoupon(coupon.id)}
                      className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-600 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-lg font-black text-slate-900">
                {editingCoupon ? 'تعديل كوبون' : 'إنشاء كوبون جديد'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white rounded-xl text-slate-400 transition-all shadow-sm">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">كود الكوبون</label>
                <input 
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  placeholder="EX: SUMMER20"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">نوع الخصم</label>
                  <select 
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value as any})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="percentage">نسبة مئوية (%)</option>
                    <option value="fixed">مبلغ ثابت (ر.س)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">قيمة الخصم</label>
                  <input 
                    type="number"
                    required
                    value={formData.value}
                    onChange={(e) => setFormData({...formData, value: Number(e.target.value)})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">حد الاستخدام</label>
                  <input 
                    type="number"
                    required
                    value={formData.usageLimit}
                    onChange={(e) => setFormData({...formData, usageLimit: Number(e.target.value)})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">تاريخ الانتهاء</label>
                  <input 
                    type="date"
                    required
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">الحد الأدنى للطلب</label>
                  <input 
                    type="number"
                    required
                    value={formData.minOrderAmount}
                    onChange={(e) => setFormData({...formData, minOrderAmount: Number(e.target.value)})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>
              <div className="pt-4">
                <button 
                  type="submit"
                  className="w-full bg-indigo-600 text-white py-3 rounded-xl font-black text-sm shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all"
                >
                  {editingCoupon ? 'حفظ التغييرات' : 'إنشاء الكوبون'}
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

export default CouponsPage;
