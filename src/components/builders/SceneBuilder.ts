import { CSG2, CubeTexture, Mesh, MeshBuilder, PBRMaterial, StandardMaterial, Texture, Vector3, VertexBuffer } from "@babylonjs/core";
import ctx from "../common/SceneContext";
import puzzleBuilder from "./PuzzleBuilder";
import shakeBehaviorManager from "../behaviors/ShakeBehaviorManager";
import physicsImpostorBuilder from "./PhysicsImpostorBuilder";
import gameModeManager from "../behaviors/GameModeManager";
import puzzleCircleBuilder from "./PuzzleCircleBuilder";

class SceneBuilder {
    buildScene() {
        gameModeManager.enterInitialMode();

        // Načítaj HDR textúru
        //var hdrTexture = new HDRCubeTexture("assets/room.hdr", ctx.scene, 512);

        // Nastav HDR ako prostredie
        //ctx.scene.environmentTexture = hdrTexture;

        // Vytvor skybox z HDR textúry
        var skybox = Mesh.CreateBox("skyBox", 400.0, ctx.scene);
        var skyboxMaterial = new PBRMaterial("skyBoxMaterial", ctx.scene);
        skyboxMaterial.backFaceCulling = false;
        //skyboxMaterial.reflectionTexture = hdrTexture.clone();
        //skyboxMaterial.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;
        skyboxMaterial.microSurface = 1.0;
        skyboxMaterial.disableLighting = true;
        skyboxMaterial.reflectionTexture = new CubeTexture(
            "assets/room", 
            //"assets/skybox2", 
            ctx.scene/*, 
            [
              "_px.webp", // +X (right)
              "_py.webp", // +Y (top)
              "_pz.webp", // +Z (front)
              "_nx.webp", // -X (left)
              "_ny.webp", // -Y (bottom)
              "_nz.webp"  // -Z (back)
            ]*/
          );
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
        const table = MeshBuilder.CreateLathe("fountain", {shape: fountainProfile, sideOrientation: Mesh.DOUBLESIDE, closed: true, updatable: true}, ctx.scene);
        const tableScale = 50;

        const positions = table.getVerticesData(VertexBuffer.PositionKind)!;
        const uvs = table.getVerticesData(VertexBuffer.UVKind)!;
    
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
        //groundMaterial.diffuseColor = new Color3(0.8,0.5,0);
        tableMaterial.diffuseTexture = new Texture("assets/ParallaxDiffuse.png", ctx.scene);
        tableMaterial.bumpTexture = new Texture("assets/ParallaxNormal.png", ctx.scene);

        (tableMaterial.diffuseTexture as Texture).uScale = textureScale;
        (tableMaterial.diffuseTexture as Texture).vScale = textureScale;
        (tableMaterial.bumpTexture as Texture).uScale = textureScale;
        (tableMaterial.bumpTexture as Texture).vScale = textureScale;

        table.material = tableMaterial;
        
        const targetPos = Vector3.Zero().clone(); 

        ctx.scene.onBeforeRenderObservable.add(() => {
            if (gameModeManager.initialMode) {
                targetPos.y = 140 * (ctx.camera.beta - 18 * Math.PI / 32);
                ctx.camera.radius = 4 * 45 + 40 * (-ctx.camera.beta + 18 * Math.PI / 32);
                ctx.camera.setTarget(targetPos);
            }
        });

        puzzleCircleBuilder.build();
    }
}

const buildScene = new SceneBuilder();
export default buildScene;