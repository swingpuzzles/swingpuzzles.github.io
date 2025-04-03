import { Mesh, PointerDragBehavior, Vector3 } from "@babylonjs/core";
import rotationToZeroAnimation from "../animations/RotationToZeroAnimation";
import ctx from "../common/SceneContext";
import dragHelpers from "./DragHelpers";
import meshHelpers from "../common/MeshHelpers";

abstract class AbstractDragManager {
    addDragBehavior(mesh: Mesh): void {
        const dragBehavior = new PointerDragBehavior({ dragPlaneNormal: new Vector3(0, 1, 0) });
        dragBehavior.useObjectOrientationForDragging = false;
    
        dragBehavior.onDragStartObservable.add(() => {
            let draggedNode = dragBehavior.attachedNode as Mesh;
            rotationToZeroAnimation.animate(draggedNode);
    
            if (draggedNode.physicsImpostor) {
                draggedNode.physicsImpostor.dispose();
                draggedNode.physicsImpostor = null;
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

    tryJoin(toJoin: Mesh, topPiece: Mesh): boolean {
        for (const n of dragHelpers.getNeighbours(toJoin)) {
            if (meshHelpers.areMeshesRelated(n, toJoin)) continue;

            if (dragHelpers.arePiecesJoining(toJoin, n)) {
                dragHelpers.joinPieces(topPiece, n);

                return true;
            }
        }

        return false;
    }

    abstract doDrop(draggedNode: Mesh) : void;
}

export default AbstractDragManager;