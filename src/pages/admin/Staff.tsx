
import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Shield, 
  Trash2, 
  Mail, 
  Clock,
  Search,
  Loader2,
  AlertCircle,
  CheckCircle2,
  X
} from 'lucide-react';
import { profileService, AdminProfile } from '../../services/profileService';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/cn';

const StaffPage: React.FC = () => {
  const [staff, setStaff] = useState<AdminProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('مشرف');
  const [isAdding, setIsAdding] = useState(false);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const data = await profileService.getAllStaff();
      setStaff(data);
    } catch (err: any) {
      console.error('Failed to fetch staff:', err);
      const msg = err.message?.includes('Failed to fetch')
        ? 'فشل الاتصال بـ Supabase (Failed to fetch). يرجى التحقق من اتصال الإنترنت أو إعدادات Supabase.'
        : 'فشل في جلب قائمة الفريق';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberEmail) return;

    try {
      setIsAdding(true);
      // Create or update by email directly
      const profile = await profileService.createInvite(newMemberEmail, newMemberRole);
      
      toast.success(`تمت إضافة ${newMemberEmail} كـ ${newMemberRole}`);
      setIsAddModalOpen(false);
      setNewMemberEmail('');
      fetchStaff();
    } catch (err) {
      console.error('Failed to add member:', err);
      toast.error('فشل في إضافة العضو');
    } finally {
      setIsAdding(false);
    }
  };

  const handleRoleChange = async (id: string, newRole: string) => {
    const member = staff.find(s => s.id === id);
    if (!member) return;

    try {
      await profileService.updateProfile({ ...member, role: newRole });
      setStaff(staff.map(s => s.id === id ? { ...s, role: newRole } : s));
      toast.success(`تم تغيير رتبة ${member.name} إلى ${newRole}`);
    } catch (err) {
      console.error('Failed to update role:', err);
      toast.error('فشل في تحديث الرتبة');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا العضو؟ سيفقد صلاحية الوصول للإدارة.')) return;

    try {
      setIsDeleting(id);
      await profileService.deleteStaff(id);
      setStaff(staff.filter(s => s.id !== id));
      toast.success('تم حذف العضو بنجاح');
    } catch (err) {
      console.error('Failed to delete staff:', err);
      toast.error('فشل في حذف العضو');
    } finally {
      setIsDeleting(null);
    }
  };

  const filteredStaff = staff.filter(s => {
    const name = s.name || '';
    const email = s.email || '';
    const term = searchTerm.toLowerCase();
    
    return name.toLowerCase().includes(term) || 
           email.toLowerCase().includes(term);
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 mb-2">إدارة الفريق</h1>
          <p className="text-slate-500 font-bold">إدارة مديري النظام وصلاحيات الوصول.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="ابحث عن عضو..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl py-2.5 pr-11 pl-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all w-64"
            />
          </div>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-black text-sm shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            إضافة عضو جديد
          </button>
        </div>
      </div>

      {/* Add Member Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                      <UserPlus className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-900">إضافة عضو جديد</h3>
                      <p className="text-slate-500 text-xs font-bold">قم بتعيين دور جديد لمستخدم مسجل.</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsAddModalOpen(false)}
                    className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleAddMember} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-700 mr-1">البريد الإلكتروني</label>
                    <div className="relative">
                      <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="email" 
                        required
                        value={newMemberEmail}
                        onChange={(e) => setNewMemberEmail(e.target.value)}
                        placeholder="example@email.com"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pr-11 pl-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                        dir="ltr"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-700 mr-1">الدور / الرتبة</label>
                    <div className="relative">
                      <Shield className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <select 
                        value={newMemberRole}
                        onChange={(e) => setNewMemberRole(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pr-11 pl-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all appearance-none cursor-pointer"
                      >
                        <option value="مدير النظام">مدير النظام (صلاحيات كاملة)</option>
                        <option value="مشرف">مشرف (صلاحيات محدودة)</option>
                        <option value="محرر">محرر (إدارة المنتجات فقط)</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-4 flex gap-3">
                    <button 
                      type="submit"
                      disabled={isAdding}
                      className="flex-1 bg-indigo-600 text-white py-3.5 rounded-xl font-black text-sm shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                      إضافة للفريق
                    </button>
                    <button 
                      type="button"
                      onClick={() => setIsAddModalOpen(false)}
                      className="flex-1 bg-slate-100 text-slate-600 py-3.5 rounded-xl font-black text-sm hover:bg-slate-200 transition-all"
                    >
                      إلغاء
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-slate-500 text-xs font-bold">إجمالي الفريق</p>
              <p className="text-2xl font-black text-slate-900">{staff.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <p className="text-slate-500 text-xs font-bold">مديرين نشطين</p>
              <p className="text-2xl font-black text-slate-900">{staff.filter(s => s.role === 'مدير النظام').length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-slate-500 text-xs font-bold">بانتظار التفعيل</p>
              <p className="text-2xl font-black text-slate-900">0</p>
            </div>
          </div>
        </div>
      </div>

      {/* Staff List */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-wider">العضو</th>
                <th className="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-wider">الرتبة</th>
                <th className="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-wider">آخر دخول</th>
                <th className="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-wider text-right">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <AnimatePresence>
                {filteredStaff.map((member) => (
                  <motion.tr 
                    key={member.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="hover:bg-slate-50/50 transition-colors group"
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 overflow-hidden border-2 border-white shadow-sm">
                          <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="font-black text-slate-900">{member.name}</p>
                          <div className="flex items-center gap-1.5 text-slate-400 text-xs mt-0.5">
                            <Mail className="w-3 h-3" />
                            <span>{member.email}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <select 
                        value={member.role}
                        onChange={(e) => handleRoleChange(member.id!, e.target.value)}
                        className={cn(
                          "text-xs font-black px-3 py-1.5 rounded-full border-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer transition-all",
                          member.role === 'مدير النظام' ? "bg-indigo-50 text-indigo-600" : "bg-slate-100 text-slate-600"
                        )}
                      >
                        <option value="مدير النظام">مدير النظام</option>
                        <option value="مشرف">مشرف</option>
                        <option value="محرر">محرر</option>
                        <option value="عميل">عميل</option>
                      </select>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2 text-slate-500 text-sm">
                        <Clock className="w-4 h-4 text-slate-300" />
                        <span>{new Date(member.lastLogin).toLocaleDateString('ar-SA')}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button
                        onClick={() => handleDelete(member.id!)}
                        disabled={isDeleting === member.id}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all disabled:opacity-50"
                        title="حذف العضو"
                      >
                        {isDeleting === member.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {filteredStaff.length === 0 && (
          <div className="p-20 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mx-auto mb-6">
              <Users className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">لم يتم العثور على أعضاء</h3>
            <p className="text-slate-500 font-bold">جرب البحث بكلمات مختلفة.</p>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="bg-indigo-50 rounded-3xl p-8 border border-indigo-100">
        <div className="flex gap-4">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm shrink-0">
            <UserPlus className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-black text-indigo-900 mb-2">كيفية إضافة مدير جديد؟</h4>
            <p className="text-indigo-700/80 font-bold text-sm leading-relaxed">
              لإضافة مدير جديد، اطلب منه أولاً إنشاء حساب في المتجر أو تسجيل الدخول. بمجرد قيامه بذلك، سيظهر اسمه في هذه القائمة. يمكنك حينها تغيير رتبته من "عميل" إلى "مدير النظام" ليتمكن من الوصول إلى لوحة التحكم.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffPage;
