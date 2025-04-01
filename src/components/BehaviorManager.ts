import { EasingFunction, Mesh, PhysicsImpostor, PointerDragBehavior, QuadraticEase, Quaternion, Vector3, Animation, Scalar, MeshBuilder } from "@babylonjs/core";
import puzzleBuilder from "./PuzzleBuilder";
import meshHelpers from "./MeshHelpers";
import ctx from "./SceneContext";

class BehaviorManager {
    constructor() {
    }

    init() {
        ctx.scene.onBeforeRenderObservable.add(() => this.checkPiecePositions());
    }

    addShakeBehavior(meshes: Mesh[]): void {
        const origPosMap = new Map<Mesh, Vector3>();
        const origMin = new Vector3(ctx.minX, ctx.minY, ctx.minZ);
        const origMax = new Vector3(ctx.maxX, 0, ctx.maxZ);
    
        for (const m of meshes) {
            origPosMap.set(m, m.position.clone());
    
            const dragBehavior = new PointerDragBehavior();
    
            dragBehavior.onDragStartObservable.add(() => {
                this.togglePhysicsAndShake();
            });
    
            dragBehavior.onDragObservable.add(() => {
                this.dragMovements(meshes, dragBehavior, origPosMap, origMin, origMax);
            });
    
            dragBehavior.onDragEndObservable.add(() => {
                this.dragMovements(meshes, dragBehavior, origPosMap, origMin, origMax);
                this.moveArcRotateCamera(3 * Math.PI / 2, 0, 42, dragBehavior.attachedNode.position);
    
                for (const mesh of meshes) {
                    this.removeDragBehavior(mesh);
                    mesh.isPickable = false;
                }
            });
    
            m.addBehavior(dragBehavior);
        }
    }
    
    dragMovements(meshes: Mesh[], dragBehavior: PointerDragBehavior, origPosMap: Map<Mesh, Vector3>, origMin: Vector3, origMax: Vector3): void {
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

    removeDragBehavior(mesh: Mesh): void {
        const behaviors = mesh.behaviors.slice();
        for (const behavior of behaviors) {
            if (behavior instanceof PointerDragBehavior) {
                mesh.removeBehavior(behavior);
            }
        }
    }
    
    addDragBehavior(mesh: Mesh): void {
        const dragBehavior = new PointerDragBehavior({ dragPlaneNormal: new Vector3(0, 1, 0) });
        dragBehavior.useObjectOrientationForDragging = false;
    
        dragBehavior.onDragStartObservable.add(() => {
            let node = dragBehavior.attachedNode as Mesh;
            this.animateRotationToZero(node);
    
            while (node.parent) node = node.parent as Mesh;
    
            if (node.physicsImpostor) {
                node.physicsImpostor.dispose();
                node.physicsImpostor = null;
            }
        });
    
        dragBehavior.onDragEndObservable.add(() => {
            let draggedNode = dragBehavior.attachedNode as Mesh;
            ctx.scene.stopAnimation(draggedNode);
            draggedNode.animations = [];
    
            while (draggedNode.parent) draggedNode = draggedNode.parent as Mesh;
    
            if (draggedNode) {
                for (const node of meshHelpers.getAllRelated(draggedNode)) {
                    const data = ctx.piecesMap.get(node);
                    if (!data) continue;
    
                    const neighbours: Mesh[] = [];
                    if (data.xIndex > 0) neighbours.push(ctx.piecesArray[data.xIndex - 1][data.zIndex]);
                    if (data.xIndex < ctx.numX - 1) neighbours.push(ctx.piecesArray[data.xIndex + 1][data.zIndex]);
                    if (data.zIndex > 0) neighbours.push(ctx.piecesArray[data.xIndex][data.zIndex - 1]);
                    if (data.zIndex < ctx.numZ - 1) neighbours.push(ctx.piecesArray[data.xIndex][data.zIndex + 1]);
    
                    for (const n of neighbours) {
                        if (meshHelpers.areMeshesRelated(n, node)) continue;
    
                        const nData = ctx.piecesMap.get(n)!;
                        const origRelativePosXZ = new Vector3(
                            data.origPos.x - nData.origPos.x,
                            0,
                            data.origPos.z - nData.origPos.z
                        );
    
                        const currentRelativePosXZ = new Vector3(
                            node.getAbsolutePosition().x - n.getAbsolutePosition().x,
                            0,
                            node.getAbsolutePosition().z - n.getAbsolutePosition().z
                        );
    
                        const topParent = meshHelpers.getTopParent(node);
    
                        const posEpsilon = 2;
                        const rotEpsilon = 1;
    
                        const identityQuaternion = Quaternion.Identity();
                        const positionMatch = Vector3.Distance(origRelativePosXZ, currentRelativePosXZ) < posEpsilon;
                        const rotationMatch =
                            Quaternion.Dot(topParent.rotationQuaternion!, identityQuaternion) > 1 - rotEpsilon &&
                            Quaternion.Dot(n.rotationQuaternion!, identityQuaternion) > 1 - rotEpsilon;
    
                        if (positionMatch && rotationMatch) {
                            const topParentData = ctx.piecesMap.get(topParent)!;
                            this.removeDragBehavior(topParent);
    
                            const neighbourTopParent = meshHelpers.getTopParent(n);
                            if (neighbourTopParent.physicsImpostor) {
                                neighbourTopParent.physicsImpostor.dispose();
                                neighbourTopParent.physicsImpostor = null;
                            }
    
                            topParent.setParent(neighbourTopParent);
                            topParent.rotationQuaternion = identityQuaternion;
                            neighbourTopParent.rotationQuaternion = identityQuaternion;
    
                            const ntData = ctx.piecesMap.get(neighbourTopParent)!;
                            topParent.position.x = topParentData.origPos.x - ntData.origPos.x;
                            topParent.position.z = topParentData.origPos.z - ntData.origPos.z;
    
                            topParent.computeWorldMatrix(true);
                            topParent.refreshBoundingInfo();
    
                            this.makeChildrenSiblings(topParent);
                            this.removeDragBehavior(neighbourTopParent);
                            let polygon = puzzleBuilder.makePolygon(neighbourTopParent);

                            const helpBox = MeshBuilder.CreateBox("box", { width: 0.1, height: 0.1, depth: 0.1 }, ctx.scene);

                            if (neighbourTopParent.parent) {
                                let parent = neighbourTopParent.parent as Mesh;
                                let oldPolygon = ctx.helpBoxMap.get(parent)!;
                                ctx.helpBoxMap.delete(oldPolygon);
                                oldPolygon.dispose();
                                meshHelpers.excludeFromParent(neighbourTopParent);
                                parent.dispose();
                            }

                            neighbourTopParent.setParent(helpBox, true);
                
                            helpBox.position = polygon.position;
                
                            ctx.helpBoxMap.set(helpBox, polygon);
                        
                            if (neighbourTopParent.getChildren().length + 1 === ctx.piecesCount) {
                                alert("Job done!");
                            }
                            return;
                        }
                    }
                }
    
                if (!draggedNode.physicsImpostor && !draggedNode.parent) {
                    draggedNode.physicsImpostor = new PhysicsImpostor(
                        draggedNode,
                        PhysicsImpostor.BoxImpostor,
                        { mass: 0.1, friction: 0.7, restitution: 0.01 },
                        ctx.scene
                    );
                }
            }
        });
    
        mesh.addBehavior(dragBehavior);
    }

    makeChildrenSiblings(mesh: Mesh): void {
        if (!mesh.parent) {
            console.warn("The mesh has no parent. Children cannot become siblings.");
            return;
        }
    
        const parent = mesh.parent as Mesh;
        mesh.computeWorldMatrix(true);
    
        mesh.getChildMeshes().forEach(child => {
            child.computeWorldMatrix(true);
    
            const worldPosition = child.getAbsolutePosition();
            const worldRotation = new Quaternion();
            child.getWorldMatrix().decompose(undefined, worldRotation, undefined);
    
            child.parent = parent;
    
            const invParentMatrix = parent.getWorldMatrix().invert();
            child.position = Vector3.TransformCoordinates(worldPosition, invParentMatrix);
            child.rotationQuaternion = parent.rotationQuaternion
                ? parent.rotationQuaternion.invert().multiply(worldRotation)
                : worldRotation;
        });
    }
    
    togglePhysicsAndShake(): void {
        ctx.jigsawPieces!.forEach(piece => {
            meshHelpers.excludeFromParent(piece);
        });
    
        ctx.jigsawPieces!.forEach(piece => {
            this.ensureDragBehavior(piece);
    
            if (piece.physicsImpostor) {
                piece.physicsImpostor.dispose();
            }
    
            piece.physicsImpostor = new PhysicsImpostor(
                piece,
                PhysicsImpostor.BoxImpostor,
                { mass: 0.2, friction: 0.3, restitution: 0.1 },
                ctx.scene
            );
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
    
    animateRotationToZero(mesh: Mesh): void {
        if (!mesh.rotationQuaternion) return;
    
        const easing = new QuadraticEase();
        easing.setEasingMode(EasingFunction.EASINGMODE_EASEOUT);
    
        let anim = new Animation(
            "rotationAnim",
            "rotationQuaternion",
            60,
            Animation.ANIMATIONTYPE_QUATERNION,
            Animation.ANIMATIONLOOPMODE_CONSTANT
        );
    
        let keys = [
            { frame: 0, value: mesh.rotationQuaternion.clone() },
            { frame: 100, value: Quaternion.Identity() }
        ];
    
        anim.setKeys(keys);
        anim.setEasingFunction(easing);
    
        mesh.animations = [];
        mesh.animations.push(anim);
    
        anim = new Animation(
            "liftAnim",
            "position.y",
            60,
            Animation.ANIMATIONTYPE_FLOAT,
            Animation.ANIMATIONLOOPMODE_CONSTANT
        );
    
        let keys2 = [
            { frame: 0, value: mesh.position.y },
            { frame: 100, value: 3 }
        ];
    
        anim.setKeys(keys2);
        anim.setEasingFunction(easing);
    
        mesh.animations.push(anim);
    
        ctx.scene.beginAnimation(mesh, 0, 100, false);
    }

    moveArcRotateCamera(
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
    
    ensureDragBehavior(mesh: Mesh): void {
        const hasDrag = mesh.behaviors.some(behavior => behavior instanceof PointerDragBehavior);
        if (!hasDrag) {
            behaviorManager.addDragBehavior(mesh);
        }
    }    

    checkPiecePositions(): void {
        for (const [helpBox, groupBox] of ctx.helpBoxMap.entries()) {
            helpBox.position.copyFrom(groupBox.position);
            helpBox.rotationQuaternion = groupBox.rotationQuaternion!.clone();
        }
    
        const helpThis = this;
        ctx.jigsawPieces.forEach(piece => {
            const pieceData = ctx.piecesMap.get(piece);
            if (!pieceData) return;
            const shapeMesh = pieceData.shapeMesh;
    
            piece.computeWorldMatrix(true);
            shapeMesh.position.copyFrom(piece.getAbsolutePosition());
    
            const worldMatrix = piece.getWorldMatrix();
            const absoluteRotation = new Quaternion();
            worldMatrix.decompose(undefined, absoluteRotation, undefined);
            shapeMesh.rotationQuaternion = absoluteRotation;
    
            if (piece.parent) {
                piece.position.y = -0.3;
                piece.rotationQuaternion = Quaternion.Identity();
                return;
            }
    
            const power = piece.getChildren().length < 1 ? 1.5 : 0.04;
    
            const edgePosMinX = helpThis.getEdgePosition(piece, (edge, pos) => pos.x - ctx.pieceWidthHalf < edge.x);
            const edgePosMaxX = helpThis.getEdgePosition(piece, (edge, pos) => pos.x + ctx.pieceWidthHalf > edge.x);
            const edgePosMinZ = helpThis.getEdgePosition(piece, (edge, pos) => pos.z - ctx.pieceDepthHalf < edge.z);
            const edgePosMaxZ = helpThis.getEdgePosition(piece, (edge, pos) => pos.z + ctx.pieceDepthHalf > edge.z);
            const edgePosMinY = helpThis.getEdgePosition(piece, (edge, pos) => pos.y - ctx.pieceHeightHalf < edge.y);
    
            let edgePos: Vector3 | null = null;
    
            if (edgePosMinX.x - ctx.pieceWidthHalf < ctx.minX) {
                piece.position.x += 0.2;
                edgePos = edgePosMinX;
            } else if (edgePosMaxX.x + ctx.pieceWidthHalf > ctx.maxX) {
                piece.position.x -= 0.2;
                edgePos = edgePosMaxX;
            } else if (edgePosMinZ.z - ctx.pieceDepthHalf < ctx.minZ) {
                piece.position.z += 0.2;
                edgePos = edgePosMinZ;
            } else if (edgePosMaxZ.z + ctx.pieceDepthHalf > ctx.maxZ) {
                piece.position.z -= 0.2;
                edgePos = edgePosMaxZ;
            } else if (edgePosMinY.y - ctx.pieceHeightHalf < ctx.minY - 0.1) {
                piece.position.y += 0.2;
                edgePos = edgePosMinY;
            } else {
                return;
            }
    
            const centerPoint = new Vector3((ctx.maxX + ctx.minX) / 2, 20 - ctx.minY, (ctx.maxZ + ctx.minZ) / 2);
            const directionToCenter = centerPoint.subtract(edgePos).normalize();
    
            if (piece.physicsImpostor) {
                piece.physicsImpostor.setLinearVelocity(Vector3.Zero());
                const centerImpulse = directionToCenter.scale(power);
                piece.physicsImpostor.applyImpulse(centerImpulse, edgePos);
    
                if (piece.getChildren().length >= 3) {
                    const maxAngularSpeed = 1;
                    const angularVelocity = piece.physicsImpostor.getAngularVelocity();
    
                    if (angularVelocity) {
                        angularVelocity.x = Scalar.Clamp(angularVelocity.x, -maxAngularSpeed, maxAngularSpeed);
                        angularVelocity.y = Scalar.Clamp(angularVelocity.y, -maxAngularSpeed, maxAngularSpeed);
                        angularVelocity.z = Scalar.Clamp(angularVelocity.z, -maxAngularSpeed, maxAngularSpeed);
                    }
    
                    piece.physicsImpostor.setAngularVelocity(angularVelocity);
                }
            }
        });
    }
    
    getEdgePosition(
        mesh: Mesh,
        func: (edge: Vector3, current: Vector3) => boolean
    ): Vector3 {
        let edgePosition = mesh.getAbsolutePosition();
    
        for (const m of meshHelpers.getAllRelated(mesh)) {
            const absPos = m.getAbsolutePosition();
            if (func(edgePosition, absPos)) {
                edgePosition = absPos;
            }
        }
    
        return edgePosition;
    }
}

const behaviorManager = new BehaviorManager();
export default behaviorManager;
