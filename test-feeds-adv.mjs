import fs from 'fs';

async function fetchWithHeaders(url) {
    try {
        const res = await fetch(url, {
            redirect: 'follow',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                'Accept': 'application/rss+xml, application/xml;q=0.9, text/xml;q=0.8, */*;q=0.1'
            }
        });
        console.log(`[${url}] Status: ${res.status}`);
        const text = await res.text();
        console.log(`[${url}] Length: ${text.length}`);
        const match = text.match(/<item>([\s\S]*?)<\/item>/i);
        if (match) {
            console.log(`[${url}] First item snippet:`, match[1].substring(0, 200));
        }

        // Test parsing
        const items = text.match(/<item>([\s\S]*?)<\/item>/gi) || [];
        if (items.length > 0) {
            let title = items[0].match(/<title[^>]*>([\s\S]*?)<\/title>/i);
            console.log(`Title 1 RAW: ${title ? title[1] : 'NONE'}`);
        }

    } catch (e) {
        console.error(`[${url}] Error: ${e.message}`);
    }
}

async function test() {
    await fetchWithHeaders('https://oilprice.com/rss/main');
    await fetchWithHeaders('https://cen.acs.org/rss/index.xml'); // Try alternative for C&EN
    await fetchWithHeaders('https://www.eia.gov/petroleum/supply/weekly/wpsr.xml'); // Alternative EIA
}

test();
