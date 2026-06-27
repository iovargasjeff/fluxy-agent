'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Home, Clock, Users, Trash2, Database, Activity, LayoutDashboard, LogOut } from 'lucide-react';
import { getInitials, getAvatarColor } from '@/lib/utils/avatar';
import { useConnectionStore } from '@/lib/store/useConnectionStore';

const DASHBOARD_ITEMS = [
  { icon: Home, label: 'Proyectos', id: 'proyectos' },
  { icon: Clock, label: 'Recientes', id: 'recientes' },
  { icon: Users, label: 'Compartidos', id: 'compartidos' },
  { icon: Trash2, label: 'Papelera', id: 'papelera' }
];

const MAIN_TOOLS = [
  { icon: LayoutDashboard, label: 'Diagramas ER', href: '/dashboard' },
  { icon: Database, label: 'Generador de Datos', href: '/generator' },
  { icon: Activity, label: 'Analizador de Consultas', href: '/analyzer' }
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

  return (
    <aside className="hidden lg:flex flex-col w-[240px] flex-shrink-0 h-screen sticky top-0"
      style={{ backgroundColor: '#0D1117', borderRight: '1px solid #1E2A45' }}>
      
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-5" style={{ borderBottom: '1px solid #1E2A45' }}>
        <div className="w-7 h-7 bg-[#1A6CF6] rounded-lg flex items-center justify-center flex-shrink-0">
          <span className="text-white text-xs font-bold">DB</span>
        </div>
        <span className="text-white font-semibold text-base">Fluxy Local</span>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-4 flex flex-col gap-6">
        
        {/* Main Tools Group */}
        <div>
          <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Herramientas</h3>
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
                      : 'text-gray-400 hover:bg-gray-800 border-transparent'
                  }`}>
                  <Icon size={16} />
                  {label}
                </Link>
              )
            })}
          </div>
        </div>

        {/* Dashboard Sub-items - Only show if in dashboard */}
        {pathname === '/dashboard' && onSectionChange && (
          <div>
            <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Mi Espacio</h3>
            <div className="flex flex-col gap-0.5">
              {DASHBOARD_ITEMS.map(({ icon: Icon, label, id }) => {
                const isActive = activeSection === id
                
                return (
                  <button
                    key={id}
                    onClick={() => onSectionChange(id)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors border-l-2 w-full ${
                      isActive
                        ? 'bg-blue-600/10 text-white border-blue-500'
                        : 'text-gray-400 hover:bg-gray-800 border-transparent'
                    }`}>
                    <Icon size={16} />
                    {label}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Usuario / Conexión en la parte inferior */}
      <div className="px-3 py-4 mt-auto" style={{ borderTop: '1px solid #1E2A45' }}>
        <div className="flex flex-col gap-3 px-2">
          {/* User Info */}
          <div className="flex items-center gap-2.5">
            {userAvatarUrl ? (
              <Image
                src={userAvatarUrl}
                alt={userName}
                width={32}
                height={32}
                unoptimized
                className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                style={{ border: '2px solid #1E2A45' }}
              />
            ) : (
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold"
                style={{ backgroundColor: getAvatarColor(userName) }}>
                {getInitials(userName)}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm text-white font-medium truncate">{userName}</p>
              {userEmail && <p className="text-xs truncate" style={{ color: '#6B7280' }}>{userEmail}</p>}
            </div>
          </div>
          
          {/* Active Connection Info */}
          {activeConnection && (
            <div className="bg-[#111827] rounded-lg p-2.5 border border-[#1E2A45] flex items-center justify-between">
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Conectado a</span>
                <span className="text-xs text-green-400 font-medium truncate" title="Base de datos activa">
                  {activeConnection.username}@{activeConnection.host}
                </span>
              </div>
              <button 
                onClick={clearConnection}
                className="text-gray-500 hover:text-red-400 p-1 rounded transition-colors"
                title="Desconectar"
              >
                <LogOut size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
