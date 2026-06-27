import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { sql } from 'drizzle-orm'

type QueryResult = { rows?: unknown[] } | unknown[]

function getRows(result: QueryResult) {
  return Array.isArray(result) ? result : result.rows ?? []
}

// Use direct connection (port 5432) for information_schema queries
const directUrl = process.env.DATABASE_URL!.replace(':6543/', ':5432/').replace('pooler.', '')
const connection = postgres(directUrl, { prepare: false })
const db = drizzle(connection)

async function main() {
  const result = await db.execute(sql`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'diagram_versions' 
    ORDER BY ordinal_position;
  `)
  console.log('--- diagram_versions columns ---')
  for (const row of getRows(result)) {
    console.log(row)
  }
  
  const count = await db.execute(sql`SELECT COUNT(*) as cnt FROM diagram_versions;`)
  console.log('--- row count ---')
  for (const row of getRows(count)) {
    console.log(row)
  }
  
  await connection.end()
  process.exit(0)
}

main().catch(e => { console.error(e); process.exit(1) })
