import HavokPhysics from "@babylonjs/havok";
import "@babylonjs/loaders"; // Required if you load external models
import ctx from "./common/SceneContext";
import { HavokPlugin, ArcRotateCamera, Engine, InitializeCSG2Async, Scene, Vector3 } from "@babylonjs/core";
import sceneBuilder from "./builders/SceneBuilder";
import puzzleAssetsManager from "./behaviors/PuzzleAssetsManager";
import guiManager from "../gui/GuiManager";
import gameModeManager from "./behaviors/GameModeManager";
import puzzleGameBuilder from "./builders/PuzzleGameBuilder";
import celebrationAnimation from "./animations/CelebrationAnimation";
import timerDisplay from "./misc/TimerDisplay";
import tutorialManager from "../gui/TutorialManager";
import handImagePool from "../gui/HandImagePool";


declare global {
    interface GlobalThis {
      HK: any;
    }
  }
  
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
         
            //const havokPlugin = new HavokPlugin(true, havokInstance);
            await createScene();
                      /*const buffer = await response.arrayBuffer();
            const module = await WebAssembly.compile(buffer);
            
            const havok = await HavokPhysics({ wasmModule: module });*/
                        // ✅ Load Havok WASM
            /*(window as any).BABYLON_HAVOK_WASM_URL = "/havok/HavokPhysics.wasm";
            (globalThis as any).HK = await HavokPhysics();
        
            await createScene((globalThis as any).HK);*/ // Assuming createScene is already defined globally or imported

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

            (window as any).BABYLON_HAVOK_WASM_URL = "/havok/HavokPhysics.wasm";

            const response = await fetch("/havok/HavokPhysics.wasm");
            const wasmBinaryArrayBuffer = await response.arrayBuffer();

            const havokInstance = await HavokPhysics({
              wasmBinary: wasmBinaryArrayBuffer,
            });

            const physicsPlugin = new HavokPlugin(true, havokInstance);
            scene.enablePhysics(new Vector3(0, -9.81, 0), physicsPlugin);

            await InitializeCSG2Async();

            puzzleAssetsManager.init();

            guiManager.init();

            sceneBuilder.buildScene();

            gameModeManager.enterInitialMode();

            puzzleGameBuilder.init();

            celebrationAnimation.init();

            timerDisplay.init();

            handImagePool.init();

            tutorialManager.init();

            gameModeManager.leaveWaiting();

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