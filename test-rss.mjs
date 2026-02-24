import Parser from 'rss-parser';

const parser = new Parser();

async function test() {
    try {
        const reuters = await parser.parseURL('https://www.reuters.com/arc/outboundfeeds/rss/category/business/energy/');
        console.log('Reuters OK:', reuters.items.length);
    } catch (e) {
        console.error('Reuters Error:', e.message);
    }

    try {
        const oilprice = await parser.parseURL('https://oilprice.com/rss/main');
        console.log('Oilprice OK:', oilprice.items.length);
    } catch (e) {
        console.error('Oilprice Error:', e.message);
    }
}

test();
