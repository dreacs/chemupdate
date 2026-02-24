async function test() {
    const xml = '<item><title>\nHello World\n</title></item>';
    const match = xml.match(new RegExp(`<title[^>]*>([\\s\\S]*?)</title>`, 'i'));
    console.log('Regex fix:', match ? match[1].trim() : 'Failed');

    // Test Feedburner with curl-like behavior using fetch
    try {
        const cenRes = await fetch('http://feeds.feedburner.com/cen_latestnews', { redirect: 'follow' });
        console.log('CEN Status:', cenRes.status, 'Len:', (await cenRes.text()).length);
    } catch (e) {
        console.log('CEN Error:', e.message);
    }

    // Test EIA alternative
    const eiaUrls = [
        'https://www.eia.gov/rss/petroleum.xml',
        'https://www.eia.gov/about/rss/press_releases.xml',
        'https://www.eia.gov/about/rss/today_in_energy.xml'
    ];
    for (const url of eiaUrls) {
        try {
            const res = await fetch(url);
            console.log(`EIA [${url}]:`, res.status);
        } catch (e) { }
    }
}
test();
