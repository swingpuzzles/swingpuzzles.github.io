import { Animation, EasingFunction, CubicEase } from "@babylonjs/core";
import gameModeManager from "../behaviors/GameModeManager";
import ctx from "../common/SceneContext";
import puzzleGameBuilder from "../builders/PuzzleGameBuilder";
class BackToInitialAnimation {
    animate(cover, action = null) {
        if (!ctx.originalCameraState) {
            console.warn("Original state not stored.");
            return;
        }
        const animSpeed = 30;
        const animFrames = 20;
        // === Animate cover back ===
        const positionAnim = new Animation("backPosition", "position", animSpeed, Animation.ANIMATIONTYPE_VECTOR3);
        positionAnim.setKeys([
            { frame: 0, value: cover.position.clone() },
            { frame: animFrames, value: ctx.originalCoverState.position.clone() }
        ]);
        const rotationAnim = new Animation("backRotation", "rotation", animSpeed, Animation.ANIMATIONTYPE_VECTOR3);
        rotationAnim.setKeys([
            { frame: 0, value: cover.rotation.clone() },
            { frame: animFrames, value: ctx.originalCoverState.rotation.clone() }
        ]);
        cover.animations = [positionAnim, rotationAnim];
        ctx.scene.beginAnimation(cover, 0, animFrames, false);
        // === Animate camera back ===
        const orig = ctx.originalCameraState;
        const easingFunction = new CubicEase();
        easingFunction.setEasingMode(EasingFunction.EASINGMODE_EASEIN);
        const alphaAnim = new Animation("camAlpha", "alpha", animSpeed, Animation.ANIMATIONTYPE_FLOAT);
        alphaAnim.setKeys([{ frame: 0, value: ctx.cameraAlpha }, { frame: animFrames, value: orig.alpha }]);
        const betaAnim = new Animation("camBeta", "beta", animSpeed, Animation.ANIMATIONTYPE_FLOAT);
        betaAnim.setKeys([{ frame: 0, value: ctx.cameraBeta }, { frame: animFrames, value: orig.beta }]);
        const radiusAnim = new Animation("camRadius", "radius", animSpeed, Animation.ANIMATIONTYPE_FLOAT);
        radiusAnim.setKeys([{ frame: 0, value: ctx.cameraRadius }, { frame: animFrames, value: orig.radius }]);
        radiusAnim.setEasingFunction(easingFunction);
        const targetAnim = new Animation("camTarget", "target", animSpeed, Animation.ANIMATIONTYPE_VECTOR3);
        targetAnim.setKeys([{ frame: 0, value: ctx.cameraTarget }, { frame: animFrames, value: orig.target.clone() }]);
        targetAnim.setEasingFunction(easingFunction);
        gameModeManager.enterOpenCoverMode(false);
        ctx.scene.beginDirectAnimation(ctx.cameraObject, [alphaAnim, betaAnim, radiusAnim, targetAnim], 0, animFrames, false, 1.0, () => {
            // Final snap to correct alpha/beta/radius/target
            ctx.cameraAlpha = orig.alpha;
            ctx.cameraBeta = orig.beta;
            ctx.cameraRadius = orig.radius;
            ctx.cameraTarget = orig.target.clone();
            if (action) {
                action();
            }
            else {
                // ✅ Safe to re-enter initial mode now
                gameModeManager.enterInitialMode();
            }
        });
        this.animUnderCover();
    }
    animUnderCover() {
        const underCoverMeshes = puzzleGameBuilder.underCoverMeshes;
        for (const mesh of underCoverMeshes) {
            const anim = new Animation("animUnderCover", "position.y", 30, Animation.ANIMATIONTYPE_FLOAT);
            anim.setKeys([
                { frame: 0, value: mesh.position.y },
                { frame: 10, value: mesh.position.y + 100 }
            ]);
            mesh.animations = [anim];
            ctx.scene.beginAnimation(mesh, 0, 10, false);
        }
        ctx.jigsawPieces.forEach(piece => {
            const pieceData = ctx.piecesMap.get(piece);
            if (pieceData) {
                const shapeMesh = pieceData.shapeMesh;
                const startY = shapeMesh.position.y;
                const endY = shapeMesh.position.y + 100; // move up by 1 unit (adjust as needed)
                const animation = new Animation("moveUp", "position.y", 30, // frames per second
                Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CONSTANT);
                const keys = [
                    { frame: 0, value: startY },
                    { frame: 10, value: endY } // move up over 15 frames (0.25s)
                ];
                animation.setKeys(keys);
                shapeMesh.animations = [animation];
                ctx.scene.beginAnimation(shapeMesh, 0, 10, false, 1.0, () => {
                    shapeMesh.dispose();
                });
            }
            piece.dispose();
        });
        puzzleGameBuilder.clear();
    }
}
const backToInitialAnimation = new BackToInitialAnimation();
export default backToInitialAnimation;
