import React, { useState } from 'react';
import { Check, Users, ChevronDown, ChevronUp, LogOut, Share2, UserPlus, Pencil, UserMinus, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { EmptyState } from './EmptyState';
import { User, Household, HouseholdMember } from '../types';

interface ProfileViewProps {
  user: User;
  household: Household | null;
  onUpdateName: (name: string) => void;
  onUpdateShareName: (name: string) => void;
  onCreateHousehold: () => void;
  onOpenInvite: () => void;
  onRemoveMember: (userId: string) => void;
  onLogout: () => void;
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export function ProfileView({
  user,
  household,
  onUpdateName,
  onUpdateShareName,
  onCreateHousehold,
  onOpenInvite,
  onRemoveMember,
  onLogout,
}: ProfileViewProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(user.name);
  const [isEditingShareName, setIsEditingShareName] = useState(false);
  const [shareNameDraft, setShareNameDraft] = useState(household?.name ?? '');
  const [howOpen, setHowOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<HouseholdMember | null>(null);

  const memberCount = household?.members.length ?? 0;
  const isShared = memberCount > 1;
  const soloHousehold = household && memberCount === 1;

  const handleSaveName = () => {
    const trimmed = nameDraft.trim();
    if (trimmed) onUpdateName(trimmed);
    setIsEditingName(false);
  };

  const handleSaveShareName = () => {
    const trimmed = shareNameDraft.trim();
    if (trimmed) onUpdateShareName(trimmed);
    else if (household) setShareNameDraft(household.name);
    setIsEditingShareName(false);
  };

  const handleLogout = () => {
    onLogout();
  };

  const handleConfirmRemove = () => {
    if (!memberToRemove) return;
    onRemoveMember(memberToRemove.userId);
    setMemberToRemove(null);
  };

  return (
    <div className="page-x flex flex-col gap-4 pb-8">
      <AnimatePresence>
        {memberToRemove && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-ink/40 backdrop-blur-sm z-[110] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white radius-card p-5 max-w-sm w-full shadow-xl"
              role="dialog"
              aria-modal="true"
              aria-labelledby="remove-member-title"
            >
              <div className="w-11 h-11 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mb-3">
                <AlertTriangle size={22} strokeWidth={2.5} />
              </div>
              <h3 id="remove-member-title" className="section-title mb-2">
                Dejar de compartir
              </h3>
              <p className="text-ink-soft text-small mb-5">
                ¿Dejás de compartir con {memberToRemove.name}? Ya no va a ver este menú, las
                recetas ni la lista de compras.
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setMemberToRemove(null)}
                  className="flex-1 py-3 px-4 radius-pill font-semibold text-ink bg-surface transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmRemove}
                  className="flex-1 py-3 px-4 radius-pill font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors"
                >
                  Confirmar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Person header */}
      <section className="bg-surface radius-card shadow-card p-4 flex items-center gap-3">
        <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center font-display font-semibold text-h2 shrink-0">
          {initials(user.name)}
        </div>
        <div className="flex-1 min-w-0">
          {isEditingName ? (
            <div className="flex items-center gap-2">
              <input
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
                className="flex-1 bg-canvas radius-input px-3 py-2 text-body font-semibold text-ink focus:outline-none focus:ring-2 focus:ring-primary"
                autoFocus
                aria-label="Nombre"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveName();
                  if (e.key === 'Escape') {
                    setNameDraft(user.name);
                    setIsEditingName(false);
                  }
                }}
              />
              <button
                type="button"
                onClick={handleSaveName}
                className="w-10 h-10 shrink-0 rounded-full bg-primary/10 text-primary flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                aria-label="Guardar nombre"
              >
                <Check size={18} strokeWidth={2.5} />
              </button>
            </div>
          ) : (
            <div className="flex items-start gap-2 min-w-0">
              <div className="flex-1 min-w-0">
                <h2 className="section-title truncate leading-tight">{user.name}</h2>
                {user.email && (
                  <p className="text-small text-ink-soft mt-0.5 leading-snug truncate">{user.email}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  setNameDraft(user.name);
                  setIsEditingName(true);
                }}
                className="w-10 h-10 shrink-0 rounded-full bg-canvas text-ink-soft hover:text-primary flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                aria-label="Editar nombre"
              >
                <Pencil size={16} strokeWidth={2.5} />
              </button>
            </div>
          )}
          {isEditingName && user.email && (
            <p className="text-small text-ink-soft mt-0.5 truncate">{user.email}</p>
          )}
        </div>
      </section>

      {/* Share */}
      <section>
        <h2 className="section-title mb-3">Compartir</h2>

        <div className="bg-surface radius-card shadow-card overflow-hidden">
          {!household ? (
            <EmptyState
              icon={Share2}
              title="Todavía no compartís tu menú"
              description="Compartí tu menú, recetas y lista con quien vive o come con vos."
              actionLabel="Empezar a compartir"
              onAction={onCreateHousehold}
              variant="compact"
            />
          ) : (
            <>
              <div className="p-4 border-b border-border">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    {isEditingShareName ? (
                      <div className="flex items-center gap-2">
                        <input
                          value={shareNameDraft}
                          onChange={(e) => setShareNameDraft(e.target.value)}
                          className="flex-1 bg-canvas radius-input px-3 py-2 text-body font-semibold text-ink focus:outline-none focus:ring-2 focus:ring-primary"
                          autoFocus
                          aria-label="Nombre del menú compartido"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveShareName();
                            if (e.key === 'Escape') {
                              setShareNameDraft(household.name);
                              setIsEditingShareName(false);
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={handleSaveShareName}
                          className="w-10 h-10 shrink-0 rounded-full bg-primary/10 text-primary flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                          aria-label="Guardar nombre del menú"
                        >
                          <Check size={18} strokeWidth={2.5} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-start gap-2 min-w-0">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-display font-semibold text-body text-ink truncate leading-tight">
                            {household.name}
                          </h3>
                          <p className="text-small text-ink-soft mt-0.5 leading-snug">
                            {isShared
                              ? `Mismo menú, mismas recetas, misma lista · ${memberCount} personas`
                              : 'Invitá a alguien para compartir el menú'}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setShareNameDraft(household.name);
                            setIsEditingShareName(true);
                          }}
                          className="w-9 h-9 shrink-0 rounded-full bg-canvas text-ink-soft hover:text-primary flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                          aria-label="Editar nombre del menú"
                        >
                          <Pencil size={15} strokeWidth={2.5} />
                        </button>
                      </div>
                    )}
                    {isEditingShareName && (
                      <p className="text-small text-ink-soft mt-0.5 leading-snug">
                        {isShared
                          ? `Mismo menú, mismas recetas, misma lista · ${memberCount} personas`
                          : 'Invitá a alguien para compartir el menú'}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <ul className="px-4 py-2">
                {household.members.map((member) => {
                  const isYou = member.userId === user.id;
                  return (
                    <li key={member.userId} className="flex items-center gap-3 py-2.5 border-b border-surface last:border-0">
                      <div className="w-9 h-9 rounded-full bg-canvas text-ink-soft flex items-center justify-center text-small font-semibold shrink-0">
                        {initials(member.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-body font-medium text-ink truncate">
                          {member.name}
                          {isYou ? ' (vos)' : ''}
                        </p>
                        {member.email && (
                          <p className="text-caption text-ink-soft truncate">{member.email}</p>
                        )}
                      </div>
                      {!isYou && (
                        <button
                          type="button"
                          onClick={() => setMemberToRemove(member)}
                          className="w-10 h-10 shrink-0 rounded-full bg-red-50 text-danger flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-danger"
                          aria-label={`Dejar de compartir con ${member.name}`}
                        >
                          <UserMinus size={16} strokeWidth={2.5} />
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>

              <div className="p-4 pt-1">
                <button
                  type="button"
                  onClick={onOpenInvite}
                  className="w-full min-h-[48px] px-6 py-3 bg-primary text-white radius-pill font-semibold text-small flex items-center justify-center gap-2 active:scale-95 transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  <UserPlus size={18} strokeWidth={2.5} />
                  {soloHousehold ? 'Invitar a alguien' : 'Invitar a otra persona'}
                </button>
              </div>
            </>
          )}

          <div className="border-t border-border">
            <button
              type="button"
              onClick={() => setHowOpen((v) => !v)}
              className="w-full flex items-center justify-between gap-3 p-4 text-left focus:outline-none"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-canvas flex items-center justify-center text-ink-soft shrink-0">
                  <Users size={18} />
                </div>
                <span className="text-body font-medium text-ink">Cómo funciona</span>
              </div>
              {howOpen ? (
                <ChevronUp size={18} className="text-ink-soft" />
              ) : (
                <ChevronDown size={18} className="text-ink-soft" />
              )}
            </button>
            {howOpen && (
              <div className="px-4 pb-4 text-small text-ink-soft leading-relaxed">
                Cuando compartís, invitás a alguien con un código: entra al mismo menú semanal,
                las mismas recetas y la misma lista de compras (no recibe una copia aparte).
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Account */}
      <section>
        <h2 className="section-title mb-3">Cuenta</h2>
        <button
          type="button"
          onClick={handleLogout}
          className="w-full bg-surface radius-card shadow-card p-4 flex items-center gap-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <div className="w-9 h-9 rounded-full bg-canvas flex items-center justify-center text-ink-soft shrink-0">
            <LogOut size={18} />
          </div>
          <span className="text-body font-medium text-ink">Cerrar sesión</span>
        </button>
      </section>
    </div>
  );
}
