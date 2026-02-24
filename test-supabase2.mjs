import fs from 'fs';
import dotenv from 'dotenv';

// Manually parse env
const envConfig = dotenv.parse(fs.readFileSync('.env.local'));
for (const k in envConfig) {
    process.env[k] = envConfig[k];
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

async function test() {
    console.log('Testing Supabase Connection...');
    console.log('URL:', supabaseUrl);

    try {
        const res = await fetch(`${supabaseUrl}/rest/v1/news?select=id,title`, {
            method: 'GET',
            headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`,
                'Content-Type': 'application/json',
            }
        });

        console.log('Status:', res.status);
        if (res.ok) {
            const data = await res.json();
            console.log(`Success! Found ${data.length} rows.`);
        } else {
            console.error('Error Response:', await res.text());
        }
    } catch (e) {
        console.error('Fetch failed:', e);
    }
}

test();
