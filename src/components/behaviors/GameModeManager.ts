import ctx from "../common/SceneContext";
import piecePositioningManager from "./PiecePositioningManager";

class GameModeManager {
    private _cameraAdjust = true;

    get cameraAdjust() {
        return this._cameraAdjust;
    }

    private resetAll() {

    }

    enterInitialMode() {
        this.resetAll();

        ctx.camera.beta = 17 * Math.PI / 32;//. = new ArcRotateCamera("arcCamera", Math.PI / 2, 17 * Math.PI / 32, 4 * 45, Vector3.Zero(), scene);
        ctx.camera.attachControl(ctx.canvas, true);

        ctx.camera.upperBetaLimit = 14 * Math.PI / 32;  
        ctx.camera.lowerBetaLimit = 9 * Math.PI / 32;
    }

    enterOpenCoverMode() {
        this.resetAll();

        ctx.camera.detachControl();
        
        this._cameraAdjust = false;
    }

    enterSolveMode() {
        this.resetAll();
        
        piecePositioningManager.init();
    }
}

const gameModeManager = new GameModeManager();
export default gameModeManager;