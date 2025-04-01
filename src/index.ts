import ammo from "ammojs-typed";
import * as BABYLON from "@babylonjs/core";
import "@babylonjs/loaders"; // Required if you load external models
import puzzleBuilder from "./components/PuzzleBuilder";
import behaviorManager from "./components/BehaviorManager";
import meshHelpers from "./components/MeshHelpers";


// Get the canvas element
const canvas = document.createElement("canvas");
document.body.appendChild(canvas);

// Create the Babylon.js engine
const engine = new BABYLON.Engine(canvas, true);

// ✅ Converted TypeScript start section

let scene: BABYLON.Scene;
const jigsawPieces: BABYLON.Mesh[] = [];
const piecesArray: BABYLON.Mesh[][] = [];
const piecesMap: Map<BABYLON.Mesh, {
    origPos: BABYLON.Vector3;
    xIndex: number;
    zIndex: number;
    shapeMesh: BABYLON.Mesh;
}> = new Map();

const helpBoxMap: Map<BABYLON.Mesh, BABYLON.Mesh> = new Map();
const c: Map<any, any> = new Map();

let numX = 3;
let numZ = 3;

const xLimit = 22;
const zLimit = 16.5;

const latheMulti = 1.455;
const latheMultiY = 1 / 6;
const latheWidth = xLimit * latheMulti;
const latheHeight = zLimit * latheMultiY;
const latheDepth = zLimit * latheMulti;

const coverMulti = 2.1;
const coverWidth = xLimit * coverMulti;
const coverHeight = zLimit * coverMulti;
const coverDepth = xLimit * 1 / 6;

let pieceWidth: number;
let pieceHeight: number;
let pieceDepth: number;
let pieceWidthHalf: number;
let pieceHeightHalf: number;
let pieceDepthHalf: number;

let camera: BABYLON.ArcRotateCamera;

const pieceEdge = 2;
const width = xLimit * 1.4;
const height = zLimit * 1.4;
const stepX = width / numX;
const stepZ = height / numZ;
const scaleX = stepX / pieceEdge;
const scaleZ = stepZ / pieceEdge;

//await createScene();

window.addEventListener("DOMContentLoaded", async () => {
    const Ammo = await ammo.bind(window)()
  
    await createScene(); // Assuming createScene is already defined globally or imported

    engine.resize();


    engine.runRenderLoop(() => {
        scene.render();
    });
});

// Handle window resizing
window.addEventListener("resize", () => {
    engine.resize();
});

// ✅ Converted createScene function to TypeScript
const createScene = async function (): Promise<BABYLON.Scene> {
    scene = new BABYLON.Scene(engine);
    camera = new BABYLON.ArcRotateCamera("Camera", 3 * Math.PI / 2, Math.PI / 4, 60, BABYLON.Vector3.Zero(), scene);

    const light1 = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 10, 0), scene);
    const light2 = new BABYLON.HemisphericLight("light2", new BABYLON.Vector3(0, -10, 5), scene);
    light1.intensity = 0.5;
    light2.intensity = 0.5;

    const physicsPlugin = new BABYLON.AmmoJSPlugin(true);
    scene.enablePhysics(new BABYLON.Vector3(0, -9.81, 0), physicsPlugin);

    await BABYLON.InitializeCSG2Async();

    puzzleBuilder.init(scene, numX, numZ, piecesArray, piecesMap);
    behaviorManager.init(scene, camera, numX, numZ, xLimit, zLimit, jigsawPieces, piecesArray, piecesMap);
    meshHelpers.init(piecesMap);

    const mat = new BABYLON.StandardMaterial("mat", scene);
    mat.backFaceCulling = false;

    const myShape = [
        new BABYLON.Vector3(0.975, 0, 0),
        new BABYLON.Vector3(1, 0, 0),
        new BABYLON.Vector3(1, 1, 0),
        new BABYLON.Vector3(0.975, 1, 0)
    ];

    const lathe = BABYLON.MeshBuilder.CreateLathe("lathe", { shape: myShape, radius: 1, tessellation: 4, sideOrientation: BABYLON.Mesh.DOUBLESIDE }, scene);
    lathe.convertToFlatShadedMesh();
    lathe.material = mat;
    lathe.rotation.y = Math.PI / 4;
    lathe.bakeCurrentTransformIntoVertices();
    lathe.scaling = new BABYLON.Vector3(latheWidth, latheHeight, latheDepth);
    lathe.position.y = -0.44;

    const ground = BABYLON.MeshBuilder.CreateGround("ground", { width: xLimit * 2, height: zLimit * 2 }, scene);
    ground.position.y = -0.1;
    ground.visibility = 0;
    ground.physicsImpostor = new BABYLON.PhysicsImpostor(
        ground,
        BABYLON.PhysicsImpostor.BoxImpostor,
        { mass: 0, friction: 0.5, restitution: 0.2 },
        scene
    );

    const groundVis = BABYLON.MeshBuilder.CreateGround("ground", { width: xLimit * 2, height: zLimit * 2 }, scene);
    groundVis.position.y = behaviorManager.minY - 0.1;

    const groundCover = BABYLON.MeshBuilder.CreateGround("ground", { width: xLimit * 2, height: zLimit * 2 }, scene);
    groundCover.visibility = 0;
    groundCover.position.y = behaviorManager.minY + 1;

    behaviorManager.addShakeBehavior([lathe, ground, groundVis, groundCover]);

    pieceWidth = 2.5 * scaleX;
    pieceHeight = 0.4;
    pieceDepth = 2.5 * scaleZ;
    pieceHeightHalf = pieceHeight / 2;
    pieceWidthHalf = pieceWidth / 2;
    pieceDepthHalf = pieceDepth / 2;

    const startX = -width / 2;
    const startZ = height / 2;

    const topLeft = puzzleBuilder.createPuzzlePiece(true, true, 0);
    const top = puzzleBuilder.createPuzzlePiece(true, false, 1);
    const left = puzzleBuilder.createPuzzlePiece(false, true, 2);
    const middle = puzzleBuilder.createPuzzlePiece(false, false, 3);

    const box = puzzleBuilder.createFlatBox(width, height);

    let usePiece: BABYLON.Mesh;
    for (let i = 0; i < numX; i++) {
        const rowArray: BABYLON.Mesh[] = [];
        piecesArray.push(rowArray);

        for (let j = 0; j < numZ; j++) {
            if (i === 0 && j === 0) {
                usePiece = topLeft;
            } else if (i === 0) {
                usePiece = left;
            } else if (j === 0) {
                usePiece = top;
            } else {
                usePiece = middle;
            }

            usePiece.scaling = new BABYLON.Vector3(scaleX, 1, scaleZ);
            setPiecePos(usePiece, startX + i * stepX, startZ - j * stepZ);

            const polyCSG = BABYLON.CSG2.FromMesh(usePiece);
            const newHolePlate = polyCSG.intersect(box);
            polyCSG.dispose();

            const newMeshHolePlate = newHolePlate.toMesh("puzzle_piece", scene);
            newMeshHolePlate.bakeCurrentTransformIntoVertices();
            newHolePlate.dispose();

            setMeshPositionByLeftTopXZ(newMeshHolePlate, startX + i * stepX, startZ - j * stepZ);

            const boundingBox = BABYLON.MeshBuilder.CreateBox("boundingBox", {
                width: i < numX - 1 ? pieceWidth : pieceWidth * 0.8,
                height: pieceHeight,
                depth: j < numZ - 1 ? pieceDepth : pieceDepth * 0.8
            }, scene!);

            boundingBox.position = newMeshHolePlate.position.clone();
            boundingBox.visibility = 0;
            boundingBox.isPickable = true;

            jigsawPieces.push(boundingBox);
            rowArray.push(boundingBox);
            piecesMap.set(boundingBox, {
                origPos: boundingBox.position.clone(),
                xIndex: i,
                zIndex: j,
                shapeMesh: newMeshHolePlate
            });
        }
    }

    scene.onBeforeRenderObservable.add(checkPiecePositions);

    createCover();

    return scene;
};

function checkPiecePositions(): void {
    for (const [helpBox, groupBox] of helpBoxMap.entries()) {
        helpBox.position.copyFrom(groupBox.position);
        helpBox.rotationQuaternion = groupBox.rotationQuaternion!.clone();
    }

    jigsawPieces.forEach(piece => {
        const pieceData = piecesMap.get(piece);
        if (!pieceData) return;
        const shapeMesh = pieceData.shapeMesh;

        piece.computeWorldMatrix(true);
        shapeMesh.position.copyFrom(piece.getAbsolutePosition());

        const worldMatrix = piece.getWorldMatrix();
        const absoluteRotation = new BABYLON.Quaternion();
        worldMatrix.decompose(undefined, absoluteRotation, undefined);
        shapeMesh.rotationQuaternion = absoluteRotation;

        if (piece.parent) {
            piece.position.y = 0;
            piece.rotationQuaternion = BABYLON.Quaternion.Identity();
            return;
        }

        const power = piece.getChildren().length < 1 ? 1.5 : 0.04;

        const edgePosMinX = getEdgePosition(piece, (edge, pos) => pos.x - pieceWidthHalf < edge.x);
        const edgePosMaxX = getEdgePosition(piece, (edge, pos) => pos.x + pieceWidthHalf > edge.x);
        const edgePosMinZ = getEdgePosition(piece, (edge, pos) => pos.z - pieceDepthHalf < edge.z);
        const edgePosMaxZ = getEdgePosition(piece, (edge, pos) => pos.z + pieceDepthHalf > edge.z);
        const edgePosMinY = getEdgePosition(piece, (edge, pos) => pos.y - pieceHeightHalf < edge.y);

        let edgePos: BABYLON.Vector3 | null = null;

        if (edgePosMinX.x - pieceWidthHalf < behaviorManager.minX) {
            piece.position.x += 0.2;
            edgePos = edgePosMinX;
        } else if (edgePosMaxX.x + pieceWidthHalf > behaviorManager.maxX) {
            piece.position.x -= 0.2;
            edgePos = edgePosMaxX;
        } else if (edgePosMinZ.z - pieceDepthHalf < behaviorManager.minZ) {
            piece.position.z += 0.2;
            edgePos = edgePosMinZ;
        } else if (edgePosMaxZ.z + pieceDepthHalf > behaviorManager.maxZ) {
            piece.position.z -= 0.2;
            edgePos = edgePosMaxZ;
        } else if (edgePosMinY.y - pieceHeightHalf < behaviorManager.minY - 0.1) {
            piece.position.y += 0.2;
            edgePos = edgePosMinY;
        } else {
            return;
        }

        const centerPoint = new BABYLON.Vector3((behaviorManager.maxX + behaviorManager.minX) / 2, 20 - behaviorManager.minY, (behaviorManager.maxZ + behaviorManager.minZ) / 2);
        const directionToCenter = centerPoint.subtract(edgePos).normalize();

        if (piece.physicsImpostor) {
            piece.physicsImpostor.setLinearVelocity(BABYLON.Vector3.Zero());
            const centerImpulse = directionToCenter.scale(power);
            piece.physicsImpostor.applyImpulse(centerImpulse, edgePos);

            if (piece.getChildren().length >= 3) {
                const maxAngularSpeed = 1;
                const angularVelocity = piece.physicsImpostor.getAngularVelocity();

                if (angularVelocity) {
                    angularVelocity.x = BABYLON.Scalar.Clamp(angularVelocity.x, -maxAngularSpeed, maxAngularSpeed);
                    angularVelocity.y = BABYLON.Scalar.Clamp(angularVelocity.y, -maxAngularSpeed, maxAngularSpeed);
                    angularVelocity.z = BABYLON.Scalar.Clamp(angularVelocity.z, -maxAngularSpeed, maxAngularSpeed);
                }

                piece.physicsImpostor.setAngularVelocity(angularVelocity);
            }
        }
    });
}

function getEdgePosition(
    mesh: BABYLON.Mesh,
    func: (edge: BABYLON.Vector3, current: BABYLON.Vector3) => boolean
): BABYLON.Vector3 {
    let edgePosition = mesh.getAbsolutePosition();

    for (const m of meshHelpers.getAllRelated(mesh)) {
        const absPos = m.getAbsolutePosition();
        if (func(edgePosition, absPos)) {
            edgePosition = absPos;
        }
    }

    return edgePosition;
}

function getPieceChildren(node: BABYLON.Mesh): BABYLON.Mesh[] {
    const result: BABYLON.Mesh[] = [];
    for (const n of node.getChildren()) {
        if (piecesMap.get(n as BABYLON.Mesh)) {
            result.push(n as BABYLON.Mesh);
        }
    }
    return result;
}

function setPiecePos(mesh: BABYLON.Mesh, x: number, z: number): void {
    const size = 2;
    mesh.position = new BABYLON.Vector3(
        x + size * mesh.scaling.x / 2,
        mesh.position.y,
        z - size * mesh.scaling.z / 2
    );
}

function setMeshPositionByLeftTopXZ(mesh: BABYLON.Mesh, left: number, top: number): void {
    mesh.refreshBoundingInfo();
    let boundingBox = mesh.getBoundingInfo().boundingBox;
    let width = (boundingBox.maximum.x - boundingBox.minimum.x) * mesh.scaling.x;
    let depth = (boundingBox.maximum.z - boundingBox.minimum.z) * mesh.scaling.z;

    let newPosition = new BABYLON.Vector3(
        left + width / 2,
        mesh.position.y + Math.random() * 0.1,
        top - depth / 2
    );
    mesh.position = newPosition;
}

function createCover(): void {
    const box = BABYLON.MeshBuilder.CreateBox("box", {
        width: coverWidth,
        height: coverHeight,
        depth: coverDepth
    }, scene);

    const mat = new BABYLON.StandardMaterial("mat", scene);
    const texture = new BABYLON.Texture("https://m.media-amazon.com/images/I/81BA14xBSAL._AC_SL1500_.jpg", scene);
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

    box.setVerticesData(BABYLON.VertexBuffer.UVKind, uvs);
    box.material = mat;

    box.actionManager = new BABYLON.ActionManager(scene);
    box.setPivotPoint(new BABYLON.Vector3(-64, 0, 0));

    box.rotation.x = 3 * Math.PI / 2;
    box.rotation.y = Math.PI / 2;
    box.rotation.z = Math.PI / 2;
    box.position = new BABYLON.Vector3(128, 1.2, 0);
    box.bakeCurrentTransformIntoVertices();

    box.actionManager.registerAction(
        new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, () => {
            openCover(box);
        })
    );
}

function openCover(cover: BABYLON.Mesh): void {
    const anim = new BABYLON.Animation("openAnim", "rotation.z", 30,
        BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);

    const keys = [
        { frame: 0, value: 0 },
        { frame: 30, value: Math.PI / 2 }
    ];

    anim.setKeys(keys);
    cover.animations = [anim];
    scene.beginAnimation(cover, 0, 30, false);
}
