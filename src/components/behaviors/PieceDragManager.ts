import { Mesh, MeshBuilder, PhysicsImpostor, PointerDragBehavior, QuadraticEase, Quaternion, Vector3, Animation, EasingFunction } from "@babylonjs/core";
import ctx from "../common/SceneContext";
import meshHelpers from "../common/MeshHelpers";
import dragHelpers from "./DragHelpers";
import dragPolygonBuilder from "../builders/DragPolygonBuilder";
import rotationToZeroAnimation from "../animations/RotationToZeroAnimation";

class PieceDragManager {
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

                        neighbourTopParent.setParent(helpBox, true);
            
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
                    draggedNode.physicsImpostor = new PhysicsImpostor(
                        draggedNode,
                        PhysicsImpostor.BoxImpostor,
                        { mass: 0.1, friction: 0.7, restitution: 0.01 },
                        ctx.scene
                    );
                }
            }
        });
    
        mesh.addBehavior(dragBehavior);
    }
}

const pieceDragManager = new PieceDragManager();
export default pieceDragManager;