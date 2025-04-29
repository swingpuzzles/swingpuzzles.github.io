import ammo from "ammojs-typed";
import "@babylonjs/loaders"; // Required if you load external models
import ctx from "./components/common/SceneContext";
import { AmmoJSPlugin, ArcRotateCamera, Engine, HemisphericLight, InitializeCSG2Async, Scene, Vector3 } from "@babylonjs/core";
import sceneBuilder from "./components/builders/SceneBuilder";
import puzzleAssetsManager from "./components/behaviors/PuzzleAssetsManager";
import guiManager from "./gui/GuiManager";
import gameModeManager from "./components/behaviors/GameModeManager";
import puzzleGameBuilder from "./components/builders/PuzzleGameBuilder";
import celebrationAnimation from "./components/animations/CelebrationAnimation";
import timerDisplay from "./components/misc/TimerDisplay";
import popupHint from "./gui/PopupHint";

let hasEverEnteredFullscreen = false;

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

    popupHint.init();
    popupHint.typeTextLetterByLetter("Vitaj doma huraa!");

    return scene;
};

function requestFullscreen(element: HTMLElement) {
    if (element.requestFullscreen) {
        element.requestFullscreen();
    } else if ((element as any).webkitRequestFullscreen) {
        (element as any).webkitRequestFullscreen();
    } else if ((element as any).msRequestFullscreen) {
        (element as any).msRequestFullscreen();
    }
}

function isMobileDevice(): boolean {
    //return true;
    return /Mobi|Android|iPhone/i.test(navigator.userAgent);
}

function showForceFullscreenDialog() {
    (document.getElementById("fullscreen-required-dialog") as HTMLElement).style.display = "flex";
}

function hideForceFullscreenDialog() {
    (document.getElementById("fullscreen-required-dialog") as HTMLElement).style.display = "none";
}

function enterFullscreenAgain() {
    requestFullscreen(document.getElementById("game-container") ?? document.body);
    hideForceFullscreenDialog();
}

// Expose it to the global window object so HTML can call it
(window as any).enterFullscreenAgain = enterFullscreenAgain;

function updateExitButtonVisibility() {
    const isFullscreen = document.fullscreenElement || (document as any).webkitFullscreenElement || (document as any).msFullscreenElement;
    const btn = document.getElementById("exitFullscreenBtn") as HTMLElement;
    btn.style.display = isFullscreen ? "block" : "none";
}

function handleFullscreenChange() {
    const isFullscreen = document.fullscreenElement || (document as any).webkitFullscreenElement || (document as any).msFullscreenElement;

    if (isFullscreen) {
        hasEverEnteredFullscreen = true;
        hideForceFullscreenDialog();
    } else {
        if (hasEverEnteredFullscreen) {
            showForceFullscreenDialog();
        }
    }

    updateExitButtonVisibility();
}

document.addEventListener("fullscreenchange", handleFullscreenChange);
document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
document.addEventListener("msfullscreenchange", handleFullscreenChange);

// Exit Fullscreen
(document.getElementById("exitFullscreenBtn") as HTMLElement).addEventListener("click", () => {
    if (document.exitFullscreen) {
        document.exitFullscreen();
    } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
    } else if ((document as any).msExitFullscreen) {
        (document as any).msExitFullscreen();
    }
});

window.addEventListener("load", () => {
    (document.getElementById("fullscreen-required-dialog") as HTMLElement).style.display = "none";
    const hasAcceptedCookies = localStorage.getItem("cookiesAccepted") === "true";
    const isMobile = isMobileDevice();

    if (!hasAcceptedCookies) {
        (document.getElementById("cookie-consent") as HTMLElement).style.display = "block";

        (document.getElementById("acceptCookies") as HTMLElement).addEventListener("click", () => {
            localStorage.setItem("cookiesAccepted", "true");
            (document.getElementById("cookie-consent") as HTMLElement).style.display = "none";
        
            // ✅ Only mobile AND no fullscreen yet
            if (isMobileDevice()) {
                maybePromptFullscreen();
            }
        });
    } else {
        console.log("[Cookie] Already accepted cookies");

        // ✅ Still show fullscreen dialog if not accepted yet AND is mobile
        if (isMobile) {
            maybePromptFullscreen();
        }    
    }
});

function maybePromptFullscreen() {
    (document.getElementById("fullscreen-required-dialog") as HTMLElement).style.display = "flex";
}

(document.getElementById("enterFullscreenBtn") as HTMLElement).addEventListener("click", () => {
    const container = document.getElementById("game-container") ?? document.body;
    requestFullscreen(container);
    localStorage.setItem("fullscreenAccepted", "true");
    hideForceFullscreenDialog();
});