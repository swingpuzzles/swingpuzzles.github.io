import { CSG2, HDRCubeTexture, Mesh, MeshBuilder, PBRMaterial, StandardMaterial, Texture, Vector3, VertexBuffer } from "@babylonjs/core";
import ctx from "../common/SceneContext";
import puzzleBuilder from "./PuzzleBuilder";
import shakeBehaviorManager from "../behaviors/ShakeBehaviorManager";
import physicsImpostorBuilder from "./PhysicsImpostorBuilder";
import gameModeManager from "../behaviors/GameModeManager";

class SceneBuilder {
    buildScene() {
        gameModeManager.enterInitialMode();

        // Načítaj HDR textúru
        var hdrTexture = new HDRCubeTexture("assets/room.hdr", ctx.scene, 512);

        // Nastav HDR ako prostredie
        ctx.scene.environmentTexture = hdrTexture;

        // Vytvor skybox z HDR textúry
        var skybox = Mesh.CreateBox("skyBox", 400.0, ctx.scene);
        var skyboxMaterial = new PBRMaterial("skyBoxMaterial", ctx.scene);
        skyboxMaterial.backFaceCulling = false;
        skyboxMaterial.reflectionTexture = hdrTexture.clone();
        skyboxMaterial.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;
        skyboxMaterial.microSurface = 1.0;
        skyboxMaterial.disableLighting = true;
        skybox.material = skyboxMaterial;


        const fountainProfile = [
            new Vector3(0.9, 2, 0),
            new Vector3(0.3, 6.8, 0),
            new Vector3(2.7, 6.9, 0),
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
            targetPos.y = 140 * (ctx.camera.beta - 18 * Math.PI / 32);
            ctx.camera.radius = 4 * 45 + 40 * (-ctx.camera.beta + 18 * Math.PI / 32);
            ctx.camera.setTarget(targetPos);
        });



        const mat = new StandardMaterial("mat", ctx.scene);
        mat.backFaceCulling = false;

        const myShape = [
            new Vector3(0.975, 0, 0),
            new Vector3(1, 0, 0),
            new Vector3(1, 1, 0),
            new Vector3(0.975, 1, 0)
        ];

        const lathe = MeshBuilder.CreateLathe("lathe", { shape: myShape, radius: 1, tessellation: 4, sideOrientation: Mesh.DOUBLESIDE }, ctx.scene);
        lathe.convertToFlatShadedMesh();
        lathe.material = mat;
        lathe.rotation.y = Math.PI / 4;
        lathe.bakeCurrentTransformIntoVertices();
        lathe.scaling = new Vector3(ctx.latheWidth, ctx.latheHeight, ctx.latheDepth);
        lathe.position.y = ctx.minY - 0.48;

        const ground = MeshBuilder.CreateGround("ground", { width: ctx.xLimit * 2, height: ctx.zLimit * 2 }, ctx.scene);
        ground.position.y = ctx.minY + 0.26;
        ground.visibility = 0;
        
        physicsImpostorBuilder.attachGroundImpostor(ground);

        const groundVis = MeshBuilder.CreateGround("ground", { width: ctx.xLimit * 2, height: ctx.zLimit * 2 }, ctx.scene);
        groundVis.position.y = ctx.minY - 0.5;

        const groundCover = MeshBuilder.CreateGround("ground", { width: ctx.xLimit * 2, height: ctx.zLimit * 2 }, ctx.scene);
        groundCover.visibility = 0;
        groundCover.position.y = ctx.minY + 1;

        shakeBehaviorManager.addShakeBehavior([lathe, ground, groundVis, groundCover]);

        const startX = -ctx.kitWidth / 2;
        const startZ = ctx.kitHeight / 2;

        const topLeft = puzzleBuilder.createPuzzlePiece(true, true, 0);
        const top = puzzleBuilder.createPuzzlePiece(true, false, 1);
        const left = puzzleBuilder.createPuzzlePiece(false, true, 2);
        const middle = puzzleBuilder.createPuzzlePiece(false, false, 3);

        const box = puzzleBuilder.createFlatBox(ctx.kitWidth, ctx.kitHeight);

        let usePiece: Mesh;
        for (let i = 0; i < ctx.numX; i++) {
            const rowArray: Mesh[] = [];
            ctx.piecesArray.push(rowArray);

            for (let j = 0; j < ctx.numZ; j++) {
                if (i === 0 && j === 0) {
                    usePiece = topLeft;
                } else if (i === 0) {
                    usePiece = left;
                } else if (j === 0) {
                    usePiece = top;
                } else {
                    usePiece = middle;
                }

                usePiece.scaling = new Vector3(ctx.pieceScaleX, 1, ctx.pieceScaleZ);
                this.setPiecePos(usePiece, startX + i * ctx.pieceStepX, startZ - j * ctx.pieceStepZ);

                const polyCSG = CSG2.FromMesh(usePiece);
                const newHolePlate = polyCSG.intersect(box);
                polyCSG.dispose();

                const newMeshHolePlate = newHolePlate.toMesh("puzzle_piece", ctx.scene);
                newMeshHolePlate.bakeCurrentTransformIntoVertices();
                newHolePlate.dispose();

                this.setMeshPositionByLeftTopXZ(newMeshHolePlate, startX + i * ctx.pieceStepX, startZ - j * ctx.pieceStepZ);

                const boundingBox = MeshBuilder.CreateBox("boundingBox", {
                    width: i < ctx.numX - 1 ? ctx.pieceWidth : ctx.pieceWidth * 0.8,
                    height: ctx.pieceHeight,
                    depth: j < ctx.numZ - 1 ? ctx.pieceDepth : ctx.pieceDepth * 0.8
                }, ctx.scene);

                boundingBox.position = newMeshHolePlate.position.clone();
                boundingBox.visibility = 0;
                boundingBox.isPickable = true;

                ctx.jigsawPieces.push(boundingBox);
                rowArray.push(boundingBox);
                ctx.piecesMap.set(boundingBox, {
                    origPos: boundingBox.position.clone(),
                    xIndex: i,
                    zIndex: j,
                    shapeMesh: newMeshHolePlate
                });
            }
        }
    }

    private setPiecePos(mesh: Mesh, x: number, z: number): void {
        const size = 2;
        mesh.position = new Vector3(
            x + size * mesh.scaling.x / 2,
            mesh.position.y,
            z - size * mesh.scaling.z / 2
        );
    }

    private setMeshPositionByLeftTopXZ(mesh: Mesh, left: number, top: number): void {
        mesh.refreshBoundingInfo();
        let boundingBox = mesh.getBoundingInfo().boundingBox;
        let width = (boundingBox.maximum.x - boundingBox.minimum.x) * mesh.scaling.x;
        let depth = (boundingBox.maximum.z - boundingBox.minimum.z) * mesh.scaling.z;

        let newPosition = new Vector3(
            left + width / 2,
            mesh.position.y + Math.random() * 0.1,
            top - depth / 2
        );
        mesh.position = newPosition;
    }
}

const buildScene = new SceneBuilder();
export default buildScene;