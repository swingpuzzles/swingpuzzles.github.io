import { Control } from "@babylonjs/gui";
import gameModeManager, { GameMode } from "../components/behaviors/GameModeManager";
import popupHint, { PopupMode } from "./PopupHint";
import { ShaderMode } from "./ScreenShader";
import handImagePool from "./HandImagePool";
import timerDisplay from "../components/misc/TimerDisplay";
import puzzleCircleBuilder from "../components/builders/PuzzleCircleBuilder";

class TutorialManager {
    init() {
        let message = `Welcome to PuzzleVerse 3D! 🧩

Get ready to explore, solve, and enjoy amazing 3D jigsaw puzzles right inside your browser. Every piece fits into a world of adventure!
    
By continuing, you agree to our use of cookies to ensure the best experience.
    
Let's start building!`;
        
        const hasAcceptedCookies = localStorage.getItem("cookiesAccepted") === "true";

        if (hasAcceptedCookies) {
            this.showSizeChooserHint();
        } else {
            popupHint.show(message, "WELCOME!", 0.7, ShaderMode.SHADOW_FULL, Control.VERTICAL_ALIGNMENT_CENTER,
                () => { this.showSizeChooserHint(); });
        }

        gameModeManager.addGameModeChangedObserver((prevMode) => {
            if (gameModeManager.currentMode === GameMode.Solve) {
                this.finishTutorial();
            }
        });
    }

    private showSizeChooserHint() {
        localStorage.setItem("cookiesAccepted", "true");

        let dimensionHint = `🧩 Choose Your Challenge!

Use the highlighted dropdown at the top center to pick your desired puzzle dimensions. 

More pieces, more fun – or keep it simple and relaxing. The choice is yours!`;

        popupHint.show(dimensionHint, "HINT: SIZE", 0.6, ShaderMode.SHADOW_WINDOW, Control.VERTICAL_ALIGNMENT_BOTTOM,
                () => { this.showPuzzleChooserHint(); }, () => { this.showPuzzleChooserHint(); },
                () => {
                    handImagePool.acquire(Control.HORIZONTAL_ALIGNMENT_CENTER, Control.VERTICAL_ALIGNMENT_TOP, 0, 0.1, 0, false); });
    }

    public showPuzzleChooserHint() {
        let browseHint = `📚 Browse and Play!

Swipe left or right to explore different puzzles.

Each puzzle is shown as a cover box — click or tap on one to select it, or just hit the ▶️ Play button to dive right in!`;

        popupHint.show(browseHint, "HINT: CHOICE", 0.6, ShaderMode.NONE, Control.VERTICAL_ALIGNMENT_TOP,
                () => { popupHint.hide(); }, () => { popupHint.hide(); },
                () => { 
            handImagePool.acquire(Control.HORIZONTAL_ALIGNMENT_CENTER, Control.VERTICAL_ALIGNMENT_BOTTOM, 0, 0.28, 30, true, 0.2, 0.01);
            handImagePool.acquire(Control.HORIZONTAL_ALIGNMENT_CENTER, Control.VERTICAL_ALIGNMENT_BOTTOM, 0, 0.15, 150, false);
        });
    }

    public showShakeHint() {
        let shakeHint = `🧩 Give it a good shake!
    
Drag the puzzle box around to shake it — this will mix up the pieces so you can start solving!`;
    
        popupHint.show(shakeHint, "SHAKE IT!", 0.5, ShaderMode.NONE, Control.VERTICAL_ALIGNMENT_TOP,
                () => { this.finishTutorial(); }, () => { this.finishTutorial(); },
                () => { 
                    handImagePool.acquire(Control.HORIZONTAL_ALIGNMENT_CENTER, Control.VERTICAL_ALIGNMENT_BOTTOM, 0, 0.1, 30, true, 0.02, 0.1); });
    }

    public showCongratsMessage() {
        const solvedTime = timerDisplay.getElapsedTime();

        const message = `🎉 Congratulations!

You’ve completed the puzzle in ${solvedTime}.
Great job putting all the pieces together!`;

        let seconds = 5;
        const countdownLabel = () => `Continue (${seconds}s)`;

        // Show initial popup
        popupHint.show(message, "PUZZLE SOLVED!", 0.57, ShaderMode.NONE, Control.VERTICAL_ALIGNMENT_CENTER,
            () => {
                clearInterval(timerId);
                this.showBuyOfferMessage();
            },
            () => {
                clearInterval(timerId);
                this.showBuyOfferMessage();
            },
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
                this.showBuyOfferMessage();
            }
        }, 1000);
    }

    public showBuyOfferMessage() {
        const message = `🧩 Love that puzzle?
    
If you'd like to own it in real life, you can order a high-quality physical version — perfect for your coffee table or as a gift.

Available now on Amazon!`;
    
        popupHint.show(message, "TAKE IT HOME?", 0.8, ShaderMode.NONE, Control.VERTICAL_ALIGNMENT_CENTER,
            () => {
                window.open(puzzleCircleBuilder.selectedLink, "_blank");
                popupHint.hide();
            },
            () => {
                popupHint.hide();
            },
            null,
            PopupMode.Sell);
    }

    private finishTutorial() {
        localStorage.setItem("tutorialDone", "true");
        popupHint.hide();
    }
}

const tutorialManager = new TutorialManager();
export default tutorialManager;