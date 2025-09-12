import navigationManager from "../../gui/NavigationManager";
import puzzleUrlHelper from "../PuzzleUrlHelper";
import { ISpecialMode } from "./ISpecialMode";

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
        if (category) {
            window.open(`https://swingpuzzles.com?category=${category}`, "_blank");
        } else {
            window.open("https://swingpuzzles.com", "_blank");
        }
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
