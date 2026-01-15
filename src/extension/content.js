// SubGuard Ghost - Content Script
console.log('[SubGuard] Ghost is haunting this page:', window.location.href);

// 1. Scan for Subscription Signals
function scanPage() {
    const text = document.body.innerText;
    const priceRegex = /\$\d+(\.\d{2})?(\/mo|\/month|\/year)/i;
    const subRegex = /subscribe|plan|billing|payment|total/i;

    const hasPrice = priceRegex.test(text);
    const hasSubContext = subRegex.test(text);

    if (hasPrice && hasSubContext) {
        const title = document.title;
        const url = window.location.href;
        const priceMatch = text.match(priceRegex);
        const price = priceMatch ? priceMatch[0] : 'Unknown';

        chrome.runtime.sendMessage({
            type: 'ANALYZE_PAGE',
            payload: { title, url, priceText: price }
        });
    }
}

// 2. Inject Ghost into Payment Fields (Targeting ONE main field)
function injectGhost() {
    // Specific selectors for the Card Number field ONLY
    const selectors = [
        'input[autocomplete="cc-number"]',
        'input[name="cardNumber"]',
        'input[name="card_number"]',
        'input[name*="cc-number"]',
        'input[id*="cardNumber"]',
        'input[placeholder*="Card Number"]',
        'input[placeholder*="0000 0000"]', // Pattern match
        '.cardNumber',
        'input[data-testid*="card-number"]'
    ];

    const inputs = document.querySelectorAll(selectors.join(', '));

    inputs.forEach(input => {
        if (input.dataset.subguardGhost) return; // Already haunted
        if (input.tagName === 'IFRAME') return;

        // Safety: Avoid injecting into CVV/Expiry if selectors were too loose
        const name = (input.name || '').toLowerCase();
        const id = (input.id || '').toLowerCase();
        const placeholder = (input.placeholder || '').toLowerCase();

        if (name.includes('cvv') || name.includes('cvc') || name.includes('exp') ||
            id.includes('cvv') || id.includes('cvc') || id.includes('exp') ||
            placeholder.includes('cvv') || placeholder.includes('code')) {
            return;
        }

        input.dataset.subguardGhost = 'true';

        // Create Icon Wrapper
        const wrapper = document.createElement('div');
        wrapper.style.position = 'relative';
        wrapper.style.display = 'inline-block';
        wrapper.style.width = input.offsetWidth > 0 ? input.offsetWidth + 'px' : '100%';

        // Insert wrapper before input, move input into wrapper
        input.parentNode.insertBefore(wrapper, input);
        wrapper.appendChild(input);

        // Create Ghost Icon
        const icon = document.createElement('img');
        icon.src = chrome.runtime.getURL('icon.png');
        icon.style.position = 'absolute';
        icon.style.right = '10px';
        icon.style.top = '50%';
        icon.style.transform = 'translateY(-50%)';
        icon.style.width = '24px';
        icon.style.height = '24px';
        icon.style.cursor = 'pointer';
        icon.style.zIndex = '2147483647'; // Max z-index
        icon.style.transition = 'all 0.2s';
        icon.title = 'SubGuard: Fill with Masked Card';

        // Icon Hover Effect
        icon.onmouseover = () => { icon.style.opacity = '1'; icon.style.filter = 'drop-shadow(0 0 5px #00f3ff)'; };
        icon.onmouseout = () => { icon.style.opacity = '0.7'; icon.style.filter = 'none'; };
        icon.style.opacity = '0.7';

        // Click Handler
        icon.onclick = (e) => {
            e.preventDefault();
            icon.style.animation = 'spin 1s linear infinite';

            chrome.runtime.sendMessage({ type: 'GET_CARD' }, (response) => {
                icon.style.animation = 'none';
                if (response && response.card) {
                    fillInput(input, response.card.number);
                    fillSiblings(wrapper, response.card);
                } else {
                    alert('SubGuard: Could not retrieve card from bridge. ensure Electron app is running.');
                }
            });
        };

        // Add CSS for spin
        const style = document.createElement('style');
        style.textContent = `@keyframes spin { 100% { transform: translateY(-50%) rotate(360deg); } }`;
        document.head.appendChild(style);

        wrapper.appendChild(icon);
    });
}

function fillInput(input, value) {
    input.value = value;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
    input.dispatchEvent(new Event('blur', { bubbles: true })); // Sometimes needed

    // Visual Flash
    input.style.backgroundColor = 'rgba(0, 243, 255, 0.2)';
    setTimeout(() => input.style.backgroundColor = '', 500);
}

function fillSiblings(wrapper, card) {
    // Heuristic: sibling inputs in same form
    const form = wrapper.closest('form');
    if (!form) return;

    const expiry = form.querySelector('input[name*="exp"], input[placeholder*="MM/YY"], input[id*="expiry"]');
    const cvv = form.querySelector('input[name*="cvc"], input[name*="cvv"], input[placeholder*="CVC"], input[id*="cvv"]');
    const holder = form.querySelector('input[name*="name"], input[placeholder*="Name"], input[id*="name"]');

    if (expiry) fillInput(expiry, card.expiry);
    if (cvv) fillInput(cvv, card.cvv);
    if (holder) fillInput(holder, card.holder);
}

// Initial Scan
scanPage();
injectGhost();

// Dynamic Observer (Better than polling)
const observer = new MutationObserver((mutations) => {
    let shouldInject = false;
    mutations.forEach(mutation => {
        if (mutation.addedNodes.length > 0) shouldInject = true;
    });
    if (shouldInject) injectGhost();
});

observer.observe(document.body, { childList: true, subtree: true });
