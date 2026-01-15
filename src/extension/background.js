// Background Service Worker
const BRIDGE_URL = 'http://localhost:3000';

// Listen for messages from Content Script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'ANALYZE_PAGE') {
        handleAnalysis(request.payload);
    }

    if (request.type === 'GET_CARD') {
        handleGetCard(sendResponse);
        return true; // Keep channel open for async response
    }
});

async function handleAnalysis(payload) {
    try {
        console.log('[Ghost] Sending analysis to bridge:', payload);
        await fetch(`${BRIDGE_URL}/analyze`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
    } catch (err) {
        console.error('[Ghost] Bridge unconnected:', err);
    }
}

async function handleGetCard(sendResponse) {
    try {
        const res = await fetch(`${BRIDGE_URL}/card`);
        const data = await res.json();
        sendResponse(data);
    } catch (err) {
        console.error('[Ghost] Bridge unconnected:', err);
        sendResponse({ error: 'Bridge Unconnected' });
    }
}
