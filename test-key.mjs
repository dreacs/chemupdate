import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI('AIzaSyARMtAUems1bQyeGTInu1_lcCrK-zqC_K8');

async function test() {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        const result = await model.generateContent('Hi');
        console.log('NEW KEY OK:', await result.response.text());
    } catch (e) {
        console.error('NEW KEY ERROR:', e.message);
    }
}

test();
