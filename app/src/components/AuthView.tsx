import React, { useState } from 'react';
import { isSupabaseConfigured } from '../lib/supabase';
import { signInWithEmail, signUpWithEmail, type AuthMode } from '../services/auth';

interface AuthViewProps {
  onAuthenticated: () => void;
}

export function AuthView({ onAuthenticated }: AuthViewProps) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const configured = isSupabaseConfigured();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!configured) return;
    setError(null);
    setLoading(true);
    try {
      if (mode === 'register') {
        if (!name.trim()) {
          setError('Ingresá tu nombre.');
          setLoading(false);
          return;
        }
        await signUpWithEmail(name, email, password);
      } else {
        await signInWithEmail(email, password);
      }
      onAuthenticated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo continuar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-screen relative min-h-screen overflow-hidden flex flex-col">
      <div className="auth-mesh" aria-hidden="true" />

      <header className="relative z-10 pt-10 pb-4 page-x text-center">
        <h1 className="font-display font-semibold text-display text-primary-dark tracking-tight">
          Whattoeat
        </h1>
      </header>

      <div className="relative z-10 flex-1 flex flex-col justify-center px-7 sm:px-10 pb-12 max-w-md mx-auto w-full">
        <h2 className="section-title mb-2 text-center">
          {mode === 'login' ? 'Iniciá sesión' : 'Creá tu cuenta'}
        </h2>
        <p className="text-small text-ink mb-6 text-center">
          {mode === 'login'
            ? 'Entrá para ver tu menú, recetas y lista de compras.'
            : 'Registráte para guardar y compartir tu menú.'}
        </p>

        {!configured && (
          <div className="auth-glass radius-card shadow-card p-4 mb-4 text-small text-ink-soft leading-relaxed">
            Falta configurar Supabase. Agregá{' '}
            <span className="font-mono text-ink">VITE_SUPABASE_URL</span> y{' '}
            <span className="font-mono text-ink">VITE_SUPABASE_ANON_KEY</span> en{' '}
            <span className="font-mono text-ink">app/.env.local</span> y corré el SQL de{' '}
            <span className="font-mono text-ink">supabase/schema.sql</span>.
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="auth-glass radius-card p-5 flex flex-col gap-3"
        >
          {mode === 'register' && (
            <label className="flex flex-col gap-1.5">
              <span className="text-caption font-semibold text-ink-soft">Nombre</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="auth-input w-full bg-white radius-input px-3 py-3 text-body text-ink focus:outline-none focus:ring-2 focus:ring-primary"
                autoComplete="name"
                required={mode === 'register'}
              />
            </label>
          )}

          <label className="flex flex-col gap-1.5">
            <span className="text-caption font-semibold text-ink-soft">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="auth-input w-full bg-white radius-input px-3 py-3 text-body text-ink focus:outline-none focus:ring-2 focus:ring-primary"
              autoComplete="email"
              required
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-caption font-semibold text-ink-soft">Contraseña</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="auth-input w-full bg-white radius-input px-3 py-3 text-body text-ink focus:outline-none focus:ring-2 focus:ring-primary"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              minLength={6}
              required
            />
          </label>

          {error && (
            <p className="text-small text-danger" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !configured}
            className="w-full min-h-[48px] mt-1 bg-primary text-white radius-pill font-semibold text-small disabled:opacity-50 active:scale-[0.98] transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            {loading ? 'Esperá…' : mode === 'login' ? 'Entrar' : 'Registrarme'}
          </button>

          <p className="text-small text-ink text-center pt-1">
            {mode === 'login' ? '¿No tenés cuenta? ' : '¿Ya tenés cuenta? '}
            <button
              type="button"
              onClick={() => {
                setMode((m) => (m === 'login' ? 'register' : 'login'));
                setError(null);
              }}
              className="font-semibold text-primary underline underline-offset-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm"
            >
              {mode === 'login' ? 'Registrate' : 'Iniciá sesión'}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}
