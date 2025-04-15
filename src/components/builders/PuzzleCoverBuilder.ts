import { ActionManager, ExecuteCodeAction, Mesh, MeshBuilder, StandardMaterial, Texture, Vector3, VertexBuffer, Animation, Scene, Matrix, CubicEase, EasingFunction } from "@babylonjs/core";
import ctx from "../common/SceneContext";
import puzzleAssetsManager from "../behaviors/PuzzleAssetsManager";
import gameModeManager from "../behaviors/GameModeManager";

class PuzzleCoverBuilder {
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

    /*private simpleAnimCamera() {
        // 1. Store direction the camera is looking
        const forward = ctx.camera.getTarget().subtract(ctx.camera.position);//.normalize();

        // 2. Choose how much you want to reduce the radius
        const delta = 0.1; // move 5 units closer

        // 3. Move the target in the same direction
        ctx.camera.target = ctx.camera.target.add(forward.scale(delta - 1));

        // 4. Reduce the radius
        ctx.camera.radius *= delta;
    }*/

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

        // Start animations
        ctx.scene.beginDirectAnimation(ctx.camera, [animAlpha, animBeta, animRadius, animTarget], 0, animFrames, false);
    }

    /*private animCameraOrig() {
                // Current values
                const oldTarget = ctx.camera.target.clone();
                const newY = -38;
        
                // Direction the camera is looking
                const forward = ctx.camera.getTarget().subtract(ctx.camera.position).normalize();
        
                // Compute how far the target is moving in Y
                const deltaY = newY - oldTarget.y;
        
                // Shift the target by deltaY along Y
                const newTarget = oldTarget.clone();
                newTarget.y = newY;
        
                // Adjust the radius: project the shift onto the forward vector
                // We only want to know how much the target moved *along* the view direction
                const targetShift = newTarget.subtract(oldTarget);
                const projection = Vector3.Dot(targetShift, forward);
        
                // Update camera
                ctx.camera.radius -= projection;
                ctx.camera.target = newTarget;
                console.log(newTarget);
        
    }*/

    public openCover(cover: Mesh): void {
        gameModeManager.enterOpenCoverMode();

        //this.simpleAnimCamera();

        const startPos = cover.position.clone();

        const rotationAnim = new Animation("openRotation", "rotation.y", 30,
            Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_RELATIVE);

        while (cover.rotation.y > 2 * Math.PI) {
            cover.rotation.y -= Math.PI * 2;
        }

        while (cover.rotation.y < 0) {
            cover.rotation.y += Math.PI * 2;
        }

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
}

const puzzleCoverBuilder = new PuzzleCoverBuilder();
export default puzzleCoverBuilder;