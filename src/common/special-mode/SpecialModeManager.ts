import guiManager from "../../gui/GuiManager";
import { GameMonetizeSpecialMode } from "./GameMonetizeSpecialMode";
import { ISpecialMode } from "./ISpecialMode";

class SpecialModeManager {
    private _specialMode: ISpecialMode | null = null;

    enterSpecialMode(specialMode: string) {
        switch (specialMode) {
            case "game-monetize":
                this._specialMode = new GameMonetizeSpecialMode();
                break;
        }

        if (this._specialMode) {
            guiManager.enterSpecialMode(this._specialMode);
        }
    }

    bannerButtonVisible(defaultVisible: boolean): boolean {
        return this._specialMode !== null ? this._specialMode.bannerButtonVisible(defaultVisible) : defaultVisible;
    }
    nextButtonVisible(defaultVisible: boolean): boolean {
        return this._specialMode !== null ? this._specialMode.nextButtonVisible(defaultVisible) : defaultVisible;
    }
    prevButtonVisible(defaultVisible: boolean): boolean {
        return this._specialMode !== null ? this._specialMode.prevButtonVisible(defaultVisible) : defaultVisible;
    }
    menuButtonVisible(defaultVisible: boolean): boolean {
        return this._specialMode !== null ? this._specialMode.menuButtonVisible(defaultVisible) : defaultVisible;
    }
    morePuzzlesButtonVisible(defaultVisible: boolean): boolean {
        return this._specialMode !== null ? this._specialMode.morePuzzlesButtonVisible(defaultVisible) : defaultVisible;
    }
    categoryDropdownVisible(defaultVisible: boolean): boolean {
        return this._specialMode !== null ? this._specialMode.categoryDropdownVisible(defaultVisible) : defaultVisible;
    }
    mainMenuButtonText(defaultText: string): string {
        return this._specialMode !== null ? this._specialMode.mainMenuButtonText(defaultText) : defaultText;
    }
    handleGoBackAction(): boolean {
        return this._specialMode !== null ? this._specialMode.handleGoBackAction() : true;
    }
    handleShowBuyOfferMessage(): boolean {
        return this._specialMode !== null ? this._specialMode.handleShowBuyOfferMessage() : true;
    }
    getPuzzleSolvedMessage(defaultMessage: string, emailCaptured: boolean, puzzleFinished: boolean): string {
        return this._specialMode !== null ? this._specialMode.getPuzzleSolvedMessage(defaultMessage, emailCaptured, puzzleFinished) : defaultMessage;
    }
}

const specialModeManager = new SpecialModeManager();
export default specialModeManager;