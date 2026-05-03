
import { useState, useEffect } from 'react';
import { Collection } from '../types/admin';
import { collectionService } from '../services/collectionService';
import { toast } from 'react-hot-toast';

export const useCollections = () => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCollections = async () => {
    try {
      setLoading(true);
      const data = await collectionService.list();
      setCollections(data);
    } catch (error) {
      console.error('Error fetching collections:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  const addCollection = async (collection: Omit<Collection, 'id'>) => {
    try {
      const newCollection = await collectionService.add(collection);
      setCollections(prev => [newCollection, ...prev]);
      toast.success('تم إضافة المجموعة بنجاح');
      return newCollection;
    } catch (error: any) {
      toast.error(error.message || 'فشل إضافة المجموعة');
      throw error;
    }
  };

  const updateCollection = async (id: string, collection: Partial<Collection>) => {
    try {
      const updated = await collectionService.update(id, collection);
      setCollections(prev => prev.map(c => c.id === id ? updated : c));
      toast.success('تم تحديث المجموعة بنجاح');
      return updated;
    } catch (error: any) {
      toast.error(error.message || 'فشل تحديث المجموعة');
      throw error;
    }
  };

  const deleteCollection = async (id: string) => {
    try {
      await collectionService.delete(id);
      setCollections(prev => prev.filter(c => c.id !== id));
      toast.success('تم حذف المجموعة بنجاح');
    } catch (error: any) {
      toast.error(error.message || 'فشل حذف المجموعة');
      throw error;
    }
  };

  return {
    collections,
    loading,
    addCollection,
    updateCollection,
    deleteCollection,
    refreshCollections: fetchCollections
  };
};
