
import { useState, useEffect } from 'react';
import { useSharedStore } from '../store/useSharedStore';
import { toast } from 'react-hot-toast';
import { Customer } from '../types/admin';
import { customerService } from '../services/customerService';
import { checkSupabaseConfig } from '../supabase';

export const useCustomers = () => {
  const { customers, setCustomers, updateCustomer: storeUpdateCustomer, deleteCustomer: storeDeleteCustomer } = useSharedStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomers = async () => {
    if (!checkSupabaseConfig()) return;
    
    setLoading(true);
    try {
      const data = await customerService.getAll();
      setCustomers(data);
    } catch (err) {
      setError('Failed to fetch customers');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const updateCustomer = async (id: string, customer: Partial<Customer>) => {
    const loadingToast = toast.loading('جاري تحديث بيانات العميل...');
    try {
      if (checkSupabaseConfig()) {
        if (id.startsWith('CUST-')) {
          const created = await customerService.add(customer);
          storeUpdateCustomer(id, created);
        } else {
          await customerService.update(id, customer);
          storeUpdateCustomer(id, customer);
        }
      } else {
        storeUpdateCustomer(id, customer);
      }
      toast.success('تم تحديث بيانات العميل بنجاح', { id: loadingToast });
    } catch (err) {
      toast.error('فشل في تحديث بيانات العميل', { id: loadingToast });
      throw err;
    }
  };

  const deleteCustomer = async (id: string) => {
    const loadingToast = toast.loading('جاري حذف العميل...');
    try {
      if (checkSupabaseConfig() && !id.startsWith('CUST-')) {
        await customerService.delete(id);
      }
      storeDeleteCustomer(id);
      toast.success('تم حذف العميل بنجاح', { id: loadingToast });
    } catch (err) {
      toast.error('فشل في حذف العميل', { id: loadingToast });
      throw err;
    }
  };

  return {
    customers,
    loading,
    error,
    updateCustomer,
    deleteCustomer,
    refresh: fetchCustomers
  };
};
