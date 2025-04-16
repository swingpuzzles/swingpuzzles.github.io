import { ActionManager, ExecuteCodeAction, Mesh, MeshBuilder, StandardMaterial, Vector3, VertexBuffer, Animation, Matrix, CubicEase, EasingFunction, Tools } from "@babylonjs/core";
import ctx from "../common/SceneContext";
import puzzleAssetsManager from "../behaviors/PuzzleAssetsManager";
import gameModeManager from "../behaviors/GameModeManager";
import { PuzzleTools } from "../common/PuzzleTools";

class PuzzleCoverBuilder {
    private originalCoverState: { position: Vector3; rotation: Vector3 } | null = null;
    private originalCameraState: { alpha: number; beta: number; radius: number; target: Vector3 } | null = null;
    private _currentCover: Mesh | null = null;

    public get currentCover(): Mesh {
        return this._currentCover!;
    }

    createCover(imgSmallUrl: string, imgBigUrl: string, imgCoverUrl: string): Mesh {
        const box = MeshBuilder.CreateBox("box", {
            width: ctx.coverWidth,
            height: ctx.coverHeight,
            depth: ctx.coverDepth
        }, ctx.scene);

        const texture = puzzleAssetsManager.addTexture(imgSmallUrl, imgBigUrl);

        const mat = new StandardMaterial("mat", ctx.scene);
        mat.diffuseTexture = texture;

        let cut = 0.1;
        let topCut = 1 - cut;

        const uvs = [
            cut, cut, topCut, cut, topCut, topCut, cut, topCut,
            0, 0, 1, 0, 1, 1, 0, 1,
            0, topCut, 0, cut, cut, cut, cut, topCut,
            topCut, topCut, topCut, cut, 1, cut, 1, topCut,
            topCut, topCut, topCut, 1, cut, 1, cut, topCut,
            cut, cut, cut, 0, topCut, 0, topCut, cut
        ];

        box.setVerticesData(VertexBuffer.UVKind, uvs);
        box.material = mat;

        box.actionManager = new ActionManager(ctx.scene);
        //box.setPivotPoint(new Vector3(-64, 0, 0));    // TODO

        box.rotation.x = 3 * Math.PI / 2;
        box.rotation.y = Math.PI / 2;
        box.rotation.z = Math.PI / 2;
        //box.position = new Vector3(128, 1.2, 0);
        box.bakeCurrentTransformIntoVertices();

        box.actionManager.registerAction(
            new ExecuteCodeAction(ActionManager.OnPickTrigger, () => {
                this.openCover(box);
            })
        );

        return box;
    }

    private animCamera(targetPos: Vector3) {
        // Define the animation parameters
        const animSpeed = 30; // frames per second
        const animFrames = 20; // total animation frames

        // Target values
        const targetAlpha = 3 * Math.PI / 2;
        const targetBeta = Math.PI / 4;
        const targetRadius = 60;
        const targetTarget = targetPos;

        // Animation for alpha
        const animAlpha = new Animation("alphaAnim", "alpha", animSpeed, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_RELATIVE);
        animAlpha.setKeys([
            { frame: 0, value: ctx.camera.alpha },
            { frame: animFrames, value: targetAlpha }
        ]);

        // Animation for beta
        const animBeta = new Animation("betaAnim", "beta", animSpeed, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_RELATIVE);
        animBeta.setKeys([
            { frame: 0, value: ctx.camera.beta },
            { frame: animFrames, value: targetBeta }
        ]);

        // Animation for radius
        const animRadius = new Animation("radiusAnim", "radius", animSpeed, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_RELATIVE);
        animRadius.setKeys([
            { frame: 0, value: ctx.camera.radius },
            { frame: animFrames, value: targetRadius }
        ]);

        // Animation for target
        const animTarget = new Animation("targetAnim", "target", animSpeed, Animation.ANIMATIONTYPE_VECTOR3, Animation.ANIMATIONLOOPMODE_RELATIVE);
        animTarget.setKeys([
            { frame: 0, value: ctx.camera.target.clone() },
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
        ctx.scene.beginDirectAnimation(ctx.camera, [animAlpha, animBeta, animRadius, animTarget], 0, animFrames, false);
    }

    public openCover(cover: Mesh): void {
        gameModeManager.enterOpenCoverMode();

        this._currentCover = cover;

        this.originalCoverState = {
            position: cover.position.clone(),
            rotation: cover.rotation.clone()
        };

        ctx.camera.alpha = PuzzleTools.normalizeAngle(ctx.camera.alpha);

        this.originalCameraState = {
            alpha: ctx.camera.alpha,
            beta: ctx.camera.beta,
            radius: ctx.camera.radius,
            target: ctx.camera.target.clone()
        };

        const startPos = cover.position.clone();

        const rotationAnim = new Animation("openRotation", "rotation.y", 30,
            Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_RELATIVE);

        cover.rotation.y = PuzzleTools.normalizeAngle(cover.rotation.y);

        const endAngle = Math.PI;// / 2;//cover.rotation.y < Math.PI ? Math.PI * 2 : 0;

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
        const moveDistanceSide = 50;
        const moveOffset = worldFront.scale(moveDistanceSide).add(new Vector3(0, moveDistanceUp, 0));

        const endPos = startPos.add(moveOffset);

        // Position animation
        const positionAnim = new Animation("movePosition", "position", 30,
            Animation.ANIMATIONTYPE_VECTOR3, Animation.ANIMATIONLOOPMODE_RELATIVE);

        const positionKeys = [
            { frame: 0, value: startPos },
            { frame: 20, value: endPos }
        ];
        positionAnim.setKeys(positionKeys);

        this.animCamera(endPos);

        // Assign and play second animation
        cover.animations = [rotationAnim, positionAnim];

        ctx.scene.beginAnimation(cover, 0, 20, false, 1.0, () => {
            const startPos = cover.position.clone();
            // ===== Second animation: your original one =====
    
            // Rotation animation
            const rotationAnim = new Animation("openRotation", "rotation.z", 30,
                Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_RELATIVE);
    
            const rotationKeys = [
                { frame: 0, value: 0 },
                { frame: 20, value: -Math.PI / 2 }
            ];
            rotationAnim.setKeys(rotationKeys);
    
            // Compute direction
            const localLeft = new Vector3(1, 0, 0);
            const rotationY = cover.rotation.y;
            const worldLeft = Vector3.TransformCoordinates(localLeft, Matrix.RotationY(rotationY));
    
            const moveDistanceUp = 100;
            const moveDistanceSide = 50;
            const moveOffset = worldLeft.scale(moveDistanceSide).add(new Vector3(0, moveDistanceUp, 0));
    
            const endPos = startPos.add(moveOffset);
    
            // Position animation
            const positionAnim = new Animation("movePosition", "position", 30,
                Animation.ANIMATIONTYPE_VECTOR3, Animation.ANIMATIONLOOPMODE_RELATIVE);
    
            const positionKeys = [
                { frame: 0, value: startPos },
                { frame: 20, value: endPos }
            ];
            positionAnim.setKeys(positionKeys);
    
            // Assign and play second animation
            cover.animations = [rotationAnim, positionAnim];
            ctx.scene.beginAnimation(cover, 0, 30, false);
        });
    }

    public animBackToOrigin(cover: Mesh): void {
        if (!this.originalCoverState || !this.originalCameraState) {
            console.warn("Original state not stored.");
            return;
        }

        const animSpeed = 30;
        const animFrames = 30;

        // === Animate cover back ===

        const positionAnim = new Animation("backPosition", "position", animSpeed, Animation.ANIMATIONTYPE_VECTOR3);
        positionAnim.setKeys([
            { frame: 0, value: cover.position.clone() },
            { frame: animFrames, value: this.originalCoverState.position.clone() }
        ]);

        const rotationAnim = new Animation("backRotation", "rotation", animSpeed, Animation.ANIMATIONTYPE_VECTOR3);
        rotationAnim.setKeys([
            { frame: 0, value: cover.rotation.clone() },
            { frame: animFrames, value: this.originalCoverState.rotation.clone() }
        ]);

        cover.animations = [positionAnim, rotationAnim];
        ctx.scene.beginAnimation(cover, 0, animFrames, false);

        // === Animate camera back ===

        const cam = ctx.camera;
        const orig = this.originalCameraState;

        const easingFunction = new CubicEase();
        easingFunction.setEasingMode(EasingFunction.EASINGMODE_EASEIN);

        const alphaAnim = new Animation("camAlpha", "alpha", animSpeed, Animation.ANIMATIONTYPE_FLOAT);
        alphaAnim.setKeys([{ frame: 0, value: cam.alpha }, { frame: animFrames, value: orig.alpha }]);

        const betaAnim = new Animation("camBeta", "beta", animSpeed, Animation.ANIMATIONTYPE_FLOAT);
        betaAnim.setKeys([{ frame: 0, value: cam.beta }, { frame: animFrames, value: orig.beta }]);

        const radiusAnim = new Animation("camRadius", "radius", animSpeed, Animation.ANIMATIONTYPE_FLOAT);
        radiusAnim.setKeys([{ frame: 0, value: cam.radius }, { frame: animFrames, value: orig.radius }]);
        radiusAnim.setEasingFunction(easingFunction);

        const targetAnim = new Animation("camTarget", "target", animSpeed, Animation.ANIMATIONTYPE_VECTOR3);
        targetAnim.setKeys([{ frame: 0, value: cam.target.clone() }, { frame: animFrames, value: orig.target.clone() }]);
        targetAnim.setEasingFunction(easingFunction);

        ctx.scene.beginDirectAnimation(cam, [alphaAnim, betaAnim, radiusAnim, targetAnim], 0, animFrames, false, 1.0, () => {
            // Final snap to correct alpha/beta/radius/target
            cam.alpha = orig.alpha;
            cam.beta = orig.beta;
            cam.radius = orig.radius;
            cam.target = orig.target.clone();
        
            // ✅ Safe to re-enter initial mode now
            gameModeManager.enterInitialMode();
        });
    }
}

const puzzleCoverBuilder = new PuzzleCoverBuilder();
export default puzzleCoverBuilder;