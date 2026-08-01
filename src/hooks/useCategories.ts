
import { useState, useEffect } from 'react';
import { toast } from '../utils/toast';
import { Category } from '../types/admin';
import { categoryService } from '../services/categoryService';
import { checkSupabaseConfig } from '../supabase';

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    if (!checkSupabaseConfig()) {
      console.warn('Supabase not configured, skipping fetchCategories');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await categoryService.getAll();
      setCategories(data);
    } catch (err) {
      setError('Failed to fetch categories');
      toast.loadError();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const addCategory = async (category: Omit<Category, 'id'>) => {
    const loadingToast = toast.loading('جاري إضافة التصنيف...');
    try {
      const newCategory = await categoryService.create(category);
      setCategories(prev => [newCategory, ...prev]);
      toast.success('تم إضافة التصنيف بنجاح', { id: loadingToast });
      return newCategory;
    } catch (err: any) {
      const msg = err.message || 'فشل في إضافة التصنيف';
      setError(msg);
      toast.error(msg, { id: loadingToast });
      throw err;
    }
  };

  const updateCategory = async (id: string, category: Partial<Category>) => {
    const loadingToast = toast.loading('جاري تحديث التصنيف...');
    try {
      const updated = await categoryService.update(id, category);
      setCategories(prev => prev.map(c => c.id === id ? updated : c));
      toast.success('تم تحديث التصنيف بنجاح', { id: loadingToast });
      return updated;
    } catch (err: any) {
      const msg = err.message || 'فشل في تحديث التصنيف';
      setError(msg);
      toast.error(msg, { id: loadingToast });
      throw err;
    }
  };

  const deleteCategory = async (id: string) => {
    const loadingToast = toast.loading('جاري حذف التصنيف...');
    try {
      await categoryService.delete(id);
      setCategories(prev => prev.filter(c => c.id !== id));
      toast.success('تم حذف التصنيف بنجاح', { id: loadingToast });
    } catch (err) {
      setError('Failed to delete category');
      toast.error('فشل في حذف التصنيف', { id: loadingToast });
      throw err;
    }
  };

  return {
    categories,
    loading,
    error,
    addCategory,
    updateCategory,
    deleteCategory,
    refresh: fetchCategories
  };
};
