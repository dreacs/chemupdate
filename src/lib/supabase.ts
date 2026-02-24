// Since "npm install @supabase/supabase-js" fails with ECONNRESET on this network,
// we interface with the Supabase PostgREST API directly via native fetch.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

export interface DbNewsItem {
    id?: string;
    title: string;
    summary: string;
    sentiment: string;
    commodity: string;
    source: string;
    link: string;
    published_at: string;
}

export async function insertNewsBatch(items: DbNewsItem[]) {
    if (!items || items.length === 0) return;
    if (!supabaseUrl || !supabaseKey) {
        console.warn('Supabase URL or Key is missing. Skipping database insert.');
        return;
    }

    try {
        const res = await fetch(`${supabaseUrl}/rest/v1/news`, {
            method: 'POST',
            headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`,
                'Content-Type': 'application/json',
                'Prefer': 'resolution=ignore-duplicates' // Will ignore items where title already exists (Unique constraint)
            },
            body: JSON.stringify(items)
        });

        if (!res.ok) {
            console.error('Failed to insert batch into Supabase:', await res.text());
        }
    } catch (e) {
        console.error('Network error during Supabase insert:', e);
    }
}

export async function fetchAllNewsFromDB(): Promise<DbNewsItem[]> {
    if (!supabaseUrl || !supabaseKey) {
        return [{
            id: 'err-env',
            title: `[DEBUG] Missing Env Variables on Vercel`,
            summary: `URL is ${supabaseUrl ? 'Set' : 'Missing'}, Key is ${supabaseKey ? 'Set' : 'Missing'}`,
            sentiment: 'Neutral',
            commodity: 'None',
            source: 'System Error',
            link: '#',
            published_at: new Date().toISOString()
        }];
    }

    try {
        const res = await fetch(`${supabaseUrl}/rest/v1/news?select=*&order=published_at.desc.nullslast`, {
            method: 'GET',
            headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`,
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache, no-store, must-revalidate',
            },
            cache: 'no-store', // Vercel Next.js exact override
            next: { revalidate: 0 } // Always fresh
        });

        if (!res.ok) {
            const errText = await res.text();
            return [{
                id: 'err-fetch',
                title: `[DEBUG] Supabase Fetch Error: ${res.status} ${res.statusText}`,
                summary: `Details: ${errText.substring(0, 200)} | Key starts with: ${supabaseKey.substring(0, 15)}...`,
                sentiment: 'Bearish',
                commodity: 'None',
                source: 'System Error',
                link: '#',
                published_at: new Date().toISOString()
            }];
        }

        return await res.json();
    } catch (e: any) {
        return [{
            id: 'err-net',
            title: `[DEBUG] Network Exception during Fetch`,
            summary: `Error: ${e.message}`,
            sentiment: 'Bearish',
            commodity: 'None',
            source: 'System Error',
            link: '#',
            published_at: new Date().toISOString()
        }];
    }
}
