// Google Analytics Provider
import IAnalyticsProvider from './IAnalyticsProvider';

export interface GAEvent {
    name: string;
    parameters?: Record<string, any>;
}

export class GAProvider implements IAnalyticsProvider {
    private measurementId: string | null = null;
    private apiSecret: string | null = null;
    private _isInitialized: boolean = false;

    constructor(measurementId?: string, apiSecret?: string) {
        this.measurementId = measurementId || null;
        this.apiSecret = apiSecret || null;
    }

    public initialize(config: { measurementId: string; apiSecret?: string }): void {
        this.measurementId = config.measurementId;
        this.apiSecret = config.apiSecret || null;
        this._isInitialized = true;
        console.log('Google Analytics Provider initialized with measurement ID:', config.measurementId);
    }

    public isReady(): boolean {
        return this._isInitialized && typeof window !== 'undefined' && (window as any).gtag;
    }

    public trackEvent(eventName: string, parameters?: Record<string, any>): void {
        if (!this.isReady()) {
            console.warn('Google Analytics is not ready. Event not tracked:', eventName);
            return;
        }

        try {
            (window as any).gtag('event', eventName, parameters);
            
            if (this.isDebugMode()) {
                console.log('GA Event:', eventName, parameters);
            }
        } catch (error) {
            console.error('Error tracking GA event:', error);
        }
    }

    public trackPageView(pageTitle?: string, pageUrl?: string): void {
        if (!this.isReady()) {
            console.warn('Google Analytics is not ready. Page view not tracked');
            return;
        }

        try {
            (window as any).gtag('config', this.measurementId, {
                page_title: pageTitle || document.title,
                page_location: pageUrl || window.location.href
            });
        } catch (error) {
            console.error('Error tracking GA page view:', error);
        }
    }

    public setCustomParameter(key: string, value: any): void {
        if (!this.isReady()) {
            console.warn('Google Analytics is not ready. Custom parameter not set');
            return;
        }

        try {
            (window as any).gtag('config', this.measurementId, {
                [key]: value
            });
        } catch (error) {
            console.error('Error setting GA custom parameter:', error);
        }
    }

    public identify(userId: string, userProperties?: Record<string, any>): void {
        if (!this.isReady()) {
            console.warn('Google Analytics is not ready. User not identified');
            return;
        }

        try {
            (window as any).gtag('config', this.measurementId, {
                user_id: userId
            });

            // Set user properties
            if (userProperties) {
                (window as any).gtag('event', 'user_properties', userProperties);
            }
        } catch (error) {
            console.error('Error identifying user in GA:', error);
        }
    }

    public trackConversion(conversionName: string, value?: number, currency?: string): void {
        if (!this.isReady()) {
            console.warn('Google Analytics is not ready. Conversion not tracked');
            return;
        }

        try {
            (window as any).gtag('event', 'conversion', {
                send_to: `${this.measurementId}/${conversionName}`,
                value: value || 0,
                currency: currency || 'USD'
            });
        } catch (error) {
            console.error('Error tracking GA conversion:', error);
        }
    }

    public trackError(errorType: string, errorMessage: string, context?: string): void {
        this.trackEvent('exception', {
            description: `${errorType}: ${errorMessage}`,
            fatal: false,
            context: context
        });
    }

    public trackPerformance(metricName: string, value: number, unit: string = 'ms'): void {
        this.trackEvent('timing_complete', {
            name: metricName,
            value: value,
            event_category: 'performance',
            event_label: unit
        });
    }

    public trackGameEvent(eventType: string, gameData: Record<string, any>): void {
        this.trackEvent(eventType, {
            ...gameData,
            event_category: 'game'
        });
    }

    public trackGiftEvent(eventType: string, giftData: Record<string, any>): void {
        this.trackEvent(eventType, {
            ...giftData,
            event_category: 'gift'
        });
    }

    public setSessionData(sessionId: string, additionalData?: Record<string, any>): void {
        this.setCustomParameter('session_id', sessionId);
        
        if (additionalData) {
            Object.entries(additionalData).forEach(([key, value]) => {
                this.setCustomParameter(`session_${key}`, value);
            });
        }
    }

    public clearSessionData(): void {
        // GA doesn't have a direct way to clear session data
        // This would require page reload or new session
        console.log('GA session data will be cleared on next page load');
    }

    public getMeasurementId(): string | null {
        return this.measurementId;
    }

    public getApiSecret(): string | null {
        return this.apiSecret;
    }

    public isInitialized(): boolean {
        return this._isInitialized;
    }

    private isDebugMode(): boolean {
        // Check if debug mode is enabled (you can implement this based on your config)
        return localStorage.getItem('analytics_debug') === 'true';
    }

    public destroy(): void {
        // GA doesn't have a destroy method, but we can reset our state
        this._isInitialized = false;
        this.measurementId = null;
        this.apiSecret = null;
        console.log('GA Provider destroyed');
    }
}

export default GAProvider;
