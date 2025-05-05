import { Mesh, PointerDragBehavior, Vector3, Animation } from "@babylonjs/core";
import ctx from "../common/SceneContext";
import meshHelpers from "../common/MeshHelpers";
import dragHelpers from "./DragHelpers";
import pieceDragManager from "./PieceDragManager"; // Ensure this path is correct
import physicsImpostorBuilder from "../builders/PhysicsImpostorBuilder";
import gameModeManager from "./GameModeManager";

class ShakeBehaviorManager {
    private _dragBehaviors: PointerDragBehavior[] = [];
    private _dragMeshes: Mesh[] = [];

    addShakeBehavior(meshes: Mesh[]): void {
        const origPosMap = new Map<Mesh, Vector3>();
        const origMin = new Vector3(ctx.minX, ctx.minY, ctx.minZ);
        const origMax = new Vector3(ctx.maxX, 0, ctx.maxZ);

        this._dragMeshes = meshes;
    
        for (const m of meshes) {
            origPosMap.set(m, m.position.clone());
    
            const dragBehavior = new PointerDragBehavior();
            this._dragBehaviors.push(dragBehavior);
    
            dragBehavior.onDragStartObservable.add(() => {
                this.togglePhysicsAndShake();
            });
    
            dragBehavior.onDragObservable.add(() => {
                this.dragMovements(meshes, dragBehavior, origPosMap, origMin, origMax);
            });
    
            dragBehavior.onDragEndObservable.add(() => {
                this.dragMovements(meshes, dragBehavior, origPosMap, origMin, origMax);

                const isPortrait = ctx.engine.getRenderHeight() > ctx.engine.getRenderWidth();

                // Base radius for landscape
                let baseRadius = 42;
                
                // Adjust camera radius proportionally in portrait
                let targetRadius = isPortrait
                ? baseRadius * (ctx.engine.getRenderHeight() / ctx.engine.getRenderWidth())
                : baseRadius;

                this.moveArcRotateCamera(3 * Math.PI / 2, 0, targetRadius, dragBehavior.attachedNode.position);
    
                for (const mesh of meshes) {
                    dragHelpers.disableDragBehavior(dragBehavior);
                    mesh.isPickable = false;
                }
            });
    
            m.addBehavior(dragBehavior);
        }
    }

    public enableDragBehaviors() {
        for (let db of this._dragBehaviors) {
            db.enabled = true;
        }
        
        for (let m of this._dragMeshes) {
            m.isPickable = true;
        }
    }
    
    private togglePhysicsAndShake(): void {
        gameModeManager.enterSolveMode();
        
        ctx.jigsawPieces!.forEach(piece => {
            meshHelpers.excludeFromParent(piece);
        });
    
        ctx.jigsawPieces!.forEach(piece => {
            this.ensureDragBehavior(piece);
    
            if (piece.physicsImpostor) {
                piece.physicsImpostor.dispose();
            }
    
            physicsImpostorBuilder.attachInitialPuzzlePieceImpostor(piece);
        });
    
        ctx.jigsawPieces.forEach(piece => {
            const shakePower = 20;
            const randomImpulse = new Vector3(
                (Math.random() - 0.5) * shakePower - piece.position.x * 0.01,
                (Math.random() - 0.5) * shakePower,
                (Math.random() - 0.5) * shakePower - piece.position.z * 0.01
            );
            piece.physicsImpostor!.applyImpulse(randomImpulse, piece.getAbsolutePosition());
        });
    }

    private dragMovements(meshes: Mesh[], dragBehavior: PointerDragBehavior, origPosMap: Map<Mesh, Vector3>, origMin: Vector3, origMax: Vector3): void {
        const attachedNode = dragBehavior.attachedNode as Mesh;
        const moveVector = attachedNode.position.subtract(origPosMap.get(attachedNode)!);

        for (const mesh of meshes) {
            if (mesh !== attachedNode) {
                mesh.position.copyFrom(origPosMap.get(mesh)!.add(moveVector));
            }
        }

        ctx.minX = origMin.x + moveVector.x;
        ctx.minY = origMin.y + moveVector.y;
        ctx.minZ = origMin.z + moveVector.z;
        ctx.maxX = origMax.x + moveVector.x;
        ctx.maxZ = origMax.z + moveVector.z;
    }

    private moveArcRotateCamera(
        newAlpha: number,
        newBeta: number,
        newRadius: number,
        newTarget: Vector3,
        duration: number = 60
    ): void {
        const frameRate = 60;
    
        const createAnimation = (property: string, from: number, to: number) => {
            const animation = new Animation(
                `${property}Anim`,
                property,
                frameRate,
                Animation.ANIMATIONTYPE_FLOAT,
                Animation.ANIMATIONLOOPMODE_CONSTANT
            );
            animation.setKeys([
                { frame: 0, value: from },
                { frame: duration, value: to }
            ]);
            return animation;
        };
    
        const alphaAnim = createAnimation("alpha", ctx.camera.alpha, newAlpha);
        const betaAnim = createAnimation("beta", ctx.camera.beta, newBeta);
        const radiusAnim = createAnimation("radius", ctx.camera.radius, newRadius);
    
        const targetXAnim = createAnimation("target.x", ctx.camera.target.x, newTarget.x);
        const targetYAnim = createAnimation("target.y", ctx.camera.target.y, newTarget.y);
        const targetZAnim = createAnimation("target.z", ctx.camera.target.z, newTarget.z);
    
        ctx.camera.animations = [
            alphaAnim,
            betaAnim,
            radiusAnim,
            targetXAnim,
            targetYAnim,
            targetZAnim
        ];
    
        ctx.scene.beginAnimation(ctx.camera, 0, duration, false);
    }
    
    private ensureDragBehavior(mesh: Mesh): void {
        const hasDrag = mesh.behaviors.some(behavior => behavior instanceof PointerDragBehavior);
        if (!hasDrag) {
            pieceDragManager.addDragBehavior(mesh);
        }
    }    
}

const shakeBehaviorManager = new ShakeBehaviorManager();
export default shakeBehaviorManager;