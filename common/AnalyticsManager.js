import { GameMode } from "../core3d/behaviors/GameModeManager";
import ClarityProvider from "./providers/ClarityProvider";
import GAProvider from "./providers/GAProvider";
import analyticsConfigManager from "./AnalyticsConfig";
class AnalyticsManager {
    constructor() {
        this.currentSession = null;
        this.isEnabled = true;
        this.events = [];
        this.maxEventsInMemory = 100;
        this.provider = null;
        this.sessionId = this.generateSessionId();
        this.init();
    }
    init() {
        // Initialize provider based on configuration
        this.initializeProvider();
        // Track basic page events
        this.trackPageView();
        // Track orientation changes
        this.trackOrientationChange();
        // Track session end
        this.trackSessionEnd();
    }
    generateSessionId() {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    initializeProvider() {
        const config = analyticsConfigManager.getConfig();
        if (!config.enabled) {
            console.log('Analytics is disabled');
            return;
        }
        switch (config.provider) {
            case 'clarity':
                if (config.clarity.enabled && config.clarity.projectId) {
                    this.provider = new ClarityProvider();
                    this.provider.initialize({ projectId: config.clarity.projectId });
                    console.log('Microsoft Clarity Provider initialized');
                }
                else {
                    console.log('Clarity is not configured - using local tracking');
                }
                break;
            case 'google-analytics':
                if (config.googleAnalytics.enabled && config.googleAnalytics.measurementId) {
                    this.provider = new GAProvider();
                    this.provider.initialize({
                        measurementId: config.googleAnalytics.measurementId,
                        apiSecret: config.googleAnalytics.apiSecret
                    });
                    console.log('Google Analytics Provider initialized');
                }
                else {
                    console.log('Google Analytics is not configured - using local tracking');
                }
                break;
            case 'local-only':
            default:
                console.log('Using local tracking only');
                break;
        }
    }
    trackPageView() {
        this.trackEvent('page_view', {
            page_title: document.title,
            page_location: window.location.href,
            session_id: this.sessionId
        });
    }
    trackOrientationChange() {
        window.addEventListener('orientationchange', () => {
            var _a;
            this.trackEvent('orientation_change', {
                orientation: ((_a = screen.orientation) === null || _a === void 0 ? void 0 : _a.type) || 'unknown',
                screen_width: window.screen.width,
                screen_height: window.screen.height
            });
        });
    }
    trackSessionEnd() {
        window.addEventListener('beforeunload', () => {
            if (this.currentSession) {
                this.endGameSession();
            }
            this.flushEvents();
        });
    }
    // Main methods for event tracking
    trackEvent(eventName, parameters) {
        if (!this.isEnabled)
            return;
        const event = {
            name: eventName,
            parameters: Object.assign(Object.assign({}, parameters), { session_id: this.sessionId, timestamp: Date.now() }),
            timestamp: Date.now()
        };
        this.events.push(event);
        // Use provider (if available)
        if (this.provider && this.provider.isReady()) {
            this.provider.trackEvent(eventName, parameters);
        }
        // Local storage (if needed)
        this.saveEventLocally(event);
        // Limit number of events in memory
        if (this.events.length > this.maxEventsInMemory) {
            this.events = this.events.slice(-this.maxEventsInMemory);
        }
        console.log('Analytics Event:', event);
    }
    saveEventLocally(event) {
        try {
            const storedEvents = JSON.parse(localStorage.getItem('analytics_events') || '[]');
            storedEvents.push(event);
            // Store only last 50 events
            const recentEvents = storedEvents.slice(-50);
            localStorage.setItem('analytics_events', JSON.stringify(recentEvents));
        }
        catch (error) {
            console.warn('Failed to save analytics event locally:', error);
        }
    }
    // Game events
    startGameSession(gameMode, category, piecesCount) {
        this.currentSession = {
            sessionId: this.sessionId,
            startTime: Date.now(),
            gameMode,
            puzzleCategory: category,
            piecesCount,
            completed: false
        };
        this.trackEvent('game_session_start', {
            game_mode: GameMode[gameMode],
            puzzle_category: category,
            pieces_count: piecesCount
        });
    }
    endGameSession() {
        if (!this.currentSession)
            return;
        this.currentSession.endTime = Date.now();
        this.currentSession.solveTime = this.currentSession.endTime - this.currentSession.startTime;
        this.trackEvent('game_session_end', {
            game_mode: GameMode[this.currentSession.gameMode],
            puzzle_category: this.currentSession.puzzleCategory,
            pieces_count: this.currentSession.piecesCount,
            solve_time_ms: this.currentSession.solveTime,
            completed: this.currentSession.completed
        });
        this.currentSession = null;
    }
    trackGameModeChange(fromMode, toMode) {
        this.trackEvent('game_mode_change', {
            from_mode: GameMode[fromMode],
            to_mode: GameMode[toMode]
        });
    }
    trackPuzzleCompletion(solveTime, piecesCount) {
        if (this.currentSession) {
            this.currentSession.completed = true;
            this.currentSession.solveTime = solveTime;
        }
        this.trackEvent('puzzle_completed', {
            solve_time_ms: solveTime,
            pieces_count: piecesCount,
            solve_time_minutes: Math.round(solveTime / 60000 * 100) / 100
        });
    }
    trackPuzzleAbandoned() {
        this.trackEvent('puzzle_abandoned', {
            game_mode: this.currentSession ? GameMode[this.currentSession.gameMode] : 'unknown'
        });
    }
    // UI interactions
    trackButtonClick(buttonName, context) {
        this.trackEvent('button_click', {
            button_name: buttonName,
            context: context
        });
    }
    trackCategoryChange(fromCategory, toCategory) {
        this.trackEvent('category_change', {
            from_category: fromCategory,
            to_category: toCategory
        });
    }
    trackDropdownInteraction(dropdownName, selectedValue) {
        this.trackEvent('dropdown_interaction', {
            dropdown_name: dropdownName,
            selected_value: selectedValue
        });
    }
    // Gifts
    trackGiftCreation(giftData) {
        this.trackEvent('gift_created', {
            gift_id: giftData.giftId,
            friend_name_length: giftData.friendName.length,
            age: giftData.age,
            language: giftData.language,
            background: giftData.background,
            font_family: giftData.fontFamily,
            foreground: giftData.foreground,
            wish_text_length: giftData.wishText.length,
            pieces_count: giftData.piecesCount
        });
    }
    trackGiftShared(giftId, shareMethod) {
        this.trackEvent('gift_shared', {
            gift_id: giftId,
            share_method: shareMethod
        });
    }
    trackGiftReceived(giftId) {
        this.trackEvent('gift_received', {
            gift_id: giftId
        });
        // Use provider for gift events
        if (this.provider && this.provider.isReady()) {
            this.provider.trackGiftEvent('gift_received', { gift_id: giftId });
        }
    }
    // Errors and performance
    trackError(errorType, errorMessage, context) {
        this.trackEvent('error_occurred', {
            error_type: errorType,
            error_message: errorMessage,
            context: context
        });
        // Use provider for errors
        if (this.provider && this.provider.isReady()) {
            this.provider.trackError(errorType, errorMessage, context);
        }
    }
    trackPerformance(metricName, value, unit = 'ms') {
        this.trackEvent('performance_metric', {
            metric_name: metricName,
            value: value,
            unit: unit
        });
        // Use provider for performance metrics
        if (this.provider && this.provider.isReady()) {
            this.provider.trackPerformance(metricName, value, unit);
        }
    }
    // Analytics management
    enable() {
        this.isEnabled = true;
        this.trackEvent('analytics_enabled');
    }
    disable() {
        this.isEnabled = false;
        this.trackEvent('analytics_disabled');
    }
    flushEvents() {
        // Send all events to server (if needed)
        console.log('Flushing analytics events:', this.events.length);
        this.events = [];
    }
    getStoredEvents() {
        try {
            return JSON.parse(localStorage.getItem('analytics_events') || '[]');
        }
        catch (error) {
            console.warn('Failed to load stored analytics events:', error);
            return [];
        }
    }
    clearStoredEvents() {
        localStorage.removeItem('analytics_events');
    }
    // Getters for current state
    getCurrentSession() {
        return this.currentSession;
    }
    getSessionId() {
        return this.sessionId;
    }
    isAnalyticsEnabled() {
        return this.isEnabled;
    }
    // Provider management
    switchProvider(providerType) {
        // Destroy current provider
        if (this.provider) {
            this.provider.destroy();
            this.provider = null;
        }
        // Update configuration
        analyticsConfigManager.switchProvider(providerType);
        // Reinitialize provider
        this.initializeProvider();
        this.trackEvent('provider_switched', {
            new_provider: providerType
        });
    }
    getCurrentProvider() {
        if (this.provider instanceof ClarityProvider) {
            return 'clarity';
        }
        else if (this.provider instanceof GAProvider) {
            return 'google-analytics';
        }
        return 'local-only';
    }
    isProviderReady() {
        return this.provider ? this.provider.isReady() : false;
    }
    setSessionData(additionalData) {
        if (this.provider && this.provider.isReady()) {
            this.provider.setSessionData(this.sessionId, additionalData);
        }
    }
    identifyUser(userId, userProperties) {
        if (this.provider && this.provider.isReady()) {
            this.provider.identify(userId, userProperties);
        }
    }
}
const analyticsManager = new AnalyticsManager();
export default analyticsManager;
