export const dynamic = 'force-dynamic'

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return <div className="flex h-[100dvh] w-full flex-col overflow-hidden">{children}</div>
}
