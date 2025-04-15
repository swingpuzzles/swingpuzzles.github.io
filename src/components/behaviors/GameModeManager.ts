import ctx from "../common/SceneContext";
import piecePositioningManager from "./PiecePositioningManager";

enum GameMode {
    Initial,
    OpenCover,
    Solve
}
class GameModeManager {
    private _currentMode: GameMode = GameMode.Initial;
    private _observers: (() => void)[] = [];

    get initialMode() {
        return this._currentMode == GameMode.Initial;
    }

    private resetAll(currentMode: GameMode) {
        this._currentMode = currentMode;

        for (let observer of this._observers) {
            observer();
        }
    }

    public addObserver(observer: () => void) {
        this._observers.push(observer);
    }

    enterInitialMode() {
        this.resetAll(GameMode.Initial);

        ctx.camera.beta = 17 * Math.PI / 32;
        ctx.camera.attachControl(ctx.canvas, true);

        ctx.camera.upperBetaLimit = 14 * Math.PI / 32;  
        ctx.camera.lowerBetaLimit = 9 * Math.PI / 32;
    }

    enterOpenCoverMode() {
        this.resetAll(GameMode.OpenCover);

        ctx.camera.detachControl();
    }

    enterSolveMode() {
        this.resetAll(GameMode.Solve);
        
        piecePositioningManager.init();
    }
}

const gameModeManager = new GameModeManager();
export default gameModeManager;