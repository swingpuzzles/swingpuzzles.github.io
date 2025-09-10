import { Control } from "@babylonjs/gui";
import gameModeManager, { GameMode } from "../core3d/behaviors/GameModeManager";
import popupHint, { overPopup, PopupMode } from "./PopupHint";
import { ShaderMode } from "./ScreenShader";
import handImagePool from "./HandImagePool";
import timerDisplay from "../core3d/misc/TimerDisplay";
import localStorageManager, { CommonStorageKeys } from "../common/LocalStorageManager";
import giftMaker from "./GiftMaker";
import openCoverAnimation from "../core3d/animations/OpenCoverAnimation";
class TutorialManager {
    init() {
        const hasSeenWelcome = localStorageManager.getBoolean(CommonStorageKeys.WelcomeSeen);
        let popup = popupHint;
        let nextAction = () => {
            localStorageManager.set(CommonStorageKeys.WelcomeSeen, true);
            this.showSizeChooserHint();
        };
        let title = "WELCOME!";
        let message = `Welcome to SwingPuzzles.com! 🧩

Get ready to explore, solve, and enjoy amazing 3D jigsaw puzzles right inside your browser. Every piece fits into a world of adventure!
    
Let's start building!`;
        if (gameModeManager.giftReceived) {
            const gifteeName = giftMaker.friendsName;
            message = `🎁 Hey ${gifteeName}, you've received a puzzle gift!

Tap "Got it", click the present to open your puzzle box,  
and start solving immediately 🧩`;
            title = "YOU'VE GOT A GIFT!";
            nextAction = () => {
                localStorageManager.set(CommonStorageKeys.WelcomeSeen, true);
                popup.hide(() => {
                    handImagePool.acquire(Control.HORIZONTAL_ALIGNMENT_CENTER, Control.VERTICAL_ALIGNMENT_TOP, 0, 0.15, 180, false, 0.06);
                });
            };
        }
        else if (!gameModeManager.initialMode) { // for gift mode at start
            popup = overPopup;
            nextAction = () => { popup.hide(); };
        }
        if (hasSeenWelcome && !gameModeManager.giftReceived) {
            nextAction();
        }
        else {
            popup.show(message, title, 0.7, ShaderMode.SHADOW_FULL, Control.VERTICAL_ALIGNMENT_CENTER, () => { nextAction(); });
        }
        gameModeManager.addGameModeChangedObserver((prevMode) => {
            if (gameModeManager.currentMode === GameMode.Solve && !openCoverAnimation.giftCover) {
                this.finishTutorial();
            }
        });
    }
    showSizeChooserHint() {
        if (localStorageManager.getBoolean(CommonStorageKeys.TutorialDone)) {
            return;
        }
        let dimensionHint = `🧩 Choose Your Challenge!

Use the highlighted dropdown at the top center to pick your desired puzzle dimensions. 

More pieces, more fun – or keep it simple and relaxing. The choice is yours!`;
        popupHint.show(dimensionHint, "HINT: SIZE", 0.6, ShaderMode.SHADOW_WINDOW, Control.VERTICAL_ALIGNMENT_BOTTOM, () => { this.showPuzzleChooserHint(); }, () => { this.showPuzzleChooserHint(); }, null, () => {
            handImagePool.acquire(Control.HORIZONTAL_ALIGNMENT_CENTER, Control.VERTICAL_ALIGNMENT_TOP, 0, 0.1, 0, false);
        });
    }
    showPuzzleChooserHint() {
        if (localStorageManager.getBoolean(CommonStorageKeys.TutorialDone)) {
            return;
        }
        let browseHint = `📚 Browse and Play!

Swipe left or right to explore different puzzles.

Each puzzle is shown as a cover box — click or tap on one to select it, or just hit the ▶️ Play button to dive right in!`;
        popupHint.show(browseHint, "HINT: CHOICE", 0.6, ShaderMode.NONE, Control.VERTICAL_ALIGNMENT_TOP, () => { popupHint.hide(); }, () => { popupHint.hide(); }, null, () => {
            handImagePool.acquire(Control.HORIZONTAL_ALIGNMENT_CENTER, Control.VERTICAL_ALIGNMENT_BOTTOM, 0, 0.28, 30, true, 0.2, 0.01);
            handImagePool.acquire(Control.HORIZONTAL_ALIGNMENT_CENTER, Control.VERTICAL_ALIGNMENT_BOTTOM, 0, 0.15, 150, false);
        });
    }
    showShakeHint() {
        if (localStorageManager.getBoolean(CommonStorageKeys.TutorialDone)) {
            return;
        }
        let shakeHint = `🧩 Give it a good shake!
    
Drag the puzzle box around to shake it — this will mix up the pieces so you can start solving!`;
        popupHint.show(shakeHint, "SHAKE IT!", 0.5, ShaderMode.NONE, Control.VERTICAL_ALIGNMENT_TOP, () => { this.finishTutorial(); }, () => { this.finishTutorial(); }, null, () => {
            handImagePool.acquire(Control.HORIZONTAL_ALIGNMENT_CENTER, Control.VERTICAL_ALIGNMENT_BOTTOM, 0, 0.1, 30, true, 0.02, 0.1);
        });
    }
    showCongratsMessage() {
        const solvedTime = timerDisplay.getElapsedTime();
        const message = `🎉 Congratulations!

You’ve completed the puzzle in ${solvedTime}.
Great job putting all the pieces together!`;
        let seconds = 5;
        const countdownLabel = () => `Continue (${seconds}s)`;
        // Show initial popup
        popupHint.show(message, "PUZZLE SOLVED!", 0.57, ShaderMode.NONE, Control.VERTICAL_ALIGNMENT_CENTER, () => {
            clearInterval(timerId);
            this.showBuyOfferMessage();
        }, () => {
            clearInterval(timerId);
            this.showBuyOfferMessage();
        }, null, null, PopupMode.PreSell);
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
    showBuyOfferMessage() {
        const message = `🧩 Love that puzzle?
    
If you'd like to own it in real life, you can order a high-quality physical version — perfect for your coffee table or as a gift.

Available now on Amazon!`;
        popupHint.show(message, "TAKE IT HOME?", 0.8, ShaderMode.SHADOW_FULL, Control.VERTICAL_ALIGNMENT_CENTER, () => {
            gameModeManager.handleGetItOnAmazonAction();
            popupHint.hide();
        }, () => {
            popupHint.hide();
        }, null, null, PopupMode.Sell);
    }
    showGiftMakingHint() {
        if (localStorageManager.getBoolean(CommonStorageKeys.GiftTutorialDone)) {
            return;
        }
        popupHint.toBack();
        let makeGiftHint = `🧩 Style your gift!
        
Pick the text, font, colors, birthday cake, tablecloth, and background.

All these options are waiting for you in the dropdowns at the top of the screen.`;
        overPopup.show(makeGiftHint, "↑ STYLE IT! ↑", 0.87, ShaderMode.SHADOW_WINDOW_WIDE, Control.VERTICAL_ALIGNMENT_BOTTOM, () => { this.finishGiftTutorial(); }, () => { this.finishGiftTutorial(); }, null, () => {
            handImagePool.acquire(Control.HORIZONTAL_ALIGNMENT_CENTER, Control.VERTICAL_ALIGNMENT_BOTTOM, 0, 0.1, 30, true, 0.02, 0.1);
        });
    }
    showBadWordHint() {
        popupHint.toBack();
        const makeGiftHint = `Oops! Your gift text contains language that isn’t allowed.
    Please choose kinder words so your friend can enjoy the puzzle.`;
        overPopup.show(makeGiftHint, "BE NICE!", 0.5, ShaderMode.SHADOW_FULL, Control.VERTICAL_ALIGNMENT_CENTER, () => { this.leaveOverPopup(); }, () => { this.leaveOverPopup(); });
    }
    leaveOverPopup() {
        overPopup.hide();
        popupHint.toFront();
    }
    finishGiftTutorial() {
        localStorageManager.set(CommonStorageKeys.GiftTutorialDone, true);
        this.leaveOverPopup();
    }
    finishTutorial() {
        localStorageManager.set(CommonStorageKeys.TutorialDone, true);
        popupHint.hide();
    }
}
const tutorialManager = new TutorialManager();
export default tutorialManager;
