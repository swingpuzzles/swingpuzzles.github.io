import { Mesh, Quaternion, Vector3, Scalar } from "@babylonjs/core";
import meshHelpers from "../common/MeshHelpers";
import ctx from "../common/SceneContext";

class BehaviorManager {
    constructor() {
    }

    init() {
        ctx.scene.onBeforeRenderObservable.add(() => this.checkPiecePositions());
    }

    checkPiecePositions(): void {
        for (const [helpBox, polygon] of ctx.helpBoxMap.entries()) {
            helpBox.position = polygon.getBoundingInfo().boundingBox.centerWorld.clone();
            helpBox.rotationQuaternion = polygon.rotationQuaternion!.clone();
        }
    
        const helpThis = this;
        ctx.jigsawPieces.forEach(piece => {
            const pieceData = ctx.piecesMap.get(piece);

            if (pieceData) {
                const shapeMesh = pieceData.shapeMesh;
        
                piece.computeWorldMatrix(true);
                shapeMesh.position.copyFrom(piece.getAbsolutePosition());
        
                const worldMatrix = piece.getWorldMatrix();
                const absoluteRotation = new Quaternion();
                worldMatrix.decompose(undefined, absoluteRotation, undefined);
                shapeMesh.rotationQuaternion = absoluteRotation;
            }
    
            if (piece.parent) {
                piece.position.y = -0.1;
                piece.rotationQuaternion = Quaternion.Identity();
                return;
            }

            const boundingbox = piece.getBoundingInfo().boundingBox;
            const widthHalf = (boundingbox.maximum.x - boundingbox.minimum.x) / 2;
            const depthHalf = (boundingbox.maximum.z - boundingbox.minimum.z) / 2;
            const heightHalf = (boundingbox.maximum.y - boundingbox.minimum.y) / 2;
    
            const element = (ctx.polygonMap.get(piece)?.getChildMeshes()[0] || piece) as Mesh;

            const edgePosMinX = helpThis.getEdgePosition(element, (edge, pos) => pos.x - widthHalf < edge.x);
            const edgePosMaxX = helpThis.getEdgePosition(element, (edge, pos) => pos.x + widthHalf > edge.x);
            const edgePosMinZ = helpThis.getEdgePosition(element, (edge, pos) => pos.z - depthHalf < edge.z);
            const edgePosMaxZ = helpThis.getEdgePosition(element, (edge, pos) => pos.z + depthHalf > edge.z);
            const edgePosMinY = helpThis.getEdgePosition(element, (edge, pos) => pos.y - heightHalf < edge.y);
    
            let edgePos: Vector3 | null = null;
    
            if (edgePosMinX.x - widthHalf < ctx.minX) {
                piece.position.x += 0.2;
                edgePos = edgePosMinX;
            } else if (edgePosMaxX.x + widthHalf > ctx.maxX) {
                piece.position.x -= 0.2;
                edgePos = edgePosMaxX;
            } else if (edgePosMinZ.z - depthHalf < ctx.minZ) {
                piece.position.z += 0.2;
                edgePos = edgePosMinZ;
            } else if (edgePosMaxZ.z + depthHalf > ctx.maxZ) {
                piece.position.z -= 0.2;
                edgePos = edgePosMaxZ;
            } else if (edgePosMinY.y - heightHalf < ctx.minY - 0.1) {
                piece.position.y += 0.2;
                edgePos = edgePosMinY;
            } else {
                return;
            }
    
            const centerPoint = new Vector3((ctx.maxX + ctx.minX) / 2, 20 - ctx.minY, (ctx.maxZ + ctx.minZ) / 2);
            const directionToCenter = centerPoint.subtract(edgePos).normalize();
    
            if (piece.physicsImpostor) {
                const power = pieceData ? 1.5 : 0.4;

                piece.physicsImpostor.setLinearVelocity(Vector3.Zero());
                const centerImpulse = directionToCenter.scale(power);
                piece.physicsImpostor.applyImpulse(centerImpulse, edgePos);
    
                if (pieceData) {
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
