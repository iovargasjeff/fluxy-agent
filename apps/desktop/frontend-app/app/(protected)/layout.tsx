// removed force-dynamic

import { ClientInitProvider } from '@/components/providers/ClientInitProvider'

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClientInitProvider>
      <div className="h-full min-h-screen">{children}</div>
    </ClientInitProvider>
  )
}
