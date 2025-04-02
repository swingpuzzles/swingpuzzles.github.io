import { Mesh, Quaternion, Vector3 } from "@babylonjs/core";
import ctx from "./SceneContext";

class MeshHelpers {
    constructor() {
    }

    areMeshesRelated(meshA: Mesh, meshB: Mesh): boolean {
        const ancestorA = this.getTopParent(meshA);
        const ancestorB = this.getTopParent(meshB);
        return ancestorA === ancestorB;
    }

    getAllRelated(mesh: Mesh): Mesh[] {
        const rootMesh = this.getTopParent(mesh);
        return this.getAllChildren(rootMesh);
    }

    getTopParent(mesh: Mesh): Mesh {
        while (mesh.parent && ctx.piecesMap.has(mesh.parent as Mesh)) {
            mesh = mesh.parent as Mesh;
        }
        return mesh;
    }

    getAllChildren(mesh: Mesh): Mesh[] {
        let children: Mesh[] = [];
        for (const ch of mesh.getChildren()) {
            children = [...children, ...this.getAllChildren(ch as Mesh)];
        }
        return [mesh, ...children];
    }

    excludeFromParent(mesh: Mesh): void {
        if (!mesh.parent) return;
    
        const parent = mesh.parent as Mesh;
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

    makeChildrenSiblings(mesh: Mesh): void {
        if (!mesh.parent) {
            console.warn("The mesh has no parent. Children cannot become siblings.");
            return;
        }
    
        const parent = mesh.parent as Mesh;
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
}

const meshHelpers = new MeshHelpers();
export default meshHelpers;