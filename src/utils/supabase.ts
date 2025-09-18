/**
 * UTILIDADES DE SUPABASE CON TYPESCRIPT
 * Archivo: src/utils/supabase.ts
 */

import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient, Session, User } from '@supabase/supabase-js';

// Tipos TypeScript
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  user: User | null;
  session: Session | null;
}

/**
 * Cliente de Supabase singleton
 */
let supabaseClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (supabaseClient) return supabaseClient;

  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
  const supabaseKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
  }

  supabaseClient = createClient(supabaseUrl, supabaseKey);
  return supabaseClient;
}

/**
 * Utilidades de autenticación con TypeScript
 */
export class AuthManager {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = getSupabaseClient();
  }

  /**
   * Registrar usuario
   */
  async signUp(email: string, password: string, name: string): Promise<AuthResponse> {
    // 1. Registrar en auth
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name }
      }
    });

    if (error) throw error;

    // 2. Crear perfil en tabla users
    if (data.user) {
      const { error: profileError } = await this.supabase
        .from('users')
        .insert({
          id: data.user.id,
          email: data.user.email,
          name: name
        });

      if (profileError) {
        console.error('Error creating profile:', profileError);
        throw new Error('Error creating profile');
      }
    }

    return { user: data.user, session: data.session };
  }

  /**
   * Iniciar sesión
   */
  async signIn(email: string, password: string): Promise<AuthResponse> {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    return { user: data.user, session: data.session };
  }

  /**
   * Cerrar sesión
   */
  async signOut(): Promise<void> {
    const { error } = await this.supabase.auth.signOut();
    if (error) throw error;
  }

  /**
   * Obtener sesión actual
   */
  async getCurrentSession(): Promise<Session | null> {
    const { data: { session }, error } = await this.supabase.auth.getSession();
    if (error) throw error;
    return session;
  }

  /**
   * Obtener perfil de usuario
   */
  async getUserProfile(userId: string): Promise<UserProfile> {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data as UserProfile;
  }

  /**
   * Obtener usuario actual
   */
  async getCurrentUser(): Promise<User | null> {
    const { data: { user }, error } = await this.supabase.auth.getUser();
    if (error) throw error;
    return user;
  }

  /**
   * Escuchar cambios de autenticación
   */
  onAuthStateChange(callback: (user: User | null) => void): () => void {
    const { data: { subscription } } = this.supabase.auth.onAuthStateChange((event, session) => {
      callback(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }
}