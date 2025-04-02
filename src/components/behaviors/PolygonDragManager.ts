import { Mesh } from "@babylonjs/core";
import ctx from "../common/SceneContext";
import physicsImpostorBuilder from "../builders/PhysicsImpostorBuilder";
import AbstractDragManager from "./AbstractDragManager";

class PolygonDragManager extends AbstractDragManager {

    doDrop(draggedNode: Mesh): void {
        const helpBox = ctx.polygonMap.get(draggedNode)!;
        const topPiece = helpBox.getChildMeshes()[0] as Mesh;

        for (const piece of [...topPiece.getChildren(), topPiece]) {
            if (this.tryJoin(piece as Mesh, topPiece)) {
                ctx.helpBoxMap.delete(draggedNode);
                ctx.polygonMap.delete(helpBox);
                draggedNode.dispose();
                ctx.jigsawPieces.splice(ctx.jigsawPieces.indexOf(draggedNode), 1);
                helpBox.dispose();

                return;
            }
        }

        if (!draggedNode.physicsImpostor && !draggedNode.parent) {
            physicsImpostorBuilder.attachDragPolygonImpostor(draggedNode);
        }
    }
}

const polygonDragManager = new PolygonDragManager();
export default polygonDragManager;