var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Animation, Vector3, Matrix, CubicEase, EasingFunction } from "@babylonjs/core";
import gameModeManager from "../behaviors/GameModeManager";
import ctx from "../common/SceneContext";
import { PuzzleTools } from "../common/PuzzleTools";
import puzzleGameBuilder from "../builders/PuzzleGameBuilder";
import puzzleUrlHelper from "../../common/PuzzleUrlHelper";
import timerManager from "../misc/TimerManager";
class OpenCoverAnimation {
    constructor() {
        this._giftCover = false;
    }
    get giftCover() {
        return this._giftCover;
    }
    animate(cover) {
        /*if (!gameModeManager.canOpenCover && !gameModeManager.solveMode && !gameModeManager.celebrationMode) {
            return;
        }*/
        let endAngle = Math.PI / 2; // / 2;//cover.rotation.y < Math.PI ? Math.PI * 2 : 0;
        const coverMat = cover.material;
        if (coverMat) { // TODO better logic here
            const originalTexture = coverMat.diffuseTexture;
            const url = originalTexture.url; // this should be the image URL
            puzzleUrlHelper.setImgUrl(url);
            endAngle = Math.PI;
            this._giftCover = false;
        }
        else {
            this._giftCover = true;
        }
        gameModeManager.enterOpenCoverMode(coverMat !== null);
        ctx.currentCover = cover;
        ctx.originalCoverState = {
            position: cover.position.clone(),
            rotation: cover.rotation.clone()
        };
        ctx.cameraAlpha = PuzzleTools.normalizeAngle(ctx.cameraAlpha);
        ctx.originalCameraState = {
            alpha: ctx.cameraAlpha,
            beta: ctx.cameraBeta,
            radius: ctx.cameraRadius,
            target: ctx.cameraTarget
        };
        const startPos = cover.position.clone();
        const rotationAnim = new Animation("openRotation", "rotation.y", 30, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_RELATIVE);
        cover.rotation.y = PuzzleTools.normalizeAngle(cover.rotation.y);
        const rotationKeys = [
            { frame: 0, value: cover.rotation.y },
            { frame: 20, value: endAngle }
        ];
        rotationAnim.setKeys(rotationKeys);
        // Compute direction
        const localFront = new Vector3(0, 0, 1);
        const rotationY = cover.rotation.y;
        const worldFront = Vector3.TransformCoordinates(localFront, Matrix.RotationY(rotationY));
        const moveDistanceUp = 10;
        const moveDistanceSide = 80 - 15 * (1 - Math.cos(rotationY));
        const moveOffset = worldFront.scale(moveDistanceSide).add(new Vector3(0, moveDistanceUp, 0));
        const endPos = startPos.add(moveOffset);
        // Position animation
        const positionAnim = new Animation("movePosition", "position", 30, Animation.ANIMATIONTYPE_VECTOR3, Animation.ANIMATIONLOOPMODE_RELATIVE);
        const positionKeys = [
            { frame: 0, value: startPos },
            { frame: 20, value: endPos }
        ];
        positionAnim.setKeys(positionKeys);
        this.animCamera(endPos);
        // Assign and play second animation
        cover.animations = [rotationAnim, positionAnim];
        ctx.scene.beginAnimation(cover, 0, 20, false, 1.0, () => {
            gameModeManager.enterWaiting();
            timerManager.setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                puzzleGameBuilder.build(cover);
                timerManager.setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                    const startPos = cover.position.clone();
                    // ===== Second animation: your original one =====
                    // Rotation animation
                    const rotationAnim = new Animation("openRotation", coverMat ? "rotation.z" : "rotation.x", 30, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_RELATIVE);
                    const rotationKeys = [
                        { frame: 0, value: 0 },
                        { frame: 20, value: -Math.PI / 2 }
                    ];
                    rotationAnim.setKeys(rotationKeys);
                    // Compute direction
                    const localLeft = coverMat ? new Vector3(1, 0, 0) : new Vector3(0, 0, -1);
                    const rotationY = cover.rotation.y;
                    const worldLeft = Vector3.TransformCoordinates(localLeft, Matrix.RotationY(rotationY));
                    const moveDistanceUp = 100;
                    const moveDistanceSide = 50;
                    const moveOffset = worldLeft.scale(moveDistanceSide).add(new Vector3(0, moveDistanceUp, 0));
                    const endPos = startPos.add(moveOffset);
                    // Position animation
                    const positionAnim = new Animation("movePosition", "position", 30, Animation.ANIMATIONTYPE_VECTOR3, Animation.ANIMATIONLOOPMODE_RELATIVE);
                    const positionKeys = [
                        { frame: 0, value: startPos },
                        { frame: 20, value: endPos }
                    ];
                    positionAnim.setKeys(positionKeys);
                    // Assign and play second animation
                    cover.animations = [rotationAnim, positionAnim];
                    ctx.scene.beginAnimation(cover, 0, 30, false);
                    gameModeManager.leaveWaiting();
                }), 0);
            }), 0);
        });
    }
    animCamera(targetPos) {
        // Define the animation parameters
        const animSpeed = 30; // frames per second
        const animFrames = 20; // total animation frames
        // Target values
        const targetAlpha = 3 * Math.PI / 2;
        const targetBeta = Math.PI / 4;
        const targetTarget = targetPos;
        const targetRadius = 60;
        // Animation for alpha
        const animAlpha = new Animation("alphaAnim", "alpha", animSpeed, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_RELATIVE);
        animAlpha.setKeys([
            { frame: 0, value: ctx.cameraAlpha },
            { frame: animFrames, value: targetAlpha }
        ]);
        // Animation for beta
        const animBeta = new Animation("betaAnim", "beta", animSpeed, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_RELATIVE);
        animBeta.setKeys([
            { frame: 0, value: ctx.cameraBeta },
            { frame: animFrames, value: targetBeta }
        ]);
        // Animation for radius
        const animRadius = new Animation("radiusAnim", "radius", animSpeed, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_RELATIVE);
        animRadius.setKeys([
            { frame: 0, value: ctx.cameraRadius },
            { frame: animFrames, value: targetRadius }
        ]);
        // Animation for target
        const animTarget = new Animation("targetAnim", "target", animSpeed, Animation.ANIMATIONTYPE_VECTOR3, Animation.ANIMATIONLOOPMODE_RELATIVE);
        animTarget.setKeys([
            { frame: 0, value: ctx.cameraTarget.clone() },
            { frame: animFrames, value: targetTarget }
        ]);
        // Create easing function
        const easingFunction = new CubicEase();
        easingFunction.setEasingMode(EasingFunction.EASINGMODE_EASEOUT);
        // Apply easing to radius animation
        animRadius.setEasingFunction(easingFunction);
        // Apply easing to target animation
        animTarget.setEasingFunction(easingFunction);
        // Start animations
        ctx.scene.beginDirectAnimation(ctx.cameraObject, [animAlpha, animBeta, animRadius, animTarget], 0, animFrames, false, 1.0, () => {
            ctx.cameraAlpha = targetAlpha;
            ctx.cameraBeta = targetBeta;
            ctx.cameraRadius = targetRadius;
            ctx.cameraTarget = targetTarget;
        });
    }
}
const openCoverAnimation = new OpenCoverAnimation();
export default openCoverAnimation;
