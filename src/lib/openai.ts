import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || '',
});

export interface AnalysisResult {
    sentiment: 'Bullish' | 'Bearish' | 'Neutral';
    summary: string;
    commodity: string;
}

export async function analyzeHeadlinesBatch(headlines: string[]): Promise<AnalysisResult[]> {
    if (!process.env.OPENAI_API_KEY) {
        return headlines.map(() => ({ sentiment: 'Neutral', summary: 'API key missing.', commodity: 'Unknown' }));
    }

    if (headlines.length === 0) return [];

    try {
        const prompt = `You are an expert energy/chemical market analyst. 
I will provide you with a JSON array of news headlines. 
For EACH headline, analyze it and provide a JSON array of objects with exactly the same length and order.

For each headline, extract:
1. "sentiment": strictly one of "Bullish", "Bearish", or "Neutral"
2. "summary": A 1-sentence summary of the headline
3. "commodity": The primary commodity mentioned (e.g., "Crude Oil", "Methanol", "Ethylene", "Natural Gas", "None")

Output format must be a JSON object with a single key "results" containing the array of exactly ${headlines.length} objects.

Example Output:
{
  "results": [
    { "sentiment": "Bullish", "summary": "Oil prices jumped 2%.", "commodity": "Crude Oil" }
  ]
}`;

        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: prompt },
                { role: 'user', content: JSON.stringify(headlines) }
            ],
            response_format: { type: 'json_object' },
        });

        const content = response.choices[0].message.content;
        if (content) {
            const parsed = JSON.parse(content);
            if (parsed.results && Array.isArray(parsed.results)) {
                return parsed.results.map((r: any) => ({
                    sentiment: ['Bullish', 'Bearish', 'Neutral'].includes(r.sentiment) ? r.sentiment : 'Neutral',
                    summary: r.summary || 'No summary provided',
                    commodity: r.commodity || 'Unknown',
                }));
            }
        }

        // Fallback if parsing fails
        return headlines.map(() => ({ sentiment: 'Neutral', summary: 'Failed to extract content.', commodity: 'Unknown' }));
    } catch (error) {
        console.error('Error analyzing headlines with OpenAI:', error);
        return headlines.map(() => ({ sentiment: 'Neutral', summary: 'Error calling OpenAI API.', commodity: 'Unknown' }));
    }
}
