import { Control } from "@babylonjs/gui";
import { FormRowModel } from "../model/FormRowModel";
import popupHint, { PopupMode } from "./PopupHint";
import { ShaderMode } from "./ScreenShader";
import backToInitialAnimation from "../core3d/animations/BackToInitialAnimation";
import ctx from "../core3d/common/SceneContext";
import gameModeManager from "../core3d/behaviors/GameModeManager";

class NavigationManager {
    public handleXAction() {
        this.enterGamePaused(false);
    }

    private enterGamePaused(puzzleFinished: boolean) {
        const formModel: FormRowModel[] = [];

        if (!puzzleFinished) {
            formModel.push({
                id: "continue",
                label: "Resume solving from this exact spot:",
                type: "button",
                buttonText: "▶️ Continue",
                background: "#27ae60",    // green
                color: "#ffffff",     // white text for contrast
                action: () => {
                    this.continue();
                }
            });
        }

        formModel.push(
            {
                id: "restart",
                label: puzzleFinished
                    ? "Relive the fun — restart this puzzle from the beginning:"
                    : "Shuffle the pieces and start over:",
                type: "button",
                buttonText: "🔄 Restart",
                background: "#d35400",   // orange
                color: "#ffffff",    // white text
                action: () => {
                    this.restartPuzzle();
                }
            },
            {
                id: "mainMenu",
                label: "Return to the puzzle gallery:",
                type: "button",
                buttonText: "🏠 Main menu",
                background: "#bdc3c7",   // light gray
                color: "#2c3e50",    // dark navy text
                action: () => {
                    this.goBack();
                }
            }
        );

        const title = puzzleFinished ? "PUZZLE SOLVED!" : "GAME PAUSED";

        const message = puzzleFinished
            ? `Congratulations!
            
You’ve completed this puzzle.

What’s next?

You can restart it for fun, return to the main menu, or use the PREV and NEXT buttons below to switch puzzles.`
            : `Your puzzle is on hold.
            
What’s next?

You can continue right where you left off, restart from the beginning, return to the main menu, or use the PREV and NEXT buttons below to switch puzzles.`;

        popupHint.show(
            message,
            title,
            0.9,
            ShaderMode.SHADOW_FULL,
            Control.VERTICAL_ALIGNMENT_CENTER,
            () => { this.nextPuzzle(); }, // FOOTER: NEXT
            () => { this.continue(); }, // X button → continue
            () => { this.prevPuzzle(); }, // FOOTER: PREV
            null,
            PopupMode.GamePaused,
            formModel
        );
    }

    private prevPuzzle() {
        // TODO
    }

    private nextPuzzle() {
        // TODO
    }

    private continue() {
        popupHint.hide();
    }

    private restartPuzzle() {
        // TODO
    }

    private goBack() {
        backToInitialAnimation.animate(ctx.currentCover);
    }
}

const navigationManager = new NavigationManager();
export default navigationManager;