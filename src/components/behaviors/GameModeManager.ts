import ctx from "../common/SceneContext";
import piecePositioningManager from "./PiecePositioningManager";

class GameModeManager {
    enterInitialMode() {
        ctx.camera.beta = 17 * Math.PI / 32;//. = new ArcRotateCamera("arcCamera", Math.PI / 2, 17 * Math.PI / 32, 4 * 45, Vector3.Zero(), scene);
        ctx.camera.attachControl(ctx.canvas, true);

        ctx.camera.upperBetaLimit = 12 * Math.PI / 32;  
        ctx.camera.lowerBetaLimit = 9 * Math.PI / 32;
    }

    enterOpenCoverMode() {
    }

    enterSolveMode() {
        piecePositioningManager.init();
    }
}

const gameModeManager = new GameModeManager();
export default gameModeManager;