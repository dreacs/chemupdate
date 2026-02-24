import { fetchNews, fetchBrentCrudePrice } from '@/lib/rss';
import { analyzeHeadlinesBatch } from '@/lib/openai';
import { insertNewsBatch, fetchAllNewsFromDB, DbNewsItem } from '@/lib/supabase';
import DashboardClient from '@/components/DashboardClient';

export const revalidate = 0; // Stateless, fetch on every request
export const dynamic = 'force-dynamic'; // Prevent Vercel from statically caching this page during build

export default async function Home() {
  // 1. Fetch fresh news from RSS
  const freshNewsItems = await fetchNews();

  // 1.5 Fetch Spot Price for Brent Crude
  const brentPrice = await fetchBrentCrudePrice();

  // 2. Extract titles and batch analyze them via OpenAI
  const titles = freshNewsItems.map(item => item.title);
  const analysisResults = await analyzeHeadlinesBatch(titles);

  // 3. Zip the items with their analysis and map to DB format
  const readyToInsert: DbNewsItem[] = freshNewsItems.map((item, index) => {
    const analysis = analysisResults[index] || { sentiment: 'Neutral', summary: 'Analysis missing', commodity: 'Unknown' };
    return {
      title: item.title,
      summary: analysis.summary,
      sentiment: analysis.sentiment,
      commodity: analysis.commodity,
      source: item.source,
      link: item.link,
      published_at: item.pubDate
    };
  });

  // 4. Insert into Supabase (Duplicates by title are ignored by 'resolution=ignore-duplicates' header)
  await insertNewsBatch(readyToInsert);

  // 5. Fetch the entire accumulated history from Supabase
  const historicalData = await fetchAllNewsFromDB();

  // 6. Map back to the shape expected by DashboardClient
  const clientData = historicalData.map(dbItem => ({
    id: dbItem.id || Math.random().toString(),
    title: dbItem.title,
    link: dbItem.link,
    pubDate: dbItem.published_at,
    source: dbItem.source,
    sentiment: dbItem.sentiment as any,
    summary: dbItem.summary,
    commodity: dbItem.commodity
  }));

  return <DashboardClient initialNews={clientData} brentPrice={brentPrice} />;
}
