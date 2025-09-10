// Example usage of the new analytics system with Clarity and GA support
import analyticsManager from './AnalyticsManager';
import analyticsInitializer from './AnalyticsInitializer';
import { GameMode } from '../core3d/behaviors/GameModeManager';
// Example initialization with Microsoft Clarity
export function initializeWithClarity(projectId) {
    console.log('Initializing with Microsoft Clarity...');
    // Set Clarity Project ID
    analyticsInitializer.updateClarityProjectId(projectId);
    // Switch to Clarity provider
    analyticsInitializer.switchToClarity(projectId);
    // Initialize analytics
    analyticsInitializer.init();
}
// Example initialization with Google Analytics
export function initializeWithGoogleAnalytics(measurementId) {
    console.log('Initializing with Google Analytics...');
    // Set GA Measurement ID
    analyticsInitializer.updateGoogleAnalyticsId(measurementId);
    // Switch to GA provider
    analyticsInitializer.switchToGoogleAnalytics(measurementId);
    // Initialize analytics
    analyticsInitializer.init();
}
// Example switching between providers
export function switchToClarity(projectId) {
    analyticsInitializer.switchToClarity(projectId);
    console.log('Switched to Microsoft Clarity');
}
export function switchToGoogleAnalytics(measurementId) {
    analyticsInitializer.switchToGoogleAnalytics(measurementId);
    console.log('Switched to Google Analytics');
}
export function switchToLocalOnly() {
    analyticsInitializer.switchToLocalOnly();
    console.log('Switched to local tracking');
}
// Example event tracking
export function trackGameEvents() {
    // Game events
    analyticsManager.startGameSession(GameMode.Initial, 'animals', 100);
    analyticsManager.trackButtonClick('play_button', 'main_menu');
    analyticsManager.trackCategoryChange('animals', 'nature');
    analyticsManager.trackPuzzleCompletion(120000, 100); // 2 minutes, 100 pieces
    analyticsManager.endGameSession();
}
// Example gift event tracking
export function trackGiftEvents() {
    const giftData = {
        giftId: 'gift_123',
        friendName: 'John',
        age: 25,
        language: 'en',
        background: 'beach',
        fontFamily: 'Arial',
        foreground: 'blue',
        wishText: 'Happy Birthday!',
        piecesCount: 50,
        creationTime: Date.now()
    };
    analyticsManager.trackGiftCreation(giftData);
    analyticsManager.trackGiftShared('gift_123', 'email');
    analyticsManager.trackGiftReceived('gift_123');
}
// Example error and performance tracking
export function trackErrorsAndPerformance() {
    // Track error
    analyticsManager.trackError('javascript_error', 'Cannot read property of undefined', 'game_initialization');
    // Track performance
    analyticsManager.trackPerformance('page_load_time', 1500);
    analyticsManager.trackPerformance('puzzle_render_time', 200);
}
// Example user identification
export function identifyUser(userId) {
    const userProperties = {
        age: 25,
        language: 'en',
        country: 'US'
    };
    analyticsManager.identifyUser(userId, userProperties);
}
// Example session data setup
export function setSessionData() {
    const additionalData = {
        game_version: '1.0.0',
        device_type: 'mobile',
        screen_resolution: '1920x1080'
    };
    analyticsManager.setSessionData(additionalData);
}
// Example getting current analytics status
export function getAnalyticsStatus() {
    console.log('Analytics Status:');
    console.log('- Enabled:', analyticsManager.isAnalyticsEnabled());
    console.log('- Current Provider:', analyticsManager.getCurrentProvider());
    console.log('- Provider Ready:', analyticsManager.isProviderReady());
    console.log('- Session ID:', analyticsManager.getSessionId());
}
// Example usage in application
export function setupAnalytics() {
    // Automatic initialization (uses configuration from localStorage)
    analyticsInitializer.init();
    // Example manual switch to Clarity
    // switchToClarity('YOUR_CLARITY_PROJECT_ID');
    // Example manual switch to Google Analytics
    // switchToGoogleAnalytics('G-XXXXXXXXXX');
    // Example switch to local tracking
    // switchToLocalOnly();
    // Track basic events
    trackGameEvents();
    trackGiftEvents();
    trackErrorsAndPerformance();
    // Display status
    getAnalyticsStatus();
}
export default {
    initializeWithClarity,
    initializeWithGoogleAnalytics,
    switchToClarity,
    switchToGoogleAnalytics,
    switchToLocalOnly,
    trackGameEvents,
    trackGiftEvents,
    trackErrorsAndPerformance,
    identifyUser,
    setSessionData,
    getAnalyticsStatus,
    setupAnalytics
};
