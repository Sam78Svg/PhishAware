import { Pool } from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const envPath = path.join(__dirname, '.env');

console.log('[db] Loading env from:', envPath);

dotenv.config({ path: envPath });

console.log('[db] DATABASE_URL exists:', !!process.env.DATABASE_URL);
console.log(
    '[db] DATABASE_URL preview:',
    process.env.DATABASE_URL
        ? process.env.DATABASE_URL.replace(/:\/\/.*@/, '://***@')
        : 'MISSING'
);

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
});

pool.query('SELECT NOW()')
    .then(result => {
        console.log('[db] PostgreSQL test successful:', result.rows[0]);
    })
    .catch(err => {
        console.error('[db] PostgreSQL test FAILED');
        console.error('name:', err.name);
        console.error('message:', err.message);
        console.error('code:', err.code);
        console.error('detail:', err.detail);
        console.error('stack:', err.stack);
    });

export default pool;