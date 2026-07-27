import { supabase } from '../lib/supabase';

export type AuthMode = 'login' | 'register';

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });
  if (error) throw new Error(mapAuthError(error.message));
  return data;
}

export async function signUpWithEmail(name: string, email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
    options: {
      data: { name: name.trim() },
    },
  });
  if (error) throw new Error(mapAuthError(error.message));
  if (!data.session && data.user) {
    throw new Error(
      'Revisá tu email para confirmar la cuenta, o desactivá “Confirm email” en Supabase Auth (desarrollo).'
    );
  }
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(mapAuthError(error.message));
}

function mapAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes('invalid login credentials')) return 'Email o contraseña incorrectos.';
  if (m.includes('user already registered')) return 'Ese email ya está registrado.';
  if (m.includes('password should be at least')) return 'La contraseña tiene que tener al menos 6 caracteres.';
  if (m.includes('unable to validate email')) return 'El email no parece válido.';
  if (m.includes('email rate limit')) return 'Demasiados intentos. Probá en unos minutos.';
  return message;
}
