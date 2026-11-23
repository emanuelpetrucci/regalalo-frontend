import { Pool } from 'pg';

const DATABASE_URL =
  process.env['E2E_DATABASE_URL'] ?? 'postgresql://nolv:nolv@localhost:5432/nolv';

let pool: Pool | null = null;

function getPool(): Pool {
  if (!pool) {
    pool = new Pool({ connectionString: DATABASE_URL, max: 3 });
  }
  return pool;
}

export async function closeDb(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

/** Mark a user's email as verified directly in the database. */
export async function verifyUserEmail(userId: string): Promise<void> {
  await getPool().query(
    'UPDATE users SET email_verified = true, verification_token_hash = null WHERE id = $1',
    [userId],
  );
}

/** Delete a user and all their data, including cascading through items. */
export async function deleteUser(userId: string): Promise<void> {
  const db = getPool();
  // Delete items published by this user first (FK constraint: items.donor_id → users.id)
  await db.query('DELETE FROM items WHERE donor_id = $1', [userId]);
  await db.query('DELETE FROM users WHERE id = $1', [userId]);
}
