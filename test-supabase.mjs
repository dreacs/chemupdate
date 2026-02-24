import { fetchAllNewsFromDB, insertNewsBatch } from './src/lib/supabase.js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function test() {
    console.log('Fetching from URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);

    // 1. Check if table exists / fetch works
    const rows = await fetchAllNewsFromDB();
    console.log('Current rows in DB:', rows.length);

    // 2. Test an insert
    if (rows.length === 0) {
        console.log('Inserting dummy row to test permissions...');
        await insertNewsBatch([{
            title: 'Test Title ' + Date.now(),
            summary: 'Test',
            sentiment: 'Neutral',
            commodity: 'None',
            source: 'Test',
            link: 'http://test.com',
            published_at: new Date().toISOString()
        }]);

        const newRows = await fetchAllNewsFromDB();
        console.log('Rows after insert:', newRows.length);
    }
}

test().catch(console.error);
