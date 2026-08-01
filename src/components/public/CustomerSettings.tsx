
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Phone, MapPin, Save, ChevronLeft, Shield, Bell, Pencil } from 'lucide-react';
import { User as UserType } from '../../types/index';
import { Address, Customer } from '../../types/admin';
import { validateEmail, validatePhone } from '../../utils/validation';
import { customerService } from '../../services/customerService';
import { addressService } from '../../services/addressService';
import { checkSupabaseConfig } from '../../supabase';
import { toast } from '../../utils/toast';
import { formInput } from '../../constants/formStyles';
import { Trash2, Plus, Check } from 'lucide-react';

interface CustomerSettingsProps {
  user: UserType;
  customers: Customer[];
  onUpdateUser: (updatedUser: UserType) => void;
  onUpdateCustomer: (id: string, updates: Partial<Customer>) => void;
  onBack: () => void;
}

const CustomerSettings: React.FC<CustomerSettingsProps> = ({ user, customers, onUpdateUser, onUpdateCustomer, onBack }) => {
  const [activeTab, setActiveTab] = useState<'personal' | 'addresses'>('personal');
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone || '',
    address: user.address || ''
  });

  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [userAddresses, setUserAddresses] = useState<Address[]>([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [editingAddressData, setEditingAddressData] = useState<Partial<Address>>({});
  const [newAddress, setNewAddress] = useState({
    full_name: user.name,
    phone: user.phone || '',
    country: 'سوريا, دمشق',
    city: '',
    street: '',
    building: '',
    notes: '',
    is_default: false
  });

  const customer = customers.find(c => 
    (c.user_id && user.id && c.user_id === user.id) || 
    (c.email?.toLowerCase() === user.email.toLowerCase())
  );

  // Fetch addresses
  React.useEffect(() => {
    const fetchAddresses = async () => {
      if (customer?.id) {
        setIsLoadingAddresses(true);
        try {
          const addresses = await addressService.getByCustomerId(customer.id);
          // فلترة السجلات بدون id وإزالة المكررات
          const seen = new Set<string>();
          const unique = addresses.filter(a => {
            if (!a.id) return false;
            if (seen.has(a.id)) return false;
            seen.add(a.id);
            return true;
          });
          setUserAddresses(unique);
        } catch (error) {
          console.error('Error fetching addresses:', error);
        } finally {
          setIsLoadingAddresses(false);
        }
      }
    };

    fetchAddresses();
  }, [customer?.id]);

  const [errors, setErrors] = useState({ email: '', phone: '', name: '' });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    const newErrors = { email: '', phone: '', name: '' };
    let hasError = false;

    if (!validateEmail(formData.email)) {
      newErrors.email = 'البريد الإلكتروني غير صالح';
      hasError = true;
    }
    if (formData.phone && !validatePhone(formData.phone)) {
      newErrors.phone = 'رقم الهاتف يجب أن يكون بين ٨ و ١٥ رقماً';
      hasError = true;
    }
    if (!formData.name.trim()) {
      newErrors.name = 'الاسم مطلوب';
      hasError = true;
    }

    setErrors(newErrors);
    if (hasError) return;

    setIsSaving(true);
    const loadingToast = toast.loading('جاري حفظ التغييرات...');

    try {
      const updates = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address
      };

      if (customer) {
        onUpdateCustomer(customer.id, updates);
      }

      // Update local state and storage
      onUpdateUser({
        ...user,
        ...updates
      });

      toast.success('تم حفظ التغييرات بنجاح', { id: loadingToast });
    } catch (err) {
      console.error('Failed to update profile:', err);
      toast.error('فشل في حفظ التغييرات، يرجى المحاولة مرة أخرى', { id: loadingToast });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddAddress = async () => {
    if (!newAddress.city || !newAddress.street || !newAddress.full_name || !newAddress.phone || !newAddress.building) {
      toast.error('يرجى إكمال جميع الحقول');
      return;
    }

    if (user?.id) {
      try {
        // Ensure customer record exists before adding address
        const customerData: Partial<Customer> = {
          user_id: user.id,
          name: user.name || newAddress.full_name,
          email: user.email || '',
          phone: user.phone || newAddress.phone || '',
          ordersCount: 0,
          totalSpent: 0,
          lastOrderDate: new Date().toISOString().split('T')[0],
          status: 'active'
        };

        const customerRecord = await customerService.getOrCreateCustomer(user.id, customerData);
        const customerId = customerRecord.id;

        const savedAddress = await addressService.add({
          ...newAddress,
          customer_id: customerId
        });
        
        // إضافة للقائمة مع منع التكرار
        setUserAddresses(prev => {
          if (!savedAddress?.id || prev.some(a => a.id === savedAddress.id)) return prev;
          return [savedAddress, ...prev];
        });
        setIsAddingAddress(false);
        setNewAddress({
          full_name: user.name,
          phone: user.phone || '',
          country: 'سوريا, دمشق',
          city: '',
          street: '',
          building: '',
          notes: '',
          is_default: false
        });
        toast.success('تمت إضافة العنوان بنجاح');
        
        // Update parent state if needed
        if (onUpdateCustomer) {
          onUpdateCustomer(customerId, customerRecord);
        }
      } catch (error) {
        console.error('Error adding address:', error);
        toast.error('فشل في إضافة العنوان');
      }
    }
  };

  const handleDeleteAddress = async (id: string) => {
    try {
      await addressService.delete(id);
      setUserAddresses(prev => prev.filter(a => a.id !== id));
      toast.success('تم حذف العنوان');
    } catch (error) {
      toast.error('فشل في حذف العنوان');
    }
  };

  const handleSetDefault = async (id: string) => {
    if (customer?.id) {
      try {
        await addressService.setDefault(id, customer.id);
        setUserAddresses(prev => prev.map(a => ({
          ...a,
          is_default: a.id === id
        })));
        toast.success('تم تعيين العنوان كافتراضي');
      } catch (error) {
        toast.error('فشل في تعيين العنوان الافتراضي');
      }
    }
  };

  const handleStartEdit = (addr: Address) => {
    setEditingAddressId(addr.id);
    setEditingAddressData({
      full_name:  addr.full_name,
      phone:      addr.phone,
      country:    addr.country,
      city:       addr.city,
      street:     addr.street,
      building:   addr.building,
      notes:      addr.notes || '',
      is_default: addr.is_default,
    });
  };

  const handleCancelEdit = () => {
    setEditingAddressId(null);
    setEditingAddressData({});
  };

  const handleUpdateAddress = async (id: string) => {
    if (!editingAddressData.city || !editingAddressData.street || !editingAddressData.full_name || !editingAddressData.phone || !editingAddressData.building) {
      toast.error('يرجى إكمال جميع الحقول المطلوبة');
      return;
    }
    try {
      const updated = await addressService.update(id, editingAddressData);
      setUserAddresses(prev => prev.map(a => a.id === id ? { ...a, ...updated } : a));
      setEditingAddressId(null);
      setEditingAddressData({});
      toast.success('تم تحديث العنوان بنجاح');
    } catch (error) {
      toast.error('فشل في تحديث العنوان');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 page-offset pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-black text-gray-900">إعدادات الحساب</h1>
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-gray-500 hover:text-primary transition-colors font-bold"
          >
            <span>العودة للمتجر</span>
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar Nav */}
          <div className="lg:col-span-1 space-y-2">
            <button 
              onClick={() => setActiveTab('personal')}
              className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl transition-all font-bold ${activeTab === 'personal' ? 'bg-white text-primary shadow-sm border border-gray-100' : 'text-gray-500 hover:bg-white'}`}
            >
              <User className="w-5 h-5" />
              <span>المعلومات الشخصية</span>
            </button>
            <button 
              onClick={() => setActiveTab('addresses')}
              className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl transition-all font-bold ${activeTab === 'addresses' ? 'bg-white text-primary shadow-sm border border-gray-100' : 'text-gray-500 hover:bg-white'}`}
            >
              <MapPin className="w-5 h-5" />
              <span>عناوين الشحن</span>
            </button>
            <button className="w-full flex items-center gap-3 px-6 py-4 rounded-2xl hover:bg-white text-gray-500 font-bold transition-all">
              <Shield className="w-5 h-5" />
              <span>الأمان والخصوصية</span>
            </button>
            <button className="w-full flex items-center gap-3 px-6 py-4 rounded-2xl hover:bg-white text-gray-500 font-bold transition-all">
              <Bell className="w-5 h-5" />
              <span>التنبيهات</span>
            </button>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {activeTab === 'personal' ? (
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h2 className="text-xl font-black text-gray-900 mb-8">المعلومات الشخصية</h2>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest mr-2">الاسم الكامل</label>
                      <div className="relative">
                        <User className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                        <input 
                          type="text"
                          value={formData.name}
                          onChange={(e) => {
                            setFormData({...formData, name: e.target.value});
                            if (errors.name) setErrors({...errors, name: ''});
                          }}
                          className={`w-full bg-gray-50 border ${errors.name ? 'border-red-500' : 'border-gray-100'} rounded-xl pr-12 pl-4 py-3.5 focus:outline-none focus:border-primary focus:bg-white transition-all font-bold`}
                        />
                        {errors.name && <p className="text-[10px] text-red-500 font-bold mr-2 mt-1">{errors.name}</p>}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest mr-2">البريد الإلكتروني</label>
                      <div className="relative">
                        <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                        <input 
                          type="email"
                          value={formData.email}
                          onChange={(e) => {
                            setFormData({...formData, email: e.target.value});
                            if (errors.email) setErrors({...errors, email: ''});
                          }}
                          className={`w-full bg-gray-50 border ${errors.email ? 'border-red-500' : 'border-gray-100'} rounded-xl pr-12 pl-4 py-3.5 focus:outline-none focus:border-primary focus:bg-white transition-all font-bold`}
                        />
                        {errors.email && <p className="text-[10px] text-red-500 font-bold mr-2 mt-1">{errors.email}</p>}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest mr-2">رقم الجوال</label>
                      <div className="relative">
                        <Phone className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                        <input 
                          type="text"
                          value={formData.phone}
                          onChange={(e) => {
                            setFormData({...formData, phone: e.target.value});
                            if (errors.phone) setErrors({...errors, phone: ''});
                          }}
                          className={`w-full bg-gray-50 border ${errors.phone ? 'border-red-500' : 'border-gray-100'} rounded-xl pr-12 pl-4 py-3.5 focus:outline-none focus:border-primary focus:bg-white transition-all font-bold text-left`}
                          dir="ltr"
                        />
                        {errors.phone && <p className="text-[10px] text-red-500 font-bold mr-2 mt-1">{errors.phone}</p>}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest mr-2">العنوان الافتراضي</label>
                      <div className="relative">
                        <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                        <input 
                          type="text"
                          value={formData.address}
                          onChange={(e) => setFormData({...formData, address: e.target.value})}
                          className={`${formInput()} pr-12`}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-50 flex justify-end">
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSave}
                      disabled={isSaving}
                      className="flex items-center gap-3 bg-primary text-white px-10 py-4 rounded-2xl font-black shadow-lg shadow-primary/20 hover:bg-primaryDark transition-all disabled:opacity-50"
                    >
                      {isSaving ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      ) : (
                        <Save className="w-5 h-5" />
                      )}
                      <span>حفظ التغييرات</span>
                    </motion.button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl font-black text-gray-900">عناوين الشحن</h2>
                    <button 
                      onClick={() => setIsAddingAddress(!isAddingAddress)}
                      className="flex items-center gap-2 text-primary font-bold text-sm hover:underline"
                    >
                      {isAddingAddress ? 'إلغاء' : <><Plus className="w-4 h-4" /> إضافة عنوان جديد</>}
                    </button>
                  </div>

                  {isAddingAddress && (
                    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 mb-8 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input 
                          type="text"
                          placeholder="الاسم الكامل للمستلم"
                          value={newAddress.full_name}
                          onChange={(e) => setNewAddress({...newAddress, full_name: e.target.value})}
                          className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 focus:outline-none focus:border-primary font-bold"
                        />
                        <input 
                          type="tel"
                          placeholder="رقم الهاتف"
                          value={newAddress.phone}
                          onChange={(e) => setNewAddress({...newAddress, phone: e.target.value})}
                          className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 focus:outline-none focus:border-primary font-bold text-left"
                          dir="ltr"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input 
                          type="text"
                          placeholder="الدولة"
                          value={newAddress.country}
                          onChange={(e) => setNewAddress({...newAddress, country: e.target.value})}
                          className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 focus:outline-none focus:border-primary font-bold"
                        />
                        <input 
                          type="text"
                          placeholder="المدينة"
                          value={newAddress.city}
                          onChange={(e) => setNewAddress({...newAddress, city: e.target.value})}
                          className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 focus:outline-none focus:border-primary font-bold"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input 
                          type="text"
                          placeholder="الشارع"
                          value={newAddress.street}
                          onChange={(e) => setNewAddress({...newAddress, street: e.target.value})}
                          className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 focus:outline-none focus:border-primary font-bold"
                        />
                        <input 
                          type="text"
                          placeholder="المبنى / الشقة"
                          value={newAddress.building}
                          onChange={(e) => setNewAddress({...newAddress, building: e.target.value})}
                          className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 focus:outline-none focus:border-primary font-bold"
                        />
                      </div>
                      <input 
                        type="text"
                        placeholder="ملاحظات إضافية"
                        value={newAddress.notes}
                        onChange={(e) => setNewAddress({...newAddress, notes: e.target.value})}
                        className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 focus:outline-none focus:border-primary font-bold"
                      />
                      <div className="flex items-center gap-2 flex-row-reverse">
                        <input 
                          type="checkbox" 
                          id="is_default_settings"
                          checked={newAddress.is_default}
                          onChange={(e) => setNewAddress({ ...newAddress, is_default: e.target.checked })}
                          className="w-4 h-4 accent-primary"
                        />
                        <label htmlFor="is_default_settings" className="text-sm font-bold text-gray-600 cursor-pointer">تعيين كعنوان افتراضي</label>
                      </div>
                      <button 
                        onClick={handleAddAddress}
                        className="w-full bg-primary text-white py-4 rounded-xl font-black hover:bg-primaryDark transition-all"
                      >
                        حفظ العنوان
                      </button>
                    </div>
                  )}

                  <div className="space-y-4">
                    {userAddresses.length > 0 ? (
                      userAddresses.map((addr, idx) => (
                        <div key={addr.id || `addr-${idx}`} className="rounded-2xl border border-gray-100 overflow-hidden">
                          {/* --- بطاقة العنوان --- */}
                          <div className="p-6 flex items-center justify-between bg-white">
                            <div className="flex items-center gap-4">
                              <div className="p-3 bg-gray-50 rounded-xl shrink-0">
                                <MapPin className="w-6 h-6 text-primary" />
                              </div>
                              <div className="text-right">
                                <div className="flex items-center gap-2 flex-row-reverse">
                                  <p className="font-bold text-gray-900">{addr.full_name}</p>
                                  {addr.is_default && (
                                    <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-black rounded-full">افتراضي</span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-500">{addr.city}، {addr.street}، مبنى {addr.building}</p>
                                <p className="text-xs text-gray-400 mt-1">{addr.phone}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              {!addr.is_default && (
                                <button
                                  onClick={() => handleSetDefault(addr.id)}
                                  className="p-2 text-gray-300 hover:text-primary transition-all rounded-xl hover:bg-primary/5"
                                  title="تعيين كافتراضي"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={() => editingAddressId === addr.id ? handleCancelEdit() : handleStartEdit(addr)}
                                className={`p-2 transition-all rounded-xl ${
                                  editingAddressId === addr.id
                                    ? 'text-primary bg-primary/10'
                                    : 'text-gray-300 hover:text-primary hover:bg-primary/5'
                                }`}
                                title="تعديل العنوان"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteAddress(addr.id)}
                                className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all rounded-xl"
                                title="حذف العنوان"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* --- نموذج التعديل --- */}
                          <AnimatePresence>
                            {editingAddressId === addr.id && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.25 }}
                                className="overflow-hidden border-t border-gray-100"
                              >
                                <div className="p-6 bg-gray-50 space-y-4">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input
                                      type="text"
                                      placeholder="الاسم الكامل للمستلم"
                                      value={editingAddressData.full_name || ''}
                                      onChange={(e) => setEditingAddressData(p => ({...p, full_name: e.target.value}))}
                                      className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 focus:outline-none focus:border-primary font-bold text-right"
                                    />
                                    <input
                                      type="tel"
                                      placeholder="رقم الهاتف"
                                      value={editingAddressData.phone || ''}
                                      onChange={(e) => setEditingAddressData(p => ({...p, phone: e.target.value}))}
                                      className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 focus:outline-none focus:border-primary font-bold text-left"
                                      dir="ltr"
                                    />
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input
                                      type="text"
                                      placeholder="الدولة"
                                      value={editingAddressData.country || ''}
                                      onChange={(e) => setEditingAddressData(p => ({...p, country: e.target.value}))}
                                      className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 focus:outline-none focus:border-primary font-bold text-right"
                                    />
                                    <input
                                      type="text"
                                      placeholder="المدينة"
                                      value={editingAddressData.city || ''}
                                      onChange={(e) => setEditingAddressData(p => ({...p, city: e.target.value}))}
                                      className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 focus:outline-none focus:border-primary font-bold text-right"
                                    />
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input
                                      type="text"
                                      placeholder="الشارع"
                                      value={editingAddressData.street || ''}
                                      onChange={(e) => setEditingAddressData(p => ({...p, street: e.target.value}))}
                                      className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 focus:outline-none focus:border-primary font-bold text-right"
                                    />
                                    <input
                                      type="text"
                                      placeholder="المبنى / الشقة"
                                      value={editingAddressData.building || ''}
                                      onChange={(e) => setEditingAddressData(p => ({...p, building: e.target.value}))}
                                      className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 focus:outline-none focus:border-primary font-bold text-right"
                                    />
                                  </div>
                                  <input
                                    type="text"
                                    placeholder="ملاحظات إضافية"
                                    value={editingAddressData.notes || ''}
                                    onChange={(e) => setEditingAddressData(p => ({...p, notes: e.target.value}))}
                                    className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 focus:outline-none focus:border-primary font-bold text-right"
                                  />
                                  <div className="flex gap-3 pt-2">
                                    <button
                                      onClick={handleCancelEdit}
                                      className="flex-1 py-3 bg-white border border-gray-100 text-gray-500 font-bold rounded-xl hover:bg-gray-50 transition-all"
                                    >
                                      إلغاء
                                    </button>
                                    <button
                                      onClick={() => handleUpdateAddress(addr.id)}
                                      className="flex-[2] py-3 bg-primary text-white font-black rounded-xl hover:bg-primaryDark transition-all flex items-center justify-center gap-2"
                                    >
                                      <Save className="w-4 h-4" />
                                      حفظ التعديلات
                                    </button>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <MapPin className="w-12 h-12 text-gray-100 mx-auto mb-4" />
                        <p className="text-gray-400 font-bold">لا توجد عناوين محفوظة بعد</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerSettings;
