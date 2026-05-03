import { useState, useEffect } from 'react';
import { paymentService, PaymentMethod } from '../services/paymentService';
import { checkSupabaseConfig } from '../supabase';

export const usePayments = () => {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMethods = async () => {
    if (!checkSupabaseConfig()) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const data = await paymentService.getAll();
    setMethods(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchMethods();
  }, []);

  const toggleMethod = async (id: string) => {
    await paymentService.toggleStatus(id);
    fetchMethods();
  };

  return { methods, loading, toggleMethod };
};
