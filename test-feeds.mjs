async function fetchXML(url) {
    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const text = await res.text();
        console.log(`[${url}] Success. Length: ${text.length}. Starts with: ${text.substring(0, 50)}`);
        console.log(`[${url}] <item> matches:`, (text.match(/<item>([\s\S]*?)<\/item>/gi) || []).length);
    } catch (e) {
        console.error(`[${url}] Error:`, e.message);
    }
}

async function test() {
    await fetchXML('https://news.google.com/rss/search?q=site:reuters.com+energy+business&hl=en-US&gl=US&ceid=US:en');
    await fetchXML('https://oilprice.com/rss/main');
    await fetchXML('http://feeds.feedburner.com/cen_latestnews');
    await fetchXML('https://www.eia.gov/about/rss/petroleum.xml');
}

test();
