import ammo from "ammojs-typed";
import "@babylonjs/loaders"; // Required if you load external models
import ctx from "./common/SceneContext";
import { AmmoJSPlugin, ArcRotateCamera, Engine, HemisphericLight, InitializeCSG2Async, Scene, Vector3 } from "@babylonjs/core";
import sceneBuilder from "./builders/SceneBuilder";
import puzzleAssetsManager from "./behaviors/PuzzleAssetsManager";
import guiManager from "../gui/GuiManager";
import gameModeManager from "./behaviors/GameModeManager";
import puzzleGameBuilder from "./builders/PuzzleGameBuilder";
import celebrationAnimation from "./animations/CelebrationAnimation";
import timerDisplay from "./misc/TimerDisplay";
import tutorialManager from "../gui/TutorialManager";
import handImagePool from "../gui/HandImagePool";

class SceneInitializer {
    private resizeObservers: ((width: number, height: number) => void)[] = [];

    init() {
        //let hasEverEnteredFullscreen = false;

        // Get the canvas element
        const canvas = document.createElement("canvas");
        document.body.appendChild(canvas);

        // Create the js engine
        const engine = new Engine(canvas, true);

        window.addEventListener("DOMContentLoaded", async () => {
            await ammo.bind(window)()
        
            await createScene(); // Assuming createScene is already defined globally or imported

            engine.resize();

            engine.runRenderLoop(() => {
                ctx.scene.render();
            });
        });

        // Handle window resizing
        window.addEventListener("resize", () => {
            engine.resize();

            for (const observer of this.resizeObservers) {
                observer(engine.getRenderWidth(), engine.getRenderHeight());
            }
        });

        // ✅ Converted createScene function to TypeScript
        const createScene = async function (): Promise<Scene> {
            let scene = new Scene(engine);
            var camera = new ArcRotateCamera("arcCamera", Math.PI / 2, 17 * Math.PI / 32, 4 * 45, Vector3.Zero(), scene);
            camera.angularSensibilityX = 4000; // higher = slower
            camera.angularSensibilityY = 8000;

            camera.beta = 17 * Math.PI / 32;

            ctx.init(scene, camera, canvas, engine);
            puzzleAssetsManager.init();

            const physicsPlugin = new AmmoJSPlugin(true);
            scene.enablePhysics(new Vector3(0, -9.81, 0), physicsPlugin);

            await InitializeCSG2Async();

            sceneBuilder.buildScene();

            guiManager.init();

            gameModeManager.enterInitialMode();

            puzzleGameBuilder.init();

            gameModeManager.leaveWaiting();

            celebrationAnimation.init();

            timerDisplay.init();

            handImagePool.init();

            tutorialManager.init();

            return scene;
        };
    }

    addResizeObserver(observer: (width: number, height: number) => void) {
        this.resizeObservers.push(observer);

        observer(ctx.engine.getRenderWidth(), ctx.engine.getRenderHeight());
    }

    removeResizeObserver(observer: (width: number, height: number) => void) {
        const index = this.resizeObservers.indexOf(observer);
        if (index > -1) {
            this.resizeObservers.splice(index, 1);
        }
    }
}

const sceneInitializer = new SceneInitializer();
export default sceneInitializer;