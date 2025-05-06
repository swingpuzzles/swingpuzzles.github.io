import tutorialManager from "../../gui/TutorialManager";
import ctx from "../common/SceneContext";
import piecePositioningManager from "./PiecePositioningManager";

export enum GameMode {
    Initial,
    OpenCover,
    Shake,
    Solve,
    Celebration
}

class GameModeManager {
    private _currentMode: GameMode = GameMode.Initial;
    private _observers: ((prevMode: GameMode) => void)[] = [];

    get initialMode() {
        return this._currentMode == GameMode.Initial;
    }
    get openCoverMode() {
        return this._currentMode == GameMode.OpenCover;
    }
    get shakeMode() {
        return this._currentMode == GameMode.Shake;
    }
    get solveMode() {
        return this._currentMode == GameMode.Solve;
    }
    get celebrationMode() {
        return this._currentMode == GameMode.Celebration;
    }
    get currentMode() {
        return this._currentMode;
    }

    private resetAll(currentMode: GameMode) {
        let prevMode = this._currentMode;
        this._currentMode = currentMode;

        ctx.camera.upperBetaLimit = null;
        ctx.camera.lowerBetaLimit = null;

        for (let observer of this._observers) {
            observer(prevMode);
        }
    }

    public addObserver(observer: (prevMode: GameMode) => void) {
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