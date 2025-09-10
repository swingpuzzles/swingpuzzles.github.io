import analyticsManager from './AnalyticsManager';
import analyticsConfigManager from './AnalyticsConfig';
class AnalyticsInitializer {
    init() {
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
        }
        else {
            console.log('Analytics is disabled or user does not want it');
            analyticsManager.disable();
        }
    }
    shouldInitializeAnalytics() {
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
    initAnalyticsProvider() {
        const config = analyticsConfigManager.getConfig();
        if (config.provider === 'clarity' && config.clarity.enabled && config.clarity.projectId) {
            this.initClarity(config.clarity.projectId);
        }
        else if (config.provider === 'google-analytics' && config.googleAnalytics.enabled && config.googleAnalytics.measurementId) {
            this.initGoogleAnalytics(config.googleAnalytics.measurementId);
        }
        else {
            console.log('No external analytics provider is configured - using local tracking');
        }
    }
    initClarity(projectId) {
        // Clarity initializes automatically via script tag in HTML
        if (typeof window !== 'undefined' && window.clarity) {
            console.log('Microsoft Clarity is available');
        }
        else {
            console.log('Microsoft Clarity is not available - check if script is loaded correctly');
        }
    }
    initGoogleAnalytics(measurementId) {
        // Check if Google Analytics is available
        if (typeof window !== 'undefined' && window.gtag) {
            console.log('Google Analytics 4 is available');
            // Set additional parameters
            window.gtag('config', measurementId, {
                page_title: document.title,
                page_location: window.location.href,
                custom_map: {
                    'custom_parameter_1': 'game_mode',
                    'custom_parameter_2': 'puzzle_category',
                    'custom_parameter_3': 'pieces_count'
                }
            });
        }
        else {
            console.log('Google Analytics 4 is not available - check if script is loaded correctly');
        }
    }
    trackInitialEvents() {
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
            var _a;
            analyticsManager.trackError('unhandled_promise_rejection', ((_a = event.reason) === null || _a === void 0 ? void 0 : _a.toString()) || 'Unknown error');
        });
    }
    setupAutoFlush() {
        const config = analyticsConfigManager.getConfig();
        if (config.localTracking.autoFlushInterval > 0) {
            setInterval(() => {
                analyticsManager.flushEvents();
            }, config.localTracking.autoFlushInterval);
        }
    }
    enableAnalytics() {
        analyticsConfigManager.updateConfig({ enabled: true });
        analyticsManager.enable();
        this.trackInitialEvents();
    }
    disableAnalytics() {
        analyticsConfigManager.updateConfig({ enabled: false });
        analyticsManager.disable();
    }
    updateClarityProjectId(projectId) {
        analyticsConfigManager.updateConfig({
            clarity: Object.assign(Object.assign({}, analyticsConfigManager.getConfig().clarity), { projectId: projectId, enabled: true })
        });
    }
    updateGoogleAnalyticsId(measurementId) {
        analyticsConfigManager.updateConfig({
            googleAnalytics: Object.assign(Object.assign({}, analyticsConfigManager.getConfig().googleAnalytics), { measurementId: measurementId, enabled: true })
        });
    }
    switchToClarity(projectId) {
        analyticsConfigManager.updateConfig({
            provider: 'clarity',
            clarity: {
                projectId: projectId,
                enabled: true
            }
        });
        analyticsManager.switchProvider('clarity');
    }
    switchToGoogleAnalytics(measurementId) {
        analyticsConfigManager.updateConfig({
            provider: 'google-analytics',
            googleAnalytics: {
                measurementId: measurementId,
                enabled: true
            }
        });
        analyticsManager.switchProvider('google-analytics');
    }
    switchToLocalOnly() {
        analyticsConfigManager.updateConfig({
            provider: 'local-only'
        });
        analyticsManager.switchProvider('local-only');
    }
}
const analyticsInitializer = new AnalyticsInitializer();
export default analyticsInitializer;
