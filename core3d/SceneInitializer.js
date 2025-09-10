var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
import puzzleEditor from "./misc/PuzzleEditor";
import profanityGuard from "../common/ProfanityGuard";
class SceneInitializer {
    constructor() {
        this.resizeObservers = [];
    }
    init() {
        //let hasEverEnteredFullscreen = false;
        // Get the canvas element
        const canvas = document.createElement("canvas");
        document.body.appendChild(canvas);
        // Create the js engine
        const engine = new Engine(canvas, true);
        window.addEventListener("DOMContentLoaded", () => __awaiter(this, void 0, void 0, function* () {
            //const havokPlugin = new HavokPlugin(true, havokInstance);
            yield createScene();
            engine.resize();
            engine.runRenderLoop(() => {
                ctx.scene.render();
            });
        }));
        // Handle window resizing
        window.addEventListener("resize", () => {
            engine.resize();
            for (const observer of this.resizeObservers) {
                observer(engine.getRenderWidth(), engine.getRenderHeight());
            }
        });
        // ✅ Converted createScene function to TypeScript
        const createScene = function () {
            return __awaiter(this, void 0, void 0, function* () {
                profanityGuard.initInBackground();
                let scene = new Scene(engine);
                var camera = new ArcRotateCamera("arcCamera", Math.PI / 2, 17 * Math.PI / 32, 4 * 45, Vector3.Zero(), scene);
                camera.angularSensibilityX = 4000; // higher = slower
                camera.angularSensibilityY = 8000;
                camera.beta = 17 * Math.PI / 32;
                ctx.init(scene, camera, canvas, engine);
                window.BABYLON_HAVOK_WASM_URL = "/havok/HavokPhysics.wasm";
                const response = yield fetch("/havok/HavokPhysics.wasm");
                const wasmBinaryArrayBuffer = yield response.arrayBuffer();
                const havokInstance = yield HavokPhysics({
                    wasmBinary: wasmBinaryArrayBuffer,
                });
                const physicsPlugin = new HavokPlugin(true, havokInstance);
                scene.enablePhysics(new Vector3(0, -9.81, 0), physicsPlugin);
                yield InitializeCSG2Async();
                puzzleAssetsManager.init();
                yield guiManager.init();
                sceneBuilder.buildScene();
                puzzleEditor.init();
                puzzleGameBuilder.init();
                celebrationAnimation.init();
                timerDisplay.init();
                handImagePool.init();
                tutorialManager.init();
                gameModeManager.leaveWaiting();
                return scene;
            });
        };
    }
    addResizeObserver(observer) {
        this.resizeObservers.push(observer);
        observer(ctx.engine.getRenderWidth(), ctx.engine.getRenderHeight());
    }
    removeResizeObserver(observer) {
        const index = this.resizeObservers.indexOf(observer);
        if (index > -1) {
            this.resizeObservers.splice(index, 1);
        }
    }
}
const sceneInitializer = new SceneInitializer();
export default sceneInitializer;
