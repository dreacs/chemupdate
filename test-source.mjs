async function test() {
    const r = await fetch('https://news.google.com/rss/search?q=ammonia+market+price+energy&hl=en-US&gl=US&ceid=US:en');
    const text = await r.text();
    const items = text.match(/<item>([\s\S]*?)<\/item>/gi) || [];

    for (let i = 0; i < 3; i++) {
        const itemXml = items[i];
        const sourceMatch = itemXml.match(/<source[^>]*>([\s\S]*?)<\/source>/i);
        console.log('Source:', sourceMatch ? sourceMatch[1] : 'NONE');
    }
}
test();
