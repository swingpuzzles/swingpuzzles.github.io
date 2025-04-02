import { Color3, CSG2, Mesh, MultiMaterial, Path2, PolygonMeshBuilder, StandardMaterial, SubMesh, Texture } from "@babylonjs/core";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import * as earcut from "earcut";
import ctx from "../common/SceneContext";
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
}

const puzzleBuilder = new PuzzleBuilder();
export default puzzleBuilder;