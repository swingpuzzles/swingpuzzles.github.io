import giftMaker from "../../gui/GiftMaker";
import tutorialManager from "../../gui/TutorialManager";
import ctx from "../common/SceneContext";
import piecePositioningManager from "./PiecePositioningManager";

export enum GameMode {
    Initial,
    OpenCover,
    Shake,
    Solve,
    Celebration,
    GiftInitial,
    GiftAdjustment,
    GiftOverview,
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

    private resetAll(currentMode: GameMode) {
        let prevMode = this._currentMode;
        this._currentMode = currentMode;

        ctx.camera.upperAlphaLimit = null;
        ctx.camera.lowerAlphaLimit = null;
        ctx.camera.upperBetaLimit = null;
        ctx.camera.lowerBetaLimit = null;

        for (let observer of this._observers) {
            observer(prevMode);
        }
    }

    public addGameModeChangedObserver(observer: (prevMode: GameMode) => void) {
        this._observers.push(observer);
    }

    enterInitialMode() {
        this.resetAll(GameMode.Initial);

        ctx.camera.upperBetaLimit = 14 * Math.PI / 32;
        ctx.camera.lowerBetaLimit = 9 * Math.PI / 32;
            
        ctx.camera.attachControl(ctx.canvas, true);
    }

    enterOpenCoverMode() {
        this.resetAll(GameMode.OpenCover);

        ctx.camera.detachControl();

        tutorialManager.showShakeHint();
    }

    enterShakeMode() {
        this.resetAll(GameMode.Shake);
        
        piecePositioningManager.init();
    }

    enterSolveMode() {
        this.resetAll(GameMode.Solve);
        
        piecePositioningManager.init();
    }

    enterCelebrationMode() {
        this.resetAll(GameMode.Celebration);
        
        piecePositioningManager.init();
    }

    enterGiftInitialMode() {
        this.resetAll(GameMode.GiftInitial);

        ctx.camera.detachControl();

        giftMaker.start();
    }

    enterGiftAdjustmentMode() {
        this.resetAll(GameMode.GiftAdjustment);

        giftMaker.enterAdjustments();
    }

    enterGiftTryMode() {
        this.resetAll(GameMode.GiftTry);

        ctx.camera.upperBetaLimit = 14 * Math.PI / 32;
        ctx.camera.lowerBetaLimit = 9 * Math.PI / 32;
        ctx.camera.upperAlphaLimit = 1 * Math.PI / 32;
        ctx.camera.lowerAlphaLimit = -1 * Math.PI / 32;
            
        ctx.camera.attachControl(ctx.canvas, true);

        ctx.camera.alpha = 0;
        //ctx.camera.beta = 12.5 * Math.PI / 32;  

        giftMaker.tryGift();
    }

    enterGiftReceivedMode() {
        this.resetAll(GameMode.GiftReceived);

        ctx.camera.upperBetaLimit = 14 * Math.PI / 32;
        ctx.camera.lowerBetaLimit = 9 * Math.PI / 32;
        ctx.camera.upperAlphaLimit = 1 * Math.PI / 32;
        ctx.camera.lowerAlphaLimit = -1 * Math.PI / 32;
            
        ctx.camera.attachControl(ctx.canvas, true);

        ctx.camera.alpha = 0;
        //ctx.camera.beta = 12.5 * Math.PI / 32;  

        giftMaker.tryGift();
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