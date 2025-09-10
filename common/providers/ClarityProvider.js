export class ClarityProvider {
    constructor(projectId) {
        this.projectId = null;
        this._isInitialized = false;
        this.projectId = projectId || null;
    }
    initialize(config) {
        this.projectId = config.projectId;
        this._isInitialized = true;
        console.log('Microsoft Clarity Provider initialized with project ID:', config.projectId);
    }
    isReady() {
        return this._isInitialized && typeof window !== 'undefined' && window.clarity;
    }
    trackEvent(eventName, parameters) {
        if (!this.isReady()) {
            console.warn('Clarity is not ready. Event not tracked:', eventName);
            return;
        }
        try {
            // Clarity uses custom events
            window.clarity('event', eventName, parameters);
            if (this.isDebugMode()) {
                console.log('Clarity Event:', eventName, parameters);
            }
        }
        catch (error) {
            console.error('Error tracking Clarity event:', error);
        }
    }
    trackPageView(pageTitle, pageUrl) {
        if (!this.isReady()) {
            console.warn('Clarity is not ready. Page view not tracked');
            return;
        }
        try {
            // Clarity automatically tracks page views, but we can add custom data
            if (pageTitle || pageUrl) {
                window.clarity('set', 'page_title', pageTitle || document.title);
                window.clarity('set', 'page_url', pageUrl || window.location.href);
            }
        }
        catch (error) {
            console.error('Error tracking Clarity page view:', error);
        }
    }
    setCustomTag(key, value) {
        if (!this.isReady()) {
            console.warn('Clarity is not ready. Custom tag not set');
            return;
        }
        try {
            window.clarity('set', key, value);
        }
        catch (error) {
            console.error('Error setting Clarity custom tag:', error);
        }
    }
    identify(userId, userProperties) {
        if (!this.isReady()) {
            console.warn('Clarity is not ready. User not identified');
            return;
        }
        try {
            window.clarity('identify', userId);
            // Set user properties as custom tags
            if (userProperties) {
                Object.entries(userProperties).forEach(([key, value]) => {
                    this.setCustomTag(`user_${key}`, String(value));
                });
            }
        }
        catch (error) {
            console.error('Error identifying user in Clarity:', error);
        }
    }
    trackConversion(conversionName, value) {
        if (!this.isReady()) {
            console.warn('Clarity is not ready. Conversion not tracked');
            return;
        }
        try {
            window.clarity('event', `conversion_${conversionName}`, {
                value: value || 0,
                timestamp: Date.now()
            });
        }
        catch (error) {
            console.error('Error tracking Clarity conversion:', error);
        }
    }
    trackError(errorType, errorMessage, context) {
        this.trackEvent('error_occurred', {
            error_type: errorType,
            error_message: errorMessage,
            context: context,
            timestamp: Date.now()
        });
    }
    trackPerformance(metricName, value, unit = 'ms') {
        this.trackEvent('performance_metric', {
            metric_name: metricName,
            value: value,
            unit: unit,
            timestamp: Date.now()
        });
    }
    trackGameEvent(eventType, gameData) {
        this.trackEvent(`game_${eventType}`, Object.assign(Object.assign({}, gameData), { timestamp: Date.now() }));
    }
    trackGiftEvent(eventType, giftData) {
        this.trackEvent(`gift_${eventType}`, Object.assign(Object.assign({}, giftData), { timestamp: Date.now() }));
    }
    setSessionData(sessionId, additionalData) {
        this.setCustomTag('session_id', sessionId);
        if (additionalData) {
            Object.entries(additionalData).forEach(([key, value]) => {
                this.setCustomTag(`session_${key}`, String(value));
            });
        }
    }
    clearSessionData() {
        // Clarity doesn't have a direct way to clear session data
        // This would require page reload or new session
        console.log('Clarity session data will be cleared on next page load');
    }
    getProjectId() {
        return this.projectId;
    }
    isInitialized() {
        return this._isInitialized;
    }
    isDebugMode() {
        // Check if debug mode is enabled (you can implement this based on your config)
        return localStorage.getItem('analytics_debug') === 'true';
    }
    destroy() {
        // Clarity doesn't have a destroy method, but we can reset our state
        this._isInitialized = false;
        this.projectId = null;
        console.log('Clarity Provider destroyed');
    }
}
export default ClarityProvider;
