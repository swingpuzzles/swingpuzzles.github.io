import { Mesh, MeshBuilder, PhysicsImpostor, PointerDragBehavior, Vector3 } from "@babylonjs/core";
import ctx from "../common/SceneContext";
import dragHelpers from "./DragHelpers";
import dragPolygonBuilder from "../builders/DragPolygonBuilder";
import rotationToZeroAnimation from "../animations/RotationToZeroAnimation";
import physicsImpostorBuilder from "../builders/PhysicsImpostorBuilder";

class PolygonDragManager {
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
                for (const n of dragHelpers.getNeighbours(draggedNode)) {
                    if (dragHelpers.arePiecesJoining(draggedNode, n)) {
                        dragHelpers.removeDragBehavior(draggedNode);

                        
                        const neighbourTopParent = dragHelpers.parentUpMeshes(draggedNode, n);

                        let polygon = dragPolygonBuilder.makePolygon(neighbourTopParent);

                        const helpBox = MeshBuilder.CreateBox("box", { width: 0.5, height: 0.5, depth: 0.5 }, ctx.scene);
            
                        helpBox.position = polygon.getBoundingInfo().boundingBox.centerWorld.clone();

                        const oldParent = neighbourTopParent.parent as Mesh;

                        neighbourTopParent.setParent(helpBox);

                        if (oldParent) {
                            let oldPolygon = ctx.helpBoxMap.get(oldParent)!;
                            ctx.helpBoxMap.delete(oldPolygon);
                            ctx.polygonMap.delete(oldParent);
                            oldPolygon.dispose();
                            ctx.jigsawPieces.splice(ctx.jigsawPieces.indexOf(oldPolygon), 1);
                            oldParent.dispose();
                        }
            
                        ctx.helpBoxMap.set(helpBox, polygon);
                        ctx.polygonMap.set(polygon, helpBox);

                        ctx.jigsawPieces.push(polygon);

                        if (neighbourTopParent.getChildren().length + 1 === ctx.piecesCount) {
                            alert("Job done!");
                        }

                        return;
                    }
                }
    
                if (!draggedNode.physicsImpostor && !draggedNode.parent) {
                    physicsImpostorBuilder.attachDragPolygonImpostor(draggedNode);
                }
            }
        });
    
        mesh.addBehavior(dragBehavior);
    }
}

const polygonDragManager = new PolygonDragManager();
export default polygonDragManager;