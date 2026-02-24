export interface NewsItem {
  id: string;
  title: string;
  link: string;
  pubDate: string;
  source: string;
}

export async function fetchBrentCrudePrice(): Promise<number | null> {
  try {
    const res = await fetch('https://query1.finance.yahoo.com/v8/finance/chart/BZ=F?interval=1d&range=1d', {
      next: { revalidate: 300 } // Revalidate every 5 minutes
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.chart.result[0].meta.regularMarketPrice;
  } catch (e) {
    console.error('Failed to fetch crude price', e);
    return null;
  }
}

function extractTag(xml: string, tag: string): string {
  const match = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i'));
  if (match && match[1]) {
    return match[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim();
  }
  return '';
}

function parseRSSItems(xmlData: string, source: string): NewsItem[] {
  const items: NewsItem[] = [];
  const itemMatches = xmlData.match(/<item>([\s\S]*?)<\/item>/gi);

  if (itemMatches) {
    for (const itemXml of itemMatches) {
      if (items.length >= 3) break; // Take only the latest 3 per source

      const title = extractTag(itemXml, 'title');
      if (!title) continue;

      let link = extractTag(itemXml, 'link');
      if (!link) {
        link = '';
      }

      const guid = extractTag(itemXml, 'guid');
      const pubDate = extractTag(itemXml, 'pubDate') || new Date().toISOString();
      let actualSource = extractTag(itemXml, 'source');

      // Clean up HTML entities like &amp;
      if (actualSource) {
        actualSource = actualSource.replace(/&amp;/g, '&').replace(/&quot;/g, '"');
      } else {
        actualSource = source; // fallback to 'Google: Acetone' etc
      }

      items.push({
        id: guid || link || Math.random().toString(),
        title,
        link,
        pubDate,
        source: actualSource,
      });
    }
  }
  return items;
}

export async function fetchNews(): Promise<NewsItem[]> {
  try {
    const fetchWithTimeout = async (url: string) => {
      const response = await fetch(url, {
        next: { revalidate: 3600 },
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.text();
    };

    const sources = [
      { name: 'Google: Acetone', url: 'https://news.google.com/rss/search?q=acetone+market+price&hl=en-US&gl=US&ceid=US:en' },
      { name: 'Google: Ammonia', url: 'https://news.google.com/rss/search?q=ammonia+market+price+energy&hl=en-US&gl=US&ceid=US:en' },
      { name: 'Google: Methanol', url: 'https://news.google.com/rss/search?q=methanol+market+price&hl=en-US&gl=US&ceid=US:en' },
      { name: 'Google: Natural Gas', url: 'https://news.google.com/rss/search?q=natural+gas+market+energy&hl=en-US&gl=US&ceid=US:en' }
    ];

    const results = await Promise.allSettled(sources.map(s => fetchWithTimeout(s.url)));
    let allItems: NewsItem[] = [];

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        const parsedItems = parseRSSItems(result.value, sources[index].name);
        allItems.push(...parsedItems);
      } else {
        console.warn(`Feed ${sources[index].name} failed to load:`, result.reason);
      }
    });

    // Deduplicate exact titles
    const seenTitles = new Set<string>();
    allItems = allItems.filter(item => {
      if (seenTitles.has(item.title)) {
        return false;
      }
      seenTitles.add(item.title);
      return true;
    });

    // Sort by pubDate descending
    allItems.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

    return allItems;
  } catch (error) {
    console.error('Error fetching RSS feeds:', error);
    return [];
  }
}
