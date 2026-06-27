function NodePreview({
  title,
  color,
  columns,
}: {
  title: string
  color: string
  columns: string[]
}) {
  return (
    <div
      className="bg-[#0A0F1E] rounded-lg overflow-hidden min-w-[130px] shadow-lg"
      style={{ border: `1px solid ${color}40` }}
    >
      <div
        className="px-3 py-1.5 text-xs font-bold text-white"
        style={{
          backgroundColor: `${color}20`,
          borderBottom: `1px solid ${color}40`,
        }}
      >
        {title}
      </div>
      <div className="px-3 py-2 flex flex-col gap-1">
        {columns.map((col, i) => (
          <span key={i} className="text-[10px] text-[#9CA3AF] font-mono">
            {col}
          </span>
        ))}
      </div>
    </div>
  )
}

export function AnimatedCanvas() {
  return (
    <div className="aspect-video rounded-xl border border-[#1E2A45] bg-[#111827] overflow-hidden relative shadow-2xl">
      {/* Dot grid background */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'radial-gradient(circle, #1E2A45 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Subtle top glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(26,108,246,0.08), transparent)',
        }}
      />

      {/* Node 1 — users */}
      <div
        className="absolute top-8 left-6"
        style={{ animation: 'fadeSlideIn 0.6s ease 0.3s both' }}
      >
        <NodePreview
          title="users"
          color="#1A6CF6"
          columns={['id: UUID PK', 'email: TEXT', 'name: TEXT']}
        />
      </div>

      {/* Connector line SVG */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ animation: 'fadeSlideIn 0.5s ease 1.3s both', opacity: 0 }}
      >
        <line
          x1="44%"
          y1="38%"
          x2="56%"
          y2="38%"
          stroke="#1A6CF6"
          strokeWidth="1.5"
          strokeDasharray="4 3"
          strokeOpacity="0.5"
        />
      </svg>

      {/* Node 2 — projects */}
      <div
        className="absolute top-8 right-6"
        style={{ animation: 'fadeSlideIn 0.6s ease 0.9s both' }}
      >
        <NodePreview
          title="projects"
          color="#10B981"
          columns={['id: UUID PK', 'owner_id: UUID FK', 'name: TEXT']}
        />
      </div>

      {/* Node 3 — tasks (lower center) */}
      <div
        className="absolute bottom-16 left-1/2 -translate-x-1/2"
        style={{ animation: 'fadeSlideIn 0.6s ease 1.5s both' }}
      >
        <NodePreview
          title="tasks"
          color="#F59E0B"
          columns={['id: UUID PK', 'project_id: FK', 'title: TEXT']}
        />
      </div>

      {/* Bottom label */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-xs text-[#6B7280] bg-[#0A0F1E]/80 px-3 py-1 rounded-full border border-[#1E2A45] whitespace-nowrap">
        Generado desde SQL en tiempo real
      </div>
    </div>
  )
}
