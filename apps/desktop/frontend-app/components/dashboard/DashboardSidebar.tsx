'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Home, Clock, Users, Trash2, Database, LayoutDashboard, LogOut, Store, Plug, Network, Bot, RefreshCw, Cloud, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { getInitials, getAvatarColor } from '@/lib/utils/avatar';
import { useConnectionStore } from '@/lib/store/useConnectionStore';
import { useEffect, useState } from 'react';
import { syncAPI } from '@/lib/api/client';

const DASHBOARD_ITEMS = [
  { icon: Home, label: 'Proyectos', id: 'proyectos' },
  { icon: Clock, label: 'Recientes', id: 'recientes' },
  { icon: Users, label: 'Compartidos', id: 'compartidos' },
  { icon: Trash2, label: 'Papelera', id: 'papelera' }
];

const MAIN_TOOLS = [
  { icon: LayoutDashboard, label: 'Diagramas ER', href: '/dashboard' },
  { icon: Plug, label: 'Conexiones', href: '/connect' },
  { icon: Database, label: 'Generador de Datos', href: '/generator' },
  { icon: Store, label: 'Skill Store', href: '/skills' },
  { icon: Bot, label: 'Herramientas Agenticas', href: '/agent-tools' },
  { icon: Network, label: 'MCP Local', href: '/mcp' },
  { icon: Cloud, label: 'Cuenta y Sync', href: '/account' }
];

interface DashboardSidebarProps {
  userName: string
  userEmail?: string
  userAvatarUrl?: string | null
  activeSection?: string
  onSectionChange?: (section: string) => void
}

export function DashboardSidebar({ userName, userEmail, userAvatarUrl, activeSection, onSectionChange }: DashboardSidebarProps) {
  const pathname = usePathname();
  const { activeConnection, clearConnection } = useConnectionStore();
  const [cloudEmail, setCloudEmail] = useState<string | null>(null);
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void syncAPI.account()
        .then((account) => {
          if (account.linked && account.user_email) setCloudEmail(account.user_email)
        })
        .catch(() => {})
    }, 0)
    return () => window.clearTimeout(timer)
  }, [])

  function openAccountSync() {
    window.location.href = '/account';
  }

  const displayName = cloudEmail ? cloudEmail.split('@')[0] : userName
  const displayEmail = cloudEmail ?? userEmail
  const isDark = resolvedTheme === 'dark'

  return (
    <aside className="hidden h-screen w-[240px] flex-shrink-0 flex-col overflow-hidden border-r border-slate-200 bg-white text-slate-950 dark:border-[#1E2A45] dark:bg-[#0D1117] dark:text-white lg:sticky lg:top-0 lg:flex">
      
      {/* Logo */}
      <div className="flex items-center gap-2.5 border-b border-slate-200 px-4 py-5 dark:border-[#1E2A45]">
        <div className="w-7 h-7 bg-[#1A6CF6] rounded-lg flex items-center justify-center flex-shrink-0">
          <span className="text-white text-xs font-bold">DB</span>
        </div>
        <span className="font-semibold text-base">Fluxy Local</span>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-2 py-4 flex flex-col gap-6 [scrollbar-width:thin] [scrollbar-color:#cbd5e1_transparent] dark:[scrollbar-color:#334155_transparent]">
        
        {/* Main Tools Group */}
        <div>
          <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 dark:text-gray-500">Herramientas</h3>
          <div className="flex flex-col gap-0.5">
            {MAIN_TOOLS.map(({ icon: Icon, label, href }) => {
              const isActive = pathname === href || pathname?.startsWith(`${href}/`)
              
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors border-l-2 w-full ${
                    isActive
                      ? 'bg-blue-600/20 text-blue-400 border-blue-500'
                      : 'text-slate-600 hover:bg-slate-100 border-transparent dark:text-gray-400 dark:hover:bg-gray-800'
                  }`}>
                  <Icon size={16} />
                  {label}
                </Link>
              )
            })}
          </div>
        </div>

        <div>
          <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 dark:text-gray-500">Mi Espacio</h3>
          <div className="flex flex-col gap-0.5">
            {DASHBOARD_ITEMS.map(({ icon: Icon, label, id }) => {
              const isActive = pathname === '/dashboard' && activeSection === id
              const interactive = pathname === '/dashboard' && onSectionChange

              return interactive ? (
                  <button
                    key={id}
                    onClick={() => onSectionChange(id)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors border-l-2 w-full ${
                      isActive
                        ? 'bg-blue-600/10 text-[#1A6CF6] border-blue-500 dark:text-white'
                        : 'text-slate-600 hover:bg-slate-100 border-transparent dark:text-gray-400 dark:hover:bg-gray-800'
                    }`}>
                    <Icon size={16} />
                    {label}
                  </button>
                ) : (
                  <Link
                    key={id}
                    href="/dashboard"
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors border-l-2 w-full ${
                      isActive ? 'bg-blue-600/10 text-[#1A6CF6] dark:text-white border-blue-500' : 'text-slate-600 hover:bg-slate-100 border-transparent dark:text-gray-400 dark:hover:bg-gray-800'
                    }`}
                  >
                    <Icon size={16} />
                    {label}
                  </Link>
                )
            })}
          </div>
        </div>
      </div>

      {/* Usuario / Conexión en la parte inferior */}
      <div className="mt-auto border-t border-slate-200 px-3 py-4 dark:border-[#1E2A45]">
        <div className="flex flex-col gap-3 px-2">
          <button
            type="button"
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className="flex h-9 items-center justify-center gap-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 transition hover:border-[#1A6CF6] hover:text-[#1A6CF6] dark:border-[#1E2A45] dark:text-gray-300 dark:hover:bg-gray-800"
          >
            {isDark ? <Sun size={14} /> : <Moon size={14} />}
            {isDark ? 'Tema claro' : 'Tema oscuro'}
          </button>

          {/* User Info */}
          <div className="flex items-center gap-2.5">
            {userAvatarUrl ? (
              <Image
                src={userAvatarUrl}
                alt={displayName}
                width={32}
                height={32}
                unoptimized
                className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                style={{ border: '2px solid #1E2A45' }}
              />
            ) : (
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold"
                style={{ backgroundColor: getAvatarColor(displayName) }}>
                {getInitials(displayName)}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{displayName}</p>
              {displayEmail && <p className="text-xs truncate text-slate-500 dark:text-[#6B7280]">{displayEmail}</p>}
            </div>
          </div>
          
          {/* Active Connection Info */}
          {activeConnection && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-2.5 flex items-center justify-between dark:border-[#1E2A45] dark:bg-[#111827]">
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider dark:text-gray-500">Conectado a</span>
                <span className="text-xs text-green-400 font-medium truncate" title="Base de datos activa">
                  {activeConnection.username}@{activeConnection.host}
                </span>
              </div>
              <button 
                onClick={clearConnection}
                className="text-slate-500 hover:text-red-500 p-1 rounded transition-colors dark:text-gray-500 dark:hover:text-red-400"
                title="Desconectar"
              >
                <LogOut size={14} />
              </button>
            </div>
          )}
          {!cloudEmail && (
            <button
              type="button"
              onClick={openAccountSync}
              className="flex items-center gap-2 text-xs w-full px-3 py-2 rounded-lg transition-colors text-slate-500 hover:bg-slate-100 hover:text-[#1A6CF6] dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800"
            >
              <RefreshCw size={14} />
              Cuenta y Sync
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
