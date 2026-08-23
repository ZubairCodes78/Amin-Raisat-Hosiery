'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { CustomerProfile, CustomerAddress } from '@/types';
import type { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: CustomerProfile | null;
  addresses: CustomerAddress[];
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, fullName: string, phone: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<CustomerProfile>) => Promise<{ error?: string }>;
  addAddress: (address: Omit<CustomerAddress, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<{ error?: string; address?: CustomerAddress }>;
  saveAddress: (address: Omit<CustomerAddress, 'id' | 'userId' | 'createdAt' | 'updatedAt'> | CustomerAddress) => Promise<{ error?: string; address?: CustomerAddress }>;
  updateAddress: (id: string, updates: Partial<CustomerAddress>) => Promise<{ error?: string }>;
  deleteAddress: (id: string) => Promise<{ error?: string }>;
  refreshProfile: () => Promise<void>;
  refreshAddresses: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch Customer Profile
  const fetchProfile = useCallback(async (userId: string, userEmail?: string) => {
    if (!isSupabaseConfigured()) {
      const localProfile = typeof window !== 'undefined' ? localStorage.getItem('arh_customer_profile') : null;
      if (localProfile) {
        try {
          setProfile(JSON.parse(localProfile));
          return;
        } catch {}
      }
      return;
    }

    try {
      const { data, error } = await supabase
        .from('customer_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (!error && data) {
        setProfile({
          id: data.id,
          fullName: data.full_name,
          phone: data.phone || undefined,
          email: data.email || userEmail || undefined,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        });
      } else if (error && error.code === 'PGRST116') {
        // Profile does not exist yet; auto-create
        const initialProfile = {
          id: userId,
          full_name: 'Customer',
          email: userEmail || '',
        };
        await supabase.from('customer_profiles').insert(initialProfile);
        setProfile({
          id: userId,
          fullName: 'Customer',
          email: userEmail || undefined,
        });
      }
    } catch (err) {
      console.warn('Error fetching customer profile:', err);
    }
  }, []);

  // Fetch Customer Addresses
  const fetchAddresses = useCallback(async (userId: string) => {
    if (!isSupabaseConfigured()) {
      const localAddresses = typeof window !== 'undefined' ? localStorage.getItem('arh_customer_addresses') : null;
      if (localAddresses) {
        try {
          setAddresses(JSON.parse(localAddresses));
          return;
        } catch {}
      }
      return;
    }

    try {
      const { data, error } = await supabase
        .from('customer_addresses')
        .select('*')
        .eq('user_id', userId)
        .order('is_default', { ascending: false });

      if (!error && data) {
        setAddresses(
          data.map((a: any) => ({
            id: a.id,
            userId: a.user_id,
            addressType: a.address_type || 'shipping',
            fullName: a.full_name,
            phone: a.phone,
            address: a.address,
            city: a.city,
            province: a.province || 'Punjab',
            postalCode: a.postal_code || undefined,
            isDefault: a.is_default || false,
            createdAt: a.created_at,
            updatedAt: a.updated_at,
          }))
        );
      }
    } catch (err) {
      console.warn('Error fetching customer addresses:', err);
    }
  }, []);

  // Initialize Auth Listener
  useEffect(() => {
    let mounted = true;

    if (!isSupabaseConfigured()) {
      setIsLoading(false);
      return;
    }

    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          if (session?.user) {
            await Promise.all([
              fetchProfile(session.user.id, session.user.email),
              fetchAddresses(session.user.id),
            ]);
          }
        }
      } catch (err) {
        console.warn('Auth initialization error:', err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        if (newSession?.user) {
          await Promise.all([
            fetchProfile(newSession.user.id, newSession.user.email),
            fetchAddresses(newSession.user.id),
          ]);
        } else {
          setProfile(null);
          setAddresses([]);
        }
        setIsLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile, fetchAddresses]);

  // Sign In
  const signIn = async (email: string, password: string): Promise<{ error?: string }> => {
    if (!isSupabaseConfigured()) {
      return { error: 'Database authentication is currently in demo mode.' };
    }
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) return { error: error.message };
      if (data.user) {
        setUser(data.user);
        await Promise.all([
          fetchProfile(data.user.id, data.user.email),
          fetchAddresses(data.user.id),
        ]);
      }
      return {};
    } catch (err: any) {
      return { error: err?.message || 'Login failed' };
    }
  };

  // Sign Up
  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    phone: string
  ): Promise<{ error?: string }> => {
    if (!isSupabaseConfigured()) {
      return { error: 'Database authentication is currently in demo mode.' };
    }
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            phone: phone.trim(),
          },
        },
      });

      if (error) return { error: error.message };

      if (data.user) {
        setUser(data.user);
        // Create initial profile record
        await supabase.from('customer_profiles').upsert({
          id: data.user.id,
          full_name: fullName.trim(),
          phone: phone.trim(),
          email: email.trim(),
        });
        await fetchProfile(data.user.id, email.trim());
      }

      return {};
    } catch (err: any) {
      return { error: err?.message || 'Sign up failed' };
    }
  };

  // Sign Out
  const signOut = async () => {
    if (isSupabaseConfigured()) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setSession(null);
    setProfile(null);
    setAddresses([]);
  };

  // Update Profile
  const updateProfile = async (updates: Partial<CustomerProfile>): Promise<{ error?: string }> => {
    if (!user) return { error: 'Not authenticated' };
    if (!isSupabaseConfigured()) {
      const updated = { ...profile, ...updates } as CustomerProfile;
      setProfile(updated);
      localStorage.setItem('arh_customer_profile', JSON.stringify(updated));
      return {};
    }

    try {
      const payload: any = {
        updated_at: new Date().toISOString(),
      };
      if (updates.fullName !== undefined) payload.full_name = updates.fullName;
      if (updates.phone !== undefined) payload.phone = updates.phone;
      if (updates.whatsappNumber !== undefined) payload.phone = updates.whatsappNumber;
      if (updates.email !== undefined) payload.email = updates.email;

      const { error } = await supabase
        .from('customer_profiles')
        .update(payload)
        .eq('id', user.id);

      if (error) return { error: error.message };
      await fetchProfile(user.id, user.email);
      return {};
    } catch (err: any) {
      return { error: err?.message || 'Profile update failed' };
    }
  };

  // Add / Save Address
  const addAddress = async (
    addressData: Omit<CustomerAddress, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ): Promise<{ error?: string; address?: CustomerAddress }> => {
    if (!user) return { error: 'Not authenticated' };

    const effectiveAddress = addressData.address || addressData.streetAddress || '';

    if (!isSupabaseConfigured()) {
      const newAddr: CustomerAddress = {
        ...addressData,
        address: effectiveAddress,
        id: `addr-${Date.now()}`,
        userId: user.id,
        createdAt: new Date().toISOString(),
      };
      const updated = [newAddr, ...addresses];
      setAddresses(updated);
      localStorage.setItem('arh_customer_addresses', JSON.stringify(updated));
      return { address: newAddr };
    }

    try {
      if (addressData.isDefault) {
        // Unset previous defaults
        await supabase
          .from('customer_addresses')
          .update({ is_default: false })
          .eq('user_id', user.id);
      }

      const { data, error } = await supabase
        .from('customer_addresses')
        .insert({
          user_id: user.id,
          address_type: addressData.addressType || 'shipping',
          full_name: addressData.fullName,
          phone: addressData.phone,
          address: effectiveAddress,
          city: addressData.city,
          province: addressData.province || 'Punjab',
          postal_code: addressData.postalCode || null,
          is_default: addressData.isDefault || false,
        })
        .select()
        .single();

      if (error) return { error: error.message };

      await fetchAddresses(user.id);
      return {
        address: data
          ? {
              id: data.id,
              userId: data.user_id,
              addressType: data.address_type,
              fullName: data.full_name,
              phone: data.phone,
              address: data.address,
              city: data.city,
              province: data.province,
              postalCode: data.postal_code || undefined,
              isDefault: data.is_default,
              createdAt: data.created_at,
            }
          : undefined,
      };
    } catch (err: any) {
      return { error: err?.message || 'Failed to save address' };
    }
  };

  const saveAddress = async (
    addressData: Omit<CustomerAddress, 'id' | 'userId' | 'createdAt' | 'updatedAt'> | CustomerAddress
  ): Promise<{ error?: string; address?: CustomerAddress }> => {
    if ('id' in addressData && addressData.id) {
      const err = await updateAddress(addressData.id, addressData);
      return { error: err.error, address: addressData as CustomerAddress };
    }
    return await addAddress(addressData);
  };

  // Update Address
  const updateAddress = async (
    id: string,
    updates: Partial<CustomerAddress>
  ): Promise<{ error?: string }> => {
    if (!user) return { error: 'Not authenticated' };

    if (!isSupabaseConfigured()) {
      const updated = addresses.map((a) => (a.id === id ? { ...a, ...updates } : a));
      setAddresses(updated);
      localStorage.setItem('arh_customer_addresses', JSON.stringify(updated));
      return {};
    }

    try {
      if (updates.isDefault) {
        await supabase
          .from('customer_addresses')
          .update({ is_default: false })
          .eq('user_id', user.id);
      }

      const payload: any = {
        updated_at: new Date().toISOString(),
      };
      if (updates.fullName !== undefined) payload.full_name = updates.fullName;
      if (updates.phone !== undefined) payload.phone = updates.phone;
      if (updates.address !== undefined) payload.address = updates.address;
      if (updates.city !== undefined) payload.city = updates.city;
      if (updates.province !== undefined) payload.province = updates.province;
      if (updates.postalCode !== undefined) payload.postal_code = updates.postalCode;
      if (updates.isDefault !== undefined) payload.is_default = updates.isDefault;

      const { error } = await supabase
        .from('customer_addresses')
        .update(payload)
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) return { error: error.message };
      await fetchAddresses(user.id);
      return {};
    } catch (err: any) {
      return { error: err?.message || 'Failed to update address' };
    }
  };

  // Delete Address
  const deleteAddress = async (id: string): Promise<{ error?: string }> => {
    if (!user) return { error: 'Not authenticated' };

    if (!isSupabaseConfigured()) {
      const updated = addresses.filter((a) => a.id !== id);
      setAddresses(updated);
      localStorage.setItem('arh_customer_addresses', JSON.stringify(updated));
      return {};
    }

    try {
      const { error } = await supabase
        .from('customer_addresses')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) return { error: error.message };
      await fetchAddresses(user.id);
      return {};
    } catch (err: any) {
      return { error: err?.message || 'Failed to delete address' };
    }
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id, user.email);
  };

  const refreshAddresses = async () => {
    if (user) await fetchAddresses(user.id);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        addresses,
        isLoading,
        signIn,
        signUp,
        signOut,
        updateProfile,
        addAddress,
        saveAddress,
        updateAddress,
        deleteAddress,
        refreshProfile,
        refreshAddresses,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
