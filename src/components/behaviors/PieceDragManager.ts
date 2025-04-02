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
                const data = ctx.piecesMap.get(draggedNode)!;

                const neighbours: Mesh[] = [];
                if (data.xIndex > 0) neighbours.push(ctx.piecesArray[data.xIndex - 1][data.zIndex]);
                if (data.xIndex < ctx.numX - 1) neighbours.push(ctx.piecesArray[data.xIndex + 1][data.zIndex]);
                if (data.zIndex > 0) neighbours.push(ctx.piecesArray[data.xIndex][data.zIndex - 1]);
                if (data.zIndex < ctx.numZ - 1) neighbours.push(ctx.piecesArray[data.xIndex][data.zIndex + 1]);

                for (const n of neighbours) {
                    if (meshHelpers.areMeshesRelated(n, draggedNode)) continue;

                    const nData = ctx.piecesMap.get(n)!;
                    const origRelativePosXZ = new Vector3(
                        data.origPos.x - nData.origPos.x,
                        0,
                        data.origPos.z - nData.origPos.z
                    );

                    const currentRelativePosXZ = new Vector3(
                        draggedNode.getAbsolutePosition().x - n.getAbsolutePosition().x,
                        0,
                        draggedNode.getAbsolutePosition().z - n.getAbsolutePosition().z
                    );

                    const posEpsilon = 2;
                    const rotEpsilon = 1;

                    const identityQuaternion = Quaternion.Identity();
                    const positionMatch = Vector3.Distance(origRelativePosXZ, currentRelativePosXZ) < posEpsilon;
                    const rotationMatch =
                        Quaternion.Dot(draggedNode.rotationQuaternion!, identityQuaternion) > 1 - rotEpsilon &&
                        Quaternion.Dot(n.rotationQuaternion!, identityQuaternion) > 1 - rotEpsilon;

                    if (positionMatch && rotationMatch) {
                        dragHelpers.removeDragBehavior(draggedNode);

                        const neighbourTopParent = meshHelpers.getTopParent(n);

                        if (neighbourTopParent.physicsImpostor) {
                            neighbourTopParent.physicsImpostor.dispose();
                            neighbourTopParent.physicsImpostor = null;
                        }

                        draggedNode.setParent(neighbourTopParent);
                        draggedNode.rotationQuaternion = identityQuaternion;
                        neighbourTopParent.rotationQuaternion = identityQuaternion;

                        const ntData = ctx.piecesMap.get(neighbourTopParent)!;
                        draggedNode.position.x = data.origPos.x - ntData.origPos.x;
                        draggedNode.position.z = data.origPos.z - ntData.origPos.z;

                        draggedNode.computeWorldMatrix(true);
                        draggedNode.refreshBoundingInfo();

                        meshHelpers.makeChildrenSiblings(draggedNode);
                        dragHelpers.removeDragBehavior(neighbourTopParent);
                        let polygon = dragPolygonBuilder.makePolygon(neighbourTopParent);

                        const helpBox = MeshBuilder.CreateBox("box", { width: 0.5, height: 0.5, depth: 0.5 }, ctx.scene);
            
                        helpBox.position = polygon.getBoundingInfo().boundingBox.centerWorld.clone();

                        neighbourTopParent.setParent(helpBox, true);
            
                        ctx.helpBoxMap.set(helpBox, polygon);
                        ctx.polygonMap.set(polygon, helpBox);

                        ctx.jigsawPieces.push(polygon);
                    console.log('new polygon', polygon);
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