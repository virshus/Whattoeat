import React, { useState } from 'react';
import { Copy, Check, Mail, Hash, LogIn } from 'lucide-react';
import { Household } from '../types';

interface InviteHouseholdSheetProps {
  household: Household;
  onJoinByCode: (code: string) => Promise<void>;
}

type InviteTab = 'share' | 'join' | 'email';

export function InviteHouseholdSheet({ household, onJoinByCode }: InviteHouseholdSheetProps) {
  const [tab, setTab] = useState<InviteTab>('share');
  const [email, setEmail] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [joinOk, setJoinOk] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(household.inviteCode);
    } catch {
      // ignore
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  const handleSendEmailMock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setEmailSent(true);
    window.setTimeout(() => setEmailSent(false), 3000);
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim() || joining) return;
    setJoinError(null);
    setJoinOk(false);
    setJoining(true);
    try {
      await onJoinByCode(joinCode.trim());
      setJoinOk(true);
      setJoinCode('');
    } catch (err) {
      setJoinError(err instanceof Error ? err.message : 'No se pudo unir al menú.');
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 pb-4">
      <p className="text-small text-ink-soft">
        Con quien lo compartas va a ver el mismo menú, recetas y lista que vos.
      </p>

      <div className="flex gap-1 p-1 bg-surface radius-card">
        <button
          type="button"
          onClick={() => setTab('share')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-[10px] text-small font-semibold transition-colors focus:outline-none ${
            tab === 'share' ? 'bg-white text-ink shadow-sm' : 'text-ink-soft'
          }`}
        >
          <Hash size={16} />
          Tu código
        </button>
        <button
          type="button"
          onClick={() => setTab('join')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-[10px] text-small font-semibold transition-colors focus:outline-none ${
            tab === 'join' ? 'bg-white text-ink shadow-sm' : 'text-ink-soft'
          }`}
        >
          <LogIn size={16} />
          Unirme
        </button>
        <button
          type="button"
          onClick={() => setTab('email')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-[10px] text-small font-semibold transition-colors focus:outline-none ${
            tab === 'email' ? 'bg-white text-ink shadow-sm' : 'text-ink-soft'
          }`}
        >
          <Mail size={16} />
          Email
        </button>
      </div>

      {tab === 'share' ? (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-white radius-card px-4 py-3.5 font-mono text-body font-semibold text-ink tracking-wide text-center shadow-sm">
              {household.inviteCode}
            </div>
            <button
              type="button"
              onClick={handleCopy}
              className="min-h-[48px] min-w-[48px] radius-card bg-white shadow-sm flex items-center justify-center text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              aria-label="Copiar código"
            >
              {copied ? <Check size={20} className="text-success" /> : <Copy size={20} />}
            </button>
          </div>
          <p className="text-caption text-ink-soft text-center">
            {copied ? 'Código copiado' : 'Compartí este código con quien quieras sumar'}
          </p>
        </div>
      ) : tab === 'join' ? (
        <form onSubmit={handleJoin} className="flex flex-col gap-3">
          <input
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            placeholder="WTE-XXXX"
            className="w-full bg-white radius-card px-4 py-3 text-body font-mono font-semibold text-ink text-center tracking-wide placeholder:text-ink-soft focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
            autoCapitalize="characters"
          />
          <button
            type="submit"
            disabled={!joinCode.trim() || joining}
            className="w-full min-h-[48px] bg-primary text-white radius-pill font-semibold text-small disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            {joining ? 'Uniéndote…' : 'Unirme a este menú'}
          </button>
          {joinError && (
            <p className="text-small text-danger text-center" role="alert">
              {joinError}
            </p>
          )}
          {joinOk && (
            <p className="text-small text-success text-center" role="status">
              Listo, ya estás en el menú compartido.
            </p>
          )}
        </form>
      ) : (
        <form onSubmit={handleSendEmailMock} className="flex flex-col gap-3">
          <input
            type="email"
            placeholder="email@ejemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-white radius-card px-4 py-3 text-body text-ink placeholder:text-ink-soft focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
          />
          <button
            type="submit"
            disabled={!email.trim()}
            className="w-full min-h-[48px] bg-primary text-white radius-pill font-semibold text-small disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            Enviar invitación
          </button>
          {emailSent && (
            <p className="text-small text-ink-soft text-center" role="status">
              Por ahora usá el código. El envío por email viene después.
            </p>
          )}
        </form>
      )}
    </div>
  );
}
