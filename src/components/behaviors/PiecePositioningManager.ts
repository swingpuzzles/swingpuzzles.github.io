import { Mesh, Quaternion, Vector3, Scalar } from "@babylonjs/core";
import meshHelpers from "../common/MeshHelpers";
import ctx from "../common/SceneContext";
import gameModeManager from "./GameModeManager";

class PiecePositioningManager {
    constructor() {
    }

    init() {
        ctx.scene.onBeforeRenderObservable.add(() => this.checkPiecePositions());
    }

    checkPiecePositions(): void {
        if (!gameModeManager.solveMode) {
            return;
        }

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
    
            const element = (ctx.polygonMap.get(piece)?.getChildMeshes()[0] || piece) as Mesh;

            const edgePosMinX = helpThis.getEdgePosition(element, (edge, pos) => pos.x - ctx.pieceWidthHalf < edge.x);
            const edgePosMaxX = helpThis.getEdgePosition(element, (edge, pos) => pos.x + ctx.pieceWidthHalf > edge.x);
            const edgePosMinZ = helpThis.getEdgePosition(element, (edge, pos) => pos.z - ctx.pieceDepthHalf < edge.z);
            const edgePosMaxZ = helpThis.getEdgePosition(element, (edge, pos) => pos.z + ctx.pieceDepthHalf > edge.z);
            const edgePosMinY = helpThis.getEdgePosition(element, (edge, pos) => pos.y - ctx.pieceHeightHalf < edge.y);
    
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
                piece.position.y += Math.max(0.2, ctx.minY - edgePosMinY.y + ctx.pieceHeightHalf + 0.2);
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

const piecePositioningManager = new PiecePositioningManager();
export default piecePositioningManager;
