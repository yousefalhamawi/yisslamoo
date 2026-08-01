
import { useState, useEffect } from 'react';
import { toast } from '../utils/toast';
import { Product } from '../types/index';
import { useSharedStore } from '../store/useSharedStore';
import { productService } from '../services/productService';
import { checkSupabaseConfig } from '../supabase';

export const useProducts = () => {
  const { products, setProducts, addProduct: storeAddProduct, updateProduct: storeUpdateProduct, deleteProduct: storeDeleteProduct } = useSharedStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    if (!checkSupabaseConfig()) {
      console.warn('Supabase not configured, skipping fetchProducts');
      return;
    }

    setLoading(true);
    try {
      const data = await productService.getAll();
      setProducts(data);
    } catch (err: any) {
      const msg = err.message?.includes('Failed to fetch')
        ? 'فشل الاتصال بـ Supabase (Failed to fetch). يرجى التحقق من اتصال الإنترنت أو إعدادات Supabase.'
        : 'فشل في جلب المنتجات';
      setError(msg);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const addProduct = async (productData: Omit<Product, 'id'>) => {
    const loadingToast = toast.loading('جاري إضافة المنتج...');
    try {
      const newProduct = await productService.create(productData);
      storeAddProduct(newProduct);
      toast.success('تم إضافة المنتج بنجاح', { id: loadingToast });
      return newProduct;
    } catch (err) {
      setError('Failed to add product');
      toast.error('فشل في إضافة المنتج', { id: loadingToast });
      throw err;
    }
  };

  const updateProduct = async (id: string, product: Partial<Product>) => {
    const loadingToast = toast.loading('جاري تحديث المنتج...');
    try {
      const updatedProduct = await productService.update(id, product);
      storeUpdateProduct(id, updatedProduct);
      toast.success('تم تحديث المنتج بنجاح', { id: loadingToast });
    } catch (err) {
      setError('Failed to update product');
      toast.error('فشل في تحديث المنتج', { id: loadingToast });
      throw err;
    }
  };

  const deleteProduct = async (id: string) => {
    const loadingToast = toast.loading('جاري حذف المنتج...');
    try {
      await productService.delete(id);
      storeDeleteProduct(id);
      toast.success('تم حذف المنتج بنجاح', { id: loadingToast });
    } catch (err) {
      setError('Failed to delete product');
      toast.error('فشل في حذف المنتج', { id: loadingToast });
      throw err;
    }
  };

  return {
    products,
    loading,
    error,
    addProduct,
    updateProduct,
    deleteProduct,
    refresh: fetchProducts
  };
};
