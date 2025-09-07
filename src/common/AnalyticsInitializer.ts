import analyticsManager from './AnalyticsManager';
import analyticsConfigManager from './AnalyticsConfig';

class AnalyticsInitializer {
    public init(): void {
        // Check if user has enabled tracking
        if (this.shouldInitializeAnalytics()) {
            console.log('Initializing analytics...');
            
            // Initialize analytics provider
            this.initAnalyticsProvider();
            
            // Track basic events
            this.trackInitialEvents();
            
            // Setup automatic flushing
            this.setupAutoFlush();
            
            console.log('Analytics successfully initialized');
        } else {
            console.log('Analytics is disabled or user does not want it');
            analyticsManager.disable();
        }
    }

    private shouldInitializeAnalytics(): boolean {
        // Check configuration
        if (!analyticsConfigManager.isEnabled()) {
            return false;
        }

        // Check Do Not Track
        if (analyticsConfigManager.shouldRespectDoNotTrack()) {
            return false;
        }

        // Check cookie consent (if required)
        if (analyticsConfigManager.requiresCookieConsent()) {
            const cookiesAccepted = localStorage.getItem('cookiesAccepted') === 'true';
            if (!cookiesAccepted) {
                return false;
            }
        }

        return true;
    }

    private initAnalyticsProvider(): void {
        const config = analyticsConfigManager.getConfig();
        
        if (config.provider === 'clarity' && config.clarity.enabled && config.clarity.projectId) {
            this.initClarity(config.clarity.projectId);
        } else if (config.provider === 'google-analytics' && config.googleAnalytics.enabled && config.googleAnalytics.measurementId) {
            this.initGoogleAnalytics(config.googleAnalytics.measurementId);
        } else {
            console.log('No external analytics provider is configured - using local tracking');
        }
    }

    private initClarity(projectId: string): void {
        // Clarity initializes automatically via script tag in HTML
        if (typeof window !== 'undefined' && (window as any).clarity) {
            console.log('Microsoft Clarity is available');
        } else {
            console.log('Microsoft Clarity is not available - check if script is loaded correctly');
        }
    }

    private initGoogleAnalytics(measurementId: string): void {
        // Check if Google Analytics is available
        if (typeof window !== 'undefined' && (window as any).gtag) {
            console.log('Google Analytics 4 is available');
            
            // Set additional parameters
            (window as any).gtag('config', measurementId, {
                page_title: document.title,
                page_location: window.location.href,
                custom_map: {
                    'custom_parameter_1': 'game_mode',
                    'custom_parameter_2': 'puzzle_category',
                    'custom_parameter_3': 'pieces_count'
                }
            });
        } else {
            console.log('Google Analytics 4 is not available - check if script is loaded correctly');
        }
    }

    private trackInitialEvents(): void {
        // Track page load
        analyticsManager.trackEvent('app_loaded', {
            user_agent: navigator.userAgent,
            screen_resolution: `${screen.width}x${screen.height}`,
            viewport_size: `${window.innerWidth}x${window.innerHeight}`,
            language: navigator.language,
            platform: navigator.platform
        });

        // Track load performance
        if (window.performance && window.performance.timing) {
            const loadTime = window.performance.timing.loadEventEnd - window.performance.timing.navigationStart;
            analyticsManager.trackPerformance('page_load_time', loadTime);
        }

        // Track JavaScript errors
        window.addEventListener('error', (event) => {
            analyticsManager.trackError('javascript_error', event.message, event.filename);
        });

        // Track unhandled Promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            analyticsManager.trackError('unhandled_promise_rejection', event.reason?.toString() || 'Unknown error');
        });
    }

    private setupAutoFlush(): void {
        const config = analyticsConfigManager.getConfig();
        
        if (config.localTracking.autoFlushInterval > 0) {
            setInterval(() => {
                analyticsManager.flushEvents();
            }, config.localTracking.autoFlushInterval);
        }
    }

    public enableAnalytics(): void {
        analyticsConfigManager.updateConfig({ enabled: true });
        analyticsManager.enable();
        this.trackInitialEvents();
    }

    public disableAnalytics(): void {
        analyticsConfigManager.updateConfig({ enabled: false });
        analyticsManager.disable();
    }

    public updateClarityProjectId(projectId: string): void {
        analyticsConfigManager.updateConfig({
            clarity: {
                ...analyticsConfigManager.getConfig().clarity,
                projectId: projectId,
                enabled: true
            }
        });
    }

    public updateGoogleAnalyticsId(measurementId: string): void {
        analyticsConfigManager.updateConfig({
            googleAnalytics: {
                ...analyticsConfigManager.getConfig().googleAnalytics,
                measurementId: measurementId,
                enabled: true
            }
        });
    }

    public switchToClarity(projectId: string): void {
        analyticsConfigManager.updateConfig({
            provider: 'clarity',
            clarity: {
                projectId: projectId,
                enabled: true
            }
        });
        analyticsManager.switchProvider('clarity');
    }

    public switchToGoogleAnalytics(measurementId: string): void {
        analyticsConfigManager.updateConfig({
            provider: 'google-analytics',
            googleAnalytics: {
                measurementId: measurementId,
                enabled: true
            }
        });
        analyticsManager.switchProvider('google-analytics');
    }

    public switchToLocalOnly(): void {
        analyticsConfigManager.updateConfig({
            provider: 'local-only'
        });
        analyticsManager.switchProvider('local-only');
    }
}

const analyticsInitializer = new AnalyticsInitializer();
export default analyticsInitializer;
