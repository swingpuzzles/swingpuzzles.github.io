import ammo from "ammojs-typed";
import "@babylonjs/loaders"; // Required if you load external models
import behaviorManager from "./components/behaviors/BehaviorManager";
import ctx from "./components/common/SceneContext";
import { AmmoJSPlugin, ArcRotateCamera, Engine, HemisphericLight, InitializeCSG2Async, Scene, Vector3 } from "@babylonjs/core";
import buildScene from "./components/builders/SceneBuilder";
import puzzleCoverBuilder from "./components/builders/PuzzleCoverBuilder";


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
    let camera = new ArcRotateCamera("Camera", 3 * Math.PI / 2, Math.PI / 4, 60, Vector3.Zero(), scene);

    ctx.init(scene, camera);

    const light1 = new HemisphericLight("light1", new Vector3(0, 10, 0), scene);
    const light2 = new HemisphericLight("light2", new Vector3(0, -10, 5), scene);
    light1.intensity = 0.5;
    light2.intensity = 0.5;

    const physicsPlugin = new AmmoJSPlugin(true);
    scene.enablePhysics(new Vector3(0, -9.81, 0), physicsPlugin);

    await InitializeCSG2Async();

    buildScene();

    behaviorManager.init();

    puzzleCoverBuilder.createCover();

    return scene;
};
