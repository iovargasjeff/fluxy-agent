export default function EditorLoading() {
  return (
    <div className="flex h-dvh overflow-hidden bg-[#07101F] text-white">
      <div className="w-14 shrink-0 border-r border-[#1E2A45] bg-[#0B1322]" />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <div className="h-14 shrink-0 border-b border-[#1E2A45] bg-[#0B1322]" />

        <div className="grid min-h-0 flex-1 grid-cols-[34%_1fr_320px] overflow-hidden">
          <div className="animate-pulse overflow-hidden border-r border-[#1E2A45] bg-[#0B1322]" />

          <div className="animate-pulse overflow-hidden bg-[#07101F] [background-image:radial-gradient(#1E3A5F_1px,transparent_1px)] [background-size:24px_24px]" />

          <div className="animate-pulse overflow-hidden border-l border-[#1E2A45] bg-[#0D1424]" />
        </div>
      </div>
    </div>
  )
}