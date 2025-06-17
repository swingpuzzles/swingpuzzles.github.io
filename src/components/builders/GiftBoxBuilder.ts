import { ImportMeshAsync } from "@babylonjs/core/Loading/sceneLoader";
import {
    MeshBuilder,
    TransformNode,
    Vector3
} from "@babylonjs/core";
import "@babylonjs/loaders/glTF";
import ctx from "../common/SceneContext";

export class GiftBoxBuilder {
    private _position: Vector3 = Vector3.Zero();
    private _scaling: Vector3 = new Vector3(1, 1, 1);

    constructor() {
    }

    public withPosition(x: number, y: number, z: number): GiftBoxBuilder {
        this._position.set(x, y, z);
        return this;
    }

    public withScaling(x: number, y: number, z: number): GiftBoxBuilder {
        this._scaling.set(x, y, z);
        return this;
    }

    public async build(): Promise<TransformNode> {
        /*const root = new TransformNode("giftRoot", ctx.scene);
        root.position.copyFrom(this._position);
        root.scaling.copyFrom(this._scaling);
        root.rotation.x = Math.PI / 36;*/

        const source = "assets/models/ribbon.glb"; // full path (not split into root + filename)

        const result = await ImportMeshAsync(source, ctx.scene);

        const position = new Vector3(0, -50, 100);
        //result.meshes[0].scaling.y = 0.2;
        result.meshes[0].position = position;
        result.meshes[0].rotation.x = Math.PI / 2;

        /*for (const mesh of result.meshes) {
            if (mesh !== result.meshes[0]) {
                mesh.parent = root;
            }
        }*/

        const giftBox = MeshBuilder.CreateBox("gift", { width: 29.7, height: 6, depth: 45.6 });
        giftBox.position = new Vector3(0, -37.8, 100);

        return result.meshes[0];
    }
}
