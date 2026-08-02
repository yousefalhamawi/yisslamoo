
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Product } from '../../types/index';
import { Customer, Address } from '../../types/admin';
import { validateEmail, validatePhone } from '../../utils/validation';
import { getColorName, getColorHex } from '../../utils/colorUtils';
import { addressService } from '../../services/addressService';
import { customerService } from '../../services/customerService';
import { toast } from '../../utils/toast';
import { computeDisplayPrice } from '../../utils/pricingEngine';
import { useSharedStore } from '../../store/useSharedStore';
import { ChevronLeft, Check, SquarePen, Trash2, MapPin, ShieldCheck } from 'lucide-react';
import { supabase } from '../../supabase';
import {
  FORM_TITLE,
  FORM_LABEL,
  FORM_FIELDS,
  FORM_ERROR,
  FORM_SUBMIT,
  formInput,
  formTextarea
} from '../../constants/formStyles';

interface CheckoutPageProps {
  items: Product[];
  user: any;
  customers: Customer[];
  onBack: () => void;
  onCompleteOrder: (data: any) => void;
  onUpdateCustomer?: (id: string, updates: Partial<Customer>) => void;
}

const CheckoutPage: React.FC<CheckoutPageProps> = ({ items, user, customers, onBack, onCompleteOrder, onUpdateCustomer }) => {
  const exchangeRate = useSharedStore((s) => s.exchangeRate);
  const [step, setStep] = useState(user ? 2 : 1);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [userAddresses, setUserAddresses] = useState<Address[]>([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    fullName: '',
    city: '',
    district: '',
    street: '',
    building: '',
    notes: '',
    paymentMethod: 'card',
    recipientNames: [] as string[]
  });

  const [recipientNamesStr, setRecipientNamesStr] = useState('');

  const [newAddress, setNewAddress] = useState({
    full_name: '',
    phone: '',
    country: 'سوريا, دمشق',
    city: '',
    street: '',
    building: '',
    notes: '',
    is_default: false
  });

  const currentCustomer = React.useMemo(() => {
    if (!user || !customers) return null;
    return customers.find(c => 
      (c.user_id && user.id && c.user_id === user.id) || 
      (c.email && user.email && c.email.toLowerCase() === user.email.toLowerCase())
    );
  }, [user, customers]);

  // Fetch addresses for logged-in user
  React.useEffect(() => {
    const fetchAddresses = async () => {
      if (currentCustomer?.id) {
        setIsLoadingAddresses(true);
        try {
          const addresses = await addressService.getByCustomerId(currentCustomer.id);
          setUserAddresses(addresses);
          
          // Select default address if exists
          const defaultAddr = addresses.find(a => a.is_default);
          if (defaultAddr) {
            setSelectedAddressId(defaultAddr.id);
            setFormData(prev => ({
              ...prev,
              fullName: defaultAddr.full_name,
              phone: defaultAddr.phone,
              city: defaultAddr.city,
              street: defaultAddr.street,
              building: defaultAddr.building,
              notes: defaultAddr.notes || ''
            }));
          } else if (addresses.length > 0) {
            // Fallback to first address
            const firstAddr = addresses[0];
            setSelectedAddressId(firstAddr.id);
            setFormData(prev => ({
              ...prev,
              fullName: firstAddr.full_name,
              phone: firstAddr.phone,
              city: firstAddr.city,
              street: firstAddr.street,
              building: firstAddr.building,
              notes: firstAddr.notes || ''
            }));
          }
        } catch (error) {
          console.error('Error fetching addresses:', error);
        } finally {
          setIsLoadingAddresses(false);
        }
      }
    };

    fetchAddresses();
  }, [currentCustomer?.id]);

  // Pre-fill data for logged-in users
  React.useEffect(() => {
    if (user && currentCustomer) {
      const hasSavedAddresses = userAddresses.length > 0;
      
      // Consolidate state updates
      setFormData(prev => ({
        ...prev,
        email: currentCustomer.email || prev.email,
        phone: currentCustomer.phone || prev.phone,
        fullName: currentCustomer.name || prev.fullName,
      }));

      // Initialize newAddress with user data
      setNewAddress(prev => ({
        ...prev,
        full_name: currentCustomer.name || prev.full_name,
        phone: currentCustomer.phone || prev.phone
      }));

      // If no saved addresses AND loading is done, automatically show the "Add Address" form
      if (!isLoadingAddresses && !hasSavedAddresses && !isAddingAddress && !isEditingAddress) {
        setIsAddingAddress(true);
      } else if (isLoadingAddresses) {
        // Still loading — do NOT open add-address form yet
        setIsAddingAddress(false);
      }

      // Navigation logic:
      // If logged in, we skip Step 1.
      if (step === 1) {
        setStep(2);
      }
    } else if (user && !currentCustomer) {
      setFormData(prev => ({
        ...prev,
        email: user.email || prev.email,
        fullName: user.name || prev.fullName
      }));
      
      // For new users, skip step 1 and show the add address form
      if (step === 1) setStep(2);
      if (!isAddingAddress) setIsAddingAddress(true);
    }
  }, [user, currentCustomer, step, userAddresses.length, isLoadingAddresses]);

  const handleSelectAddress = (addr: Address) => {
    setSelectedAddressId(addr.id);
    setFormData(prev => ({
      ...prev,
      fullName: addr.full_name,
      phone: addr.phone,
      city: addr.city,
      street: addr.street,
      building: addr.building,
      notes: addr.notes || ''
    }));
  };

  const handleDeleteAddress = async (addrId: string) => {
    if (!user?.id) return;
    
    try {
      await addressService.delete(addrId);
      setUserAddresses(prev => prev.filter(a => a.id !== addrId));
      
      if (selectedAddressId === addrId) {
        setSelectedAddressId(null);
      }
      toast.success('تم حذف العنوان بنجاح');
    } catch (error) {
      toast.error('فشل في حذف العنوان');
    }
  };

  const handleEditAddress = (addr: Address) => {
    setNewAddress({
      full_name: addr.full_name,
      phone: addr.phone,
      country: addr.country,
      city: addr.city,
      street: addr.street,
      building: addr.building,
      notes: addr.notes || '',
      is_default: addr.is_default
    });
    setEditingAddressId(addr.id);
    setIsEditingAddress(true);
    setIsAddingAddress(true);
  };

  const handleAddNewAddress = async () => {
    if (!newAddress.city || !newAddress.street || !newAddress.full_name || !newAddress.phone || !newAddress.building) {
      toast.error('يرجى إكمال جميع الحقول المطلوبة');
      return;
    }

    try {
      let savedAddress: any = null;

      if (user) {
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

        const customer = await customerService.getOrCreateCustomer(user.id, customerData);
        const customerId = customer.id;

        if (onUpdateCustomer) onUpdateCustomer(customerId, customer);

        if (isEditingAddress && editingAddressId) {
          savedAddress = await addressService.update(editingAddressId, newAddress);
          setUserAddresses(prev => prev.map(a => a.id === editingAddressId ? savedAddress : a));
          toast.success('تم تحديث العنوان بنجاح');
        } else {
          savedAddress = await addressService.add({
            ...newAddress,
            customer_id: customerId
          });
          // Only add to list if not already present (to avoid duplicate keys)
          setUserAddresses(prev => {
            if (prev.some(a => a.id === savedAddress?.id)) return prev;
            return [savedAddress, ...prev];
          });
          toast.success('تم إضافة العنوان بنجاح');
        }
      }

      // Use the saved address or the form data if guest
      const addressToUse = savedAddress || {
        ...newAddress,
        id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      };

      setSelectedAddressId(addressToUse.id);
      setFormData(prev => ({
        ...prev,
        fullName: addressToUse.full_name,
        phone: addressToUse.phone,
        city: addressToUse.city,
        street: addressToUse.street,
        building: addressToUse.building,
        notes: addressToUse.notes || ''
      }));
      
      // Advance to step 3 if not already there
      if (step < 3) setStep(3);
      
      setIsAddingAddress(false);
      setIsEditingAddress(false);
      setEditingAddressId(null);
      // Reset newAddress but keep user info for next time
      setNewAddress(prev => ({ 
        ...prev,
        city: '', 
        street: '',
        building: '',
        notes: '',
        is_default: false
      }));
    } catch (error) {
      console.error('Error in handleAddNewAddress:', error);
      toast.error('فشل في حفظ العنوان');
    }
  };

  const [errors, setErrors] = useState({ email: '', phone: '', fullName: '' });
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponError, setCouponError] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const subtotal = items.reduce((sum, item) => sum + (computeDisplayPrice(item, exchangeRate) * (item.quantity || 1)), 0);
  const shipping = subtotal > 2000000 ? 0 : 50000;
  const total = subtotal + shipping - discount;

  /**
   * التحقق من الكوبون يتم على الخادم عبر `validate_coupon`.
   * الخصم المعروض هنا للعرض فقط — الخادم يعيد حسابه عند إنشاء الطلب،
   * فتعديله من أدوات المتصفح لا يغيّر المبلغ المدفوع فعلياً.
   */
  const handleApplyCoupon = async () => {
    const code = couponCode.trim();
    if (!code) {
      setCouponError('يرجى إدخال كود الخصم');
      return;
    }

    setIsApplyingCoupon(true);
    try {
      const { data, error } = await supabase.rpc('validate_coupon', {
        p_code: code,
        p_subtotal: subtotal
      });

      if (error) throw error;

      const result = Array.isArray(data) ? data[0] : data;

      if (!result?.valid) {
        setDiscount(0);
        setCouponError(result?.message || 'كود الخصم غير صحيح');
        return;
      }

      setDiscount(Number(result.discount) || 0);
      setCouponError('');
    } catch (err) {
      console.error('Coupon validation failed:', err);
      setDiscount(0);
      setCouponError('تعذّر التحقق من كود الخصم. حاول مرة أخرى.');
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const steps = user 
    ? [
        { id: 2, name: 'الشحن' },
        { id: 3, name: 'الدفع' }
      ]
    : [
        { id: 1, name: 'المعلومات' },
        { id: 2, name: 'الشحن' },
        { id: 3, name: 'الدفع' }
      ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name as keyof typeof errors]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const nextStep = () => {
    if (step === 1) {
      const newErrors = { email: '', phone: '', fullName: '' };
      let hasError = false;
      if (!validateEmail(formData.email)) {
        newErrors.email = 'البريد الإلكتروني غير صالح';
        hasError = true;
      }
      if (!validatePhone(formData.phone)) {
        newErrors.phone = 'رقم الهاتف يجب أن يكون بين ٨ و ١٥ رقماً';
        hasError = true;
      }
      setErrors(newErrors);
      if (hasError) return;
    }
    
    if (step === 2) {
      if (!formData.fullName.trim()) {
        setErrors({ ...errors, fullName: 'الاسم الكامل مطلوب' });
        return;
      }
    }

    setStep(prev => Math.min(prev + 1, 3));
  };
  const prevStep = () => {
    if (user && step === 2) {
      onBack();
      return;
    }
    setStep(prev => Math.max(prev - 1, 1));
  };

  return (
    <div className="bg-[#FAFBFC] min-h-screen page-offset pb-24">
      <div className="container mx-auto px-6 max-w-7xl">
        
        {/* رأس الصفحة: زر العودة ثم مؤشّر الخطوات */}
        <div className="mb-10 md:mb-14">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-primary transition-colors mb-6"
          >
            <ChevronLeft className="w-4 h-4" strokeWidth={2.5} />
            <span className="font-bold">العودة</span>
          </button>

          {/* خطوط الوصل مرنة (flex-1) فتتقلّص مع عرض الشاشة بدل أن تتجاوزها */}
          <ol className="flex items-start w-full max-w-lg mx-auto">
            {steps.map((s, i) => {
              const isDone = step > s.id;
              const isCurrent = step === s.id;
              const isReached = step >= s.id;

              return (
                <React.Fragment key={`checkout-step-${s.id}-${i}`}>
                  <li
                    className="flex flex-col items-center gap-2 shrink-0 w-16"
                    aria-current={isCurrent ? 'step' : undefined}
                  >
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                        isReached
                          ? 'bg-primary text-white shadow-md shadow-primary/25'
                          : 'bg-white border border-gray-200 text-gray-300'
                      }`}
                    >
                      {isDone ? (
                        <Check className="w-4 h-4" strokeWidth={3} />
                      ) : (
                        s.id
                      )}
                    </div>
                    <span
                      className={`text-[11px] font-bold text-center leading-tight ${
                        isReached ? 'text-primary' : 'text-gray-300'
                      }`}
                    >
                      {s.name}
                    </span>
                  </li>

                  {i < steps.length - 1 && (
                    <li
                      aria-hidden="true"
                      className={`flex-1 h-0.5 mt-[18px] rounded-full transition-colors ${
                        isDone ? 'bg-primary' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </ol>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          
          {/* Main Form Area */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div 
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100"
                >
                  <h2 className={FORM_TITLE}>معلومات التواصل</h2>
                  <div className={FORM_FIELDS}>
                    <div>
                      <label className={FORM_LABEL}>البريد الإلكتروني</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="example@yaslamo.sa"
                        className={formInput(!!errors.email)}
                      />
                      {errors.email && <p className={FORM_ERROR}>{errors.email}</p>}
                    </div>
                    <div>
                      <label className={FORM_LABEL}>رقم الهاتف</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+966 5x xxx xxxx"
                        className={formInput(!!errors.phone)}
                      />
                      {errors.phone && <p className={FORM_ERROR}>{errors.phone}</p>}
                    </div>
                    <button
                      onClick={nextStep}
                      className={FORM_SUBMIT}
                    >
                      متابعة للشحن
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div 
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100"
                >
                  <div className="flex items-center justify-between mb-10">
                    <h2 className="text-3xl font-black text-textMain text-right">عنوان الشحن</h2>
                    {user && (
                      <button 
                        onClick={() => {
                          setIsAddingAddress(!isAddingAddress);
                          if (isAddingAddress) {
                            setIsEditingAddress(false);
                            setEditingAddressId(null);
                          }
                        }}
                        className="text-primary text-sm font-bold flex items-center gap-2 hover:underline"
                      >
                        {isAddingAddress ? 'إلغاء' : '+ إضافة عنوان جديد'}
                      </button>
                    )}
                  </div>

                  {user && !isAddingAddress && (
                    <div className="mb-10 space-y-4">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-right mb-4">اختر من عناوينك المحفوظة</p>
                      <div className="grid grid-cols-1 gap-4">
                        {isLoadingAddresses ? (
                          <div className="flex justify-center py-8">
                            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                          </div>
                        ) : userAddresses.length === 0 ? (
                          <p className="text-sm text-gray-400 text-right italic">لا توجد عناوين محفوظة بعد</p>
                        ) : (
                          userAddresses.map((addr, idx) => (
                            <div
                              key={`saved-addr-${addr.id || 'new'}-${idx}`}
                              onClick={() => handleSelectAddress(addr)}
                              role="button"
                              tabIndex={0}
                              onKeyDown={(e) => e.key === 'Enter' && handleSelectAddress(addr)}
                              className={`w-full p-6 rounded-3xl border-2 text-right transition-all cursor-pointer ${selectedAddressId === addr.id ? 'border-primary bg-primary/5' : 'border-gray-50 hover:border-gray-100'}`}
                            >
                              <div className="flex items-start justify-between flex-row-reverse">
                                <div className="flex items-start gap-4 flex-row-reverse">
                                  <div className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${selectedAddressId === addr.id ? 'border-primary' : 'border-gray-200'}`}>
                                    {selectedAddressId === addr.id && <div className="w-3 h-3 bg-primary rounded-full" />}
                                  </div>
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-3 flex-row-reverse">
                                      <p className="font-black text-lg text-textMain">{addr.full_name}</p>
                                      {addr.is_default && (
                                        <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-black rounded-full">افتراضي</span>
                                      )}
                                      <div className="flex items-center gap-1">
                                        <button 
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleEditAddress(addr);
                                          }}
                                          className="p-1.5 text-gray-400 hover:text-primary transition-colors"
                                          title="تعديل العنوان"
                                        >
                                          <SquarePen className="w-4 h-4" strokeWidth={2} />
                                        </button>
                                        <button 
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteAddress(addr.id);
                                          }}
                                          className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                                          title="حذف العنوان"
                                        >
                                          <Trash2 className="w-4 h-4" strokeWidth={2} />
                                        </button>
                                      </div>
                                    </div>
                                    <p className="text-sm text-gray-500 font-bold">{addr.phone}</p>
                                    <p className="text-sm text-primary font-black mt-2">
                                      {addr.city}، {addr.street}، مبنى {addr.building}
                                    </p>
                                    {addr.notes && <p className="text-xs text-gray-400 italic mt-1">{addr.notes}</p>}
                                  </div>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-2xl">
                                  <MapPin className="w-6 h-6 text-primary" strokeWidth={2} />
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  {isAddingAddress ? (
                    <div className="space-y-8 bg-gray-50 p-10 rounded-[3rem] border border-gray-100 mb-10">
                      <h3 className="text-2xl font-black text-right mb-6">
                        {isEditingAddress ? 'تعديل العنوان' : 'إضافة عنوان جديد'}
                      </h3>
                      
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <label className={FORM_LABEL}>الاسم الكامل</label>
                          <input 
                            type="text" 
                            value={newAddress.full_name}
                            onChange={(e) => setNewAddress({ ...newAddress, full_name: e.target.value })}
                            placeholder="أدخل اسم المستلم"
                            className={formInput()} 
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className={FORM_LABEL}>رقم الهاتف</label>
                            <input 
                              type="tel" 
                              value={newAddress.phone}
                              onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                              placeholder="05xxxxxxxx"
                              className={formInput()} 
                            />
                          </div>
                          <div className="space-y-2">
                            <label className={FORM_LABEL}>الدولة</label>
                            <input 
                              type="text" 
                              value={newAddress.country}
                              onChange={(e) => setNewAddress({ ...newAddress, country: e.target.value })}
                              placeholder="سوريا, دمشق"
                              className={formInput()} 
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className={FORM_LABEL}>المدينة</label>
                            <input 
                              type="text" 
                              value={newAddress.city}
                              onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                              placeholder="مثلاً: الرياض"
                              className={formInput()} 
                            />
                          </div>
                          <div className="space-y-2">
                            <label className={FORM_LABEL}>الشارع</label>
                            <input 
                              type="text" 
                              value={newAddress.street}
                              onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                              placeholder="اسم الشارع"
                              className={formInput()} 
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className={FORM_LABEL}>المبنى / الشقة</label>
                            <input 
                              type="text" 
                              value={newAddress.building}
                              onChange={(e) => setNewAddress({ ...newAddress, building: e.target.value })}
                              placeholder="رقم المبنى أو الشقة"
                              className={formInput()} 
                            />
                          </div>
                          <div className="space-y-2">
                            <label className={FORM_LABEL}>ملاحظات إضافية</label>
                            <input 
                              type="text" 
                              value={newAddress.notes}
                              onChange={(e) => setNewAddress({ ...newAddress, notes: e.target.value })}
                              placeholder="مثلاً: بجانب المسجد"
                              className={formInput()} 
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-3 flex-row-reverse">
                          <input 
                            type="checkbox" 
                            id="is_default"
                            checked={newAddress.is_default}
                            onChange={(e) => setNewAddress({ ...newAddress, is_default: e.target.checked })}
                            className="w-5 h-5 accent-primary"
                          />
                          <label htmlFor="is_default" className="text-sm font-bold text-gray-600 cursor-pointer">تعيين كعنوان افتراضي</label>
                        </div>
                      </div>

                      <button 
                        onClick={handleAddNewAddress}
                        className="w-full py-6 bg-primary text-white font-black rounded-[2rem] shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all text-xl mt-4"
                      >
                        {isEditingAddress ? 'حفظ التعديلات' : 'حفظ العنوان الجديد والمتابعة'}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-8">
                      {user && (
                        <button 
                          onClick={() => {
                            if (selectedAddressId !== null) {
                              setStep(3);
                            }
                          }}
                          disabled={selectedAddressId === null}
                          className={`w-full py-6 font-black rounded-[2rem] shadow-xl transition-all text-xl mb-8 ${selectedAddressId !== null ? 'bg-primary text-white shadow-primary/20 hover:scale-[1.02] active:scale-95' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                        >
                          تأكيد العنوان والمتابعة
                        </button>
                      )}
                      <div className="space-y-2">
                        <label className={FORM_LABEL}>الاسم الكامل</label>
                        <input 
                          type="text" 
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleInputChange}
                          placeholder="أدخل اسم المستلم"
                          className={formInput(!!errors.fullName)} 
                        />
                        {errors.fullName && <p className="text-[10px] text-red-500 font-bold mr-2 mt-1">{errors.fullName}</p>}
                      </div>
                      {!user && (
                        <>
                          <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <label className={FORM_LABEL}>المدينة</label>
                              <input 
                                type="text" 
                                name="city"
                                value={formData.city}
                                onChange={handleInputChange}
                                className={formInput()} 
                              />
                            </div>
                            <div className="space-y-2">
                              <label className={FORM_LABEL}>الحي</label>
                              <input 
                                type="text" 
                                name="district"
                                value={formData.district}
                                onChange={handleInputChange}
                                className={formInput()} 
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className={FORM_LABEL}>الشارع وتفاصيل العنوان</label>
                            <input 
                              type="text" 
                              name="street"
                              value={formData.street}
                              onChange={handleInputChange}
                              className={formInput()} 
                            />
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  <div className="flex gap-4 mt-10">
                    <button 
                      onClick={prevStep}
                      className="flex-1 py-6 bg-gray-50 text-gray-400 font-black rounded-2xl hover:bg-gray-100 transition-all text-xl"
                    >
                      رجوع
                    </button>
                    <button 
                      onClick={nextStep}
                      disabled={isAddingAddress}
                      className={`flex-[2] py-6 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all text-xl ${isAddingAddress ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      متابعة للدفع
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div 
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100"
                >
                  <h2 className="text-3xl font-black mb-10 text-textMain text-right">تأكيد الطلب والدفع</h2>
                  
                  {user && (
                    <div className="mb-10 space-y-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-black text-textMain text-right">عنوان الشحن</h3>
                        <button 
                          onClick={() => {
                            setIsAddingAddress(!isAddingAddress);
                            if (isAddingAddress) {
                              setIsEditingAddress(false);
                              setEditingAddressId(null);
                            }
                          }}
                          className="text-primary text-sm font-bold flex items-center gap-2 hover:underline"
                        >
                          {isAddingAddress ? 'إلغاء' : '+ إضافة عنوان جديد'}
                        </button>
                      </div>

                      {isAddingAddress ? (
                        <div className="space-y-6 bg-gray-50 p-8 rounded-3xl border border-gray-100">
                          <h4 className="text-lg font-black text-right mb-4">
                            {isEditingAddress ? 'تعديل العنوان' : 'إضافة عنوان جديد'}
                          </h4>
                          
                          <div className="space-y-4">
                            <div className="space-y-1">
                              <label className={FORM_LABEL}>الاسم الكامل</label>
                              <input 
                                type="text" 
                                value={newAddress.full_name}
                                onChange={(e) => setNewAddress({ ...newAddress, full_name: e.target.value })}
                                placeholder="أدخل اسم المستلم"
                                className={formInput()} 
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <label className={FORM_LABEL}>الدولة</label>
                                <input 
                                  type="text" 
                                  value={newAddress.country}
                                  onChange={(e) => setNewAddress({ ...newAddress, country: e.target.value })}
                                  placeholder="سوريا, دمشق"
                                  className={formInput()} 
                                />
                              </div>
                              <div className="space-y-1">
                                <label className={FORM_LABEL}>رقم الهاتف</label>
                                <input 
                                  type="tel" 
                                  value={newAddress.phone}
                                  onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                                  placeholder="05xxxxxxxx"
                                  className={formInput()} 
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <label className={FORM_LABEL}>المدينة</label>
                                <input 
                                  type="text" 
                                  value={newAddress.city}
                                  onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                                  placeholder="مثلاً: الرياض"
                                  className={formInput()} 
                                />
                              </div>
                              <div className="space-y-1">
                                <label className={FORM_LABEL}>المبنى / الشقة</label>
                                <input 
                                  type="text" 
                                  value={newAddress.building}
                                  onChange={(e) => setNewAddress({ ...newAddress, building: e.target.value })}
                                  placeholder="مثلاً: مبنى ٥، شقة ١٠"
                                  className={formInput()} 
                                />
                              </div>
                            </div>

                            <div className="space-y-1">
                              <label className={FORM_LABEL}>الشارع وتفاصيل العنوان</label>
                              <input 
                                type="text" 
                                value={newAddress.street}
                                onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                                placeholder="اسم الشارع، رقم المبنى..."
                                className={formInput()} 
                              />
                            </div>
                          </div>

                          <button 
                            onClick={handleAddNewAddress}
                            className="w-full py-4 bg-primary text-white font-black rounded-2xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all text-lg mt-2"
                          >
                            {isEditingAddress ? 'حفظ التعديلات' : 'حفظ العنوان الجديد'}
                          </button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-4">
                          {userAddresses.length === 0 ? (
                            <p className="text-sm text-gray-400 text-right italic">لا توجد عناوين محفوظة بعد</p>
                          ) : (
                            userAddresses.map((addr, idx) => (
                              <div
                                key={`step3-addr-${addr.id || 'new'}-${idx}`}
                                onClick={() => handleSelectAddress(addr)}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => e.key === 'Enter' && handleSelectAddress(addr)}
                                className={`w-full p-5 rounded-2xl border-2 text-right transition-all cursor-pointer ${selectedAddressId === addr.id ? 'border-primary bg-primary/5' : 'border-gray-50 hover:border-gray-100'}`}
                              >
                                <div className="flex items-start justify-between flex-row-reverse">
                                  <div className="flex items-start gap-3 flex-row-reverse">
                                    <div className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${selectedAddressId === addr.id ? 'border-primary' : 'border-gray-200'}`}>
                                      {selectedAddressId === addr.id && <div className="w-2.5 h-2.5 bg-primary rounded-full" />}
                                    </div>
                                    <div className="space-y-0.5">
                                      <div className="flex items-center gap-2 flex-row-reverse">
                                        <p className="font-black text-base text-textMain">{addr.full_name}</p>
                                        <button 
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleEditAddress(addr);
                                          }}
                                          className="p-1 text-gray-400 hover:text-primary transition-colors"
                                        >
                                          <SquarePen className="w-3.5 h-3.5" strokeWidth={2} />
                                        </button>
                                      </div>
                                      <p className="text-xs text-gray-500 font-bold">{addr.phone}</p>
                                      <p className="text-xs text-primary font-black">
                                        {addr.city}، {addr.street}، مبنى {addr.building}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="space-y-8">
                      <div className="space-y-2">
                        <label className={FORM_LABEL}>أسماء المُهدى إليهم (اختياري)</label>
                        <input 
                          type="text" 
                          name="recipientNames"
                          value={recipientNamesStr}
                          onChange={(e) => {
                            const val = e.target.value;
                            setRecipientNamesStr(val);
                            setFormData(prev => ({
                              ...prev,
                              recipientNames: val.split(/[،,]/).map(s => s.trim()).filter(Boolean)
                            }));
                          }}
                          placeholder="مثلاً: محمد، سارة..."
                          className="${formInput()}" 
                        />
                      </div>

                    <div className="space-y-4">
                      <label className={FORM_LABEL}>طريقة الدفع</label>
                      <div className="grid grid-cols-1 gap-4">
                        {[
                          { id: 'card', name: 'بطاقة ائتمانية / مدى', icon: '💳' },
                          { id: 'apple', name: 'Apple Pay', icon: '🍎' },
                          { id: 'cash', name: 'الدفع عند الاستلام', icon: '💵' }
                        ].map(method => (
                          <button
                            key={method.id}
                            onClick={() => setFormData({ ...formData, paymentMethod: method.id })}
                            className={`w-full p-5 rounded-2xl border-2 flex items-center justify-between transition-all ${formData.paymentMethod === method.id ? 'border-primary bg-primary/5' : 'border-gray-50 hover:border-gray-100'}`}
                          >
                            <div className="flex items-center gap-4">
                              <span className="text-xl">{method.icon}</span>
                              <span className="font-bold text-base">{method.name}</span>
                            </div>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.paymentMethod === method.id ? 'border-primary' : 'border-gray-200'}`}>
                              {formData.paymentMethod === method.id && <div className="w-2.5 h-2.5 bg-primary rounded-full" />}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="pt-6 flex gap-4">
                      <button 
                        onClick={prevStep}
                        className="flex-1 py-6 bg-gray-50 text-gray-400 font-black rounded-2xl hover:bg-gray-100 transition-all text-xl"
                      >
                        رجوع
                      </button>
                      <button 
                        onClick={() => onCompleteOrder({
                          ...formData,
                          discount,
                          couponCode,
                          exchange_rate_at_purchase: exchangeRate,
                          final_price_syp: total,
                        })}
                        className="flex-[2] py-6 bg-accent text-primaryDark font-black rounded-2xl shadow-xl shadow-accent/20 hover:scale-[1.02] active:scale-95 transition-all text-xl"
                      >
                        تأكيد الطلب
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sticky Order Summary Sidebar with Gift Details */}
          <div className="lg:col-span-5 lg:sticky lg:top-40">
            <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-gray-100">
              <h3 className="text-xl font-black mb-8 pb-4 border-b border-gray-50 text-right">ملخص الطلب</h3>
              
              <div className="max-h-[400px] overflow-y-auto mb-8 space-y-6 px-2 custom-scrollbar">
                {items.map((item, idx) => (
                  <div key={`order-summary-item-${item.cartId || idx}-${idx}`} className="space-y-4">
                    <div className="flex gap-4 items-start flex-row-reverse">
                      <img src={item.image} className="w-20 h-24 rounded-2xl object-cover border border-gray-50 shadow-sm" alt="" />
                      <div className="flex-1 text-right">
                        <div className="flex justify-between items-start flex-row-reverse">
                          <p className="font-bold text-base text-textMain line-clamp-1 mb-1">{item.name}</p>
                          <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-lg font-bold">×{item.quantity || 1}</span>
                        </div>
                        <p className="text-sm text-primary font-black mb-3">{(computeDisplayPrice(item, exchangeRate) * (item.quantity || 1)).toLocaleString()} ل.س</p>
                        
                        {/* Selected Options Display */}
                        <div className="space-y-1.5 border-t border-gray-50 pt-2">
                           {item.selectedColor && (
                              <div className="flex items-center gap-2 justify-end">
                                 <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">اللون</span>
                                 <div 
                                    className="w-3 h-3 rounded-full border border-gray-100" 
                                    style={{ 
                                      background: getColorHex(item.selectedColor) === '#FFD700' 
                                        ? 'linear-gradient(135deg, #BF953F 0%, #FCF6BA 45%, #B38728 70%, #FBF5B7 100%)'
                                        : getColorHex(item.selectedColor) === '#C0C0C0'
                                          ? 'linear-gradient(135deg, #C0C0C0 0%, #E8E8E8 45%, #A9A9A9 70%, #E8E8E8 100%)'
                                          : getColorHex(item.selectedColor) 
                                    }} 
                                  />
                                  <span className="text-[10px] text-gray-500 font-bold">{getColorName(item.selectedColor)}</span>
                              </div>
                           )}
                           {item.selectedEngraving && (
                              <p className="text-[10px] text-gray-500 font-bold">
                                 <span className="text-primary/60">النقش:</span> {item.selectedEngraving}
                              </p>
                           )}
                           {item.selectedGiftWrapping && (
                              <p className="text-[10px] text-accent font-black bg-accent/10 px-2 py-1 rounded-lg inline-block">
                                 🎁 {item.selectedGiftWrapping}
                              </p>
                           )}
                           {item.selectedGiftMessage && (
                              <div className="bg-gray-50 p-3 rounded-xl mt-2 text-right">
                                 <p className="text-[9px] text-gray-400 font-bold mb-1 border-b border-gray-100 pb-1">رسالة الإهداء</p>
                                 <p className="text-[10px] text-textMain leading-relaxed">"{item.selectedGiftMessage}"</p>
                              </div>
                           )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Coupon Code Section */}
              <div className="mb-8 p-6 bg-gray-50 rounded-2xl border border-gray-100">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest text-right mb-3">هل لديك كوبون خصم؟</label>
                <div className="flex gap-2">
                  <button
                    onClick={handleApplyCoupon}
                    disabled={isApplyingCoupon}
                    className="bg-primary text-white px-4 py-2 rounded-xl font-black text-xs hover:bg-primaryDark disabled:opacity-60 disabled:pointer-events-none transition-all"
                  >
                    {isApplyingCoupon ? '...' : 'تطبيق'}
                  </button>
                  <input 
                    type="text" 
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="أدخل الكود هنا"
                    className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm text-right focus:outline-none focus:border-primary transition-all"
                  />
                </div>
                {couponError && <p className="text-[10px] text-red-500 font-bold text-right mt-2">{couponError}</p>}
                {discount > 0 && <p className="text-[10px] text-emerald-600 font-black text-right mt-2">تم تطبيق الخصم بنجاح! ✨</p>}
              </div>

              <div className="space-y-4 pt-6 border-t border-gray-50">
                <div className="flex justify-between text-gray-400 font-bold text-sm flex-row-reverse">
                  <span className="text-right">المجموع الفرعي</span>
                  <span>{subtotal.toLocaleString()} ل.س</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold text-sm flex-row-reverse">
                    <span className="text-right">خصم الكوبون</span>
                    <span>-{discount.toLocaleString()} ل.س</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-400 font-bold text-sm flex-row-reverse">
                  <span className="text-right">الشحن</span>
                  <span className={shipping === 0 ? 'text-green-500' : ''}>
                    {shipping === 0 ? 'مجاني' : `${shipping.toLocaleString()} ل.س`}
                  </span>
                </div>
                <div className="h-px bg-gray-50 my-2" />
                <div className="flex justify-between items-center pt-2 flex-row-reverse">
                  <span className="text-lg font-black text-textMain text-right">الإجمالي</span>
                  <span className="text-3xl font-black text-primary">{total.toLocaleString()} ل.س</span>
                </div>
              </div>

              <div className="mt-10 p-8 bg-primary/5 rounded-[2.5rem] border border-primary/10 relative overflow-hidden">
                <div className="flex gap-4 items-center mb-4 flex-row-reverse">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-sm">
                    {/* نجمة ممتلئة وسط أيقونات محدّدة كانت شاذة — والدرع هو رمز
                        الضمان المستخدم في باقي الموقع */}
                    <ShieldCheck className="w-6 h-6" strokeWidth={2} />
                  </div>
                  <p className="font-black text-primary text-base">ضمان نخبة الذهبي</p>
                </div>
                <p className="text-[11px] text-gray-500 leading-relaxed text-right font-medium">
                  نحن في "يسلمو" نضمن جودة كل قطعة مقدمة. في حال لم تكن راضياً عن الهدية، نوفر لك سياسة استرجاع مرنة وسهلة لضمان رضاكم التام.
                </p>
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -translate-y-12 translate-x-12" />
              </div>
            </div>
          </div>

        </div>
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #f3f4f6; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default CheckoutPage;
