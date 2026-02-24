import fs from 'fs';

// Vanilla JS approach to parsing .env
const text = fs.readFileSync('.env.local', 'utf-8');
const env = {};
text.split('\n').forEach(line => {
    let match = line.match(/^([^=]+)=(.*)$/);
    if (match) env[match[1].trim()] = match[2].trim();
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

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
