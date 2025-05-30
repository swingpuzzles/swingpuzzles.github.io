import { Mesh } from "@babylonjs/core";
import ctx from "../common/SceneContext";
import physicsAggregateBuilder from "../builders/PhysicsAggregateBuilder";
import AbstractDragManager from "./AbstractDragManager";

class PolygonDragManager extends AbstractDragManager {

    doDrop(draggedNode: Mesh): void {
        const helpBox = ctx.polygonMap.get(draggedNode)!;
        const topPiece = helpBox.getChildMeshes()[0] as Mesh;

        for (const piece of [...topPiece.getChildren(), topPiece]) {
            const newPolygon = this.tryJoin(piece as Mesh, topPiece);
            
            if (newPolygon) {
                ctx.helpBoxMap.delete(draggedNode);
                ctx.polygonMap.delete(helpBox);
                draggedNode.dispose();
                ctx.jigsawPieces.splice(ctx.jigsawPieces.indexOf(draggedNode), 1);
                helpBox.dispose();

                this.reorderPieces(newPolygon, true);

                return;
            }
        }

        this.reorderPieces(draggedNode, false);

        if (!draggedNode.physicsAggregate && !draggedNode.parent) {
            physicsAggregateBuilder.attachPuzzlePieceAggregate(draggedNode);
        }
    }
}

const polygonDragManager = new PolygonDragManager();
export default polygonDragManager;