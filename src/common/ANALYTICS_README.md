# Analytics System - Microsoft Clarity & Google Analytics

This system provides flexible support for Microsoft Clarity and Google Analytics with easy switching between providers.

## Features

- ✅ **Microsoft Clarity** - Primary analytics provider
- ✅ **Google Analytics 4** - Alternative provider
- ✅ **Local tracking** - Fallback mode
- ✅ **Easy switching** between providers
- ✅ **Game metrics** - Puzzle game tracking
- ✅ **Gift metrics** - Gift creation and sharing tracking
- ✅ **Performance metrics** - Application performance tracking
- ✅ **Error tracking** - Automatic error tracking
- ✅ **Privacy protection** - Respects Do Not Track and cookie consent

## Quick Start

### 1. Setting up Microsoft Clarity

```typescript
import analyticsInitializer from './common/AnalyticsInitializer';

// Set Clarity Project ID
analyticsInitializer.updateClarityProjectId('YOUR_CLARITY_PROJECT_ID');

// Switch to Clarity provider
analyticsInitializer.switchToClarity('YOUR_CLARITY_PROJECT_ID');

// Initialize
analyticsInitializer.init();
```

### 2. Setting up Google Analytics (alternative)

```typescript
import analyticsInitializer from './common/AnalyticsInitializer';

// Set GA Measurement ID
analyticsInitializer.updateGoogleAnalyticsId('G-XXXXXXXXXX');

// Switch to GA provider
analyticsInitializer.switchToGoogleAnalytics('G-XXXXXXXXXX');

// Initialize
analyticsInitializer.init();
```

### 3. Event Tracking

```typescript
import analyticsManager from './common/AnalyticsManager';

// Game events
analyticsManager.startGameSession('puzzle', 'animals', 100);
analyticsManager.trackButtonClick('play_button', 'main_menu');
analyticsManager.trackPuzzleCompletion(120000, 100);
analyticsManager.endGameSession();

// Gift events
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

// Errors and performance
analyticsManager.trackError('javascript_error', 'Cannot read property', 'game_init');
analyticsManager.trackPerformance('page_load_time', 1500);
```

## Configuration

### HTML Script Tags

In `src/index.html` script tags are already added for both providers:

```html
<!-- Microsoft Clarity (active) -->
<script type="text/javascript">
    (function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", "YOUR_PROJECT_ID");
</script>

<!-- Google Analytics (commented out) -->
<!--
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-XXXXXXXXXX', {
        anonymize_ip: true,
        cookie_flags: 'SameSite=None;Secure'
    });
</script>
-->
```

### Configuration File

Configuration is stored in `localStorage` and can be modified via `AnalyticsConfig`:

```typescript
import analyticsConfigManager from './common/AnalyticsConfig';

// Get current configuration
const config = analyticsConfigManager.getConfig();

// Update configuration
analyticsConfigManager.updateConfig({
    provider: 'clarity',
    clarity: {
        enabled: true,
        projectId: 'YOUR_PROJECT_ID'
    }
});
```

## Switching Between Providers

### Programmatic Switching

```typescript
import analyticsManager from './common/AnalyticsManager';

// Switch to Clarity
analyticsManager.switchProvider('clarity');

// Switch to Google Analytics
analyticsManager.switchProvider('google-analytics');

// Switch to local tracking
analyticsManager.switchProvider('local-only');
```

### Status Check

```typescript
// Check current provider
const currentProvider = analyticsManager.getCurrentProvider();
console.log('Current provider:', currentProvider);

// Check if provider is ready
const isReady = analyticsManager.isProviderReady();
console.log('Provider ready:', isReady);

// Check if analytics is enabled
const isEnabled = analyticsManager.isAnalyticsEnabled();
console.log('Analytics enabled:', isEnabled);
```

## Event Types

### Game Events
- `game_session_start` - Start of game session
- `game_session_end` - End of game session
- `puzzle_completed` - Puzzle completion
- `puzzle_abandoned` - Puzzle abandonment
- `game_mode_change` - Game mode change

### UI Events
- `button_click` - Button click
- `category_change` - Category change
- `dropdown_interaction` - Dropdown interaction

### Gift Events
- `gift_created` - Gift creation
- `gift_shared` - Gift sharing
- `gift_received` - Gift receiving

### System Events
- `error_occurred` - Error occurrence
- `performance_metric` - Performance metric
- `page_view` - Page view

## Privacy Protection

The system automatically respects:
- **Do Not Track** browser setting
- **Cookie consent** (if enabled)
- **Data anonymization** (if enabled)

## Debug Mode

To enable debug mode:

```typescript
localStorage.setItem('analytics_debug', 'true');
```

## Usage Examples

See `src/common/AnalyticsExample.ts` for complete usage examples.

## Migration from Original System

If you're already using the old analytics system, simply replace:

```typescript
// Old way
import analyticsManager from './common/AnalyticsManager';
analyticsManager.trackEvent('event_name', { param: 'value' });

// New way (same API)
import analyticsManager from './common/AnalyticsManager';
analyticsManager.trackEvent('event_name', { param: 'value' });
```

The API remains the same, just added support for Clarity and flexible switching between providers.
