import navigationManager from "../../gui/NavigationManager";
import puzzleUrlHelper from "../PuzzleUrlHelper";
import { ISpecialMode } from "./ISpecialMode";
import localStorageManager, { CommonStorageKeys, GiftStorageKeys } from "../LocalStorageManager";

export class GameMonetizeSpecialMode implements ISpecialMode {
    constructor() {
    }
    categoryDropdownVisible(defaultVisible: boolean): boolean {
        return false;
    }
    bannerButtonVisible(defaultVisible: boolean): boolean {
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
        const category = puzzleUrlHelper.category;
        const localStorageData = puzzleUrlHelper.getCurrentLocalStorageData();
        
        // Build URL with category and localStorage items
        const params = new URLSearchParams();
        
        if (category) {
            params.set('category', category);
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
        return puzzleFinished ? emailCaptured
        ? `🎉 Congratulations!
  
  You've completed this puzzle.
  
  You can restart it, explore more puzzles, or add another email to get updates.`
        : `🎉 Congratulations!
  
  You've completed this puzzle.
  
  You can restart it, explore more puzzles, or add your email to get updates when new puzzles arrive.`
    : `Your puzzle is on hold.
            
    What's next?

    You can continue right where you left off, restart from the beginning, explore more puzzles, or add your email to get updates when new puzzles arrive.`;
    }
    cookiesBannerVisible(defaultVisible: boolean): boolean {
        return false; // GameMonetize special mode doesn't show cookie banner
    }
    useCookies(defaultUse: boolean): boolean {
        return false; // GameMonetize special mode doesn't use cookies
    }
}
