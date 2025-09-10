import { Color4, ParticleSystem, Animation, Texture, Vector3, SineEase, EasingFunction } from "@babylonjs/core";
import ctx from "../common/SceneContext";
import gameModeManager, { GameMode } from "../behaviors/GameModeManager";
import tutorialManager from "../../gui/TutorialManager";
import timerManager from "../misc/TimerManager";
class CelebrationAnimation {
    animate(mesh) {
        this.particleSystem.emitter = mesh.position.clone();
        this.particleSystem.start();
        timerManager.setTimeout(() => {
            if (gameModeManager.celebrationMode) {
                tutorialManager.showCongratsMessage();
            }
        }, 1500);
        ctx.jigsawPieces.forEach(piece => {
            const pieceData = ctx.piecesMap.get(piece);
            if (!pieceData)
                return;
            const shapeMesh = pieceData.shapeMesh;
            shapeMesh.position.y = ctx.minY + 1;
            const centerX = (ctx.numX - 1) / 2;
            const centerZ = (ctx.numZ - 1) / 2;
            const dx = pieceData.xIndex - centerX;
            const dz = pieceData.zIndex - centerZ;
            const distance = Math.sqrt(dx * dx + dz * dz);
            const delayFrames = distance * 10; // how far = how late
            const waveHeight = 6 + Math.random() * 0.3;
            const waveDuration = 30;
            const anim = new Animation("waveY", "position.y", 30, // FPS
            Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CONSTANT);
            const y0 = shapeMesh.position.y;
            anim.setKeys([
                { frame: 0, value: y0 },
                { frame: delayFrames + 0, value: y0 },
                { frame: delayFrames + waveDuration / 2, value: y0 + waveHeight },
                { frame: delayFrames + waveDuration, value: y0 },
                /*{ frame: delayFrames + 3 * waveDuration / 2, value: y0 + waveHeight },
                { frame: delayFrames + 2 * waveDuration, value: y0 },*/
            ]);
            // 🔥 Add sinusoidal-like easing
            const easing = new SineEase();
            easing.setEasingMode(EasingFunction.EASINGMODE_EASEINOUT);
            anim.setEasingFunction(easing);
            shapeMesh.animations = [anim];
            ctx.scene.beginAnimation(shapeMesh, 0, delayFrames + waveDuration /** 2*/, false);
        });
    }
    init() {
        // Create particle system
        this.particleSystem = new ParticleSystem("celebration", 2000, ctx.scene);
        this.particleSystem.particleTexture = new Texture("assets/misc/Flare.png", ctx.scene);
        // Emitter settings
        this.particleSystem.minEmitBox = new Vector3(-20, 0, -20);
        this.particleSystem.maxEmitBox = new Vector3(20, 0, 20);
        // Appearance
        this.particleSystem.color1 = new Color4(1, 0.2, 0.6, 1);
        this.particleSystem.color2 = new Color4(0.2, 1, 0.6, 1);
        this.particleSystem.colorDead = new Color4(0.1, 0.1, 0.1, 0.0);
        // Size, lifetime
        this.particleSystem.minSize = 0.2;
        this.particleSystem.maxSize = 0.6;
        this.particleSystem.minLifeTime = 0.5;
        this.particleSystem.maxLifeTime = 1.5;
        // Emission
        this.particleSystem.emitRate = 1000;
        this.particleSystem.gravity = new Vector3(0, -5, 0);
        this.particleSystem.direction1 = new Vector3(-1, 4, 1);
        this.particleSystem.direction2 = new Vector3(1, 4, -1);
        this.particleSystem.minAngularSpeed = 0;
        this.particleSystem.maxAngularSpeed = Math.PI;
        this.particleSystem.minEmitPower = 1;
        this.particleSystem.maxEmitPower = 3;
        this.particleSystem.updateSpeed = 0.01;
        gameModeManager.addGameModeChangedObserver((prevMode) => {
            if (prevMode == GameMode.Celebration) {
                this.particleSystem.stop();
            }
        });
    }
}
const celebrationAnimation = new CelebrationAnimation();
export default celebrationAnimation;
