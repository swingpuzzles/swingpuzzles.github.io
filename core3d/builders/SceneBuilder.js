import { CubeTexture, HemisphericLight, Mesh, MeshBuilder, PBRMaterial, StandardMaterial, Texture, Vector3, VertexBuffer } from "@babylonjs/core";
import ctx from "../common/SceneContext";
import gameModeManager from "../behaviors/GameModeManager";
import puzzleCircleBuilder from "./PuzzleCircleBuilder";
class SceneBuilder {
    buildScene() {
        var light = new HemisphericLight("light1", new Vector3(0, 1, -1), ctx.scene);
        var light2 = new HemisphericLight("light1", new Vector3(0, 0, 1), ctx.scene);
        light.intensity = 1;
        light2.intensity = 0.2;
        var skybox = Mesh.CreateBox("skyBox", 400.0, ctx.scene);
        var skyboxMaterial = new PBRMaterial("skyBoxMaterial", ctx.scene);
        skyboxMaterial.backFaceCulling = false;
        //skyboxMaterial.reflectionTexture = hdrTexture.clone();
        //skyboxMaterial.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;
        skyboxMaterial.microSurface = 1.0;
        skyboxMaterial.disableLighting = true;
        skyboxMaterial.reflectionTexture = new CubeTexture("assets/room/room", 
        //"assets/skybox2", 
        ctx.scene /*,
        [
          "_px.webp", // +X (right)
          "_py.webp", // +Y (top)
          "_pz.webp", // +Z (front)
          "_nx.webp", // -X (left)
          "_ny.webp", // -Y (bottom)
          "_nz.webp"  // -Z (back)
        ]*/);
        skyboxMaterial.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;
        skybox.material = skyboxMaterial;
        const fountainProfile = [
            new Vector3(0.9, 2, 0),
            new Vector3(0.3, 6.8, 0),
            new Vector3(2.7, 6.9, 0),
            new Vector3(2.72, 6.91, 0),
            new Vector3(2.73, 6.93, 0),
            new Vector3(2.732, 6.95, 0),
            new Vector3(2.73, 6.97, 0),
            new Vector3(2.72, 6.99, 0),
            new Vector3(2.7, 7, 0),
            new Vector3(0, 7, 0)
        ];
        //Create lathe
        const table = MeshBuilder.CreateLathe("fountain", { shape: fountainProfile, sideOrientation: Mesh.DOUBLESIDE, closed: true, updatable: true }, ctx.scene);
        const tableScale = 50;
        const positions = table.getVerticesData(VertexBuffer.PositionKind);
        const uvs = table.getVerticesData(VertexBuffer.UVKind);
        // Remap UVs
        const vertex = new Vector3();
        const minVec = new Vector3(Infinity, Infinity, Infinity);
        const maxVec = new Vector3(-Infinity, -Infinity, -Infinity);
        for (let i = 0; i < positions.length; i += 3) {
            Vector3.FromArrayToRef(positions, i, vertex);
            minVec.minimizeInPlace(vertex);
            maxVec.maximizeInPlace(vertex);
        }
        const range = maxVec.subtract(minVec);
        for (let i = 0; i < positions.length; i += 3) {
            const vertexI = i / 3;
            Vector3.FromArrayToRef(positions, i, vertex);
            const uvI = vertexI * 2;
            uvs[uvI + 0] = (vertex.z - minVec.z) / range.z;
            uvs[uvI + 1] = (vertex.x - minVec.x) / range.x;
        }
        table.updateVerticesData(VertexBuffer.UVKind, uvs);
        table.scaling = new Vector3(tableScale, tableScale, tableScale);
        table.position.y = -78 * 5;
        const textureScale = 4;
        var tableMaterial = new StandardMaterial("groundMaterial", ctx.scene);
        tableMaterial.diffuseTexture = new Texture("assets/room/ParallaxDiffuse.png", ctx.scene);
        tableMaterial.bumpTexture = new Texture("assets/room/ParallaxNormal.png", ctx.scene);
        tableMaterial.diffuseTexture.uScale = textureScale;
        tableMaterial.diffuseTexture.vScale = textureScale;
        tableMaterial.bumpTexture.uScale = textureScale;
        tableMaterial.bumpTexture.vScale = textureScale;
        table.material = tableMaterial;
        const targetPos = Vector3.Zero().clone();
        ctx.scene.onBeforeRenderObservable.add(() => {
            if (gameModeManager.canOpenCover) {
                targetPos.y = 140 * (ctx.cameraBeta - 18 * Math.PI / 32);
                ctx.cameraRadius = 4 * 45 + 40 * (-ctx.cameraBeta + 18 * Math.PI / 32);
                ctx.cameraTarget = targetPos;
            }
        });
        puzzleCircleBuilder.init();
    }
}
const buildScene = new SceneBuilder();
export default buildScene;
