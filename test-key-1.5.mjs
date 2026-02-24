import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI('AIzaSyARMtAUems1bQyeGTInu1_lcCrK-zqC_K8');

async function test() {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent('Hi');
        console.log('1.5-flash OK:', await result.response.text());
    } catch (e) {
        console.error('1.5-flash ERROR:', e.message);
    }
}

test();
