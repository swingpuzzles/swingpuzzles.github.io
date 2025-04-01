import { EasingFunction, Mesh, PhysicsImpostor, PointerDragBehavior, QuadraticEase, Quaternion, Scene, Vector3, ArcRotateCamera, Animation } from "@babylonjs/core";
import puzzleBuilder from "./PuzzleBuilder";
import meshHelpers from "./MeshHelpers";

class BehaviorManager {
    private scene: Scene | null = null;
    private numX: number | null = null;
    private numZ: number | null = null;
    private _minX: number | null = null;
    private _maxX: number | null = null;
    private _minZ: number | null = null;
    private _maxZ: number | null = null;
    private _minY: number | null = null;
    private jigsawPieces: Mesh[] | null = null;
    private camera: ArcRotateCamera | null = null;

    private piecesArray: Mesh[][] | null = null;
    private piecesMap: Map<Mesh, {
        origPos: Vector3;
        xIndex: number;
        zIndex: number;
        shapeMesh: Mesh;
    }> | null = null;
    private piecesCount: number | null = null;

    constructor() {
    }

    init(scene: Scene, camera: ArcRotateCamera, numX: number, numZ: number, xLimit: number, zLimit: number, jigsawPieces: Mesh[], piecesArray: Mesh[][], piecesMap: Map<Mesh, {
        origPos: Vector3;
        xIndex: number;
        zIndex: number;
        shapeMesh: Mesh;
    }>): void {
        this.scene = scene;
        this.camera = camera;
        this.numX = numX;
        this.numZ = numZ;
        this.jigsawPieces = jigsawPieces;
        this.piecesArray = piecesArray;
        this.piecesMap = piecesMap;

        this._minX = -xLimit;
        this._maxX = xLimit;
        this._minZ = -zLimit;
        this._maxZ = zLimit;
        this._minY = -0.36;

        this.piecesCount = numX * numZ;
    }

    get minX(): number {
        return this._minX!;
    }
    get maxX(): number {
        return this._maxX!;
    }
    get minZ(): number {
        return this._minZ!;
    }
    get maxZ(): number {
        return this._maxZ!;
    }
    get minY(): number {
        return this._minY!;
    }

    addShakeBehavior(meshes: Mesh[]): void {
        const origPosMap = new Map<Mesh, Vector3>();
        const origMin = new Vector3(this._minX!, this._minY!, this._minZ!);
        const origMax = new Vector3(this._maxX!, 0, this._maxZ!);
    
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

        this._minX = origMin.x + moveVector.x;
        this._minY = origMin.y + moveVector.y;
        this._minZ = origMin.z + moveVector.z;
        this._maxX = origMax.x + moveVector.x;
        this._maxZ = origMax.z + moveVector.z;
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
            this.scene!.stopAnimation(draggedNode);
            draggedNode.animations = [];
    
            while (draggedNode.parent) draggedNode = draggedNode.parent as Mesh;
    
            if (draggedNode) {
                for (const node of meshHelpers.getAllRelated(draggedNode)) {
                    const data = this.piecesMap!.get(node);
                    if (!data) continue;
    
                    const neighbours: Mesh[] = [];
                    if (data.xIndex > 0) neighbours.push(this.piecesArray![data.xIndex - 1][data.zIndex]);
                    if (data.xIndex < this.numX! - 1) neighbours.push(this.piecesArray![data.xIndex + 1][data.zIndex]);
                    if (data.zIndex > 0) neighbours.push(this.piecesArray![data.xIndex][data.zIndex - 1]);
                    if (data.zIndex < this.numZ! - 1) neighbours.push(this.piecesArray![data.xIndex][data.zIndex + 1]);
    
                    for (const n of neighbours) {
                        if (meshHelpers.areMeshesRelated(n, node)) continue;
    
                        const nData = this.piecesMap!.get(n)!;
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
                            const topParentData = this.piecesMap!.get(topParent)!;
                            this.removeDragBehavior(topParent);
    
                            const neighbourTopParent = meshHelpers.getTopParent(n);
                            if (neighbourTopParent.physicsImpostor) {
                                neighbourTopParent.physicsImpostor.dispose();
                                neighbourTopParent.physicsImpostor = null;
                            }
    
                            topParent.setParent(neighbourTopParent);
                            topParent.rotationQuaternion = identityQuaternion;
                            neighbourTopParent.rotationQuaternion = identityQuaternion;
    
                            const ntData = this.piecesMap!.get(neighbourTopParent)!;
                            topParent.position.x = topParentData.origPos.x - ntData.origPos.x;
                            topParent.position.z = topParentData.origPos.z - ntData.origPos.z;
    
                            topParent.computeWorldMatrix(true);
                            topParent.refreshBoundingInfo();
    
                            this.makeChildrenSiblings(topParent);
                            this.removeDragBehavior(neighbourTopParent);
                            let polygon = puzzleBuilder.makePolygon(neighbourTopParent);
    
                            if (neighbourTopParent.getChildren().length + 1 === this.piecesCount) {
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
                        this.scene!
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
        this.jigsawPieces!.forEach(piece => {
            meshHelpers.excludeFromParent(piece);
        });
    
        this.jigsawPieces!.forEach(piece => {
            this.ensureDragBehavior(piece);
    
            if (piece.physicsImpostor) {
                piece.physicsImpostor.dispose();
            }
    
            piece.physicsImpostor = new PhysicsImpostor(
                piece,
                PhysicsImpostor.BoxImpostor,
                { mass: 0.2, friction: 0.3, restitution: 0.1 },
                this.scene!
            );
        });
    
        this.jigsawPieces!.forEach(piece => {
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
    
        this.scene!.beginAnimation(mesh, 0, 100, false);
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
    
        const alphaAnim = createAnimation("alpha", this.camera!.alpha, newAlpha);
        const betaAnim = createAnimation("beta", this.camera!.beta, newBeta);
        const radiusAnim = createAnimation("radius", this.camera!.radius, newRadius);
    
        const targetXAnim = createAnimation("target.x", this.camera!.target.x, newTarget.x);
        const targetYAnim = createAnimation("target.y", this.camera!.target.y, newTarget.y);
        const targetZAnim = createAnimation("target.z", this.camera!.target.z, newTarget.z);
    
        this.camera!.animations = [
            alphaAnim,
            betaAnim,
            radiusAnim,
            targetXAnim,
            targetYAnim,
            targetZAnim
        ];
    
        this.scene!.beginAnimation(this.camera!, 0, duration, false);
    }
    
    ensureDragBehavior(mesh: Mesh): void {
        const hasDrag = mesh.behaviors.some(behavior => behavior instanceof PointerDragBehavior);
        if (!hasDrag) {
            behaviorManager.addDragBehavior(mesh);
        }
    }    
}

const behaviorManager = new BehaviorManager();
export default behaviorManager;