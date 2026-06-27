export default function DashboardLoading() {
  return (
    <div className="flex min-h-screen bg-[#0A0F1E] text-white">
      <div className="hidden w-[220px] border-r border-[#1E2A45] bg-[#0D1117] lg:block" />
      <main className="flex-1">
        <div className="h-16 border-b border-[#1E2A45] bg-[#111827]" />
        <div className="mx-auto max-w-6xl space-y-6 px-4 py-10">
          <div className="h-9 w-52 animate-pulse rounded-lg bg-[#111827]" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-44 animate-pulse rounded-xl border border-[#1E2A45] bg-[#111827]" />
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
