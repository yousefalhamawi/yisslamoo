
import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  Mail, 
  Phone, 
  Eye,
  UserPlus,
  ChevronRight,
  ChevronLeft,
  Ban,
  CheckCircle2,
  Loader2,
  X,
  Edit,
  Trash2,
  Save
} from 'lucide-react';
import { useCustomers } from '../../hooks/useCustomers';
import { cn } from '../../utils/cn';
import { toast } from '../../utils/toast';

const CustomersPage: React.FC = () => {
  const { customers, loading, updateCustomer, deleteCustomer } = useCustomers();
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);

  const filteredCustomers = customers.filter(customer => {
    const name = customer.name || '';
    const email = customer.email || '';
    const phone = customer.phone || '';
    const query = searchQuery.toLowerCase();
    
    return name.toLowerCase().includes(query) || 
           email.toLowerCase().includes(query) ||
           phone.toLowerCase().includes(query);
  });

  const toggleStatus = async (customer: any) => {
    const newStatus = customer.status === 'active' ? 'blocked' : 'active';
    try {
      await updateCustomer(customer.id, { status: newStatus });
      toast.success(newStatus === 'active' ? 'تم تنشيط العميل بنجاح' : 'تم حظر العميل بنجاح');
    } catch (error) {
      toast.error('حدث خطأ أثناء تغيير حالة العميل');
    }
  };

  const handleViewCustomer = (customer: any) => {
    setSelectedCustomer(customer);
    setFormData(customer);
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  const handleEditCustomer = (customer: any) => {
    setSelectedCustomer(customer);
    setFormData(customer);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleDeleteCustomer = async (id: string) => {
    if (window.confirm('هل أنت متأكد من رغبتك في حذف هذا العميل نهائياً؟')) {
      try {
        await deleteCustomer(id);
        toast.success('تم حذف العميل بنجاح');
        setIsModalOpen(false);
      } catch (error) {
        toast.error('حدث خطأ أثناء حذف العميل');
      }
    }
  };

  const handleSaveCustomer = async () => {
    if (!formData.name || !formData.email) {
      toast.error('يرجى ملء الحقول الإجبارية (الاسم والبريد الإلكتروني)');
      return;
    }
    setIsSaving(true);
    try {
      await updateCustomer(selectedCustomer.id, formData);
      toast.success('تم تحديث بيانات العميل بنجاح');
      setIsModalOpen(false);
    } catch (error) {
      toast.error('حدث خطأ أثناء تحديث البيانات');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading && customers.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900">إدارة العملاء</h1>
          <p className="text-slate-500 font-bold text-sm">لديك {customers.length} عميل مسجل في متجرك.</p>
        </div>
        <button className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-black text-sm shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center gap-2">
          <UserPlus className="w-4 h-4" />
          إضافة عميل جديد
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="ابحث باسم العميل، البريد الإلكتروني، أو رقم الهاتف..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pr-11 pl-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
          />
        </div>
        <button className="bg-slate-50 border border-slate-200 text-slate-600 px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-100 transition-all flex items-center gap-2">
          <Filter className="w-4 h-4" />
          تصفية
        </button>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs font-black uppercase tracking-wider">
                <th className="px-6 py-4">العميل</th>
                <th className="px-6 py-4">معلومات الاتصال</th>
                <th className="px-6 py-4">عدد الطلبات</th>
                <th className="px-6 py-4">إجمالي الإنفاق</th>
                <th className="px-6 py-4">الحالة</th>
                <th className="px-6 py-4">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-slate-50 transition-all group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 font-black text-sm">
                        {customer.name?.[0] || '?'}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900">{customer.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">ID: {customer.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                        <Mail className="w-3 h-3 text-slate-400" />
                        {customer.email}
                      </div>
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span dir="ltr">{customer.phone}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-black text-slate-900">{customer.ordersCount} طلبات</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-black text-indigo-600">{customer.totalSpent.toLocaleString()} ل.س</span>
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => toggleStatus(customer)}
                      className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 w-fit transition-all hover:scale-105",
                        customer.status === 'active' ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                      )}
                    >
                      {customer.status === 'active' ? <CheckCircle2 className="w-3 h-3" /> : <Ban className="w-3 h-3" />}
                      {customer.status === 'active' ? 'نشط' : 'محظور'}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleViewCustomer(customer)}
                        className="p-2 hover:bg-indigo-50 rounded-lg text-slate-400 hover:text-indigo-600 transition-all"
                        title="عرض التفاصيل"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleEditCustomer(customer)}
                        className="p-2 hover:bg-emerald-50 rounded-lg text-slate-400 hover:text-emerald-600 transition-all"
                        title="تعديل"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteCustomer(customer.id)}
                        className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-600 transition-all"
                        title="حذف"
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
        
        {/* Pagination */}
        <div className="p-6 border-t border-slate-100 flex justify-between items-center">
          <p className="text-xs text-slate-500 font-bold">عرض ١-{filteredCustomers.length} من أصل {filteredCustomers.length} عميل</p>
          <div className="flex gap-2">
            <button className="p-2 border border-slate-200 rounded-lg text-slate-400 hover:bg-slate-50 transition-all">
              <ChevronRight className="w-4 h-4" />
            </button>
            <button className="p-2 border border-slate-200 rounded-lg text-slate-400 hover:bg-slate-50 transition-all">
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Customer Modal */}
      {isModalOpen && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 font-black text-xl">
                  {selectedCustomer.name?.[0] || '?'}
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900">
                    {isEditMode ? 'تعديل بيانات العميل' : 'تفاصيل العميل'}
                  </h2>
                  <p className="text-sm font-bold text-slate-500">
                    ID: {selectedCustomer.id}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-white rounded-full text-slate-400 hover:text-slate-600 transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 text-right">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-wider">الاسم الكامل <span className="text-red-500">*</span></label>
                  {isEditMode ? (
                    <input 
                      type="text" 
                      value={formData.name || ''} 
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    />
                  ) : (
                    <div className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-700">
                      {selectedCustomer.name || 'غير متوفر'}
                    </div>
                  )}
                </div>

                <div className="space-y-2 text-right">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-wider">البريد الإلكتروني <span className="text-red-500">*</span></label>
                  {isEditMode ? (
                    <input 
                      type="email" 
                      value={formData.email || ''} 
                      onChange={e => setFormData({...formData, email: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                      dir="ltr"
                    />
                  ) : (
                    <div className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-700" dir="ltr">
                      {selectedCustomer.email || 'غير متوفر'}
                    </div>
                  )}
                </div>

                <div className="space-y-2 text-right">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-wider">رقم الهاتف</label>
                  {isEditMode ? (
                    <input 
                      type="tel" 
                      value={formData.phone || ''} 
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                      dir="ltr"
                    />
                  ) : (
                    <div className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-700" dir="ltr">
                      {selectedCustomer.phone || 'غير متوفر'}
                    </div>
                  )}
                </div>

                <div className="space-y-2 text-right">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-wider">العنوان</label>
                  {isEditMode ? (
                    <input 
                      type="text" 
                      value={formData.address || ''} 
                      onChange={e => setFormData({...formData, address: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    />
                  ) : (
                    <div className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-700">
                      {selectedCustomer.address || 'غير متوفر'}
                    </div>
                  )}
                </div>

                <div className="space-y-2 text-right">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-wider">عدد الطلبات المكتملة</label>
                  <div className="bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3 text-sm font-black text-indigo-700">
                    {selectedCustomer.ordersCount || 0} طلبات
                  </div>
                </div>

                <div className="space-y-2 text-right">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-wider">إجمالي الإنفاق</label>
                  <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3 text-sm font-black text-emerald-700">
                    {(selectedCustomer.totalSpent || 0).toLocaleString()} ل.س
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-3 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all"
              >
                إغلاق
              </button>
              {isEditMode ? (
                <button 
                  onClick={handleSaveCustomer}
                  disabled={isSaving}
                  className="px-6 py-3 bg-indigo-600 text-white font-black rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  حفظ التعديلات
                </button>
              ) : (
                <button 
                  onClick={() => setIsEditMode(true)}
                  className="px-6 py-3 bg-indigo-600 text-white font-black rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center gap-2"
                >
                  <Edit className="w-5 h-5" />
                  تعديل البيانات
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomersPage;
