import localStorageManager, { CommonStorageKeys } from "../../common/LocalStorageManager";
import puzzleUrlHelper from "../../common/PuzzleUrlHelper";
import giftMaker from "../../gui/GiftMaker";
import popupHint, { overPopup } from "../../gui/popups/PopupHint";
import tutorialManager from "../../gui/TutorialManager";
import backToInitialAnimation from "../animations/BackToInitialAnimation";
import openCoverAnimation from "../animations/OpenCoverAnimation";
import puzzleCircleBuilder from "../builders/PuzzleCircleBuilder";
import ctx from "../common/SceneContext";
import Constants, { Categories, Category } from "../common/Constants";
import timerManager from "../misc/TimerManager";
import piecePositioningManager from "./PiecePositioningManager";
import analyticsManager from "../../common/AnalyticsManager";
import calendarManager from "../../gui/CalendarManager";
import PuzzleUrlHelper from "../../common/PuzzleUrlHelper";

export enum MainMode {
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

export enum SubMode {
    Normal,
    GiftMaking,
    GiftReceiving,
    Calendar,
}

class GameModeManager {
    private _currentMainMode: MainMode = MainMode.Initial;
    private _currentSubMode: SubMode = SubMode.Normal;
    private _observers: ((prevMode: MainMode) => void)[] = [];

    get initialMode() {
        return this._currentMainMode === MainMode.Initial;
    }
    get openCoverMode() {
        return this._currentMainMode === MainMode.OpenCover;
    }
    get shakeMode() {
        return this._currentMainMode === MainMode.Shake;
    }
    get solveMode() {
        return this._currentMainMode === MainMode.Solve;
    }
    get celebrationMode() {
        return this._currentMainMode === MainMode.Celebration;
    }
    get giftTryMode() {
        return this._currentMainMode === MainMode.GiftTry;
    }
    get giftReceived() {
        return this._currentMainMode === MainMode.GiftReceived;
    }
    get normalSubMode() {
        return this._currentSubMode === SubMode.Normal;
    }
    get calendarMode() {
        return this._currentSubMode === SubMode.Calendar;
    }
    get currentMode() {
        return this._currentMainMode;
    }
    get canOpenCover() {
        return this.initialMode || this.giftTryMode || this.giftReceived;
    }
    get anyGiftMode() {
        return this.giftTryMode || this.giftReceived;
    }

    private resetAll(currentMode: MainMode, hidePopups: boolean = true) {
        let prevMode = this._currentMainMode;
        this._currentMainMode = currentMode;

        console.log("resetAll", currentMode, this._currentSubMode);

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

    public addGameModeChangedObserver(observer: (prevMode: MainMode) => void) {
        this._observers.push(observer);
    }

    enterInitialMode(clearPuzzleId: boolean = true) {
        this.resetAll(MainMode.Initial);

        ctx.cameraUpperBetaLimit = 14 * Math.PI / 32;
        ctx.cameraLowerBetaLimit = 9 * Math.PI / 32;
            
        ctx.cameraAttachControl(true);

        if (clearPuzzleId) {
            puzzleUrlHelper.clearPuzzleId();
        }
        
        // Track game session start
        analyticsManager.startGameSession(MainMode.Initial, this._currentSubMode, ctx.category?.key);
    }

    enterNormalSubMode(): boolean {
        const changed = this._currentSubMode !== SubMode.Normal;

        this._currentSubMode = SubMode.Normal;

        return changed;
    }

    enterOpenCoverMode(showShakeIt: boolean = true) {
        this.resetAll(MainMode.OpenCover);

        ctx.cameraDetachControl();

        if (showShakeIt) {
            tutorialManager.showShakeHint();
        }
    }

    enterShakeMode() {
        this.resetAll(MainMode.Shake);
        
        piecePositioningManager.init();
    }

    enterSolveMode() {
        this.resetAll(MainMode.Solve);
        
        piecePositioningManager.init();
        
        // Track puzzle solving start
        analyticsManager.startGameSession(MainMode.Solve, this._currentSubMode, ctx.category?.key);
    }

    enterCelebrationMode() {
        this.resetAll(MainMode.Celebration);
        
        piecePositioningManager.init();
        
        // Track puzzle completion
        const currentSession = analyticsManager.getCurrentSession();
        if (currentSession) {
            const solveTime = Date.now() - currentSession.startTime;
            analyticsManager.trackPuzzleCompletion(solveTime, currentSession.piecesCount || 0);
        }
    }

    enterGiftInitialMode() {
        this.resetAll(MainMode.GiftInitial);

        this._currentSubMode = SubMode.GiftMaking;

        ctx.cameraDetachControl();

        giftMaker.start();
        
        // Track gift creation start
        analyticsManager.startGameSession(MainMode.GiftInitial, SubMode.GiftMaking);
    }

    async enterGiftAdjustmentMode() {
        let prevMode = this._currentMainMode;

        if (await giftMaker.enterAdjustments(prevMode === MainMode.GiftInitial)) {
            this.resetAll(MainMode.GiftAdjustment, false);

            tutorialManager.showGiftMakingHint();
        } else {
            tutorialManager.showBadWordHint();
        }
    }

    enterGiftOverviewMode() {
        this.resetAll(MainMode.GiftOverview);

        giftMaker.enterOverview();
    }

    enterGiftPhysicalOrientationMode() {
        this.resetAll(MainMode.GiftPhysicalOrientation);

        giftMaker.enterGiftPhysicalOrientation();
    }

    enterGiftPhysicalFinalMode() {
        this.resetAll(MainMode.GiftPhysicalFinal);

        giftMaker.enterGiftPhysicalFinal();
    }

    enterGiftTryMode() {
        this.resetAll(MainMode.GiftTry);

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
        this.resetAll(MainMode.GiftReceived);

        ctx.cameraUpperBetaLimit = 14 * Math.PI / 32;
        ctx.cameraLowerBetaLimit = 9 * Math.PI / 32;
        ctx.cameraUpperAlphaLimit = 1.5 * Math.PI / 32;
        ctx.cameraLowerAlphaLimit = -1.5 * Math.PI / 32;
            
        ctx.cameraAttachControl(true);

        ctx.cameraAlpha = 0;
        //ctx.camera.beta = 12.5 * Math.PI / 32;

        localStorageManager.set(CommonStorageKeys.Mode, Constants.MODE_GIFT_RECEIVE);

        giftMaker.tryGift();
    }

    async enterCalendarMode(openCover: boolean, forceInitialMode: boolean = true) {
        this._currentSubMode = SubMode.Calendar;

        if (forceInitialMode) {
            this.enterInitialMode(openCover);
        }

        await calendarManager.start(openCover);
    }

    handleGetItOnAmazonAction() {
        if (openCoverAnimation.giftCover) {
            backToInitialAnimation.animate(ctx.currentCover, () => { this.enterGiftPhysicalOrientationMode(); });
        } else {
            window.open(puzzleCircleBuilder.selectedLink, "_blank");
        }
    }

    async handleCategoryChange(category: Category, userAction: boolean) {
        if (this.enterNormalSubMode() || ctx.category !== category) {
            const fromCategory = ctx.category?.key || 'unknown';
            const toCategory = category.key;
            
            ctx.category = category;

            puzzleUrlHelper.setMode(category.key/*, userAction*/);

            // Track category change
            analyticsManager.trackCategoryChange(fromCategory, toCategory);

            if (!userAction) {
                this.enterInitialMode();
            }

            await puzzleCircleBuilder.build();
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