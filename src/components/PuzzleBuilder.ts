import { Color3, CSG2, Mesh, MultiMaterial, Path2, PhysicsImpostor, PolygonMeshBuilder, Scene, StandardMaterial, SubMesh, Texture, Vector2, Vector3 } from "@babylonjs/core";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import * as earcut from "earcut";
import behaviorManager from "./BehaviorManager";
import ctx from "./SceneContext";
(window as any).earcut = earcut;


class PuzzleBuilder {
    constructor() {
    }

    createFlatBox(width: number, height: number, depth: number = 0.1): CSG2 {
        const box = MeshBuilder.CreateBox("box", { width, height, depth }, ctx.scene);
        box.rotation.x = -Math.PI / 2;
        box.position.y = -0.2;
    
        const multiMat = new MultiMaterial("multiMat", ctx.scene);
    
        const frontMaterial = new StandardMaterial("frontMat", ctx.scene);
        frontMaterial.diffuseTexture = new Texture("https://m.media-amazon.com/images/I/81BA14xBSAL._AC_SL1500_.jpg", ctx.scene);
    
        const backMaterial = new StandardMaterial("backMat", ctx.scene);
        const texture = new Texture("https://www.babylonjs-playground.com/textures/floor.png", ctx.scene);
        texture.uScale = 4;
        texture.vScale = 4;
        backMaterial.diffuseTexture = texture;
    
        const sideMaterial = new StandardMaterial("sideMat", ctx.scene);
        sideMaterial.diffuseColor = new Color3(1, 1, 1);
    
        multiMat.subMaterials.push(frontMaterial, backMaterial, sideMaterial);
        box.material = multiMat;
    
        box.subMeshes = [
            new SubMesh(0, 0, box.getTotalVertices(), 0, 6, box),
            new SubMesh(1, 0, box.getTotalVertices(), 6, 6, box),
            new SubMesh(2, 0, box.getTotalVertices(), 12, 24, box),
        ];
    
        const boxCSG = CSG2.FromMesh(box);
        box.dispose();
        return boxCSG;
    }
    
    createPuzzlePiece(edgeTop: boolean, edgeLeft: boolean, yPos: number): Mesh {
        const poly_path = new Path2(-1, -1);
        poly_path.addLineTo(-0.2, -1);
        poly_path.addArcTo(0, -1.5, 0.2, -1, 10);
        poly_path.addLineTo(1, -1);
        poly_path.addLineTo(1, -0.2);
        poly_path.addArcTo(1.5, 0, 1, 0.2, 10);
        poly_path.addLineTo(1, 1);
        if (!edgeTop) {
            poly_path.addLineTo(0.2, 1);
            poly_path.addArcTo(0, 0.5, -0.2, 1, 10);
        }
        poly_path.addLineTo(-1, 1);
        if (!edgeLeft) {
            poly_path.addLineTo(-1, 0.2);
            poly_path.addArcTo(-0.5, 0, -1, -0.2, 10);
        }
        const poly_tri2 = new PolygonMeshBuilder("polytri2", poly_path, ctx.scene, earcut.default);
        //poly_tri2.bjsEarcut = earcut;
        const polygon2 = poly_tri2.build(false, 0.4);
        polygon2.visibility = 0;
    
        return polygon2;
    }
    
    makePolygon(mesh: Mesh): Mesh {
        type Dir = {
            after: Dir[];
            step: [number, number];
            point: [number, number];
            vertical: boolean;
        };
    
        const LEFT: Dir = {} as Dir;
        const TOP: Dir = {} as Dir;
        const RIGHT: Dir = {} as Dir;
        const BOTTOM: Dir = {} as Dir;
    
        RIGHT.after = [TOP, RIGHT, BOTTOM];
        TOP.after = [LEFT, TOP, RIGHT];
        LEFT.after = [BOTTOM, LEFT, TOP];
        BOTTOM.after = [RIGHT, BOTTOM, LEFT];
    
        RIGHT.step = [1, 0];
        TOP.step = [0, -1];
        LEFT.step = [-1, 0];
        BOTTOM.step = [0, 1];
    
        RIGHT.point = [1, 1];
        TOP.point = [-1, 1];
        LEFT.point = [-1, -1];
        BOTTOM.point = [1, -1];
    
        RIGHT.vertical = false;
        TOP.vertical = true;
        LEFT.vertical = false;
        BOTTOM.vertical = true;
    
        const path: Vector2[] = [];
        const groupMeshes = [mesh, ...mesh.getChildren()] as Mesh[];
    
        let topLeftMesh = mesh;
        let topLeftData = ctx.piecesMap.get(mesh)!;
    
        for (const c of groupMeshes) {
            const cData = ctx.piecesMap.get(c);
            if (!cData) continue;
    
            if (
                cData.xIndex < topLeftData.xIndex ||
                (cData.xIndex === topLeftData.xIndex && cData.zIndex < topLeftData.zIndex)
            ) {
                topLeftMesh = c;
                topLeftData = cData;
            }
        }
    
        let xIndex = topLeftData.xIndex;
        let zIndex = topLeftData.zIndex;
    
        let boundingBox = topLeftMesh.getBoundingInfo().boundingBox;
        let xOffset = (boundingBox.maximum.x - boundingBox.minimum.x) * topLeftMesh.scaling.x / 2;
        let zOffset = (boundingBox.maximum.z - boundingBox.minimum.z) * topLeftMesh.scaling.z / 2;
    
        let meshPos = topLeftMesh.getAbsolutePosition();
        let startPoint = new Vector2(meshPos.x - xOffset, meshPos.z + zOffset);
        path.push(startPoint);
    
        let nextPoint = new Vector2(meshPos.x + xOffset, meshPos.z + zOffset);
        let direction = RIGHT;
    
        let leakSafe = 0;
        do {
            leakSafe++;
            let xTry = xIndex + direction.step[0];
            let zTry = zIndex + direction.step[1];
    
            let tryMesh = this.tryGetMesh(xTry, zTry, groupMeshes);
            if (tryMesh) {
                let xTry2 = xTry + direction.after[0].step[0];
                let zTry2 = zTry + direction.after[0].step[1];
    
                let tryMesh2 = this.tryGetMesh(xTry2, zTry2, groupMeshes);
                if (tryMesh2) {
                    boundingBox = tryMesh2.getBoundingInfo().boundingBox;
                    xOffset = (boundingBox.maximum.x - boundingBox.minimum.x) * tryMesh2.scaling.x / 2;
                    zOffset = (boundingBox.maximum.z - boundingBox.minimum.z) * tryMesh2.scaling.z / 2;
                    meshPos = tryMesh2.getAbsolutePosition();
    
                    direction = direction.after[0];
                    xIndex = xTry2;
                    zIndex = zTry2;
    
                    if (direction.vertical) {
                        nextPoint.x = meshPos.x + direction.after[0].point[0] * xOffset;
                    } else {
                        nextPoint.y = meshPos.z + direction.after[0].point[1] * zOffset;
                    }
                    path.push(nextPoint);
                } else {
                    boundingBox = tryMesh.getBoundingInfo().boundingBox;
                    xOffset = (boundingBox.maximum.x - boundingBox.minimum.x) * tryMesh.scaling.x / 2;
                    zOffset = (boundingBox.maximum.z - boundingBox.minimum.z) * tryMesh.scaling.z / 2;
                    meshPos = tryMesh.getAbsolutePosition();
    
                    direction = direction.after[1];
                    xIndex = xTry;
                    zIndex = zTry;
                }
            } else {
                path.push(nextPoint);
                direction = direction.after[2];
            }
            nextPoint = new Vector2(
                meshPos.x + direction.point[0] * xOffset,
                meshPos.z + direction.point[1] * zOffset
            );
        } while ((xIndex !== topLeftData.xIndex || zIndex !== topLeftData.zIndex || direction !== TOP) && leakSafe < 100);
    
        const polygon = new PolygonMeshBuilder("tetris_piece", path.reverse(), ctx.scene, earcut.default);
        const extrudedMesh = polygon.build(false, 0.4);
        extrudedMesh.position.y = 5;
        extrudedMesh.physicsImpostor = new PhysicsImpostor(
            extrudedMesh,
            PhysicsImpostor.BoxImpostor,
            { mass: 0.1, friction: 0.7, restitution: 0.01 },
            ctx.scene
        );
    
        behaviorManager.addDragBehavior(extrudedMesh);

        return extrudedMesh;
    }
    
    tryGetMesh(x: number, z: number, toContain: Mesh[] | null = null): Mesh | null {
        if (x >= 0 && z >= 0 && x < ctx.numX && z < ctx.numZ) {
            const tryMesh = ctx.piecesArray![x][z];
            if (!toContain || toContain.includes(tryMesh)) {
                return tryMesh;
            }
        }
        return null;
    }
}

const puzzleBuilder = new PuzzleBuilder();
export default puzzleBuilder;