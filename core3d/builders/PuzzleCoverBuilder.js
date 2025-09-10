import { ActionManager, ExecuteCodeAction, MeshBuilder, StandardMaterial, VertexBuffer } from "@babylonjs/core";
import ctx from "../common/SceneContext";
import puzzleAssetsManager from "../behaviors/PuzzleAssetsManager";
import openCoverAnimation from "../animations/OpenCoverAnimation";
class PuzzleCoverBuilder {
    createCover(imgSmallUrl, imgBigUrl) {
        const box = MeshBuilder.CreateBox("box", {
            width: ctx.coverWidth,
            height: ctx.coverHeight,
            depth: ctx.coverDepth
        }, ctx.scene);
        const texture = puzzleAssetsManager.addTexture(imgSmallUrl, imgBigUrl);
        texture.uScale = -1;
        const mat = new StandardMaterial("mat", ctx.scene);
        mat.diffuseTexture = texture;
        let cut = 0.1;
        let topCut = 1 - cut;
        const uvs = [
            cut, cut, topCut, cut, topCut, topCut, cut, topCut,
            0, 0, 1, 0, 1, 1, 0, 1,
            0, topCut, 0, cut, cut, cut, cut, topCut,
            topCut, topCut, topCut, cut, 1, cut, 1, topCut,
            topCut, topCut, topCut, 1, cut, 1, cut, topCut,
            cut, cut, cut, 0, topCut, 0, topCut, cut
        ];
        box.setVerticesData(VertexBuffer.UVKind, uvs);
        box.material = mat;
        box.actionManager = new ActionManager(ctx.scene);
        box.rotation.x = 3 * Math.PI / 2;
        box.rotation.y = Math.PI / 2;
        box.rotation.z = Math.PI / 2;
        box.bakeCurrentTransformIntoVertices();
        box.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPickTrigger, () => {
            openCoverAnimation.animate(box);
        }));
        return box;
    }
}
const puzzleCoverBuilder = new PuzzleCoverBuilder();
export default puzzleCoverBuilder;
