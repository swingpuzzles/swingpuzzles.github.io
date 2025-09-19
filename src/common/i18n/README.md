# Internationalization (i18n) System

This document describes the internationalization system for the Swing Puzzles application.

## Overview

The i18n system provides:
- Multi-language support for the entire application
- Dynamic language switching
- Automatic language detection
- Fallback mechanisms
- Type-safe translation keys
- Parameter interpolation

## Supported Languages

- English (en) - Default
- Spanish (es)
- German (de) - TODO
- French (fr) - TODO
- Italian (it) - TODO
- Czech (cs) - TODO
- Slovak (sk) - TODO

## Architecture

### Core Components

1. **LanguageManager** (`LanguageManager.ts`)
   - Manages current language state
   - Handles language switching
   - Provides language metadata

2. **I18nManager** (`I18nManager.ts`)
   - Main translation engine
   - Parameter interpolation
   - Fallback handling
   - Pluralization support

3. **TranslationKeys** (`TranslationKeys.ts`)
   - Type-safe translation key constants
   - Organized by feature/section
   - Prevents typos and missing translations

4. **LanguageDetector** (`LanguageDetector.ts`)
   - Automatic language detection
   - URL parameter support
   - Browser language detection
   - HTML lang attribute support

### Translation Files

Translation files are stored in `src/common/i18n/translations/` as JSON files:
- `en.json` - English translations (complete)
- `es.json` - Spanish translations (complete)
- Other languages - TODO

## Usage

### Basic Translation

```typescript
import { i18nManager, TranslationKeys } from "../common/i18n";

// Simple translation
const title = i18nManager.translate(TranslationKeys.TUTORIAL.WELCOME.TITLE);

// Translation with parameters
const message = i18nManager.translate(TranslationKeys.TUTORIAL.WELCOME.GIFT_MESSAGE, { 
    name: "John" 
});
```

### Language Management

```typescript
import { languageManager, SupportedLanguages } from "../common/i18n";

// Get current language
const currentLang = languageManager.currentLanguage;

// Change language
languageManager.setLanguage(SupportedLanguages.ES);

// Get available languages
const languages = languageManager.getAllSupportedLanguages();
```

### Language Detection

```typescript
import { LanguageDetector } from "../common/i18n/LanguageDetector";

// Detect best available language
const detectedLang = LanguageDetector.detectBestLanguage();

// Check if language is supported
const isSupported = LanguageDetector.isSupported("es");
```

## Adding New Translations

### 1. Add Translation Key

Add the key to `TranslationKeys.ts`:

```typescript
export const TranslationKeys = {
    MY_FEATURE: {
        TITLE: "myFeature.title",
        MESSAGE: "myFeature.message"
    }
} as const;
```

### 2. Add Translations to Files

Add to each language file:

**en.json:**
```json
{
  "myFeature": {
    "title": "My Feature",
    "message": "This is my feature message"
  }
}
```

**es.json:**
```json
{
  "myFeature": {
    "title": "Mi Característica",
    "message": "Este es el mensaje de mi característica"
  }
}
```

### 3. Use in Components

```typescript
import { i18nManager, TranslationKeys } from "../common/i18n";

const title = i18nManager.translate(TranslationKeys.MY_FEATURE.TITLE);
```

## Parameter Interpolation

The system supports parameter interpolation using `{parameterName}` syntax:

```typescript
// Translation: "Hello {name}, you have {count} messages"
const message = i18nManager.translate("greeting", { 
    name: "John", 
    count: 5 
});
// Result: "Hello John, you have 5 messages"
```

## Pluralization

Basic pluralization support is available:

```typescript
// Translation: { "one": "1 item", "other": "{count} items" }
const message = i18nManager.translatePlural("items", count);
```

## Migration Guide

### From Old Translation System

The old `TranslationManager` is still available for backward compatibility with gift wish texts. New translations should use the new system.

### Updating Existing Components

1. Import the i18n system:
```typescript
import { i18nManager, TranslationKeys } from "../common/i18n";
```

2. Replace hardcoded strings:
```typescript
// Before
const title = "Welcome!";

// After
const title = i18nManager.translate(TranslationKeys.TUTORIAL.WELCOME.TITLE);
```

3. Handle parameters:
```typescript
// Before
const message = `Hello ${name}, welcome!`;

// After
const message = i18nManager.translate(TranslationKeys.GREETING, { name });
```

## Best Practices

1. **Use Type-Safe Keys**: Always use `TranslationKeys` constants instead of raw strings
2. **Organize by Feature**: Group related translations under feature-specific keys
3. **Provide Fallbacks**: Always provide English fallbacks for missing translations
4. **Test All Languages**: Verify translations in all supported languages
5. **Keep Context**: Include context in translation keys (e.g., `button.save` vs `button.cancel`)
6. **Avoid Concatenation**: Use parameter interpolation instead of string concatenation

## Future Enhancements

- [ ] Complete translations for all supported languages
- [ ] RTL language support
- [ ] Date/time formatting
- [ ] Number formatting per locale
- [ ] Translation management tools
- [ ] Lazy loading of translation files
- [ ] Translation validation
- [ ] Context-aware translations
