import { ActionManager, ExecuteCodeAction, Mesh, MeshBuilder, StandardMaterial, Texture, Vector3, VertexBuffer, Animation, Scene, Matrix, CubicEase, EasingFunction } from "@babylonjs/core";
import ctx from "../common/SceneContext";
import puzzleAssetsManager from "../behaviors/PuzzleAssetsManager";

class PuzzleCoverBuilder {
    createCover(imgSmallUrl: string, imgBigUrl: string, imgCoverUrl: string): Mesh {
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
                this.openCover(box);
            })
        );

        return box;
    }

    public openCover(cover: Mesh): void {
        // Rotation animation (rotation.z)
        const rotationAnim = new Animation("openRotation", "rotation.z", 30,
            Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CONSTANT);
    
        const rotationKeys = [
            { frame: 0, value: 0 },
            { frame: 20, value: -Math.PI / 2 }
        ];
        rotationAnim.setKeys(rotationKeys);
    
        // Compute direction: "left" relative to current Y-rotation
        const localLeft = new Vector3(1, 0, 0); // left in local space
        const rotationY = cover.rotation.y;
        const worldLeft = Vector3.TransformCoordinates(localLeft, Matrix.RotationY(rotationY));
    
        const moveDistanceUp = 100; // adjust this value
        const moveDistanceSide = 50; // adjust this value
        const moveOffset = worldLeft.scale(moveDistanceSide).add(new Vector3(0, moveDistanceUp, 0)); // left + up
    
        const startPos = cover.position.clone();
        const endPos = startPos.add(moveOffset);
    
        // Position animation (Vector3)
        const positionAnim = new Animation("movePosition", "position", 30,
            Animation.ANIMATIONTYPE_VECTOR3, Animation.ANIMATIONLOOPMODE_CONSTANT);
    
        const positionKeys = [
            { frame: 0, value: startPos },
            { frame: 20, value: endPos }
        ];
        positionAnim.setKeys(positionKeys);
    
        // Assign animations
        cover.animations = [rotationAnim, positionAnim];
    
        // Start animation
        ctx.scene.beginAnimation(cover, 0, 30, false);
    }
                            
}

const puzzleCoverBuilder = new PuzzleCoverBuilder();
export default puzzleCoverBuilder;