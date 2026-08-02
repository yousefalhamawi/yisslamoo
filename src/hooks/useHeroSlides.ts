import { useState, useEffect, useCallback, useRef } from 'react';
import { HeroSlide } from '../types/admin';
import { sliderService } from '../services/sliderService';
import { toast } from '../utils/toast';
import { readHeroSlidesCache, writeHeroSlidesCache } from '../utils/heroSlidesCache';

type SlideInput = Omit<HeroSlide, 'id'>;

interface UseHeroSlidesOptions {
  /**
   * يكتم رسالة خطأ الجلب. تُستخدم في واجهة المتجر: غياب السلايدر
   * لا يمنع التسوّق، فلا داعي لإزعاج الزائر برسالة خطأ.
   * لوحة التحكم تتركها false لأن الأدمن يحتاج معرفة سبب الفشل.
   */
  silentLoadErrors?: boolean;
}

export const useHeroSlides = ({ silentLoadErrors = false }: UseHeroSlidesOptions = {}) => {
  const cachedSlides = readHeroSlidesCache();
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>(() => cachedSlides ?? []);
  const [loading, setLoading] = useState(() => cachedSlides === null);
  const hasCachedSlidesRef = useRef(cachedSlides !== null);

  const fetchSlides = useCallback(async () => {
    try {
      if (!hasCachedSlidesRef.current) setLoading(true);
      const data = await sliderService.getAll();
      setHeroSlides(data);
      writeHeroSlidesCache(data);
      hasCachedSlidesRef.current = true;
    } catch (error) {
      console.error('Error fetching hero slides:', error);
      if (!silentLoadErrors) {
        toast.loadError();
      }
      setHeroSlides([]);
    } finally {
      setLoading(false);
    }
  }, [silentLoadErrors]);

  useEffect(() => {
    void fetchSlides();
  }, [fetchSlides]);

  const addHeroSlide = async (slide: SlideInput) => {
    const loadingToast = toast.loading('جاري إضافة السلايد...');
    try {
      const created = await sliderService.create(slide);
      setHeroSlides(prev => {
        const next = [...prev, created];
        writeHeroSlidesCache(next);
        return next;
      });
      toast.success('تم إضافة السلايد بنجاح', { id: loadingToast });
      return created;
    } catch (error: any) {
      toast.error(error.message || 'فشل في إضافة السلايد', { id: loadingToast });
      throw error;
    }
  };

  const updateHeroSlide = async (id: string, updates: Partial<SlideInput>) => {
    const loadingToast = toast.loading('جاري تحديث السلايد...');
    try {
      const updated = await sliderService.update(id, updates);
      setHeroSlides(prev => {
        const next = prev.map(s => (s.id === id ? updated : s));
        writeHeroSlidesCache(next);
        return next;
      });
      toast.success('تم تحديث السلايد بنجاح', { id: loadingToast });
      return updated;
    } catch (error: any) {
      toast.error(error.message || 'فشل في تحديث السلايد', { id: loadingToast });
      throw error;
    }
  };

  const deleteHeroSlide = async (id: string) => {
    const loadingToast = toast.loading('جاري حذف السلايد...');
    try {
      await sliderService.delete(id);
      setHeroSlides(prev => {
        const next = prev.filter(s => s.id !== id);
        writeHeroSlidesCache(next);
        return next;
      });
      toast.success('تم حذف السلايد', { id: loadingToast });
    } catch (error: any) {
      toast.error(error.message || 'فشل في حذف السلايد', { id: loadingToast });
      throw error;
    }
  };

  return {
    heroSlides,
    loading,
    refetch: fetchSlides,
    addHeroSlide,
    updateHeroSlide,
    deleteHeroSlide
  };
};
