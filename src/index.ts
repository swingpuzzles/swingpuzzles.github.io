import ammo from "ammojs-typed";
import "@babylonjs/loaders"; // Required if you load external models
import piecePositioningManager from "./components/behaviors/PiecePositioningManager";
import ctx from "./components/common/SceneContext";
import { AmmoJSPlugin, ArcRotateCamera, Engine, HemisphericLight, InitializeCSG2Async, Scene, Vector3 } from "@babylonjs/core";
import puzzleCoverBuilder from "./components/builders/PuzzleCoverBuilder";
import sceneBuilder from "./components/builders/SceneBuilder";
import puzzleAssetsManager from "./components/behaviors/PuzzleAssetsManager";
import guiManager from "./gui/GuiManager";
import gameModeManager from "./components/behaviors/GameModeManager";


// Get the canvas element
const canvas = document.createElement("canvas");
document.body.appendChild(canvas);

// Create the js engine
const engine = new Engine(canvas, true);

window.addEventListener("DOMContentLoaded", async () => {
    const Ammo = await ammo.bind(window)()
  
    await createScene(); // Assuming createScene is already defined globally or imported

    engine.resize();


    engine.runRenderLoop(() => {
        ctx.scene.render();
    });
});

// Handle window resizing
window.addEventListener("resize", () => {
    engine.resize();
});

// ✅ Converted createScene function to TypeScript
const createScene = async function (): Promise<Scene> {
    let scene = new Scene(engine);
    var camera = new ArcRotateCamera("arcCamera", Math.PI / 2, 17 * Math.PI / 32, 4 * 45, Vector3.Zero(), scene);
    camera.angularSensibilityX = 4000; // higher = slower
    camera.angularSensibilityY = 8000;

    camera.beta = 17 * Math.PI / 32;
    camera.upperBetaLimit = 14 * Math.PI / 32;  
    camera.lowerBetaLimit = 9 * Math.PI / 32;

    ctx.init(scene, camera, canvas, engine);
    puzzleAssetsManager.init();

    const physicsPlugin = new AmmoJSPlugin(true);
    scene.enablePhysics(new Vector3(0, -9.81, 0), physicsPlugin);

    await InitializeCSG2Async();

    sceneBuilder.buildScene();

    guiManager.init();

    gameModeManager.enterInitialMode();

    return scene;
};
