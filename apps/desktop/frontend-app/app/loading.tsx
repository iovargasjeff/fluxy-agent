export default function Loading() {
  return (
    <main className="min-h-screen bg-[#0A0F1E] p-6 text-white">
      <div className="mx-auto max-w-7xl animate-pulse space-y-6">
        <div className="h-12 w-48 rounded-xl bg-[#111827]" />
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="h-96 rounded-3xl border border-[#1E2A45] bg-[#111827]" />
          <div className="h-96 rounded-3xl border border-[#1E2A45] bg-[#111827]" />
        </div>
      </div>
    </main>
  )
}
