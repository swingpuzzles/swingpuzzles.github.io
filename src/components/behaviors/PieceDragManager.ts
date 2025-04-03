import { Mesh } from "@babylonjs/core";
import physicsImpostorBuilder from "../builders/PhysicsImpostorBuilder";
import AbstractDragManager from "./AbstractDragManager";

class PieceDragManager extends AbstractDragManager {

    doDrop(draggedNode: Mesh): void {
        const polygon = this.tryJoin(draggedNode, draggedNode);
        
        if (polygon) {
            this.reorderPieces(polygon, true);
            return;
        }

        if (!draggedNode.physicsImpostor && !draggedNode.parent) {
            physicsImpostorBuilder.attachDragPolygonImpostor(draggedNode);
        }
    }
}

const pieceDragManager = new PieceDragManager();
export default pieceDragManager;