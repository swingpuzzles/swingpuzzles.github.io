import { Quaternion, Vector3 } from "@babylonjs/core";
import ctx from "./SceneContext";
class MeshHelpers {
    constructor() {
    }
    areMeshesRelated(meshA, meshB) {
        const ancestorA = this.getTopParent(meshA);
        const ancestorB = this.getTopParent(meshB);
        return ancestorA === ancestorB;
    }
    getAllRelated(mesh) {
        const rootMesh = this.getTopParent(mesh);
        return this.getAllChildren(rootMesh);
    }
    getTopParent(mesh) {
        while (mesh.parent && ctx.piecesMap.has(mesh.parent)) {
            mesh = mesh.parent;
        }
        return mesh;
    }
    getAllChildren(mesh) {
        let children = [];
        for (const ch of mesh.getChildren()) {
            children = [...children, ...this.getAllChildren(ch)];
        }
        return [mesh, ...children];
    }
    excludeFromParent(mesh) {
        if (!mesh.parent)
            return;
        const parent = mesh.parent;
        mesh.computeWorldMatrix(true);
        const worldPosition = mesh.getAbsolutePosition();
        const worldRotation = new Quaternion();
        mesh.getWorldMatrix().decompose(undefined, worldRotation, undefined);
        mesh.parent = null;
        mesh.position = worldPosition;
        mesh.rotationQuaternion = worldRotation;
        mesh.computeWorldMatrix(true);
        mesh.refreshBoundingInfo();
        parent.computeWorldMatrix(true);
        parent.refreshBoundingInfo();
    }
    makeChildrenSiblings(mesh) {
        if (!mesh.parent) {
            console.warn("The mesh has no parent. Children cannot become siblings.");
            return;
        }
        const parent = mesh.parent;
        mesh.computeWorldMatrix(true);
        mesh.getChildMeshes().forEach(child => {
            child.computeWorldMatrix(true);
            const worldPosition = child.getAbsolutePosition();
            const worldRotation = new Quaternion();
            child.getWorldMatrix().decompose(undefined, worldRotation, undefined);
            child.parent = parent;
            const invParentMatrix = parent.getWorldMatrix().invert();
            child.position = Vector3.TransformCoordinates(worldPosition, invParentMatrix);
            child.rotationQuaternion = parent.rotationQuaternion
                ? parent.rotationQuaternion.invert().multiply(worldRotation)
                : worldRotation;
        });
    }
    teleportMesh(mesh, newPosition) {
        var _a;
        const body = (_a = mesh.physicsAggregate) === null || _a === void 0 ? void 0 : _a.body;
        if (!body)
            return;
        // Enable pre-step to allow the physics engine to update the body's transform
        body.disablePreStep = true;
        // Set the new position
        mesh.position.copyFrom(newPosition);
        // Disable pre-step after the update
        body.disablePreStep = false;
    }
    teleportMeshWithFunction(mesh, posChangeFunction) {
        var _a;
        const body = (_a = mesh.physicsAggregate) === null || _a === void 0 ? void 0 : _a.body;
        if (!body) {
            return;
        }
        // Enable pre-step to allow the physics engine to update the body's transform
        body.disablePreStep = true;
        // Set the new position
        posChangeFunction(mesh);
        // Disable pre-step after the update
        body.disablePreStep = false;
    }
}
const meshHelpers = new MeshHelpers();
export default meshHelpers;
