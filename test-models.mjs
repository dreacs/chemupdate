import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI('AIzaSyAk7wG5XPD0UvQbxCpMPrQ32G2p5TwfByM');

async function test() {
    const modelsToTest = ['gemini-pro', 'gemini-1.0-pro', 'gemini-1.5-pro', 'gemini-1.5-pro-latest'];

    for (const modelName of modelsToTest) {
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent('Hi');
            console.log(`${modelName} OK`);
        } catch (e) {
            console.error(`${modelName} ERROR:`, e.message);
        }
    }
}

test();
