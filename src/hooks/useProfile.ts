import { useState, useEffect } from 'react';
import { profileService, AdminProfile } from '../services/profileService';
import { useAuth } from '../contexts/AuthContext';
import { checkSupabaseConfig } from '../supabase';

export const useProfile = () => {
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id || !checkSupabaseConfig()) {
        setLoading(false);
        return;
      }
      const data = await profileService.getProfile(user.id);
      setProfile(data);
      setLoading(false);
    };
    fetchProfile();
  }, [user?.id]);

  const updateProfile = async (newProfile: AdminProfile) => {
    setLoading(true);
    const updated = await profileService.updateOwnProfile(newProfile);
    setProfile(updated);
    setLoading(false);
  };

  return { profile, loading, updateProfile };
};
