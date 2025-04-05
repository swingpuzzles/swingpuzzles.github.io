import { ActionManager, ExecuteCodeAction, Mesh, MeshBuilder, StandardMaterial, Texture, Vector3, VertexBuffer, Animation, Scene } from "@babylonjs/core";
import ctx from "../common/SceneContext";
import puzzleAssetsManager from "../behaviors/PuzzleAssetsManager";

class PuzzleCoverBuilder {
    createCover(imgSmallUrl: string, imgBigUrl: string): Mesh {
        const box = MeshBuilder.CreateBox("box", {
            width: ctx.coverWidth,
            height: ctx.coverHeight,
            depth: ctx.coverDepth
        }, ctx.scene);

        const texture = puzzleAssetsManager.addTexture(imgSmallUrl, imgBigUrl);

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
        //box.setPivotPoint(new Vector3(-64, 0, 0));    // TODO

        box.rotation.x = 3 * Math.PI / 2;
        box.rotation.y = Math.PI / 2;
        box.rotation.z = Math.PI / 2;
        //box.position = new Vector3(128, 1.2, 0);
        box.bakeCurrentTransformIntoVertices();

        box.actionManager.registerAction(
            new ExecuteCodeAction(ActionManager.OnPickTrigger, () => {
                this.openCover(ctx.scene, box);
            })
        );

        return box;
    }

    private openCover(scene: Scene, cover: Mesh): void {
        const anim = new Animation("openAnim", "rotation.z", 30,
            Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CONSTANT);

        const keys = [
            { frame: 0, value: 0 },
            { frame: 30, value: Math.PI / 2 }
        ];

        anim.setKeys(keys);
        cover.animations = [anim];
        scene.beginAnimation(cover, 0, 30, false);
    }
}

const puzzleCoverBuilder = new PuzzleCoverBuilder();
export default puzzleCoverBuilder;