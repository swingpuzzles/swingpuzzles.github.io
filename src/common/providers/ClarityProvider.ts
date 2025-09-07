// Microsoft Clarity Provider
import IAnalyticsProvider from './IAnalyticsProvider';

export interface ClarityEvent {
    name: string;
    parameters?: Record<string, any>;
}

export class ClarityProvider implements IAnalyticsProvider {
    private projectId: string | null = null;
    private _isInitialized: boolean = false;

    constructor(projectId?: string) {
        this.projectId = projectId || null;
    }

    public initialize(config: { projectId: string }): void {
        this.projectId = config.projectId;
        this._isInitialized = true;
        console.log('Microsoft Clarity Provider initialized with project ID:', config.projectId);
    }

    public isReady(): boolean {
        return this._isInitialized && typeof window !== 'undefined' && (window as any).clarity;
    }

    public trackEvent(eventName: string, parameters?: Record<string, any>): void {
        if (!this.isReady()) {
            console.warn('Clarity is not ready. Event not tracked:', eventName);
            return;
        }

        try {
            // Clarity uses custom events
            (window as any).clarity('event', eventName, parameters);
            
            if (this.isDebugMode()) {
                console.log('Clarity Event:', eventName, parameters);
            }
        } catch (error) {
            console.error('Error tracking Clarity event:', error);
        }
    }

    public trackPageView(pageTitle?: string, pageUrl?: string): void {
        if (!this.isReady()) {
            console.warn('Clarity is not ready. Page view not tracked');
            return;
        }

        try {
            // Clarity automatically tracks page views, but we can add custom data
            if (pageTitle || pageUrl) {
                (window as any).clarity('set', 'page_title', pageTitle || document.title);
                (window as any).clarity('set', 'page_url', pageUrl || window.location.href);
            }
        } catch (error) {
            console.error('Error tracking Clarity page view:', error);
        }
    }

    public setCustomTag(key: string, value: string): void {
        if (!this.isReady()) {
            console.warn('Clarity is not ready. Custom tag not set');
            return;
        }

        try {
            (window as any).clarity('set', key, value);
        } catch (error) {
            console.error('Error setting Clarity custom tag:', error);
        }
    }

    public identify(userId: string, userProperties?: Record<string, any>): void {
        if (!this.isReady()) {
            console.warn('Clarity is not ready. User not identified');
            return;
        }

        try {
            (window as any).clarity('identify', userId);
            
            // Set user properties as custom tags
            if (userProperties) {
                Object.entries(userProperties).forEach(([key, value]) => {
                    this.setCustomTag(`user_${key}`, String(value));
                });
            }
        } catch (error) {
            console.error('Error identifying user in Clarity:', error);
        }
    }

    public trackConversion(conversionName: string, value?: number): void {
        if (!this.isReady()) {
            console.warn('Clarity is not ready. Conversion not tracked');
            return;
        }

        try {
            (window as any).clarity('event', `conversion_${conversionName}`, {
                value: value || 0,
                timestamp: Date.now()
            });
        } catch (error) {
            console.error('Error tracking Clarity conversion:', error);
        }
    }

    public trackError(errorType: string, errorMessage: string, context?: string): void {
        this.trackEvent('error_occurred', {
            error_type: errorType,
            error_message: errorMessage,
            context: context,
            timestamp: Date.now()
        });
    }

    public trackPerformance(metricName: string, value: number, unit: string = 'ms'): void {
        this.trackEvent('performance_metric', {
            metric_name: metricName,
            value: value,
            unit: unit,
            timestamp: Date.now()
        });
    }

    public trackGameEvent(eventType: string, gameData: Record<string, any>): void {
        this.trackEvent(`game_${eventType}`, {
            ...gameData,
            timestamp: Date.now()
        });
    }

    public trackGiftEvent(eventType: string, giftData: Record<string, any>): void {
        this.trackEvent(`gift_${eventType}`, {
            ...giftData,
            timestamp: Date.now()
        });
    }

    public setSessionData(sessionId: string, additionalData?: Record<string, any>): void {
        this.setCustomTag('session_id', sessionId);
        
        if (additionalData) {
            Object.entries(additionalData).forEach(([key, value]) => {
                this.setCustomTag(`session_${key}`, String(value));
            });
        }
    }

    public clearSessionData(): void {
        // Clarity doesn't have a direct way to clear session data
        // This would require page reload or new session
        console.log('Clarity session data will be cleared on next page load');
    }

    public getProjectId(): string | null {
        return this.projectId;
    }

    public isInitialized(): boolean {
        return this._isInitialized;
    }

    private isDebugMode(): boolean {
        // Check if debug mode is enabled (you can implement this based on your config)
        return localStorage.getItem('analytics_debug') === 'true';
    }

    public destroy(): void {
        // Clarity doesn't have a destroy method, but we can reset our state
        this._isInitialized = false;
        this.projectId = null;
        console.log('Clarity Provider destroyed');
    }
}

export default ClarityProvider;
