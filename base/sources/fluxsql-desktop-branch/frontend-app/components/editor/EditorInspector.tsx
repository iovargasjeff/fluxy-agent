'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { GitBranch, Plus, Trash2 } from 'lucide-react'
import { useEditorStore } from '@/store/useEditorStore'
import { DEFAULT_TABLE_COLOR, isEditorNode, type EditorNode, type RelationshipCardinality } from '@/lib/editor-schema'

const DATA_TYPES = ['SERIAL', 'UUID', 'INT', 'VARCHAR(100)', 'TEXT', 'DECIMAL(10,2)', 'DATE', 'TIMESTAMP', 'BOOLEAN', 'JSONB']

export function EditorInspector() {
  const nodes = useEditorStore((state) => state.nodes)
  const edges = useEditorStore((state) => state.edges)
  const selectedNodeId = useEditorStore((state) => state.selectedNodeId)
  const setSelectedNodeId = useEditorStore((state) => state.setSelectedNodeId)
  const addTable = useEditorStore((state) => state.addTable)
  const updateTable = useEditorStore((state) => state.updateTable)
  const deleteTable = useEditorStore((state) => state.deleteTable)
  const addColumn = useEditorStore((state) => state.addColumn)
  const updateColumn = useEditorStore((state) => state.updateColumn)
  const deleteColumn = useEditorStore((state) => state.deleteColumn)
  const addRelationship = useEditorStore((state) => state.addRelationship)

  const tables = nodes.filter(isEditorNode)
  const selected = tables.find((node) => node.id === selectedNodeId) ?? tables[0]

  if (!selected) {
    return (
      <aside className="h-full min-h-0 w-full overflow-y-auto border-l border-[#1E2A45] bg-[#0D1424]/95 p-4 text-white">
        <h2 className="text-lg font-semibold">Inspector</h2>
        <p className="mt-2 text-sm text-[#94A3B8]">Aun no hay tablas. Crea una para empezar a modelar sin escribir SQL.</p>
        <button onClick={addTable} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#1A6CF6] px-3 py-2 text-sm font-medium text-white">
          <Plus size={14} />
          Agregar tabla
        </button>
      </aside>
    )
  }

  return (
    <aside className="flex h-full min-h-0 w-full flex-col overflow-y-auto border-l border-[#1E2A45] bg-[#0D1424]/95 text-white">
      <div className="shrink-0 border-b border-[#1E2A45] bg-[#0D1424] p-4">
        <p className="text-xs uppercase tracking-[0.18em] text-[#64748B]">Inspector</p>
        <select
          value={selected.id}
          onChange={(event) => setSelectedNodeId(event.target.value)}
          className="mt-2 w-full rounded-lg border border-[#1E2A45] bg-[#111827] px-3 py-2 text-sm font-semibold text-white outline-none focus:border-[#1A6CF6]"
        >
          {tables.map((table) => <option key={table.id} value={table.id}>{table.data.tableName}</option>)}
        </select>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 pr-3 [scrollbar-color:#1E2A45_transparent]">
        <div className="space-y-5 pb-24">
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[#E2E8F0]">Propiedades</h3>
              <button onClick={() => deleteTable(selected.id)} className="rounded-lg border border-red-500/20 p-2 text-red-300 hover:bg-red-500/10" title="Eliminar tabla">
                <Trash2 size={15} />
              </button>
            </div>
            <TextField label="Nombre de tabla" value={selected.data.tableName} onChange={(value) => updateTable(selected.id, { tableName: value || 'sin_nombre' })} />
            <label className="block text-xs text-[#94A3B8]">
              Comentario
              <textarea
                value={selected.data.comment ?? ''}
                onChange={(event) => updateTable(selected.id, { comment: event.target.value })}
                placeholder="Describe esta tabla..."
                className="mt-1 min-h-16 w-full resize-none rounded-lg border border-[#1E2A45] bg-[#111827] px-3 py-2 text-sm text-white outline-none focus:border-[#1A6CF6]"
              />
            </label>
            <label className="block text-xs text-[#94A3B8]">
              Color
              <input type="color" value={selected.data.color ?? DEFAULT_TABLE_COLOR} onChange={(event) => updateTable(selected.id, { color: event.target.value })} className="mt-1 h-9 w-16 rounded-lg border border-[#1E2A45] bg-[#111827] p-1" />
            </label>
          </section>

          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[#E2E8F0]">Campos ({selected.data.columns.length})</h3>
              <button onClick={() => addColumn(selected.id)} className="rounded-lg border border-[#1E2A45] p-1.5 text-[#94A3B8] hover:text-white">
                <Plus size={14} />
              </button>
            </div>

            {selected.data.columns.map((column, index) => (
              <div key={`${selected.id}-${index}`} className="rounded-xl border border-[#1E2A45] bg-[#111827]/80 p-3">
                <div className="flex items-center gap-2">
                  <input value={column.name} onChange={(event) => updateColumn(selected.id, index, { name: event.target.value || `campo_${index + 1}` })} className="min-w-0 flex-1 rounded-md border border-[#1E2A45] bg-[#0A0F1E] px-2 py-1.5 text-xs text-white outline-none focus:border-[#1A6CF6]" />
                  <select value={column.type} onChange={(event) => updateColumn(selected.id, index, { type: event.target.value })} className="w-32 rounded-md border border-[#1E2A45] bg-[#0A0F1E] px-2 py-1.5 text-xs text-white outline-none focus:border-[#1A6CF6]">
                    {DATA_TYPES.map((type) => <option key={type}>{type}</option>)}
                  </select>
                  <button onClick={() => deleteColumn(selected.id, index)} className="rounded-md p-1.5 text-[#64748B] hover:bg-red-500/10 hover:text-red-300">
                    <Trash2 size={13} />
                  </button>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-[11px] text-[#94A3B8]">
                  <FancyCheck label="Primaria" checked={Boolean(column.isPrimaryKey)} onChange={(checked) => updateColumn(selected.id, index, { isPrimaryKey: checked })} />
                  <FancyCheck label="Nulo" checked={column.nullable !== false} onChange={(checked) => updateColumn(selected.id, index, { nullable: checked })} />
                  <FancyCheck label="Foranea" checked={Boolean(column.isForeignKey)} onChange={(checked) => updateColumn(selected.id, index, { isForeignKey: checked })} />
                </div>
                <input value={column.defaultValue ?? ''} onChange={(event) => updateColumn(selected.id, index, { defaultValue: event.target.value })} placeholder="DEFAULT opcional" className="mt-2 w-full rounded-md border border-[#1E2A45] bg-[#0A0F1E] px-2 py-1.5 text-xs text-white outline-none focus:border-[#1A6CF6]" />
              </div>
            ))}
          </section>

          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[#E2E8F0]">Relaciones ({edges.length})</h3>
            </div>
            <RelationBuilder key={selected.id} selected={selected} tables={tables} onAdd={addRelationship} />
          </section>
        </div>
      </div>
    </aside>
  )
}

function TextField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block text-xs text-[#94A3B8]">
      {label}
      <input value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 w-full rounded-lg border border-[#1E2A45] bg-[#111827] px-3 py-2 text-sm text-white outline-none focus:border-[#1A6CF6]" />
    </label>
  )
}

function FancyCheck({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className={`flex cursor-pointer items-center justify-center gap-1 rounded-lg border px-2 py-1.5 transition ${checked ? 'border-[#1A6CF6]/50 bg-[#1A6CF6]/15 text-[#BFDBFE]' : 'border-[#1E2A45] bg-[#0A0F1E] text-[#94A3B8]'}`}>
      <input className="sr-only" type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <span className={`h-3 w-3 rounded border ${checked ? 'border-[#1A6CF6] bg-[#1A6CF6]' : 'border-[#475569]'}`} />
      {label}
    </label>
  )
}

function RelationBuilder({
  selected,
  tables,
  onAdd,
}: {
  selected: EditorNode
  tables: EditorNode[]
  onAdd: (sourceId: string, sourceColumn: string, targetId: string, targetColumn: string, cardinality?: RelationshipCardinality) => void
}) {
  const firstChild = tables.find((item) => item.id !== selected.id) ?? tables[0]
  const [parentId, setParentId] = useState(selected.id)
  const parent = tables.find((item) => item.id === parentId) ?? selected
  const [parentColumn, setParentColumn] = useState(getKeyColumn(parent))
  const [childId, setChildId] = useState(firstChild?.id ?? '')
  const child = tables.find((item) => item.id === childId)
  const [childColumn, setChildColumn] = useState(child ? getForeignColumn(child, parent) : '')
  const [cardinality, setCardinality] = useState<RelationshipCardinality>('one-to-many')
  const touchedRef = useRef(false)
  const relationKey = `${childId}:${childColumn}:${parentId}:${parentColumn}:${cardinality}`

  const existingRelation = useMemo(() => {
    if (!child || !parent) return null
    return child.data.columns.find((column) =>
      column.name === childColumn &&
      column.references?.table === parent.data.tableName &&
      column.references?.column === parentColumn
    )
  }, [child, childColumn, parent, parentColumn])

  useEffect(() => {
    if (!touchedRef.current) return
    if (!childId || !childColumn || !parentId || !parentColumn || childId === parentId) return
    onAdd(childId, childColumn, parentId, parentColumn, cardinality)
  }, [relationKey, childId, childColumn, parentId, parentColumn, cardinality, onAdd])

  if (tables.length < 2 || tables.some((table) => table.data.columns.length === 0)) {
    return <p className="rounded-lg border border-[#1E2A45] bg-[#111827] p-3 text-xs text-[#94A3B8]">Agrega al menos dos tablas con campos para crear relaciones.</p>
  }

  return (
    <div className="space-y-3 rounded-xl border border-[#1E2A45] bg-[#111827]/80 p-3">
      <div className="flex items-start gap-2">
        <div className="mt-0.5 rounded-lg border border-[#1A6CF6]/25 bg-[#1A6CF6]/10 p-1.5 text-[#93C5FD]">
          <GitBranch size={14} />
        </div>
        <div>
          <p className="text-xs font-semibold text-[#E2E8F0]">Relacion automatica</p>
          <p className="mt-0.5 text-[11px] leading-4 text-[#94A3B8]">Elige tabla principal, tabla relacionada y cardinalidad. El diagrama y SQL se actualizan al cambiar.</p>
        </div>
      </div>

      <SegmentedCardinality value={cardinality} onChange={(value) => {
        touchedRef.current = true
        setCardinality(value)
      }} />

      <div className="rounded-lg border border-[#1E2A45] bg-[#0A0F1E]/70 p-2">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#60A5FA]">Lado 1 - tabla principal</p>
        <div className="grid grid-cols-2 gap-2">
          <LabeledSelect label="Tabla" value={parentId} onChange={(value) => {
            const nextParent = tables.find((item) => item.id === value)
            const nextChild = tables.find((item) => item.id !== value) ?? child
            touchedRef.current = true
            setParentId(value)
            setParentColumn(nextParent ? getKeyColumn(nextParent) : '')
            setChildId(nextChild?.id ?? '')
            setChildColumn(nextParent && nextChild ? getForeignColumn(nextChild, nextParent) : '')
          }} options={tables.map((table) => ({ value: table.id, label: table.data.tableName }))} />
          <LabeledSelect label="Clave" value={parentColumn} onChange={(value) => {
            touchedRef.current = true
            setParentColumn(value)
          }} options={parent.data.columns.map((column) => ({ value: column.name, label: column.name }))} />
        </div>
      </div>

      <div className="rounded-lg border border-[#1E2A45] bg-[#0A0F1E]/70 p-2">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#34D399]">Lado N - tabla relacionada</p>
        <div className="grid grid-cols-2 gap-2">
          <LabeledSelect label="Tabla" value={childId} onChange={(value) => {
            const nextChild = tables.find((item) => item.id === value)
            touchedRef.current = true
            setChildId(value)
            setChildColumn(nextChild ? getForeignColumn(nextChild, parent) : '')
          }} options={tables.filter((table) => table.id !== parentId).map((table) => ({ value: table.id, label: table.data.tableName }))} />
          <LabeledSelect label="Campo FK" value={childColumn} onChange={(value) => {
            touchedRef.current = true
            setChildColumn(value)
          }} options={(child?.data.columns ?? []).map((column) => ({ value: column.name, label: column.name }))} />
        </div>
      </div>

      <div className={`rounded-lg border px-3 py-2 text-[11px] ${
        existingRelation
          ? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-200'
          : 'border-[#1A6CF6]/25 bg-[#1A6CF6]/10 text-[#BFDBFE]'
      }`}>
        {existingRelation ? 'Relacion activa y sincronizada.' : 'Lista para crear: cambia cualquier selector para aplicar la relacion.'}
      </div>
    </div>
  )
}

const CARDINALITIES: Array<{ value: RelationshipCardinality; label: string; hint: string }> = [
  { value: 'one-to-many', label: '1:N', hint: 'Una principal, muchas relacionadas' },
  { value: 'many-to-one', label: 'N:1', hint: 'Muchas relacionadas, una principal' },
  { value: 'one-to-one', label: '1:1', hint: 'Una fila por cada fila' },
]

function SegmentedCardinality({ value, onChange }: { value: RelationshipCardinality; onChange: (value: RelationshipCardinality) => void }) {
  return (
    <div className="grid grid-cols-3 gap-1 rounded-lg border border-[#1E2A45] bg-[#0A0F1E] p-1">
      {CARDINALITIES.map((item) => (
        <button
          key={item.value}
          type="button"
          onClick={() => onChange(item.value)}
          title={item.hint}
          className={`rounded-md px-2 py-1.5 text-xs font-semibold transition ${
            value === item.value
              ? 'bg-[#1A6CF6] text-white shadow shadow-[#1A6CF6]/20'
              : 'text-[#94A3B8] hover:bg-[#111827] hover:text-white'
          }`}
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}

function getKeyColumn(table: EditorNode) {
  return table.data.columns.find((column) => column.isPrimaryKey)?.name ?? table.data.columns[0]?.name ?? ''
}

function getForeignColumn(child: EditorNode, parent: EditorNode) {
  const parentName = parent.data.tableName.toLowerCase().replace(/s$/, '')
  return (
    child.data.columns.find((column) => column.references?.table === parent.data.tableName)?.name ??
    child.data.columns.find((column) => column.isForeignKey)?.name ??
    child.data.columns.find((column) => column.name.toLowerCase().includes(parentName))?.name ??
    child.data.columns.find((column) => !column.isPrimaryKey)?.name ??
    child.data.columns[0]?.name ??
    ''
  )
}

function LabeledSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: Array<{ value: string; label: string }> }) {
  return (
    <label className="block text-[11px] text-[#94A3B8]">
      {label}
      <Select value={value} onChange={onChange} options={options} />
    </label>
  )
}

function Select({ value, onChange, options }: { value: string; onChange: (value: string) => void; options: Array<{ value: string; label: string }> }) {
  return (
    <select value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-md border border-[#1E2A45] bg-[#0A0F1E] px-2 py-1.5 text-xs text-white outline-none focus:border-[#1A6CF6]">
      {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
    </select>
  )
}
