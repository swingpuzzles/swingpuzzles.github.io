import { Mesh, PointerDragBehavior, Quaternion, Vector3 } from "@babylonjs/core";
import ctx from "../common/SceneContext";
import meshHelpers from "../common/MeshHelpers";

class DragHelpers {
    removeDragBehavior(mesh: Mesh): void {
        const behaviors = mesh.behaviors.slice();
        for (const behavior of behaviors) {
            if (behavior instanceof PointerDragBehavior) {
                mesh.removeBehavior(behavior);
            }
        }
    }

    arePiecesJoining(meshA: Mesh, meshB: Mesh): boolean {
        const dataA = ctx.piecesMap.get(meshA)!;
        const dataB = ctx.piecesMap.get(meshB)!;

        const origRelativePosXZ = new Vector3(
            dataA.origPos.x - dataB.origPos.x,
            0,
            dataA.origPos.z - dataB.origPos.z
        );

        const currentRelativePosXZ = new Vector3(
            meshA.getAbsolutePosition().x - meshB.getAbsolutePosition().x,
            0,
            meshA.getAbsolutePosition().z - meshB.getAbsolutePosition().z
        );

        const posEpsilon = 2;
        const rotEpsilon = 1;

        const identityQuaternion = Quaternion.Identity();
        const positionMatch = Vector3.Distance(origRelativePosXZ, currentRelativePosXZ) < posEpsilon;
        const rotationMatch =
            Quaternion.Dot(meshA.rotationQuaternion!, identityQuaternion) > 1 - rotEpsilon &&
            Quaternion.Dot(meshB.rotationQuaternion!, identityQuaternion) > 1 - rotEpsilon;

        return positionMatch && rotationMatch;
    }

    parentUpMeshes(mesh: Mesh, parent: Mesh): Mesh {
        const neighbourTopParent = meshHelpers.getTopParent(parent);

        if (neighbourTopParent.physicsImpostor) {
            neighbourTopParent.physicsImpostor.dispose();
            neighbourTopParent.physicsImpostor = null;
        }

        mesh.setParent(neighbourTopParent);
        mesh.rotationQuaternion = Quaternion.Identity();
        neighbourTopParent.rotationQuaternion = Quaternion.Identity();

        const data = ctx.piecesMap.get(mesh)!;
        const ntData = ctx.piecesMap.get(neighbourTopParent)!;
        mesh.position.x = data.origPos.x - ntData.origPos.x;
        mesh.position.z = data.origPos.z - ntData.origPos.z;

        mesh.computeWorldMatrix(true);
        mesh.refreshBoundingInfo();

        meshHelpers.makeChildrenSiblings(mesh);
        dragHelpers.removeDragBehavior(neighbourTopParent);

        return neighbourTopParent;
    }

    getNeighbours(mesh: Mesh): Mesh[] {
        const data = ctx.piecesMap.get(mesh)!;
        const neighbours: Mesh[] = [];

        if (data.xIndex > 0) neighbours.push(ctx.piecesArray[data.xIndex - 1][data.zIndex]);
        if (data.xIndex < ctx.numX - 1) neighbours.push(ctx.piecesArray[data.xIndex + 1][data.zIndex]);
        if (data.zIndex > 0) neighbours.push(ctx.piecesArray[data.xIndex][data.zIndex - 1]);
        if (data.zIndex < ctx.numZ - 1) neighbours.push(ctx.piecesArray[data.xIndex][data.zIndex + 1]);

        return neighbours;
    }
}

const dragHelpers = new DragHelpers();
export default dragHelpers;