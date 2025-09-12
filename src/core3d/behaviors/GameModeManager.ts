import localStorageManager, { CommonStorageKeys } from "../../common/LocalStorageManager";
import puzzleUrlHelper from "../../common/PuzzleUrlHelper";
import giftMaker from "../../gui/GiftMaker";
import popupHint, { overPopup } from "../../gui/PopupHint";
import tutorialManager from "../../gui/TutorialManager";
import backToInitialAnimation from "../animations/BackToInitialAnimation";
import openCoverAnimation from "../animations/OpenCoverAnimation";
import puzzleCircleBuilder from "../builders/PuzzleCircleBuilder";
import ctx, { Categories, Category } from "../common/SceneContext";
import timerManager from "../misc/TimerManager";
import piecePositioningManager from "./PiecePositioningManager";
import analyticsManager from "../../common/AnalyticsManager";

export enum GameMode {
    Initial,
    OpenCover,
    Shake,
    Solve,
    Celebration,
    GiftInitial,
    GiftAdjustment,
    GiftOverview,
    GiftPhysicalOrientation,
    GiftPhysicalFinal,
    GiftTry,
    GiftReceived,
}

class GameModeManager {
    private _currentMode: GameMode = GameMode.Initial;
    private _observers: ((prevMode: GameMode) => void)[] = [];

    get initialMode() {
        return this._currentMode === GameMode.Initial;
    }
    get openCoverMode() {
        return this._currentMode === GameMode.OpenCover;
    }
    get shakeMode() {
        return this._currentMode === GameMode.Shake;
    }
    get solveMode() {
        return this._currentMode === GameMode.Solve;
    }
    get celebrationMode() {
        return this._currentMode === GameMode.Celebration;
    }
    get giftTryMode() {
        return this._currentMode === GameMode.GiftTry;
    }
    get giftReceived() {
        return this._currentMode === GameMode.GiftReceived;
    }
    get currentMode() {
        return this._currentMode;
    }
    get canOpenCover() {
        return this.initialMode || this.giftTryMode || this.giftReceived;
    }

    private resetAll(currentMode: GameMode, hidePopups: boolean = true) {
        let prevMode = this._currentMode;
        this._currentMode = currentMode;

        // Track game mode change
        if (prevMode !== currentMode) {
            analyticsManager.trackGameModeChange(prevMode, currentMode);
        }

        if (hidePopups) {
            popupHint.hide();
            overPopup.hide();
        }

        timerManager.clearAll();

        ctx.cameraUpperAlphaLimit = null;
        ctx.cameraLowerAlphaLimit = null;
        ctx.cameraUpperBetaLimit = null;
        ctx.cameraLowerBetaLimit = null;

        for (let observer of this._observers) {
            observer(prevMode);
        }
    }

    public addGameModeChangedObserver(observer: (prevMode: GameMode) => void) {
        this._observers.push(observer);
    }

    enterInitialMode() {
        this.resetAll(GameMode.Initial);

        ctx.cameraUpperBetaLimit = 14 * Math.PI / 32;
        ctx.cameraLowerBetaLimit = 9 * Math.PI / 32;
            
        ctx.cameraAttachControl(true);

        puzzleUrlHelper.clearPuzzleId();
        
        // Track game session start
        analyticsManager.startGameSession(GameMode.Initial, ctx.category?.key);
    }

    enterOpenCoverMode(showShakeIt: boolean = true) {
        this.resetAll(GameMode.OpenCover);

        ctx.cameraDetachControl();

        if (showShakeIt) {
            tutorialManager.showShakeHint();
        }
    }

    enterShakeMode() {
        this.resetAll(GameMode.Shake);
        
        piecePositioningManager.init();
    }

    enterSolveMode() {
        this.resetAll(GameMode.Solve);
        
        piecePositioningManager.init();
        
        // Track puzzle solving start
        analyticsManager.startGameSession(GameMode.Solve, ctx.category?.key);
    }

    enterCelebrationMode() {
        this.resetAll(GameMode.Celebration);
        
        piecePositioningManager.init();
        
        // Track puzzle completion
        const currentSession = analyticsManager.getCurrentSession();
        if (currentSession) {
            const solveTime = Date.now() - currentSession.startTime;
            analyticsManager.trackPuzzleCompletion(solveTime, currentSession.piecesCount || 0);
        }
    }

    enterGiftInitialMode() {
        this.resetAll(GameMode.GiftInitial);

        ctx.cameraDetachControl();

        giftMaker.start();
        
        // Track gift creation start
        analyticsManager.startGameSession(GameMode.GiftInitial, 'gift');
    }

    async enterGiftAdjustmentMode() {
        let prevMode = this._currentMode;

        if (await giftMaker.enterAdjustments(prevMode === GameMode.GiftInitial)) {
            this.resetAll(GameMode.GiftAdjustment, false);

            tutorialManager.showGiftMakingHint();
        } else {
            tutorialManager.showBadWordHint();
        }
    }

    enterGiftOverviewMode() {
        this.resetAll(GameMode.GiftOverview);

        giftMaker.enterOverview();
    }

    enterGiftPhysicalOrientationMode() {
        this.resetAll(GameMode.GiftPhysicalOrientation);

        giftMaker.enterGiftPhysicalOrientation();
    }

    enterGiftPhysicalFinalMode() {
        this.resetAll(GameMode.GiftPhysicalFinal);

        giftMaker.enterGiftPhysicalFinal();
    }

    enterGiftTryMode() {
        this.resetAll(GameMode.GiftTry);

        ctx.cameraUpperBetaLimit = 14 * Math.PI / 32;
        ctx.cameraLowerBetaLimit = 9 * Math.PI / 32;
        ctx.cameraUpperAlphaLimit = 1.5 * Math.PI / 32;
        ctx.cameraLowerAlphaLimit = -1.5 * Math.PI / 32;
            
        ctx.cameraAttachControl(true);

        ctx.cameraAlpha = 0;
        //ctx.camera.beta = 12.5 * Math.PI / 32;  

        giftMaker.tryGift();
    }

    enterGiftReceivedMode() {
        this.resetAll(GameMode.GiftReceived);

        ctx.cameraUpperBetaLimit = 14 * Math.PI / 32;
        ctx.cameraLowerBetaLimit = 9 * Math.PI / 32;
        ctx.cameraUpperAlphaLimit = 1.5 * Math.PI / 32;
        ctx.cameraLowerAlphaLimit = -1.5 * Math.PI / 32;
            
        ctx.cameraAttachControl(true);

        ctx.cameraAlpha = 0;
        //ctx.camera.beta = 12.5 * Math.PI / 32;

        localStorageManager.set(CommonStorageKeys.Category, Categories.Gift.key);
        ctx.category = Categories.Gift;

        giftMaker.tryGift();
    }

    handleGetItOnAmazonAction() {
        if (openCoverAnimation.giftCover) {
            backToInitialAnimation.animate(ctx.currentCover, () => { this.enterGiftPhysicalOrientationMode(); });
            puzzleUrlHelper.setCategory(Categories.Gift.key);
        } else {
            window.open(puzzleCircleBuilder.selectedLink, "_blank");
        }
    }

    handleCategoryChange(category: Category, userAction: boolean) {
        if (ctx.category !== category) {
            const fromCategory = ctx.category?.key || 'unknown';
            const toCategory = category.key;
            
            ctx.category = category;

            puzzleUrlHelper.setCategory(category.key/*, userAction*/);

            // Track category change
            analyticsManager.trackCategoryChange(fromCategory, toCategory);

            if (category === Categories.Gift) {
                if (!this.giftReceived) {
                    this.enterGiftInitialMode();
                }
            } else {
                if (!userAction) {
                    this.enterInitialMode();
                }

                puzzleCircleBuilder.build();
            }
        }
    }

    enterWaiting() {
        const overlay = document.getElementById("loadingOverlay");
        overlay!.style.display = "flex";
    }

    leaveWaiting() {
        const overlay = document.getElementById("loadingOverlay");
        overlay!.style.display = "none";
    }
}

const gameModeManager = new GameModeManager();
export default gameModeManager;