# Analytika pre Swing Puzzles

Tento dokument popisuje implementáciu analytického systému pre aplikáciu Swing Puzzles.

## Prehľad

Analytický systém je navrhnutý tak, aby sledoval kľúčové metriky hry a poskytoval užitočné informácie o používateľskom správaní. Systém podporuje:

- **Lokálne sledovanie** - ukladanie udalostí do localStorage
- **Google Analytics 4** - odosielanie udalostí do GA4
- **Ochrana súkromia** - respektovanie Do Not Track a cookie súhlasu
- **Konfigurovateľnosť** - možnosť zapnúť/vypnúť rôzne typy sledovania

## Architektúra

### Hlavné komponenty

1. **AnalyticsManager** (`src/common/AnalyticsManager.ts`)
   - Hlavná trieda pre sledovanie udalostí
   - Spravuje herné relácie a udalosti
   - Podporuje lokálne ukladanie a Google Analytics

2. **AnalyticsConfig** (`src/common/AnalyticsConfig.ts`)
   - Konfiguračný manažér
   - Nastavenia pre rôzne typy sledovania
   - Správa ochrany súkromia

3. **AnalyticsInitializer** (`src/common/AnalyticsInitializer.ts`)
   - Inicializácia analytického systému
   - Kontrola oprávnení a nastavení
   - Nastavenie automatického flushovania

## Sledované udalosti

### Herné udalosti
- `game_session_start` - Začiatok hernej relácie
- `game_session_end` - Koniec hernej relácie
- `game_mode_change` - Zmena módu hry
- `puzzle_completed` - Dokončenie puzzle
- `puzzle_abandoned` - Opustenie puzzle

### UI interakcie
- `button_click` - Klik na tlačidlo
- `category_change` - Zmena kategórie
- `dropdown_interaction` - Interakcia s dropdown

### Darčeky
- `gift_created` - Vytvorenie darčeka
- `gift_shared` - Zdieľanie darčeka
- `gift_received` - Prijatie darčeka

### Výkon a chyby
- `performance_metric` - Metriky výkonu
- `error_occurred` - Výskyt chyby
- `page_view` - Načítanie stránky

## Konfigurácia

### Základné nastavenia

```typescript
const config: AnalyticsConfig = {
    enabled: true,
    debugMode: false,
    
    googleAnalytics: {
        enabled: true,
        measurementId: 'G-XXXXXXXXXX'
    },
    
    localTracking: {
        enabled: true,
        maxStoredEvents: 50,
        autoFlushInterval: 300000 // 5 minút
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
```

### Google Analytics 4 nastavenie

1. Vytvorte si Google Analytics 4 property
2. Získajte Measurement ID (formát: G-XXXXXXXXXX)
3. Nahraďte `G-XXXXXXXXXX` v `src/index.html`
4. Aktualizujte konfiguráciu v `AnalyticsConfig.ts`

## Použitie

### Základné sledovanie

```typescript
import analyticsManager from './common/AnalyticsManager';

// Sledovanie udalosti
analyticsManager.trackEvent('custom_event', {
    parameter1: 'value1',
    parameter2: 'value2'
});

// Sledovanie hernej relácie
analyticsManager.startGameSession(GameMode.Solve, 'animals', 100);
analyticsManager.trackPuzzleCompletion(120000, 100); // 2 minúty, 100 kúskov
analyticsManager.endGameSession();
```

### Konfigurácia

```typescript
import analyticsConfigManager from './common/AnalyticsConfig';

// Zapnúť/vypnúť analytiku
analyticsConfigManager.updateConfig({ enabled: true });

// Aktualizovať Google Analytics ID
analyticsConfigManager.updateConfig({
    googleAnalytics: {
        enabled: true,
        measurementId: 'G-NOVY_ID'
    }
});
```

## Ochrana súkromia

Systém respektuje:

- **Do Not Track** - ak je nastavené v prehliadači
- **Cookie súhlas** - ak je povinný
- **Anonymizácia dát** - odstránenie citlivých informácií
- **Lokálne ukladanie** - možnosť vypnúť odosielanie na server

## Debugovanie

Pre zapnutie debug módu:

```typescript
analyticsConfigManager.updateConfig({ debugMode: true });
```

V debug móde sa všetky udalosti vypisujú do konzoly.

## Testovanie

### Lokálne testovanie

1. Otvorte Developer Tools (F12)
2. Prejdite na Application > Local Storage
3. Nájdite kľúč `analytics_events`
4. Skontrolujte uložené udalosti

### Google Analytics testovanie

1. Použite Google Analytics Debug View
2. Alebo Real-time reports
3. Overte, že sa udalosti zobrazujú správne

## Príklady použitia

### Sledovanie času riešenia puzzle

```typescript
// V TimerDisplay.ts
const solveTime = this.getElapsedTimeMs();
analyticsManager.trackPuzzleCompletion(solveTime, piecesCount);
```

### Sledovanie UI interakcií

```typescript
// V GuiManager.ts
this.playButton.onPointerClickObservable.add(() => {
    analyticsManager.trackButtonClick('play_button', 'initial_mode');
    // ... zvyšok kódu
});
```

### Sledovanie darčekov

```typescript
// V GiftMaker.ts
const giftData: GiftCreationData = {
    giftId: `gift_${Date.now()}`,
    friendName: 'Alex',
    age: 25,
    language: 'en',
    // ... ďalšie údaje
};
analyticsManager.trackGiftCreation(giftData);
```

## Rozšírenie

Pre pridanie nových typov udalostí:

1. Rozšírte `AnalyticsEvent` interface
2. Pridajte metódu do `AnalyticsManager`
3. Volajte metódu v príslušných miestach kódu
4. Aktualizujte konfiguráciu podľa potreby

## Problémy a riešenia

### Google Analytics sa nenačítava
- Skontrolujte Measurement ID
- Overte internetové pripojenie
- Skontrolujte konzolu pre chyby

### Udalosti sa neukladajú lokálne
- Skontrolujte localStorage dostupnosť
- Overte konfiguráciu `localTracking.enabled`
- Skontrolujte veľkosť localStorage

### Výkon aplikácie
- Znížte `maxEventsInMemory`
- Zvýšte `autoFlushInterval`
- Vypnite nepotrebné typy sledovania

## Podpora

Pre otázky a problémy s analytikou kontaktujte vývojový tím alebo vytvorte issue v repozitári.
