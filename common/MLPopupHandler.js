import navigationManager from "../gui/NavigationManager";
class MlPopupHandler {
    constructor(options) {
        this.disposed = false;
        this.opts = Object.assign({ popupIframeSelector: 'iframe[src*="mailerlite"], iframe[src*="mlcdn"], iframe[src*="assets.mailerlite"]', waitMs: 5000 }, options);
    }
    /** Open ML popup, focus the iframe, and attach postMessage listener */
    // Call this directly from your click handler:
    // button.addEventListener('click', () => mlPopupHandler.open());
    open() {
        var _a, _b;
        // IMPORTANT: keep this call inside the same user gesture
        (_a = window.ml) === null || _a === void 0 ? void 0 : _a.call(window, 'show', this.opts.formId, true);
        this.watchForIframe();
        (_b = this.attachMessageListener) === null || _b === void 0 ? void 0 : _b.call(this); // if you added postMessage handling
    }
    watchForIframe() {
        const selector = 'iframe[src*="mailerlite"], iframe[src*="mlcdn"], iframe[src*="assets.mailerlite"]';
        const deadline = Date.now() + 5000;
        const focusIframe = (iframe) => {
            // Make it focusable
            if (!iframe.hasAttribute('tabindex'))
                iframe.setAttribute('tabindex', '-1');
            // Try a few times – different browsers attach late
            let attempts = 0;
            const tryFocus = () => {
                attempts++;
                // Try focusing the iframe element itself
                iframe.focus({ preventScroll: true });
                // If not focused, try again a few frames; also scroll into view once
                if (document.activeElement !== iframe && attempts < 8) {
                    if (attempts === 2)
                        iframe.scrollIntoView({ block: 'center', inline: 'center' });
                    requestAnimationFrame(tryFocus);
                }
            };
            // Focus after load too (some browsers need this)
            const onLoad = () => {
                iframe.removeEventListener('load', onLoad);
                requestAnimationFrame(tryFocus);
            };
            iframe.addEventListener('load', onLoad);
            // And try immediately in case it’s already loaded
            requestAnimationFrame(tryFocus);
        };
        const findNow = () => {
            var _a, _b;
            const iframe = document.querySelector(selector);
            if (iframe) {
                (_b = (_a = this.opts).onPopupShown) === null || _b === void 0 ? void 0 : _b.call(_a);
                focusIframe(iframe);
                return true;
            }
            return false;
        };
        // quick poll in same gesture frame
        if (findNow())
            return;
        // rAF loop up to deadline
        const tick = () => {
            if (Date.now() > deadline)
                return;
            if (!findNow())
                requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        // backup MutationObserver (covers late injections)
        const mo = new MutationObserver(() => {
            var _a, _b;
            const iframe = document.querySelector(selector);
            if (iframe) {
                mo.disconnect();
                (_b = (_a = this.opts).onPopupShown) === null || _b === void 0 ? void 0 : _b.call(_a);
                focusIframe(iframe);
            }
        });
        mo.observe(document.documentElement, { childList: true, subtree: true });
        setTimeout(() => mo.disconnect(), 6000);
    }
    /** Listen for ML/recaptcha postMessage events and route to hooks */
    attachMessageListener() {
        const trustedOrigins = new Set([
            'https://assets.mailerlite.com',
            'https://static.mailerlite.com',
            'https://www.google.com',
            'https://www.recaptcha.net',
        ]);
        this.msgHandler = (e) => {
            var _a, _b, _c, _d, _e, _f;
            if (this.disposed)
                return;
            if (this.opts.logAllMessages) {
                // Inspect these once to learn exact payload shape
                console.log('[ML postMessage]', e.origin, e.data);
            }
            if (!trustedOrigins.has(e.origin))
                return;
            // Normalize a few common payload shapes
            const d = e.data;
            const type = ((d === null || d === void 0 ? void 0 : d.type) || (d === null || d === void 0 ? void 0 : d.event) || (d === null || d === void 0 ? void 0 : d.name) || '').toString().toLowerCase();
            const formId = (d === null || d === void 0 ? void 0 : d.formId) || ((_a = d === null || d === void 0 ? void 0 : d.detail) === null || _a === void 0 ? void 0 : _a.formId) || ((_b = d === null || d === void 0 ? void 0 : d.payload) === null || _b === void 0 ? void 0 : _b.id) || this.opts.formId;
            // Heuristics: adjust after you log real messages
            if (type.includes('submit')) {
                (_d = (_c = this.opts).onSubmitAttempt) === null || _d === void 0 ? void 0 : _d.call(_c, formId);
            }
            if (type.includes('success') || type.includes('subscribed')) {
                (_f = (_e = this.opts).onSuccess) === null || _f === void 0 ? void 0 : _f.call(_e, formId);
                this.dispose(); // cleanup after success
            }
        };
        window.addEventListener('message', this.msgHandler);
    }
    /** Cleanup listeners/observers */
    dispose() {
        var _a;
        this.disposed = true;
        if (this.msgHandler)
            window.removeEventListener('message', this.msgHandler);
        (_a = this.observer) === null || _a === void 0 ? void 0 : _a.disconnect();
    }
}
// ---- Your configured instance ----
const mlPopupHandler = new MlPopupHandler({
    formId: '1RSel7',
    logAllMessages: false, // turn on for a couple of runs, then set to false
    onPopupShown: () => {
        navigationManager.setEmailCaptured(true);
    },
    onSubmitAttempt: (formId) => {
    },
    onSuccess: (formId) => {
    },
});
export default mlPopupHandler;
