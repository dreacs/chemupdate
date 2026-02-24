// Since "npm install @supabase/supabase-js" fails with ECONNRESET on this network,
// we interface with the Supabase PostgREST API directly via native fetch.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!;

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
}

export async function fetchAllNewsFromDB(): Promise<DbNewsItem[]> {
    const res = await fetch(`${supabaseUrl}/rest/v1/news?select=*&order=published_at.desc.nullslast`, {
        method: 'GET',
        headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
        },
        next: { revalidate: 0 } // Always fresh
    });

    if (!res.ok) {
        console.error('Failed to fetch from Supabase:', await res.text());
        return [];
    }

    return await res.json();
}
