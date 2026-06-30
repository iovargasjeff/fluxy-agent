'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Clock, Users, Trash2, History, LogOut, Settings, Store } from 'lucide-react';
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
  const pathname = usePathname();
  const router = useRouter();
  const isSkillsActive = pathname === '/skills' || pathname?.startsWith('/skills/');

  return (
    <aside className="hidden lg:flex flex-col w-[220px] flex-shrink-0 h-screen sticky top-0 bg-white border-r border-slate-200">
      <div className="flex items-center gap-2.5 px-4 py-5 border-b border-slate-100">
        <div className="h-8 w-8 rounded-lg bg-[#1A6CF6] flex items-center justify-center text-white text-xs font-bold">
          F
        </div>
        <span className="text-slate-950 font-semibold text-base">Fluxy</span>
      </div>

      <nav className="flex-1 px-2 py-4 flex flex-col gap-0.5">
        <Link
          href="/skills"
          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors border-l-2 w-full ${
            isSkillsActive
              ? 'bg-[#1A6CF6] text-white font-medium border-transparent shadow-sm'
              : 'text-slate-600 hover:bg-blue-50 hover:text-[#1A6CF6] border-transparent'
          }`}
        >
          <Store size={16} />
          Skill Store
        </Link>

        {NAV_ITEMS.map(({ icon: Icon, label, id }) => {
          const isActive = !isSkillsActive && activeSection === id;

          return (
            <button
              key={id}
              onClick={() => {
                onSectionChange(id);
                if (isSkillsActive) router.push('/dashboard');
              }}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors border-l-2 w-full ${
                isActive
                  ? 'bg-[#1A6CF6] text-white font-medium shadow-sm border-transparent'
                  : 'text-slate-600 hover:bg-blue-50 hover:text-[#1A6CF6] border-transparent'
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-slate-100">
        <Link
          href="/profile"
          className="flex items-center gap-2.5 mb-3 px-1 py-1 rounded-lg transition-colors hover:bg-slate-50"
        >
          {userAvatarUrl ? (
            <Image
              src={userAvatarUrl}
              alt={userName}
              width={32}
              height={32}
              unoptimized
              className="w-8 h-8 rounded-full object-cover flex-shrink-0 border-2 border-slate-100"
            />
          ) : (
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold"
              style={{ backgroundColor: getAvatarColor(userName) }}
            >
              {getInitials(userName)}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm text-slate-950 font-medium truncate">{userName}</p>
            {userEmail && <p className="text-xs text-slate-500 truncate">{userEmail}</p>}
          </div>
        </Link>

        <Link
          href="/profile"
          className="flex items-center gap-2 text-xs w-full px-3 py-2 rounded-lg transition-colors text-slate-600 hover:text-[#1A6CF6] hover:bg-blue-50 mb-1"
        >
          <Settings size={14} />
          Configuracion
        </Link>
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex items-center gap-2 text-xs w-full px-3 py-2 rounded-lg transition-colors text-slate-600 hover:text-[#1A6CF6] hover:bg-blue-50"
          >
            <LogOut size={14} />
            Salir
          </button>
        </form>
      </div>
    </aside>
  );
}
