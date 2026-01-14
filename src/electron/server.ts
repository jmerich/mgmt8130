
import http from 'http';

const PORT = 3000;

export function startServer(mainWindow: any) {
    const server = http.createServer((req, res) => {
        // 1. CORS Headers (Allow Extension to talk to us)
        res.setHeader('Access-Control-Allow-Origin', '*'); // Or specific extension ID
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        // Handle Preflight
        if (req.method === 'OPTIONS') {
            res.writeHead(204);
            res.end();
            return;
        }

        // 2. Router
        const url = new URL(req.url || '', `http://localhost:${PORT}`);

        // Endpoint: /status
        if (url.pathname === '/status' && req.method === 'GET') {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ status: 'active', version: '1.0.0-native' }));
            return;
        }

        // Endpoint: /analyze (POST)
        if (url.pathname === '/analyze' && req.method === 'POST') {
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });
            req.on('end', () => {
                try {
                    const data = JSON.parse(body);
                    console.log('[Server] Received analysis:', data);

                    mainWindow.webContents.send('extension-event', {
                        type: 'ANALYSIS_RECEIVED',
                        payload: data
                    });

                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'Analysis received' }));
                } catch (e) {
                    res.writeHead(400);
                    res.end(JSON.stringify({ error: 'Invalid JSON' }));
                }
            });
            return;
        }

        // Endpoint: /card (GET)
        if (url.pathname === '/card' && req.method === 'GET') {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                card: {
                    number: '5500 0000 0000 9012',
                    expiry: '12/28',
                    cvv: '123',
                    holder: 'SUBGUARD PROXY'
                }
            }));
            return;
        }

        // 404
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Not Found' }));
    });

    server.listen(PORT, () => {
        console.log(`[Bridge] Native Server running on http://localhost:${PORT}`);
    });
}
