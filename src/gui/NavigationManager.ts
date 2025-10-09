import { Control } from "@babylonjs/gui";
import { FormRowModel } from "../model/FormRowModel";
import popupHint, { PopupMode } from "./popups/PopupHint";
import { ShaderMode } from "./ScreenShader";
import backToInitialAnimation from "../core3d/animations/BackToInitialAnimation";
import ctx from "../core3d/common/SceneContext";
import gameModeManager from "../core3d/behaviors/GameModeManager";
import timerDisplay from "../core3d/misc/TimerDisplay";
import openCoverAnimation from "../core3d/animations/OpenCoverAnimation";
import puzzleCircleBuilder from "../core3d/builders/PuzzleCircleBuilder";
import { Mesh } from "@babylonjs/core";
import guiManager from "./GuiManager";
import mlPopupHandler from "../common/MLPopupHandler";
import specialModeManager from "../common/special-mode/SpecialModeManager";
import { i18nManager, TranslationKeys } from "../common/i18n";

declare var ml: any;

class NavigationManager {
    private static readonly EMAIL_FLAG_KEY = "emailCaptured";

    private getEmailCaptured(): boolean {
        return localStorage.getItem(NavigationManager.EMAIL_FLAG_KEY) === "true";
    }

    public setEmailCaptured(value: boolean): void {
        localStorage.setItem(NavigationManager.EMAIL_FLAG_KEY, value ? "true" : "false");
    }

    public handleXAction() {
        timerDisplay.pause();
        this.enterGamePaused(gameModeManager.celebrationMode);
    }

    private enterGamePaused(puzzleFinished: boolean) {
        const formModel: FormRowModel[] = [];
        const alreadyCaptured = this.getEmailCaptured();

        let message: string;

        if (puzzleFinished) {
            formModel.push({
                id: "email",
                type: "emailCapture",
                label: alreadyCaptured
                  ? i18nManager.translate(TranslationKeys.NAVIGATION.EMAIL_UPDATE_QUESTION)
                  : i18nManager.translate(TranslationKeys.NAVIGATION.EMAIL_INSERT_QUESTION),
                isUpdate: alreadyCaptured,
                buttonTextSubscribe: i18nManager.translate(TranslationKeys.NAVIGATION.BUTTON_ADD_EMAIL),
                buttonTextUpdate: i18nManager.translate(TranslationKeys.NAVIGATION.BUTTON_ADD_ANOTHER),
                action: () => {
                    mlPopupHandler.open();
                }
            });
        
            message = alreadyCaptured
              ? TranslationKeys.NAVIGATION.CONGRATS_MESSAGE_COMPLETED
              : TranslationKeys.NAVIGATION.CONGRATS_MESSAGE_FIRST_TIME;
        
            // use `message` in popupHint.show later
        } else {
            formModel.push({
                id: "continue",
                label: i18nManager.translate(TranslationKeys.NAVIGATION.RESUME_SOLVING_LABEL),
                type: "button",
                buttonText: i18nManager.translate(TranslationKeys.NAVIGATION.BUTTON_CONTINUE),
                background: "#27ae60",    // green
                color: "#ffffff",     // white text for contrast
                action: () => {
                    this.continue(puzzleFinished);
                }
            });

            message = TranslationKeys.NAVIGATION.PUZZLE_PAUSED_MESSAGE;
        }

        formModel.push(
            {
                id: "restart",
                label: puzzleFinished
                    ? i18nManager.translate(TranslationKeys.NAVIGATION.PLAY_AGAIN_QUESTION)
                    : i18nManager.translate(TranslationKeys.NAVIGATION.SHUFFLE_RESTART_LABEL),
                type: "button",
                buttonText: i18nManager.translate(TranslationKeys.NAVIGATION.BUTTON_RESTART),
                background: "#d35400",   // orange
                color: "#ffffff",    // white text
                action: () => {
                    this.restartPuzzle();
                }
            },
            {
                id: "mainMenu",
                label: i18nManager.translate(TranslationKeys.NAVIGATION.RETURN_TO_GALLERY_LABEL),
                type: "button",
                buttonText: specialModeManager.mainMenuButtonText(i18nManager.translate(TranslationKeys.NAVIGATION.BUTTON_MAIN_MENU)),
                background: "#bdc3c7",   // light gray
                color: "#2c3e50",    // dark navy text
                action: () => {
                    this.goBack();
                }
            }
        );

        const titleKey = puzzleFinished ? TranslationKeys.NAVIGATION.TITLE_PUZZLE_SOLVED : TranslationKeys.NAVIGATION.TITLE_GAME_PAUSED;

        popupHint.show(
            message,
            titleKey,
            {},
            {},
            0.99,
            ShaderMode.SHADOW_FULL,
            Control.VERTICAL_ALIGNMENT_CENTER,
            () => { this.nextPuzzle(); }, // FOOTER: NEXT
            () => { this.continue(puzzleFinished); }, // X button → continue
            () => { this.prevPuzzle(); }, // FOOTER: PREV
            null,
            PopupMode.GamePaused,
            formModel
        );
    }

    private prevPuzzle() {
        guiManager.ensureNotGiftCategory();

        this.playPuzzle(puzzleCircleBuilder.getPrevCover(ctx.currentCover)!);
    }

    private nextPuzzle() {
        guiManager.ensureNotGiftCategory();

        this.playPuzzle(puzzleCircleBuilder.getNextCover(ctx.currentCover)!);
    }

    private continue(puzzleFinished: boolean) {
        popupHint.hide();

        if (!puzzleFinished) {
            timerDisplay.continue();
        }
    }

    private restartPuzzle() {
        this.playPuzzle(ctx.currentCover);
    }

    private playPuzzle(cover: Mesh) {
        backToInitialAnimation.animate(ctx.currentCover, () => {
            openCoverAnimation.animate(cover);
        });
    }

    private goBack() {
        if (specialModeManager.handleGoBackAction()) {
            guiManager.ensureNotGiftCategory();
            backToInitialAnimation.animate(ctx.currentCover);
        }
    }
}

const navigationManager = new NavigationManager();
export default navigationManager;