// Analytics configuration file
export type AnalyticsProvider = 'clarity' | 'google-analytics' | 'local-only';

export interface AnalyticsConfig {
    // Basic settings
    enabled: boolean;
    debugMode: boolean;
    provider: AnalyticsProvider;
    
    // Microsoft Clarity
    clarity: {
        enabled: boolean;
        projectId?: string;
    };
    
    // Google Analytics 4
    googleAnalytics: {
        enabled: boolean;
        measurementId?: string;
        apiSecret?: string;
    };
    
    // Local tracking
    localTracking: {
        enabled: boolean;
        maxStoredEvents: number;
        autoFlushInterval: number; // in milliseconds
    };
    
    // Game metrics
    gameMetrics: {
        trackSolveTime: boolean;
        trackPuzzleAbandonment: boolean;
        trackUserInteractions: boolean;
        trackPerformanceMetrics: boolean;
    };
    
    // Gifts
    giftTracking: {
        trackCreation: boolean;
        trackSharing: boolean;
        trackReceiving: boolean;
        trackCustomization: boolean;
    };
    
    // Privacy protection
    privacy: {
        anonymizeData: boolean;
        respectDoNotTrack: boolean;
        cookieConsentRequired: boolean;
    };
}

// Default configuration
export const defaultAnalyticsConfig: AnalyticsConfig = {
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
    private config: AnalyticsConfig;
    
    constructor() {
        this.config = this.loadConfig();
    }
    
    private loadConfig(): AnalyticsConfig {
        try {
            const stored = localStorage.getItem('analytics_config');
            if (stored) {
                const parsed = JSON.parse(stored);
                return { ...defaultAnalyticsConfig, ...parsed };
            }
        } catch (error) {
            console.warn('Failed to load analytics configuration:', error);
        }
        
        return { ...defaultAnalyticsConfig };
    }
    
    public getConfig(): AnalyticsConfig {
        return { ...this.config };
    }
    
    public updateConfig(updates: Partial<AnalyticsConfig>): void {
        this.config = { ...this.config, ...updates };
        this.saveConfig();
    }
    
    private saveConfig(): void {
        try {
            localStorage.setItem('analytics_config', JSON.stringify(this.config));
        } catch (error) {
            console.warn('Failed to save analytics configuration:', error);
        }
    }
    
    public resetToDefault(): void {
        this.config = { ...defaultAnalyticsConfig };
        this.saveConfig();
    }
    
    public isEnabled(): boolean {
        return this.config.enabled;
    }
    
    public isDebugMode(): boolean {
        return this.config.debugMode;
    }
    
    public shouldTrackGameMetrics(): boolean {
        return this.config.enabled && this.config.gameMetrics.trackSolveTime;
    }
    
    public shouldTrackGiftMetrics(): boolean {
        return this.config.enabled && this.config.giftTracking.trackCreation;
    }
    
    public shouldRespectDoNotTrack(): boolean {
        return this.config.privacy.respectDoNotTrack && 
               (navigator.doNotTrack === '1' || navigator.doNotTrack === 'yes');
    }
    
    public requiresCookieConsent(): boolean {
        return this.config.privacy.cookieConsentRequired;
    }
    
    public getCurrentProvider(): AnalyticsProvider {
        return this.config.provider;
    }
    
    public isClarityEnabled(): boolean {
        return this.config.enabled && this.config.clarity.enabled && this.config.provider === 'clarity';
    }
    
    public isGoogleAnalyticsEnabled(): boolean {
        return this.config.enabled && this.config.googleAnalytics.enabled && this.config.provider === 'google-analytics';
    }
    
    public switchProvider(provider: AnalyticsProvider): void {
        this.config.provider = provider;
        this.saveConfig();
    }
}

const analyticsConfigManager = new AnalyticsConfigManager();
export default analyticsConfigManager;
