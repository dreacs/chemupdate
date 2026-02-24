async function test3() {
    try {
        const r1 = await fetch('https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=10000810');
        console.log('CNBC', r1.status, (await r1.text()).length);
    } catch (e) { console.log('CNBC error'); }

    try {
        const r2 = await fetch('https://feeds.finance.yahoo.com/rss/2.0/headline?s=XLE');
        console.log('Yahoo', r2.status, (await r2.text()).length);
    } catch (e) { console.log('Yahoo error'); }
}
test3();
