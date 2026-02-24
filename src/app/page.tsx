import { fetchNews } from '@/lib/rss';
import { analyzeHeadlinesBatch } from '@/lib/openai';
import DashboardClient from '@/components/DashboardClient';

export const revalidate = 0; // Stateless, fetch on every request

export default async function Home() {
  const newsItems = await fetchNews();

  // Extract titles and batch analyze
  const titles = newsItems.map(item => item.title);
  const analysisResults = await analyzeHeadlinesBatch(titles);

  // Zip the items with their analysis
  const analyzedNews = newsItems.map((item, index) => {
    const analysis = analysisResults[index] || { sentiment: 'Neutral', summary: 'Analysis missing', commodity: 'Unknown' };
    return { ...item, ...analysis } as any; // Cast for now, Client handles the exact shape
  });

  return <DashboardClient initialNews={analyzedNews} />;
}
