'use client';

import { useState, useMemo, useEffect } from 'react';

type Sentiment = 'Bullish' | 'Bearish' | 'Neutral';

export interface NewsItem {
    id: string;
    title: string;
    link: string;
    pubDate: string;
    source: string;
    sentiment: Sentiment;
    summary: string;
    commodity: string;
}

export default function DashboardClient({ initialNews, brentPrice }: { initialNews: NewsItem[], brentPrice?: number | null }) {
    const [filter, setFilter] = useState<string>('All');
    const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

    // Set initial refresh time on client load
    useEffect(() => {
        setLastRefreshed(new Date());
    }, []);

    // Strict sorting (descending) and standardize Crude Oil -> Brent Oil
    const sortedNews = useMemo(() => {
        return [...initialNews].map(n => ({
            ...n,
            commodity: n.commodity === 'Crude Oil' || n.commodity === 'Crude Brent Oil' ? 'Brent Oil' : n.commodity
        })).sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
    }, [initialNews]);

    // Extract unique commodities, but ensure core ones always exist
    const commodities = useMemo(() => {
        const raw = sortedNews.map((n) => n.commodity).filter(c => c && c !== 'None' && c !== 'Unknown');
        const unique = new Set(raw);
        // Ensure our standard commodities are always present
        ['Brent Oil', 'Acetone', 'Ammonia', 'Methanol', 'Natural Gas'].forEach(c => unique.add(c));
        return ['All', ...Array.from(unique)];
    }, [sortedNews]);

    // Filtered news
    const filteredNews = useMemo(() => {
        if (filter === 'All') return sortedNews;
        return sortedNews.filter((n) => n.commodity === filter);
    }, [sortedNews, filter]);

    // Process timeline data based on filtered items
    const timelineData = useMemo(() => {
        const dateMap: Record<string, { Bullish: number; Bearish: number; Neutral: number; dateString: string; rawDate: string }> = {};

        filteredNews.forEach((n) => {
            const d = new Date(n.pubDate);
            const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            const shortDate = `${d.getDate()}.${monthNames[d.getMonth()]}`;

            if (!dateMap[shortDate]) {
                dateMap[shortDate] = { Bullish: 0, Bearish: 0, Neutral: 0, dateString: shortDate, rawDate: n.pubDate };
            }

            if (n.sentiment === 'Bullish') {
                dateMap[shortDate].Bullish += 1;
            } else if (n.sentiment === 'Bearish') {
                dateMap[shortDate].Bearish += 1;
            } else {
                dateMap[shortDate].Neutral += 1;
            }
        });

        return Object.values(dateMap).sort((a, b) => new Date(a.rawDate).getTime() - new Date(b.rawDate).getTime());
    }, [filteredNews]);

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-sans p-4 sm:p-8">
            <div className="max-w-5xl mx-auto">
                <header className="mb-10 border-b border-slate-800 pb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                    <div>
                        <div className="flex items-center gap-4">
                            <h1 className="text-4xl font-bold text-white tracking-tight">ChemSignal</h1>
                            <button
                                onClick={() => window.location.reload()}
                                className="flex items-center gap-1.5 px-3 py-1.5 mt-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md text-xs font-medium border border-slate-700 hover:border-slate-600 transition-colors shadow-sm"
                                title="Force refresh data and analyze new articles"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                Refresh
                            </button>
                        </div>
                        <div className="flex flex-col gap-1 mt-2">
                            <p className="text-slate-400 text-lg">Real-time Energy & Chemical Market Sentiment</p>
                            {lastRefreshed && (
                                <p className="text-xs text-slate-500 font-mono">
                                    Last Check: {lastRefreshed.toLocaleString()}
                                </p>
                            )}
                        </div>
                    </div>
                    {brentPrice !== undefined && brentPrice !== null && (
                        <a href="https://www.investing.com/commodities/brent-oil" target="_blank" rel="noopener noreferrer" className="flex flex-col items-end bg-slate-900 border border-slate-800 px-4 py-2 rounded-lg shadow-sm hover:border-slate-700 hover:bg-slate-800 transition-colors group cursor-pointer">
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 group-hover:text-blue-400 transition-colors">Crude brent oil</span>
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-bold text-white">${brentPrice.toFixed(2)}</span>
                                <span className="text-xs text-slate-400">/bbl</span>
                            </div>
                        </a>
                    )}
                </header>

                {/* Filters */}
                <div className="mb-8">
                    <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Commodity Filter</h2>
                    <div className="flex flex-wrap gap-2">
                        {commodities.map((c) => (
                            <button
                                key={c}
                                onClick={() => setFilter(c)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 border ${filter === c
                                    ? 'bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-500/20 scale-105 transform'
                                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 hover:border-slate-700'
                                    }`}
                            >
                                {c}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Stats / Timeline (Custom SVG Bar Chart) */}
                {filteredNews.length > 0 && (
                    <div className="mb-10 bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg">
                        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-6">Sentiment Timeline (Bullish vs Bearish)</h2>
                        <div className="w-full h-64 relative flex items-end justify-between gap-2 border-l border-b border-slate-700 pb-6 pl-2">
                            {timelineData.map((d, index) => {
                                const maxVal = Math.max(...timelineData.map(t => t.Bullish + t.Bearish + t.Neutral), 1);
                                const bulHeight = (d.Bullish / maxVal) * 100;
                                const bearHeight = (d.Bearish / maxVal) * 100;
                                const neutralHeight = (d.Neutral / maxVal) * 100;
                                return (
                                    <div key={index} className="flex-1 flex flex-col justify-end items-center h-full relative group">
                                        {/* Tooltip */}
                                        <div className="absolute -top-10 bg-slate-800 border border-slate-700 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none whitespace-nowrap shadow-lg">
                                            <span className="text-emerald-400 font-bold">{d.Bullish}</span> | <span className="text-slate-400 font-bold">{d.Neutral}</span> | <span className="text-rose-400 font-bold">{d.Bearish}</span>
                                        </div>

                                        {/* Bars */}
                                        <div className="w-full max-w-12 bg-rose-500/90 rounded-t-sm transition-all duration-500 ease-out" style={{ height: `${bearHeight}%` }}></div>
                                        <div className="w-full max-w-12 bg-slate-500/90 transition-all duration-500 ease-out" style={{ height: `${neutralHeight}%` }}></div>
                                        <div className="w-full max-w-12 bg-emerald-500/90 transition-all duration-500 ease-out" style={{ height: `${bulHeight}%` }}></div>

                                        {/* X-Axis Label */}
                                        <div className="absolute -bottom-6 text-xs text-slate-500 font-medium whitespace-nowrap mt-2">
                                            {d.dateString}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="mt-8 flex gap-4 text-sm justify-center">
                            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-emerald-500 rounded-full"></div> Bullish</div>
                            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-slate-500 rounded-full"></div> Neutral</div>
                            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-rose-500 rounded-full"></div> Bearish</div>
                        </div>
                    </div>
                )
                }

                {/* News List */}
                <div>
                    <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">News Updates ({filteredNews.length})</h2>
                    {filteredNews.length === 0 ? (
                        <div className="text-center text-slate-500 py-12 bg-slate-900 rounded-xl border border-slate-800 transition-opacity duration-500">No news items found for {filter}.</div>
                    ) : (
                        <div className="space-y-4">
                            {filteredNews.map((item) => (
                                <div
                                    key={item.id}
                                    className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-md hover:border-slate-700 transition-all duration-500 ease-in-out transform hover:-translate-y-1"
                                >
                                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-3">
                                        <div className="flex-1">
                                            <div className="flex flex-wrap gap-2 mb-2 items-center">
                                                <span className="px-2 py-0.5 text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded">
                                                    {item.source}
                                                </span>
                                                {item.commodity && item.commodity !== 'None' && item.commodity !== 'Unknown' && (
                                                    <span className="px-2 py-0.5 text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded">
                                                        {item.commodity}
                                                    </span>
                                                )}
                                            </div>
                                            <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-xl font-semibold text-slate-100 hover:text-blue-400 transition-colors block leading-snug">
                                                {item.title}
                                            </a>
                                        </div>
                                        <SentimentBadge sentiment={item.sentiment} />
                                    </div>

                                    <p className="text-slate-300 text-base mb-4 bg-slate-800/40 p-4 rounded-lg border border-slate-800/60 leading-relaxed shadow-inner">
                                        {item.summary}
                                    </p>

                                    <div className="flex justify-end items-center text-sm text-slate-500">
                                        <span className="font-mono text-xs text-slate-600 bg-slate-950 px-2 py-1 rounded border border-slate-800">
                                            {new Date(item.pubDate).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div >
        </div >
    );
}

function SentimentBadge({ sentiment }: { sentiment: 'Bullish' | 'Bearish' | 'Neutral' }) {
    const styles = {
        Bullish: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        Bearish: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
        Neutral: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    };

    const safeSentiment = ['Bullish', 'Bearish', 'Neutral'].includes(sentiment) ? sentiment : 'Neutral';

    return (
        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${styles[safeSentiment as 'Bullish' | 'Bearish' | 'Neutral']} whitespace-nowrap`}>
            {safeSentiment}
        </span>
    );
}
