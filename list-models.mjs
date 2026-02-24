const apiKey = 'AIzaSyAk7wG5XPD0UvQbxCpMPrQ32G2p5TwfByM';

async function listModels() {
    try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await res.json();
        console.log(data.models.map(m => m.name));
    } catch (e) {
        console.error('ERROR:', e.message);
    }
}

listModels();
