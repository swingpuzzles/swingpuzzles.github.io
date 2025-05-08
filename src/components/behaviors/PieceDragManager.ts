import { Mesh } from "@babylonjs/core";
import physicsAggregateBuilder from "../builders/PhysicsAggregateBuilder";
import AbstractDragManager from "./AbstractDragManager";

class PieceDragManager extends AbstractDragManager {

    doDrop(draggedNode: Mesh): void {
        const polygon = this.tryJoin(draggedNode, draggedNode);
        
        if (polygon) {
            this.reorderPieces(polygon, true);
            return;
        }

        if (!draggedNode.physicsAggregate && !draggedNode.parent) {
            physicsAggregateBuilder.attachPuzzlePieceAggregate(draggedNode);
        }
    }
}

const pieceDragManager = new PieceDragManager();
export default pieceDragManager;