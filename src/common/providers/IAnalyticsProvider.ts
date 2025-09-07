// Base interface for analytics providers
export interface IAnalyticsProvider {
    initialize(config: any): void;
    isReady(): boolean;
    trackEvent(eventName: string, parameters?: Record<string, any>): void;
    trackPageView(pageTitle?: string, pageUrl?: string): void;
    identify(userId: string, userProperties?: Record<string, any>): void;
    trackError(errorType: string, errorMessage: string, context?: string): void;
    trackPerformance(metricName: string, value: number, unit?: string): void;
    trackGameEvent(eventType: string, gameData: Record<string, any>): void;
    trackGiftEvent(eventType: string, giftData: Record<string, any>): void;
    setSessionData(sessionId: string, additionalData?: Record<string, any>): void;
    clearSessionData(): void;
    destroy(): void;
}

export default IAnalyticsProvider;
