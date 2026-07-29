import React, { useState } from 'react';
import { X, Home, CalendarDays, Utensils, ListChecks, User, LogOut, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentView: string;
  onNavigate: (view: string) => void;
  onLogout: () => void;
}

export function Drawer({ isOpen, onClose, currentView, onNavigate, onLogout }: DrawerProps) {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const menuItems = [
    { id: 'home', icon: <Home size={20} />, label: 'Inicio' },
    { id: 'weekly', icon: <CalendarDays size={20} />, label: 'Menú semanal' },
    { id: 'recipes', icon: <Utensils size={20} />, label: 'Recetas' },
    { id: 'shopping', icon: <ListChecks size={20} />, label: 'Lista de compras' },
    { id: 'profile', icon: <User size={20} />, label: 'Perfil' },
  ];

  const handleConfirmLogout = () => {
    setShowLogoutConfirm(false);
    onClose();
    onLogout();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-ink/40 z-40 backdrop-blur-sm"
            aria-hidden="true"
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-3/4 max-w-sm bg-surface z-50 shadow-2xl flex flex-col"
          >
            <div className="p-4 flex justify-end">
              <button
                onClick={onClose}
                className="p-2 text-ink-soft hover:text-ink transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg"
                aria-label="Cerrar menú"
              >
                <X size={22} />
              </button>
            </div>

            <nav className="flex-1 px-4 py-2 flex flex-col gap-1.5">
              {menuItems.map((item) => {
                const isActive = item.id === currentView;
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                      isActive
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-ink hover:bg-canvas'
                    }`}
                  >
                    <span className={isActive ? 'text-primary' : 'text-ink-soft'}>
                      {item.icon}
                    </span>
                    <span className="text-body">{item.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="p-4 border-t border-border flex flex-col gap-3">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(true)}
                className="w-full flex items-center justify-center gap-2 min-h-[48px] px-4 radius-pill font-semibold text-small text-danger bg-red-50 hover:bg-red-100 active:scale-[0.98] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-danger"
                aria-label="Cerrar sesión"
              >
                <LogOut size={18} strokeWidth={2.5} />
                Cerrar sesión
              </button>
              <p className="text-caption text-ink-soft text-center">Whattoeat v1.0</p>
            </div>
          </motion.div>

          <AnimatePresence>
            {showLogoutConfirm && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-ink/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
              >
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="bg-white radius-card p-5 max-w-sm w-full shadow-xl"
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="logout-confirm-title"
                >
                  <div className="w-11 h-11 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mb-3">
                    <AlertTriangle size={22} strokeWidth={2.5} />
                  </div>
                  <h3 id="logout-confirm-title" className="section-title mb-2">
                    Cerrar sesión
                  </h3>
                  <p className="text-ink-soft text-small mb-5">
                    ¿Seguro que querés cerrar sesión? Vas a tener que volver a iniciar sesión para
                    ver tu menú.
                  </p>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowLogoutConfirm(false)}
                      className="flex-1 py-3 px-4 radius-pill font-semibold text-ink bg-surface transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmLogout}
                      className="flex-1 py-3 px-4 radius-pill font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors"
                    >
                      Cerrar sesión
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  );
}
