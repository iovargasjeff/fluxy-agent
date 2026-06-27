'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Home, Clock, Users, Trash2, History, LogOut, Settings } from 'lucide-react';
import { logoutAction } from '@/lib/backend/actions/auth/logout';
import { getInitials, getAvatarColor } from '@/lib/utils/avatar';

const NAV_ITEMS = [
  { icon: Home, label: 'Proyectos', id: 'proyectos' },
  { icon: Clock, label: 'Recientes', id: 'recientes' },
  { icon: Users, label: 'Compartidos', id: 'compartidos' },
  { icon: Trash2, label: 'Papelera', id: 'papelera' },
  { icon: History, label: 'Historial', id: 'historial' }
];

interface DashboardSidebarProps {
  userName: string
  userEmail?: string
  userAvatarUrl?: string | null
  activeSection: string
  onSectionChange: (section: string) => void
}

export function DashboardSidebar({ userName, userEmail, userAvatarUrl, activeSection, onSectionChange }: DashboardSidebarProps) {

  return (
    <aside className="hidden lg:flex flex-col w-[220px] flex-shrink-0 h-screen sticky top-0 bg-[#0B1322] border-r border-[#1E2A45]">
      
      <div className="flex items-center gap-2.5 px-4 py-5 border-b border-transparent">
        <span className="text-white font-semibold text-base">FluxSQL</span>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-2 py-4 flex flex-col gap-0.5">
        {NAV_ITEMS.map(({ icon: Icon, label, id }) => {
          const isActive = activeSection === id
          
          return (
            <button
              key={id}
              onClick={() => onSectionChange(id)}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 border-l-2 w-full ${
                isActive
                  ? 'bg-[#1A6CF6] text-white font-medium shadow-sm border-transparent'
                  : 'text-[#94A3B8] hover:bg-[#1E2A45] hover:text-white border-transparent hover:translate-x-1'
              }`}>
              <Icon size={16} />
              {label}
            </button>
          )
        })}
      </nav>

      {/* Usuario en la parte inferior */}
      <div className="px-3 py-4 border-t border-[#151E31]">
        <Link
          href="/profile"
          className="flex items-center gap-2.5 mb-3 px-1 py-1 rounded-lg transition-colors hover:bg-[#151E31]"
        >
          {userAvatarUrl ? (
            <Image
              src={userAvatarUrl}
              alt={userName}
              width={32}
              height={32}
              unoptimized
              className="w-8 h-8 rounded-full object-cover flex-shrink-0 border-2 border-[#151E31]"
            />
          ) : (
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold"
              style={{ backgroundColor: getAvatarColor(userName) }}>
              {getInitials(userName)}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm text-white font-medium truncate">{userName}</p>
            {userEmail && <p className="text-xs text-[#94A3B8] truncate">{userEmail}</p>}
          </div>
        </Link>
        <Link
          href="/profile"
          className="flex items-center gap-2 text-xs w-full px-3 py-2 rounded-lg transition-colors text-[#94A3B8] hover:text-white hover:bg-[#1E2A45] mb-1"
        >
          <Settings size={14} />
          Configuración
        </Link>
        <form action={logoutAction}>
          <button type="submit"
            className="flex items-center gap-2 text-xs w-full px-3 py-2 rounded-lg transition-colors text-[#94A3B8] hover:text-white hover:bg-[#1E2A45]">
            <LogOut size={14} />
            Salir
          </button>
        </form>
      </div>
    </aside>
  );
}
