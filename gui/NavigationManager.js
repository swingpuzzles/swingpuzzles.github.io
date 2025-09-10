import { Control } from "@babylonjs/gui";
import popupHint, { PopupMode } from "./PopupHint";
import { ShaderMode } from "./ScreenShader";
import backToInitialAnimation from "../core3d/animations/BackToInitialAnimation";
import ctx from "../core3d/common/SceneContext";
import gameModeManager from "../core3d/behaviors/GameModeManager";
import timerDisplay from "../core3d/misc/TimerDisplay";
import openCoverAnimation from "../core3d/animations/OpenCoverAnimation";
import puzzleCircleBuilder from "../core3d/builders/PuzzleCircleBuilder";
import guiManager from "./GuiManager";
import mlPopupHandler from "../common/MLPopupHandler";
class NavigationManager {
    getEmailCaptured() {
        return localStorage.getItem(NavigationManager.EMAIL_FLAG_KEY) === "true";
    }
    setEmailCaptured(value) {
        localStorage.setItem(NavigationManager.EMAIL_FLAG_KEY, value ? "true" : "false");
    }
    handleXAction() {
        timerDisplay.pause();
        this.enterGamePaused(gameModeManager.celebrationMode);
    }
    enterGamePaused(puzzleFinished) {
        const formModel = [];
        let message;
        if (puzzleFinished) {
            const alreadyCaptured = this.getEmailCaptured();
            formModel.push({
                id: "email",
                type: "emailCapture",
                label: alreadyCaptured
                    ? "Want to add another email for updates?"
                    : "Want new puzzles & updates? Add your email:",
                isUpdate: alreadyCaptured,
                buttonTextSubscribe: "📧 Add email",
                buttonTextUpdate: "✏️ Add another",
                action: () => {
                    mlPopupHandler.open();
                    //ml('show', '1RSel7', true);
                    /*const r = await fetch("/api/subscribe", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ email })
                    });
                    if (!r.ok) {
                      const err = await r.json().catch(() => ({}));
                      throw new Error(err?.detail || "Subscribe failed");
                    }
                    this.setEmailCaptured(true); // your boolean flag
                    alert(mode === "subscribe" ? "Thanks! Check your inbox to confirm." : "Another email added. You’re all set!");*/
                }
            });
            message = alreadyCaptured
                ? `🎉 Congratulations!
        
        You’ve completed this puzzle.
        
        You can restart it, return to the gallery, or add another email below to get updates.`
                : `🎉 Congratulations!
        
        You’ve completed this puzzle.
        
        You can restart it, return to the gallery, or add your email below to get updates when new puzzles arrive.`;
            // use `message` in popupHint.show later
        }
        else {
            formModel.push({
                id: "continue",
                label: "Resume solving from this exact spot:",
                type: "button",
                buttonText: "▶️ Continue",
                background: "#27ae60", // green
                color: "#ffffff", // white text for contrast
                action: () => {
                    this.continue(puzzleFinished);
                }
            });
            message = `Your puzzle is on hold.
            
            What’s next?
            
            You can continue right where you left off, restart from the beginning, return to the main menu, or use the PREV and NEXT buttons below to switch puzzles.`;
        }
        formModel.push({
            id: "restart",
            label: puzzleFinished
                ? "Relive the fun — restart this puzzle from the beginning:"
                : "Shuffle the pieces and start over:",
            type: "button",
            buttonText: "🔄 Restart",
            background: "#d35400", // orange
            color: "#ffffff", // white text
            action: () => {
                this.restartPuzzle();
            }
        }, {
            id: "mainMenu",
            label: "Return to the puzzle gallery:",
            type: "button",
            buttonText: "🏠 Main menu",
            background: "#bdc3c7", // light gray
            color: "#2c3e50", // dark navy text
            action: () => {
                this.goBack();
            }
        });
        const title = puzzleFinished ? "PUZZLE SOLVED!" : "GAME PAUSED";
        popupHint.show(message, title, 0.95, ShaderMode.SHADOW_FULL, Control.VERTICAL_ALIGNMENT_CENTER, () => { this.nextPuzzle(); }, // FOOTER: NEXT
        () => { this.continue(puzzleFinished); }, // X button → continue
        () => { this.prevPuzzle(); }, // FOOTER: PREV
        null, PopupMode.GamePaused, formModel);
    }
    prevPuzzle() {
        guiManager.ensureNotGiftCategory();
        this.playPuzzle(puzzleCircleBuilder.getPrevCover(ctx.currentCover));
    }
    nextPuzzle() {
        guiManager.ensureNotGiftCategory();
        this.playPuzzle(puzzleCircleBuilder.getNextCover(ctx.currentCover));
    }
    continue(puzzleFinished) {
        popupHint.hide();
        if (!puzzleFinished) {
            timerDisplay.continue();
        }
    }
    restartPuzzle() {
        this.playPuzzle(ctx.currentCover);
    }
    playPuzzle(cover) {
        backToInitialAnimation.animate(ctx.currentCover, () => {
            openCoverAnimation.animate(cover);
        });
    }
    goBack() {
        guiManager.ensureNotGiftCategory();
        backToInitialAnimation.animate(ctx.currentCover);
    }
}
NavigationManager.EMAIL_FLAG_KEY = "emailCaptured";
const navigationManager = new NavigationManager();
export default navigationManager;
