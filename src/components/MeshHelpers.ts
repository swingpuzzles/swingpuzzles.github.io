import { Mesh, Quaternion, Vector3 } from "@babylonjs/core";

class MeshHelpers {
    private piecesMap: Map<Mesh, {
        origPos: Vector3;
        xIndex: number;
        zIndex: number;
        shapeMesh: Mesh;
    }> | null = null;

    constructor() {
    }

    init(piecesMap: Map<Mesh, {
        origPos: Vector3;
        xIndex: number;
        zIndex: number;
        shapeMesh: Mesh;
    }>): void {
        this.piecesMap = piecesMap;
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
        while (mesh.parent && this.piecesMap!.has(mesh.parent as Mesh)) {
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
}

const meshHelpers = new MeshHelpers();
export default meshHelpers;