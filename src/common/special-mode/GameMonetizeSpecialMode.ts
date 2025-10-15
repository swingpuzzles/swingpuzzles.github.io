import navigationManager from "../../gui/NavigationManager";
import puzzleUrlHelper from "../PuzzleUrlHelper";
import { ISpecialMode } from "./ISpecialMode";
import localStorageManager, { CommonStorageKeys, GiftStorageKeys } from "../LocalStorageManager";
import { i18nManager, TranslationKeys } from "../i18n";

export class GameMonetizeSpecialMode implements ISpecialMode {
    constructor() {
    }
    categoryDropdownVisible(defaultVisible: boolean): boolean {
        return false;
    }
    bannerButtonVisible(defaultVisible: boolean): boolean {
        return false;
    }
    calendarButtonVisible(defaultVisible: boolean): boolean {
        return false;
    }
    giftButtonVisible(defaultVisible: boolean): boolean {
        return false;
    }
    nextButtonVisible(defaultVisible: boolean): boolean {
        return false;
    }
    prevButtonVisible(defaultVisible: boolean): boolean {
        return false;
    }
    menuButtonVisible(defaultVisible: boolean): boolean {
        return false;
    }
    morePuzzlesButtonVisible(defaultVisible: boolean): boolean {
        return true;
    }
    mainMenuButtonText(defaultText: string): string {
        return "🧩🏠 MORE PUZZLES 🏠🧩";
    }
    handleGoBackAction(): boolean {
        const mode = puzzleUrlHelper.mode;
        const localStorageData = puzzleUrlHelper.getCurrentLocalStorageData();
        
        // Build URL with category and localStorage items
        const params = new URLSearchParams();
        
        if (mode) {
            params.set('mode', mode);
        }
        
        // Add localStorage items to URL parameters
        Object.entries(localStorageData).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
                // Don't stringify strings, only objects/arrays
                const paramValue = typeof value === 'string' ? value : JSON.stringify(value);
                params.set(key, paramValue);
            }
        });
        
        const url = params.toString() ? `https://swingpuzzles.com?${params.toString()}` : 'https://swingpuzzles.com';
        window.open(url, "_blank");
        
        return false;
    }
    handleShowBuyOfferMessage(): boolean {
        navigationManager.handleXAction();
        return false;
    }
    getPuzzleSolvedMessage(defaultMessage: string, emailCaptured: boolean, puzzleFinished: boolean): string {
        if (puzzleFinished) {
            return emailCaptured
                ? i18nManager.translate(TranslationKeys.SPECIAL_MODE.GAME_MONETIZE.PUZZLE_SOLVED_MESSAGE_COMPLETED)
                : i18nManager.translate(TranslationKeys.SPECIAL_MODE.GAME_MONETIZE.PUZZLE_SOLVED_MESSAGE_FIRST_TIME);
        } else {
            return i18nManager.translate(TranslationKeys.SPECIAL_MODE.GAME_MONETIZE.PUZZLE_PAUSED_MESSAGE);
        }
    }
    cookiesBannerVisible(defaultVisible: boolean): boolean {
        return false; // GameMonetize special mode doesn't show cookie banner
    }
    useCookies(defaultUse: boolean): boolean {
        return false; // GameMonetize special mode doesn't use cookies
    }
    handleWelcomeAction(defaultAction: boolean): boolean {
        if (window.parent) {
            window.parent.postMessage('showAd', '*');
        }
        
        return defaultAction; // GameMonetize special mode allows welcome action
    }
    welcomeSeen(defaultSeen: boolean): boolean {
        return false; // GameMonetize special mode respects default welcome seen state
    }
}
