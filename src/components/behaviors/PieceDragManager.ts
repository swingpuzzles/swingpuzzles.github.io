import { Mesh, MeshBuilder, PhysicsImpostor, PointerDragBehavior, Vector3 } from "@babylonjs/core";
import ctx from "../common/SceneContext";
import dragHelpers from "./DragHelpers";
import dragPolygonBuilder from "../builders/DragPolygonBuilder";
import rotationToZeroAnimation from "../animations/RotationToZeroAnimation";
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