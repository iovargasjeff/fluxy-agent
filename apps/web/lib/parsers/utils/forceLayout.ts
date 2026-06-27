/**
 * Simple force-directed layout algorithm (spring-repulsion).
 * No external dependencies — pure TypeScript math.
 * Only used by the Neo4j editor canvas.
 */

interface LayoutNode {
  id: string
  x: number
  y: number
  vx: number
  vy: number
}

interface LayoutEdge {
  source: string
  target: string
}

const REPULSION = 8000     // How strongly nodes push each other away
const ATTRACTION = 0.04    // Spring strength for connected nodes
const IDEAL_DIST = 160     // Ideal distance between connected nodes
const DAMPING = 0.85       // Velocity damping (0-1, lower = more friction)
const ITERATIONS = 120     // Number of simulation steps

/**
 * Apply a force-directed layout to a set of nodes and edges.
 * Returns a map of nodeId → { x, y } final positions.
 */
export function applyForceLayout(
  nodes: Array<{ id: string; position: { x: number; y: number } }>,
  edges: Array<{ source: string; target: string }>,
  canvasWidth = 800,
  canvasHeight = 600,
): Map<string, { x: number; y: number }> {
  if (nodes.length === 0) return new Map()
  if (nodes.length === 1) {
    return new Map([[nodes[0].id, { x: canvasWidth / 2, y: canvasHeight / 2 }]])
  }

  // Initialize particles with randomness to break symmetry!
  const particles: LayoutNode[] = nodes.map((n) => {
    // If no initial position or (0,0), give it a random position near center
    const hasPosition = n.position.x !== 0 || n.position.y !== 0
    return {
      id: n.id,
      x: hasPosition ? n.position.x : (canvasWidth / 2) + (Math.random() - 0.5) * 300,
      y: hasPosition ? n.position.y : (canvasHeight / 2) + (Math.random() - 0.5) * 300,
      vx: 0,
      vy: 0,
    }
  })

  const particleMap = new Map(particles.map(p => [p.id, p]))

  for (let iter = 0; iter < ITERATIONS; iter++) {
    // --- Repulsion: all pairs ---
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i]
        const b = particles[j]
        let dx = a.x - b.x
        let dy = a.y - b.y
        
        // Add tiny jitter to prevent perfect symmetry traps (e.g. perfect rings)
        if (dx === 0 && dy === 0) {
          dx = (Math.random() - 0.5) * 2
          dy = (Math.random() - 0.5) * 2
        }

        const dist = Math.sqrt(dx * dx + dy * dy) || 0.1
        const force = REPULSION / (dist * dist)
        const fx = (dx / dist) * force
        const fy = (dy / dist) * force
        a.vx += fx
        a.vy += fy
        b.vx -= fx
        b.vy -= fy
      }
    }

    // --- Attraction: connected pairs ---
    for (const edge of edges) {
      const a = particleMap.get(edge.source)
      const b = particleMap.get(edge.target)
      if (!a || !b) continue
      const dx = b.x - a.x
      const dy = b.y - a.y
      const dist = Math.sqrt(dx * dx + dy * dy) || 0.1
      const force = (dist - IDEAL_DIST) * ATTRACTION
      const fx = (dx / dist) * force
      const fy = (dy / dist) * force
      a.vx += fx
      a.vy += fy
      b.vx -= fx
      b.vy -= fy
    }

    // --- Center gravity (weak pull toward center) ---
    const cx = canvasWidth / 2
    const cy = canvasHeight / 2
    for (const p of particles) {
      p.vx += (cx - p.x) * 0.002
      p.vy += (cy - p.y) * 0.002
    }

    // --- Apply velocity and damping ---
    for (const p of particles) {
      p.vx *= DAMPING
      p.vy *= DAMPING
      p.x += p.vx
      p.y += p.vy
    }
  }

  return new Map(particles.map(p => [p.id, { x: p.x, y: p.y }]))
}
