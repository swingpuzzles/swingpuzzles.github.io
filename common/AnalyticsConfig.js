// Default configuration
export const defaultAnalyticsConfig = {
    enabled: true,
    debugMode: false,
    provider: 'clarity', // Default to Clarity
    clarity: {
        enabled: true, // Enable manually after adding Project ID
        projectId: undefined
    },
    googleAnalytics: {
        enabled: false, // Enable manually after adding Measurement ID
        measurementId: undefined,
        apiSecret: undefined
    },
    localTracking: {
        enabled: true,
        maxStoredEvents: 50,
        autoFlushInterval: 300000 // 5 minutes
    },
    gameMetrics: {
        trackSolveTime: true,
        trackPuzzleAbandonment: true,
        trackUserInteractions: true,
        trackPerformanceMetrics: true
    },
    giftTracking: {
        trackCreation: true,
        trackSharing: true,
        trackReceiving: true,
        trackCustomization: true
    },
    privacy: {
        anonymizeData: true,
        respectDoNotTrack: true,
        cookieConsentRequired: true
    }
};
// Configuration manager
class AnalyticsConfigManager {
    constructor() {
        this.config = this.loadConfig();
    }
    loadConfig() {
        try {
            const stored = localStorage.getItem('analytics_config');
            if (stored) {
                const parsed = JSON.parse(stored);
                return Object.assign(Object.assign({}, defaultAnalyticsConfig), parsed);
            }
        }
        catch (error) {
            console.warn('Failed to load analytics configuration:', error);
        }
        return Object.assign({}, defaultAnalyticsConfig);
    }
    getConfig() {
        return Object.assign({}, this.config);
    }
    updateConfig(updates) {
        this.config = Object.assign(Object.assign({}, this.config), updates);
        this.saveConfig();
    }
    saveConfig() {
        try {
            localStorage.setItem('analytics_config', JSON.stringify(this.config));
        }
        catch (error) {
            console.warn('Failed to save analytics configuration:', error);
        }
    }
    resetToDefault() {
        this.config = Object.assign({}, defaultAnalyticsConfig);
        this.saveConfig();
    }
    isEnabled() {
        return this.config.enabled;
    }
    isDebugMode() {
        return this.config.debugMode;
    }
    shouldTrackGameMetrics() {
        return this.config.enabled && this.config.gameMetrics.trackSolveTime;
    }
    shouldTrackGiftMetrics() {
        return this.config.enabled && this.config.giftTracking.trackCreation;
    }
    shouldRespectDoNotTrack() {
        return this.config.privacy.respectDoNotTrack &&
            (navigator.doNotTrack === '1' || navigator.doNotTrack === 'yes');
    }
    requiresCookieConsent() {
        return this.config.privacy.cookieConsentRequired;
    }
    getCurrentProvider() {
        return this.config.provider;
    }
    isClarityEnabled() {
        return this.config.enabled && this.config.clarity.enabled && this.config.provider === 'clarity';
    }
    isGoogleAnalyticsEnabled() {
        return this.config.enabled && this.config.googleAnalytics.enabled && this.config.provider === 'google-analytics';
    }
    switchProvider(provider) {
        this.config.provider = provider;
        this.saveConfig();
    }
}
const analyticsConfigManager = new AnalyticsConfigManager();
export default analyticsConfigManager;
