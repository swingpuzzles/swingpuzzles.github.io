export class GAProvider {
    constructor(measurementId, apiSecret) {
        this.measurementId = null;
        this.apiSecret = null;
        this._isInitialized = false;
        this.measurementId = measurementId || null;
        this.apiSecret = apiSecret || null;
    }
    initialize(config) {
        this.measurementId = config.measurementId;
        this.apiSecret = config.apiSecret || null;
        this._isInitialized = true;
        console.log('Google Analytics Provider initialized with measurement ID:', config.measurementId);
    }
    isReady() {
        return this._isInitialized && typeof window !== 'undefined' && window.gtag;
    }
    trackEvent(eventName, parameters) {
        if (!this.isReady()) {
            console.warn('Google Analytics is not ready. Event not tracked:', eventName);
            return;
        }
        try {
            window.gtag('event', eventName, parameters);
            if (this.isDebugMode()) {
                console.log('GA Event:', eventName, parameters);
            }
        }
        catch (error) {
            console.error('Error tracking GA event:', error);
        }
    }
    trackPageView(pageTitle, pageUrl) {
        if (!this.isReady()) {
            console.warn('Google Analytics is not ready. Page view not tracked');
            return;
        }
        try {
            window.gtag('config', this.measurementId, {
                page_title: pageTitle || document.title,
                page_location: pageUrl || window.location.href
            });
        }
        catch (error) {
            console.error('Error tracking GA page view:', error);
        }
    }
    setCustomParameter(key, value) {
        if (!this.isReady()) {
            console.warn('Google Analytics is not ready. Custom parameter not set');
            return;
        }
        try {
            window.gtag('config', this.measurementId, {
                [key]: value
            });
        }
        catch (error) {
            console.error('Error setting GA custom parameter:', error);
        }
    }
    identify(userId, userProperties) {
        if (!this.isReady()) {
            console.warn('Google Analytics is not ready. User not identified');
            return;
        }
        try {
            window.gtag('config', this.measurementId, {
                user_id: userId
            });
            // Set user properties
            if (userProperties) {
                window.gtag('event', 'user_properties', userProperties);
            }
        }
        catch (error) {
            console.error('Error identifying user in GA:', error);
        }
    }
    trackConversion(conversionName, value, currency) {
        if (!this.isReady()) {
            console.warn('Google Analytics is not ready. Conversion not tracked');
            return;
        }
        try {
            window.gtag('event', 'conversion', {
                send_to: `${this.measurementId}/${conversionName}`,
                value: value || 0,
                currency: currency || 'USD'
            });
        }
        catch (error) {
            console.error('Error tracking GA conversion:', error);
        }
    }
    trackError(errorType, errorMessage, context) {
        this.trackEvent('exception', {
            description: `${errorType}: ${errorMessage}`,
            fatal: false,
            context: context
        });
    }
    trackPerformance(metricName, value, unit = 'ms') {
        this.trackEvent('timing_complete', {
            name: metricName,
            value: value,
            event_category: 'performance',
            event_label: unit
        });
    }
    trackGameEvent(eventType, gameData) {
        this.trackEvent(eventType, Object.assign(Object.assign({}, gameData), { event_category: 'game' }));
    }
    trackGiftEvent(eventType, giftData) {
        this.trackEvent(eventType, Object.assign(Object.assign({}, giftData), { event_category: 'gift' }));
    }
    setSessionData(sessionId, additionalData) {
        this.setCustomParameter('session_id', sessionId);
        if (additionalData) {
            Object.entries(additionalData).forEach(([key, value]) => {
                this.setCustomParameter(`session_${key}`, value);
            });
        }
    }
    clearSessionData() {
        // GA doesn't have a direct way to clear session data
        // This would require page reload or new session
        console.log('GA session data will be cleared on next page load');
    }
    getMeasurementId() {
        return this.measurementId;
    }
    getApiSecret() {
        return this.apiSecret;
    }
    isInitialized() {
        return this._isInitialized;
    }
    isDebugMode() {
        // Check if debug mode is enabled (you can implement this based on your config)
        return localStorage.getItem('analytics_debug') === 'true';
    }
    destroy() {
        // GA doesn't have a destroy method, but we can reset our state
        this._isInitialized = false;
        this.measurementId = null;
        this.apiSecret = null;
        console.log('GA Provider destroyed');
    }
}
export default GAProvider;
