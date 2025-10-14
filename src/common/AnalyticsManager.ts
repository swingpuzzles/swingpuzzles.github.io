import { MainMode, SubMode } from "../core3d/behaviors/GameModeManager";
import IAnalyticsProvider from "./providers/IAnalyticsProvider";
import ClarityProvider from "./providers/ClarityProvider";
import GAProvider from "./providers/GAProvider";
import analyticsConfigManager from "./AnalyticsConfig";

// Types for analytics events
export interface AnalyticsEvent {
    name: string;
    parameters?: Record<string, any>;
    timestamp?: number;
}

export interface GameSessionData {
    sessionId: string;
    startTime: number;
    endTime?: number;
    gameMode: MainMode;
    subMode: SubMode;
    puzzleCategory?: string;
    piecesCount?: number;
    solveTime?: number;
    completed: boolean;
}

export interface GiftCreationData {
    giftId: string;
    friendName: string;
    age: number;
    language: string;
    background: string;
    fontFamily: string;
    foreground: string;
    wishText: string;
    piecesCount: number;
    creationTime: number;
}

class AnalyticsManager {
    private sessionId: string;
    private currentSession: GameSessionData | null = null;
    private isEnabled: boolean = true;
    private events: AnalyticsEvent[] = [];
    private maxEventsInMemory: number = 100;
    private provider: IAnalyticsProvider | null = null;

    constructor() {
        this.sessionId = this.generateSessionId();
        this.init();
    }

    private init(): void {
        // Initialize provider based on configuration
        this.initializeProvider();
        
        // Track basic page events
        this.trackPageView();
        
        // Track orientation changes
        this.trackOrientationChange();
        
        // Track session end
        this.trackSessionEnd();
    }

    private generateSessionId(): string {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    private initializeProvider(): void {
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
                } else {
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
                } else {
                    console.log('Google Analytics is not configured - using local tracking');
                }
                break;
                
            case 'local-only':
            default:
                console.log('Using local tracking only');
                break;
        }
    }

    private trackPageView(): void {
        this.trackEvent('page_view', {
            page_title: document.title,
            page_location: window.location.href,
            session_id: this.sessionId
        });
    }

    private trackOrientationChange(): void {
        window.addEventListener('orientationchange', () => {
            this.trackEvent('orientation_change', {
                orientation: screen.orientation?.type || 'unknown',
                screen_width: window.screen.width,
                screen_height: window.screen.height
            });
        });
    }

    private trackSessionEnd(): void {
        window.addEventListener('beforeunload', () => {
            if (this.currentSession) {
                this.endGameSession();
            }
            this.flushEvents();
        });
    }

    // Main methods for event tracking
    public trackEvent(eventName: string, parameters?: Record<string, any>): void {
        if (!this.isEnabled) return;

        const event: AnalyticsEvent = {
            name: eventName,
            parameters: {
                ...parameters,
                session_id: this.sessionId,
                timestamp: Date.now()
            },
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

    private saveEventLocally(event: AnalyticsEvent): void {
        try {
            const storedEvents = JSON.parse(localStorage.getItem('analytics_events') || '[]');
            storedEvents.push(event);
            
            // Store only last 50 events
            const recentEvents = storedEvents.slice(-50);
            localStorage.setItem('analytics_events', JSON.stringify(recentEvents));
        } catch (error) {
            console.warn('Failed to save analytics event locally:', error);
        }
    }

    // Game events
    public startGameSession(gameMode: MainMode, subMode: SubMode, category?: string, piecesCount?: number): void {
        this.currentSession = {
            sessionId: this.sessionId,
            startTime: Date.now(),
            gameMode,
            subMode,
            puzzleCategory: category,
            piecesCount,
            completed: false
        };

        this.trackEvent('game_session_start', {
            game_mode: MainMode[gameMode],
            sub_mode: SubMode[subMode],
            puzzle_category: category,
            pieces_count: piecesCount
        });
    }

    public endGameSession(): void {
        if (!this.currentSession) return;

        this.currentSession.endTime = Date.now();
        this.currentSession.solveTime = this.currentSession.endTime - this.currentSession.startTime;

        this.trackEvent('game_session_end', {
            game_mode: MainMode[this.currentSession.gameMode],
            puzzle_category: this.currentSession.puzzleCategory,
            pieces_count: this.currentSession.piecesCount,
            solve_time_ms: this.currentSession.solveTime,
            completed: this.currentSession.completed
        });

        this.currentSession = null;
    }

    public trackGameModeChange(fromMode: MainMode, toMode: MainMode): void {
        this.trackEvent('game_mode_change', {
            from_mode: MainMode[fromMode],
            to_mode: MainMode[toMode]
        });
    }

    public trackPuzzleCompletion(solveTime: number, piecesCount: number): void {
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

    public trackPuzzleAbandoned(): void {
        this.trackEvent('puzzle_abandoned', {
            game_mode: this.currentSession ? MainMode[this.currentSession.gameMode] : 'unknown'
        });
    }

    // UI interactions
    public trackButtonClick(buttonName: string, context?: string): void {
        this.trackEvent('button_click', {
            button_name: buttonName,
            context: context
        });
    }

    public trackCategoryChange(fromCategory: string, toCategory: string): void {
        this.trackEvent('category_change', {
            from_category: fromCategory,
            to_category: toCategory
        });
    }

    public trackDropdownInteraction(dropdownName: string, selectedValue: string): void {
        this.trackEvent('dropdown_interaction', {
            dropdown_name: dropdownName,
            selected_value: selectedValue
        });
    }

    // Gifts
    public trackGiftCreation(giftData: GiftCreationData): void {
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

    public trackGiftShared(giftId: string, shareMethod: string): void {
        this.trackEvent('gift_shared', {
            gift_id: giftId,
            share_method: shareMethod
        });
    }

    public trackGiftReceived(giftId: string): void {
        this.trackEvent('gift_received', {
            gift_id: giftId
        });
        
        // Use provider for gift events
        if (this.provider && this.provider.isReady()) {
            this.provider.trackGiftEvent('gift_received', { gift_id: giftId });
        }
    }

    // Errors and performance
    public trackError(errorType: string, errorMessage: string, context?: string): void {
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

    public trackPerformance(metricName: string, value: number, unit: string = 'ms'): void {
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
    public enable(): void {
        this.isEnabled = true;
        this.trackEvent('analytics_enabled');
    }

    public disable(): void {
        this.isEnabled = false;
        this.trackEvent('analytics_disabled');
    }

    public flushEvents(): void {
        // Send all events to server (if needed)
        console.log('Flushing analytics events:', this.events.length);
        this.events = [];
    }

    public getStoredEvents(): AnalyticsEvent[] {
        try {
            return JSON.parse(localStorage.getItem('analytics_events') || '[]');
        } catch (error) {
            console.warn('Failed to load stored analytics events:', error);
            return [];
        }
    }

    public clearStoredEvents(): void {
        localStorage.removeItem('analytics_events');
    }

    // Getters for current state
    public getCurrentSession(): GameSessionData | null {
        return this.currentSession;
    }

    public getSessionId(): string {
        return this.sessionId;
    }

    public isAnalyticsEnabled(): boolean {
        return this.isEnabled;
    }

    // Provider management
    public switchProvider(providerType: 'clarity' | 'google-analytics' | 'local-only'): void {
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

    public getCurrentProvider(): string | null {
        if (this.provider instanceof ClarityProvider) {
            return 'clarity';
        } else if (this.provider instanceof GAProvider) {
            return 'google-analytics';
        }
        return 'local-only';
    }

    public isProviderReady(): boolean {
        return this.provider ? this.provider.isReady() : false;
    }

    public setSessionData(additionalData?: Record<string, any>): void {
        if (this.provider && this.provider.isReady()) {
            this.provider.setSessionData(this.sessionId, additionalData);
        }
    }

    public identifyUser(userId: string, userProperties?: Record<string, any>): void {
        if (this.provider && this.provider.isReady()) {
            this.provider.identify(userId, userProperties);
        }
    }
}

const analyticsManager = new AnalyticsManager();
export default analyticsManager;
