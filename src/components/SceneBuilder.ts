import { CSG2, Mesh, MeshBuilder, PhysicsImpostor, StandardMaterial, Vector3 } from "@babylonjs/core";
import behaviorManager from "./BehaviorManager";
import ctx from "./SceneContext";
import puzzleBuilder from "./PuzzleBuilder";

function buildScene() {
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
    lathe.position.y = -0.44;

    const ground = MeshBuilder.CreateGround("ground", { width: ctx.xLimit * 2, height: ctx.zLimit * 2 }, ctx.scene);
    ground.position.y = -0.1;
    ground.visibility = 0;
    ground.physicsImpostor = new PhysicsImpostor(
        ground,
        PhysicsImpostor.BoxImpostor,
        { mass: 0, friction: 0.5, restitution: 0.2 },
        ctx.scene
    );

    const groundVis = MeshBuilder.CreateGround("ground", { width: ctx.xLimit * 2, height: ctx.zLimit * 2 }, ctx.scene);
    groundVis.position.y = ctx.minY - 0.1;

    const groundCover = MeshBuilder.CreateGround("ground", { width: ctx.xLimit * 2, height: ctx.zLimit * 2 }, ctx.scene);
    groundCover.visibility = 0;
    groundCover.position.y = ctx.minY + 1;

    behaviorManager.addShakeBehavior([lathe, ground, groundVis, groundCover]);

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
            setPiecePos(usePiece, startX + i * ctx.pieceStepX, startZ - j * ctx.pieceStepZ);

            const polyCSG = CSG2.FromMesh(usePiece);
            const newHolePlate = polyCSG.intersect(box);
            polyCSG.dispose();

            const newMeshHolePlate = newHolePlate.toMesh("puzzle_piece", ctx.scene);
            newMeshHolePlate.bakeCurrentTransformIntoVertices();
            newHolePlate.dispose();

            setMeshPositionByLeftTopXZ(newMeshHolePlate, startX + i * ctx.pieceStepX, startZ - j * ctx.pieceStepZ);

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

function setPiecePos(mesh: Mesh, x: number, z: number): void {
    const size = 2;
    mesh.position = new Vector3(
        x + size * mesh.scaling.x / 2,
        mesh.position.y,
        z - size * mesh.scaling.z / 2
    );
}

function setMeshPositionByLeftTopXZ(mesh: Mesh, left: number, top: number): void {
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

export default buildScene;