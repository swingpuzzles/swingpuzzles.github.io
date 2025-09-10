import { PointerDragBehavior, Vector3, Animation, Scalar } from "@babylonjs/core";
import ctx from "../common/SceneContext";
import meshHelpers from "../common/MeshHelpers";
import dragHelpers from "./DragHelpers";
import pieceDragManager from "./PieceDragManager"; // Ensure this path is correct
import physicsAggregateBuilder from "../builders/PhysicsAggregateBuilder";
import gameModeManager from "./GameModeManager";
class ShakeBehaviorManager {
    constructor() {
        this._dragBehaviors = [];
        this._dragMeshes = [];
    }
    addShakeBehavior(dragMeshes) {
        if (this._dragMeshes.length > 0) {
            return;
        }
        const origPosMap = new Map();
        const origMin = new Vector3(ctx.minX, ctx.minY, ctx.minZ);
        const origMax = new Vector3(ctx.maxX, 0, ctx.maxZ);
        this._dragMeshes = dragMeshes;
        for (const m of dragMeshes) {
            m.isPickable = false;
            origPosMap.set(m, m.position.clone());
            const dragBehavior = new PointerDragBehavior();
            this._dragBehaviors.push(dragBehavior);
            dragBehavior.onDragStartObservable.add(() => {
                this.togglePhysicsAndShake();
            });
            dragBehavior.onDragObservable.add(() => {
                this.dragMovements(dragMeshes, dragBehavior, origPosMap, origMin, origMax);
            });
            dragBehavior.onDragEndObservable.add(() => {
                gameModeManager.enterSolveMode();
                this.dragMovements(dragMeshes, dragBehavior, origPosMap, origMin, origMax);
                this.moveCameraOnTop();
                dragHelpers.disableDragBehavior(dragBehavior);
                for (const mesh of dragMeshes) {
                    mesh.isPickable = false;
                }
            });
            m.addBehavior(dragBehavior);
        }
    }
    moveCameraOnTop() {
        const isPortrait = ctx.engine.getRenderHeight() > ctx.engine.getRenderWidth();
        // Base radius for landscape
        let baseRadius = 42.00001;
        // Adjust camera radius proportionally in portrait
        let targetRadius = isPortrait
            ? baseRadius * (ctx.engine.getRenderHeight() / ctx.engine.getRenderWidth())
            : baseRadius;
        this.moveArcRotateCamera(3 * Math.PI / 2, 0, targetRadius, this._dragMeshes[0].position);
    }
    autoShake() {
        this.togglePhysicsAndShake();
        gameModeManager.enterSolveMode();
        this.moveCameraOnTop();
    }
    enableDragBehaviors() {
        for (let db of this._dragBehaviors) {
            db.enabled = true;
        }
        for (let m of this._dragMeshes) {
            m.isPickable = true;
        }
    }
    togglePhysicsAndShake() {
        gameModeManager.enterShakeMode();
        ctx.jigsawPieces.forEach(piece => {
            meshHelpers.excludeFromParent(piece);
        });
        ctx.jigsawPieces.forEach(piece => {
            this.ensureDragBehavior(piece);
            if (piece.physicsAggregate) {
                piece.physicsAggregate.dispose();
                piece.physicsAggregate = undefined;
            }
            physicsAggregateBuilder.attachInitialPuzzlePieceAggregate(piece);
        });
        ctx.jigsawPieces.forEach(piece => {
            const shakePower = 20;
            const randomImpulse = new Vector3((Math.random() - 0.5) * shakePower - piece.position.x * 0.01, (Math.random() - 0.5) * shakePower, (Math.random() - 0.5) * shakePower - piece.position.z * 0.01);
            piece.physicsAggregate.body.applyImpulse(randomImpulse, piece.getAbsolutePosition());
        });
    }
    dragMovements(meshes, dragBehavior, origPosMap, origMin, origMax) {
        const attachedNode = dragBehavior.attachedNode;
        const limit = 175;
        const minX = -limit, maxX = limit;
        const minZ = -limit, maxZ = limit;
        const minY = -38;
        const maxY = 38;
        const newPos = new Vector3(Scalar.Clamp(attachedNode.position.x, minX, maxX), Scalar.Clamp(attachedNode.position.y, minY, maxY), Scalar.Clamp(attachedNode.position.z, minZ, maxZ));
        if (attachedNode.physicsBody) {
            meshHelpers.teleportMesh(attachedNode, newPos);
        }
        else {
            attachedNode.position = newPos;
        }
        const moveVector = attachedNode.position.subtract(origPosMap.get(attachedNode));
        for (const mesh of meshes) {
            if (mesh !== attachedNode) {
                if (mesh.physicsBody) {
                    meshHelpers.teleportMesh(mesh, origPosMap.get(mesh).add(moveVector));
                }
                else {
                    mesh.position.copyFrom(origPosMap.get(mesh).add(moveVector));
                }
            }
        }
        ctx.minX = origMin.x + moveVector.x;
        ctx.minY = origMin.y + moveVector.y;
        ctx.minZ = origMin.z + moveVector.z;
        ctx.maxX = origMax.x + moveVector.x;
        ctx.maxZ = origMax.z + moveVector.z;
    }
    moveArcRotateCamera(newAlpha, newBeta, newRadius, newTarget, duration = 60) {
        const frameRate = 60;
        const createAnimation = (property, from, to) => {
            const animation = new Animation(`${property}Anim`, property, frameRate, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CONSTANT);
            animation.setKeys([
                { frame: 0, value: from },
                { frame: duration, value: to }
            ]);
            return animation;
        };
        const alphaAnim = createAnimation("alpha", ctx.cameraAlpha, newAlpha);
        const betaAnim = createAnimation("beta", ctx.cameraBeta, newBeta);
        const radiusAnim = createAnimation("radius", ctx.cameraRadius, newRadius);
        const targetXAnim = createAnimation("target.x", ctx.cameraTarget.x, newTarget.x);
        const targetYAnim = createAnimation("target.y", ctx.cameraTarget.y, newTarget.y);
        const targetZAnim = createAnimation("target.z", ctx.cameraTarget.z, newTarget.z);
        ctx.cameraObject.animations = [
            alphaAnim,
            betaAnim,
            radiusAnim,
            targetXAnim,
            targetYAnim,
            targetZAnim
        ];
        ctx.scene.beginAnimation(ctx.cameraObject, 0, duration, false);
    }
    ensureDragBehavior(mesh) {
        const hasDrag = mesh.behaviors.some(behavior => behavior instanceof PointerDragBehavior);
        if (!hasDrag) {
            pieceDragManager.addDragBehavior(mesh);
        }
    }
}
const shakeBehaviorManager = new ShakeBehaviorManager();
export default shakeBehaviorManager;
