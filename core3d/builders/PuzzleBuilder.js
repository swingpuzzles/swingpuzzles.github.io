import { Color3, CSG2, MultiMaterial, Path2, PolygonMeshBuilder, StandardMaterial, SubMesh } from "@babylonjs/core";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import * as earcut from "earcut";
import ctx from "../common/SceneContext";
import puzzleAssetsManager from "../behaviors/PuzzleAssetsManager";
window.earcut = earcut;
class PuzzleBuilder {
    constructor() {
    }
    createFlatBox(width, height, depth = 0.1, puzzleTexture) {
        const box = MeshBuilder.CreateBox("box", { width, height, depth }, ctx.scene);
        box.rotation.x = -Math.PI / 2;
        //box.rotation.y = Math.PI;
        box.position.y += -0.2;
        const multiMat = new MultiMaterial("multiMat", ctx.scene);
        const frontMaterial = new StandardMaterial("frontMat", ctx.scene);
        frontMaterial.diffuseTexture = puzzleTexture;
        frontMaterial.emissiveColor = new Color3(1, 1, 1); // full white
        frontMaterial.disableLighting = true;
        const backMaterial = new StandardMaterial("backMat", ctx.scene);
        const texture = puzzleAssetsManager.addTexture("assets/room/floor-small.webp", "assets/floor.webp");
        texture.uScale = 4;
        texture.vScale = 4;
        backMaterial.diffuseTexture = texture;
        backMaterial.emissiveColor = new Color3(1, 1, 1); // full white
        backMaterial.disableLighting = true;
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
    createPuzzlePiece(edgeTop, edgeLeft, yPos) {
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
