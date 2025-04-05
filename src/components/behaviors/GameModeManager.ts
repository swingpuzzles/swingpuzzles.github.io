import ctx from "../common/SceneContext";

class GameModeManager {
    enterInitialMode() {
        ctx.camera.beta = 17 * Math.PI / 32;//. = new ArcRotateCamera("arcCamera", Math.PI / 2, 17 * Math.PI / 32, 4 * 45, Vector3.Zero(), scene);
        ctx.camera.attachControl(ctx.canvas, true);

        ctx.camera.upperBetaLimit = 16 * Math.PI / 32;  
        ctx.camera.lowerBetaLimit = 9 * Math.PI / 32;
    }

    enterOpenCoverMode() {
    }
}

const gameModeManager = new GameModeManager();
export default gameModeManager;