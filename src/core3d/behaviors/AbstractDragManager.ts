import { Mesh, PointerDragBehavior, Vector2, Vector3 } from "@babylonjs/core";
import rotationToZeroAnimation from "../animations/RotationToZeroAnimation";
import ctx from "../common/SceneContext";
import dragHelpers from "./DragHelpers";
import meshHelpers from "../common/MeshHelpers";
import physicsAggregateBuilder from "../builders/PhysicsAggregateBuilder";

abstract class AbstractDragManager {
    addDragBehavior(mesh: Mesh): void {
        const dragBehavior = new PointerDragBehavior({ dragPlaneNormal: new Vector3(0, 1, 0) });
        dragBehavior.useObjectOrientationForDragging = false;
    
        dragBehavior.onDragStartObservable.add(() => {
            let draggedNode = dragBehavior.attachedNode as Mesh;
            rotationToZeroAnimation.animate(draggedNode);
    
            if (draggedNode.physicsAggregate) {
                draggedNode.physicsAggregate.dispose();
                draggedNode.physicsAggregate = undefined;
            }
        });
    
        dragBehavior.onDragEndObservable.add(() => {
            let draggedNode = dragBehavior.attachedNode as Mesh;
            ctx.scene.stopAnimation(draggedNode);
            draggedNode.animations = [];
    
            if (draggedNode) {
                this.doDrop(draggedNode);
            }
        });
    
        mesh.addBehavior(dragBehavior);
    }

    tryJoin(toJoin: Mesh, topPiece: Mesh): Mesh | null {
        for (const n of dragHelpers.getNeighbours(toJoin)) {
            if (meshHelpers.areMeshesRelated(n, toJoin)) continue;

            if (dragHelpers.arePiecesJoining(toJoin, n)) {
                return dragHelpers.joinPieces(topPiece, n);
            }
        }

        return null;
    }

    reorderPieces(polygon: Mesh, newMatch : boolean): void {
        const helpBox = ctx.polygonMap.get(polygon)!;
        const topPiece = helpBox.getChildMeshes()[0] as Mesh;
        const childrenCount = topPiece.getChildMeshes().length;
    
        polygon.computeWorldMatrix(true);
        polygon.refreshBoundingInfo();
    
        const boundingInfo = polygon.getBoundingInfo();
        const boundingBox = boundingInfo.boundingBox;
        const min = boundingBox.minimumWorld;
        const max = boundingBox.maximumWorld;
    
        const minXZ = new Vector2(min.x, min.z);
        const maxXZ = new Vector2(max.x, max.z);

        if (newMatch) {
            const newPos = polygon.position.clone();
            newPos.y = Math.min(ctx.minY + 1, polygon.position.y);
            meshHelpers.teleportMesh(polygon, newPos);
         }

        const flippedOf = polygon.position.y - ctx.minY;
    
        ctx.jigsawPieces.forEach(piece => {
            if (piece.parent) {
                return;
            }
            
            const element = (ctx.polygonMap.get(piece)?.getChildMeshes()[0] || piece) as Mesh;

            if (element.getChildMeshes().length < childrenCount) {
    
                piece.computeWorldMatrix(true);
                piece.refreshBoundingInfo();
    
                const pieceBounds = piece.getBoundingInfo().boundingBox;
                const pieceMin = pieceBounds.minimumWorld;
                const pieceMax = pieceBounds.maximumWorld;
    
                const pieceMinXZ = new Vector2(pieceMin.x, pieceMin.z);
                const pieceMaxXZ = new Vector2(pieceMax.x, pieceMax.z);
    
                // Check XZ plane overlap
                const intersectsXZ =
                    pieceMaxXZ.x >= minXZ.x &&
                    pieceMinXZ.x <= maxXZ.x &&
                    pieceMaxXZ.y >= minXZ.y &&
                    pieceMinXZ.y <= maxXZ.y;
    
                if (intersectsXZ) {
                    const newPos = piece.position.clone();
                    newPos.y += flippedOf + 1;
                    meshHelpers.teleportMesh(piece, newPos);
                }
            }
        });
    }

    abstract doDrop(draggedNode: Mesh) : void;
}

export default AbstractDragManager;