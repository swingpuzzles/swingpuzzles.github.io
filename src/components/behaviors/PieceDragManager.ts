import { Mesh } from "@babylonjs/core";
import physicsImpostorBuilder from "../builders/PhysicsImpostorBuilder";
import AbstractDragManager from "./AbstractDragManager";

class PieceDragManager extends AbstractDragManager {

    doDrop(draggedNode: Mesh): void {
        if (this.tryJoin(draggedNode, draggedNode)) {
            return;
        }

        if (!draggedNode.physicsImpostor && !draggedNode.parent) {
            physicsImpostorBuilder.attachDragPolygonImpostor(draggedNode);
        }
    }
}

const pieceDragManager = new PieceDragManager();
export default pieceDragManager;