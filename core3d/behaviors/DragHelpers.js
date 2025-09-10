import { MeshBuilder, PointerDragBehavior, Quaternion, Vector3 } from "@babylonjs/core";
import ctx from "../common/SceneContext";
import meshHelpers from "../common/MeshHelpers";
import dragPolygonBuilder from "../builders/DragPolygonBuilder";
import celebrationAnimation from "../animations/CelebrationAnimation";
import puzzleGameBuilder from "../builders/PuzzleGameBuilder";
import gameModeManager from "./GameModeManager";
class DragHelpers {
    removeDragBehavior(mesh) {
        const behaviors = mesh.behaviors.slice();
        for (const behavior of behaviors) {
            if (behavior instanceof PointerDragBehavior) {
                mesh.removeBehavior(behavior);
            }
        }
    }
    disableDragBehavior(dragBehavior) {
        dragBehavior.enabled = false;
    }
    arePiecesJoining(meshA, meshB) {
        const dataA = ctx.piecesMap.get(meshA);
        const dataB = ctx.piecesMap.get(meshB);
        const origRelativePosXZ = new Vector3(dataA.origPos.x - dataB.origPos.x, 0, dataA.origPos.z - dataB.origPos.z);
        const currentRelativePosXZ = new Vector3(meshA.getAbsolutePosition().x - meshB.getAbsolutePosition().x, 0, meshA.getAbsolutePosition().z - meshB.getAbsolutePosition().z);
        const posEpsilon = 2;
        const rotEpsilon = 1;
        const identityQuaternion = Quaternion.Identity();
        const positionMatch = Vector3.Distance(origRelativePosXZ, currentRelativePosXZ) < posEpsilon;
        const rotationMatch = Quaternion.Dot(meshA.rotationQuaternion, identityQuaternion) > 1 - rotEpsilon &&
            Quaternion.Dot(meshB.rotationQuaternion, identityQuaternion) > 1 - rotEpsilon;
        return positionMatch && rotationMatch;
    }
    parentUpMeshes(mesh, parent) {
        const neighbourTopParent = meshHelpers.getTopParent(parent);
        this.clearPhysics(neighbourTopParent);
        this.clearPhysics(mesh);
        mesh.setParent(neighbourTopParent);
        mesh.rotationQuaternion = Quaternion.Identity();
        neighbourTopParent.rotationQuaternion = Quaternion.Identity();
        const data = ctx.piecesMap.get(mesh);
        const ntData = ctx.piecesMap.get(neighbourTopParent);
        mesh.position.x = data.origPos.x - ntData.origPos.x;
        mesh.position.z = data.origPos.z - ntData.origPos.z;
        mesh.computeWorldMatrix(true);
        mesh.refreshBoundingInfo();
        meshHelpers.makeChildrenSiblings(mesh);
        dragHelpers.removeDragBehavior(neighbourTopParent);
        dragHelpers.removeDragBehavior(mesh);
        return neighbourTopParent;
    }
    clearPhysics(mesh) {
        if (mesh.physicsAggregate) {
            mesh.physicsAggregate.dispose();
            mesh.physicsAggregate = undefined;
        }
        if (mesh.physicsBody) {
            mesh.physicsBody.dispose();
            mesh.physicsBody = undefined;
        }
        if (mesh.physicsShape) {
            mesh.physicsShape.dispose();
            mesh.physicsShape = undefined;
        }
    }
    getNeighbours(mesh) {
        const data = ctx.piecesMap.get(mesh);
        const neighbours = [];
        if (data.xIndex > 0)
            neighbours.push(ctx.piecesArray[data.xIndex - 1][data.zIndex]);
        if (data.xIndex < ctx.numX - 1)
            neighbours.push(ctx.piecesArray[data.xIndex + 1][data.zIndex]);
        if (data.zIndex > 0)
            neighbours.push(ctx.piecesArray[data.xIndex][data.zIndex - 1]);
        if (data.zIndex < ctx.numZ - 1)
            neighbours.push(ctx.piecesArray[data.xIndex][data.zIndex + 1]);
        return neighbours;
    }
    joinPieces(draggedTop, matchedNeighbour) {
        dragHelpers.removeDragBehavior(draggedTop);
        const neighbourTopParent = dragHelpers.parentUpMeshes(draggedTop, matchedNeighbour);
        let polygon = dragPolygonBuilder.makePolygon(neighbourTopParent);
        const helpBox = MeshBuilder.CreateBox("box", { width: 0.5, height: 0.5, depth: 0.5 }, ctx.scene);
        helpBox.position = polygon.getBoundingInfo().boundingBox.centerWorld.clone();
        helpBox.visibility = 0;
        const oldParent = neighbourTopParent.parent;
        neighbourTopParent.setParent(helpBox);
        if (oldParent) {
            let oldPolygon = ctx.helpBoxMap.get(oldParent);
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
            const delayModeSwitchCoroutine = function* () {
                yield;
                gameModeManager.enterCelebrationMode();
                celebrationAnimation.animate(puzzleGameBuilder.underCoverMeshes[0]);
            };
            ctx.scene.onBeforeRenderObservable.runCoroutineAsync(delayModeSwitchCoroutine());
        }
        return polygon;
    }
}
const dragHelpers = new DragHelpers();
export default dragHelpers;
