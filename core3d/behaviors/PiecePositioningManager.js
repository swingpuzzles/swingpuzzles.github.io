import { Quaternion, Vector3, Scalar } from "@babylonjs/core";
import meshHelpers from "../common/MeshHelpers";
import ctx from "../common/SceneContext";
import gameModeManager from "./GameModeManager";
import normalizePositionRotationAnimation from "../animations/NormalizePositionRotationAnimation";
import polygonDragManager from "./PolygonDragManager";
class PiecePositioningManager {
    constructor() {
        this._initialized = false;
    }
    init() {
        if (!this._initialized) {
            ctx.scene.onBeforeRenderObservable.add(() => this.checkPiecePositions());
            this._initialized = true;
        }
    }
    checkPiecePositions() {
        if (!gameModeManager.solveMode && !gameModeManager.shakeMode) {
            return;
        }
        for (const [helpBox, polygon] of ctx.helpBoxMap.entries()) {
            helpBox.position = polygon.getBoundingInfo().boundingBox.centerWorld.clone();
            helpBox.rotationQuaternion = polygon.rotationQuaternion.clone();
        }
        const helpThis = this;
        ctx.jigsawPieces.forEach(piece => {
            var _a, _b;
            const pieceData = ctx.piecesMap.get(piece);
            const isPolygon = !pieceData;
            if (!isPolygon) {
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
            if (((_a = ctx.polygonMap.get(piece)) === null || _a === void 0 ? void 0 : _a.getChildMeshes()[0]) && !isPolygon) {
                console.error("Piece has a child mesh, but is not a polygon. This should not happen.");
            }
            const basicPiece = (((_b = ctx.polygonMap.get(piece)) === null || _b === void 0 ? void 0 : _b.getChildMeshes()[0]) || piece);
            const edgePosMinX = helpThis.getEdgePosition(basicPiece, (edge, pos) => pos.x - ctx.pieceWidthHalf < edge.x);
            const edgePosMaxX = helpThis.getEdgePosition(basicPiece, (edge, pos) => pos.x + ctx.pieceWidthHalf > edge.x);
            const edgePosMinZ = helpThis.getEdgePosition(basicPiece, (edge, pos) => pos.z - ctx.pieceDepthHalf < edge.z);
            const edgePosMaxZ = helpThis.getEdgePosition(basicPiece, (edge, pos) => pos.z + ctx.pieceDepthHalf > edge.z);
            const edgePosMinY = helpThis.getEdgePosition(basicPiece, (edge, pos) => pos.y - ctx.pieceHeightHalf < edge.y);
            if (piece.physicsAggregate) {
                if (isPolygon) {
                    if ((edgePosMinX.x - ctx.pieceWidthHalf < ctx.minX)
                        || (edgePosMaxX.x + ctx.pieceWidthHalf > ctx.maxX)
                        || (edgePosMinZ.z - ctx.pieceDepthHalf < ctx.minZ)
                        || (edgePosMaxZ.z + ctx.pieceDepthHalf > ctx.maxZ)
                        || (edgePosMinY.y - ctx.pieceHeightHalf < ctx.minY - 0.1)) {
                        normalizePositionRotationAnimation.destinationX = (ctx.minX + ctx.maxX) * 0.5 - (edgePosMinX.x + edgePosMaxX.x) * 0.5 + piece.position.x;
                        normalizePositionRotationAnimation.destinationZ = (ctx.minZ + ctx.maxZ) * 0.5 - (edgePosMinZ.z + edgePosMaxZ.z) * 0.5 + piece.position.z;
                        if (piece.physicsAggregate) {
                            piece.physicsAggregate.dispose();
                            piece.physicsAggregate = undefined;
                        }
                        normalizePositionRotationAnimation.animate(piece, () => {
                            polygonDragManager.doDrop(piece);
                        });
                    }
                }
                else {
                    let edgePos = null;
                    if (edgePosMinX.x - ctx.pieceWidthHalf < ctx.minX) {
                        this.handleElementMove(piece, (el) => { el.position.x += 0.2; }, isPolygon);
                        edgePos = edgePosMinX;
                    }
                    else if (edgePosMaxX.x + ctx.pieceWidthHalf > ctx.maxX) {
                        this.handleElementMove(piece, (el) => { el.position.x -= 0.2; }, isPolygon);
                        edgePos = edgePosMaxX;
                    }
                    else if (edgePosMinZ.z - ctx.pieceDepthHalf < ctx.minZ) {
                        this.handleElementMove(piece, (el) => { el.position.z += 0.2; }, isPolygon);
                        edgePos = edgePosMinZ;
                    }
                    else if (edgePosMaxZ.z + ctx.pieceDepthHalf > ctx.maxZ) {
                        this.handleElementMove(piece, (el) => { el.position.z -= 0.2; }, isPolygon);
                        edgePos = edgePosMaxZ;
                    }
                    else if (edgePosMinY.y - ctx.pieceHeightHalf < ctx.minY - 0.1) {
                        this.handleElementMove(piece, (el) => { el.position.y += Math.max(0.2, ctx.minY - edgePosMinY.y + ctx.pieceHeightHalf + 0.2); }, isPolygon);
                        edgePos = edgePosMinY;
                    }
                    else {
                        return;
                    }
                    const centerPoint = new Vector3((ctx.maxX + ctx.minX) / 2, 20 - ctx.minY, (ctx.maxZ + ctx.minZ) / 2);
                    const directionToCenter = centerPoint.subtract(edgePos).normalize();
                    const power = 1.5;
                    const body = piece.physicsAggregate.body;
                    if (!body)
                        return;
                    body.setLinearVelocity(Vector3.Zero());
                    const centerImpulse = directionToCenter.scale(power);
                    body.applyImpulse(centerImpulse, edgePos);
                    const maxAngularSpeed = 1;
                    const angularVelocity = body.getAngularVelocity();
                    if (angularVelocity) {
                        angularVelocity.x = Scalar.Clamp(angularVelocity.x, -maxAngularSpeed, maxAngularSpeed);
                        angularVelocity.y = Scalar.Clamp(angularVelocity.y, -maxAngularSpeed, maxAngularSpeed);
                        angularVelocity.z = Scalar.Clamp(angularVelocity.z, -maxAngularSpeed, maxAngularSpeed);
                        body.setAngularVelocity(angularVelocity);
                    }
                }
            }
        });
    }
    handleElementMove(element, posChangeFunction, isPolygon) {
        meshHelpers.teleportMeshWithFunction(element, posChangeFunction);
    }
    getEdgePosition(mesh, func) {
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
