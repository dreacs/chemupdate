async function testOil() {
    try {
        // Brent Crude Oil symbol on Yahoo Finance is BZ=F
        const res = await fetch('https://query1.finance.yahoo.com/v8/finance/chart/BZ=F?interval=1d&range=1d');
        const data = await res.json();
        const price = data.chart.result[0].meta.regularMarketPrice;
        console.log('Brent Crude Price:', price);
    } catch (e) {
        console.error('Error fetching oil:', e);
    }
}
testOil();
