import { Control } from "@babylonjs/gui";
import gameModeManager, { MainMode } from "../core3d/behaviors/GameModeManager";
import popupHint, { overPopup } from "./popups/PopupHint";
import { PopupMode } from "./popups/modes/PopupMode";
import { ShaderMode } from "./ScreenShader";
import handImagePool from "./HandImagePool";
import timerDisplay from "../core3d/misc/TimerDisplay";
import localStorageManager, { CommonStorageKeys } from "../common/LocalStorageManager";
import giftMaker from "./GiftMaker";
import openCoverAnimation from "../core3d/animations/OpenCoverAnimation";
import specialModeManager from "../common/special-mode/SpecialModeManager";
import { i18nManager, TranslationKeys } from "../common/i18n";

class TutorialManager {
    private _puzzleChooserHintShown: boolean = false;

    init() {
        const hasSeenWelcome = specialModeManager.welcomeSeen(localStorageManager.getBoolean(CommonStorageKeys.WelcomeSeen));

        let popup = popupHint;
        let nextAction = () => {
            if (specialModeManager.handleWelcomeAction(true)) {
                localStorageManager.set(CommonStorageKeys.WelcomeSeen, true);
                this.showSizeChooserHint();
            }
        };

        if (gameModeManager.giftReceived) {
            let gifteeName = giftMaker.friendsName;

            if (gifteeName) {
                gifteeName = gifteeName.trim();
                gifteeName = ' ' + gifteeName;
            }

            nextAction = () => {
                localStorageManager.set(CommonStorageKeys.WelcomeSeen, true);
                popup.hide(() => {
                    handImagePool.acquire(Control.HORIZONTAL_ALIGNMENT_CENTER, Control.VERTICAL_ALIGNMENT_TOP, 0, 0.15, 180, false, 0.06);
                });
            };
        } else if (!gameModeManager.initialMode) {  // for gift mode at start
            popup = overPopup;
            nextAction = () => { popup.hide(); };
        }
        
        if (hasSeenWelcome && !gameModeManager.giftReceived) {
            nextAction();
        } else {
            if (gameModeManager.giftReceived) {
                let gifteeName = giftMaker.friendsName;
                if (gifteeName) {
                    gifteeName = gifteeName.trim();
                    gifteeName = ' ' + gifteeName;
                }
                popup.show(TranslationKeys.TUTORIAL.WELCOME.GIFT_MESSAGE, TranslationKeys.TUTORIAL.WELCOME.GIFT_TITLE, { name: gifteeName }, {}, 0.7, ShaderMode.SHADOW_FULL, Control.VERTICAL_ALIGNMENT_CENTER,
                    () => { nextAction(); });
            } else {
                popup.show(TranslationKeys.TUTORIAL.WELCOME.MESSAGE, TranslationKeys.TUTORIAL.WELCOME.TITLE, {}, {}, 0.7, ShaderMode.SHADOW_FULL, Control.VERTICAL_ALIGNMENT_CENTER,
                    () => { nextAction(); });
            }
        }

        gameModeManager.addGameModeChangedObserver((prevMode) => {
            if (gameModeManager.currentMode === MainMode.Solve && !openCoverAnimation.giftCover) {
                this.finishTutorial();
            }
        });
    }

    private showSizeChooserHint() {
        if (localStorageManager.getBoolean(CommonStorageKeys.TutorialDone)) {
            popupHint.hide();
            return;
        }

        popupHint.show(TranslationKeys.TUTORIAL.HINTS.SIZE_MESSAGE, TranslationKeys.TUTORIAL.HINTS.SIZE_TITLE, {}, {}, 0.63, ShaderMode.SHADOW_WINDOW, Control.VERTICAL_ALIGNMENT_BOTTOM,
                () => { this.showPuzzleChooserHint(); }, () => { this.showPuzzleChooserHint(); },
                null,
                () => {
                    handImagePool.acquire(Control.HORIZONTAL_ALIGNMENT_CENTER, Control.VERTICAL_ALIGNMENT_TOP, 0, 0.1, 0, false); });
    }

    public showPuzzleChooserHint() {
        if (localStorageManager.getBoolean(CommonStorageKeys.TutorialDone) || this._puzzleChooserHintShown) {
            return;
        }

        this._puzzleChooserHintShown = true;

        popupHint.show(TranslationKeys.TUTORIAL.HINTS.CHOICE_MESSAGE, TranslationKeys.TUTORIAL.HINTS.CHOICE_TITLE, {}, {}, 0.67, ShaderMode.NONE, Control.VERTICAL_ALIGNMENT_TOP,
                () => { popupHint.hide(); },
                () => { popupHint.hide(); },
                null, 
                () => { 
            handImagePool.acquire(Control.HORIZONTAL_ALIGNMENT_CENTER, Control.VERTICAL_ALIGNMENT_BOTTOM, 0, 0.21, 30, true, 0.2, 0.01);
            handImagePool.acquire(Control.HORIZONTAL_ALIGNMENT_CENTER, Control.VERTICAL_ALIGNMENT_BOTTOM, 0, 0.15, 150, false);
        });
    }

    public showShakeHint() {
        if (localStorageManager.getBoolean(CommonStorageKeys.TutorialDone)) {
            return;
        }
        
        popupHint.show(TranslationKeys.TUTORIAL.HINTS.SHAKE_MESSAGE, TranslationKeys.TUTORIAL.HINTS.SHAKE_TITLE, {}, {}, 0.51, ShaderMode.NONE, Control.VERTICAL_ALIGNMENT_TOP,
                () => { this.finishTutorial(); },
                () => { this.finishTutorial(); },
                null, 
                () => { 
                    handImagePool.acquire(Control.HORIZONTAL_ALIGNMENT_CENTER, Control.VERTICAL_ALIGNMENT_BOTTOM, 0, 0.1, 30, true, 0.02, 0.1); });
    }

    public showCongratsMessage() {
        if (specialModeManager.handleShowBuyOfferMessage()) {
            this.showCongratsMessageImpl();
        }
    }
    
    public showCongratsMessageImpl() {
        const solvedTime = timerDisplay.getElapsedTime();

        let seconds = 5;
        const countdownLabel = () => `${i18nManager.translate(TranslationKeys.UI.BUTTONS.CONTINUE)} (${seconds}s)`;

        // Show initial popup
        popupHint.show(TranslationKeys.TUTORIAL.CONGRATS.MESSAGE, TranslationKeys.TUTORIAL.CONGRATS.TITLE, { time: solvedTime }, {}, 0.57, ShaderMode.NONE, Control.VERTICAL_ALIGNMENT_CENTER,
            () => {
                clearInterval(timerId);
                this.showBuyOfferMessage();
            },
            () => {
                clearInterval(timerId);
                this.showBuyOfferMessage();
            },
            null,
            null,
            PopupMode.PreSell
        );

        // Update the button label manually
        popupHint.updateConfirmButtonText(countdownLabel());

        const timerId = window.setInterval(() => {
            seconds--;
            popupHint.updateConfirmButtonText(countdownLabel());

            if (seconds <= 0) {
                clearInterval(timerId);
                if (gameModeManager.celebrationMode) {
                    this.showBuyOfferMessage();
                }
            }
        }, 1000);
    }

    public showBuyOfferMessage() {
        popupHint.show(TranslationKeys.TUTORIAL.CONGRATS.BUY_MESSAGE, TranslationKeys.TUTORIAL.CONGRATS.BUY_TITLE, {}, {}, 0.8, ShaderMode.SHADOW_FULL, Control.VERTICAL_ALIGNMENT_CENTER,
            () => {
                gameModeManager.handleGetItOnAmazonAction();
                popupHint.hide();
            },
            () => {
                popupHint.hide();
            },
            null,
            null,
            PopupMode.Sell);
    }

    public showGiftMakingHint() {
        if (localStorageManager.getBoolean(CommonStorageKeys.GiftTutorialDone)) {
            return;
        }

        popupHint.toBack();

        overPopup.show(TranslationKeys.TUTORIAL.HINTS.STYLE_MESSAGE, TranslationKeys.TUTORIAL.HINTS.STYLE_TITLE, {}, {}, 0.87, ShaderMode.SHADOW_WINDOW_WIDE, Control.VERTICAL_ALIGNMENT_BOTTOM,
                () => { this.finishGiftTutorial(); },
                () => { this.finishGiftTutorial(); },
                null, 
                () => { 
                    handImagePool.acquire(Control.HORIZONTAL_ALIGNMENT_CENTER, Control.VERTICAL_ALIGNMENT_BOTTOM, 0, 0.1, 30, true, 0.02, 0.1); });
    }

    public showBadWordHint() {
        popupHint.toBack();

        overPopup.show(
            TranslationKeys.TUTORIAL.BAD_WORD.MESSAGE,
            TranslationKeys.TUTORIAL.BAD_WORD.TITLE,
            {},
            {},
            0.5,
            ShaderMode.SHADOW_FULL,
            Control.VERTICAL_ALIGNMENT_CENTER,
            () => { this.leaveOverPopup(); },
            () => { this.leaveOverPopup(); }
        );
    }

    public leaveOverPopup() {
        overPopup.hide();
        popupHint.toFront();
    }

    public finishGiftTutorial() {
        localStorageManager.set(CommonStorageKeys.GiftTutorialDone, true);

        this.leaveOverPopup();
    }

    private finishTutorial() {
        localStorageManager.set(CommonStorageKeys.TutorialDone, true);
        popupHint.hide();
    }
}

const tutorialManager = new TutorialManager();
export default tutorialManager;