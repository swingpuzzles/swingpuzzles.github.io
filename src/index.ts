import ammo from "ammojs-typed";
import * as earcut from "earcut";
import * as BABYLON from "@babylonjs/core";
import "@babylonjs/loaders"; // Required if you load external models

(window as any).earcut = earcut;

// Get the canvas element
const canvas = document.createElement("canvas");
document.body.appendChild(canvas);

// Create the Babylon.js engine
const engine = new BABYLON.Engine(canvas, true);

// Create a scene
/*const scene = new BABYLON.Scene(engine);

// Create a camera and attach controls
const camera = new BABYLON.ArcRotateCamera("camera", Math.PI / 2, Math.PI / 2.5, 5, BABYLON.Vector3.Zero(), scene);
camera.attachControl(canvas, true);

// Create a simple light
const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(1, 1, 0), scene);

// Create a basic sphere
const sphere = BABYLON.MeshBuilder.CreateSphere("sphere", { diameter: 1 }, scene);
sphere.position.y = 1;

// Create a ground plane
const ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 6, height: 6 }, scene);*/

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
const piecesCount = numX * numZ;

const xLimit = 22;
const zLimit = 16.5;
let minX = -xLimit, maxX = xLimit;
let minZ = -zLimit, maxZ = zLimit;
let minY = -0.36;

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
    groundVis.position.y = minY - 0.1;

    const groundCover = BABYLON.MeshBuilder.CreateGround("ground", { width: xLimit * 2, height: zLimit * 2 }, scene);
    groundCover.visibility = 0;
    groundCover.position.y = minY + 1;

    addShakeBehavior([lathe, ground, groundVis, groundCover]);

    pieceWidth = 2.5 * scaleX;
    pieceHeight = 0.4;
    pieceDepth = 2.5 * scaleZ;
    pieceHeightHalf = pieceHeight / 2;
    pieceWidthHalf = pieceWidth / 2;
    pieceDepthHalf = pieceDepth / 2;

    const startX = -width / 2;
    const startZ = height / 2;

    const topLeft = createPuzzlePiece(true, true, 0);
    const top = createPuzzlePiece(true, false, 1);
    const left = createPuzzlePiece(false, true, 2);
    const middle = createPuzzlePiece(false, false, 3);

    const box = createFlatBox(width, height);

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

        if (edgePosMinX.x - pieceWidthHalf < minX) {
            piece.position.x += 0.2;
            edgePos = edgePosMinX;
        } else if (edgePosMaxX.x + pieceWidthHalf > maxX) {
            piece.position.x -= 0.2;
            edgePos = edgePosMaxX;
        } else if (edgePosMinZ.z - pieceDepthHalf < minZ) {
            piece.position.z += 0.2;
            edgePos = edgePosMinZ;
        } else if (edgePosMaxZ.z + pieceDepthHalf > maxZ) {
            piece.position.z -= 0.2;
            edgePos = edgePosMaxZ;
        } else if (edgePosMinY.y - pieceHeightHalf < minY - 0.1) {
            piece.position.y += 0.2;
            edgePos = edgePosMinY;
        } else {
            return;
        }

        const centerPoint = new BABYLON.Vector3((maxX + minX) / 2, 20 - minY, (maxZ + minZ) / 2);
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

function createFlatBox(width: number, height: number, depth: number = 0.1): BABYLON.CSG2 {
    const box = BABYLON.MeshBuilder.CreateBox("box", { width, height, depth }, scene!);
    box.rotation.x = -Math.PI / 2;
    box.position.y = -0.2;

    const multiMat = new BABYLON.MultiMaterial("multiMat", scene!);

    const frontMaterial = new BABYLON.StandardMaterial("frontMat", scene!);
    frontMaterial.diffuseTexture = new BABYLON.Texture("https://m.media-amazon.com/images/I/81BA14xBSAL._AC_SL1500_.jpg", scene!);

    const backMaterial = new BABYLON.StandardMaterial("backMat", scene!);
    const texture = new BABYLON.Texture("https://www.babylonjs-playground.com/textures/floor.png", scene!);
    texture.uScale = 4;
    texture.vScale = 4;
    backMaterial.diffuseTexture = texture;

    const sideMaterial = new BABYLON.StandardMaterial("sideMat", scene!);
    sideMaterial.diffuseColor = new BABYLON.Color3(1, 1, 1);

    multiMat.subMaterials.push(frontMaterial, backMaterial, sideMaterial);
    box.material = multiMat;

    box.subMeshes = [
        new BABYLON.SubMesh(0, 0, box.getTotalVertices(), 0, 6, box),
        new BABYLON.SubMesh(1, 0, box.getTotalVertices(), 6, 6, box),
        new BABYLON.SubMesh(2, 0, box.getTotalVertices(), 12, 24, box),
    ];

    const boxCSG = BABYLON.CSG2.FromMesh(box);
    box.dispose();
    return boxCSG;
}

function createPuzzlePiece(edgeTop: boolean, edgeLeft: boolean, yPos: number): BABYLON.Mesh {
    const poly_path = new BABYLON.Path2(-1, -1);
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
    const poly_tri2 = new BABYLON.PolygonMeshBuilder("polytri2", poly_path, scene, earcut.default);
    //poly_tri2.bjsEarcut = earcut;
    const polygon2 = poly_tri2.build(false, 0.4);
    polygon2.visibility = 0;

    return polygon2;
}

function makePolygon(mesh: BABYLON.Mesh): void {
    type Dir = {
        after: Dir[];
        step: [number, number];
        point: [number, number];
        vertical: boolean;
    };

    const LEFT: Dir = {} as Dir;
    const TOP: Dir = {} as Dir;
    const RIGHT: Dir = {} as Dir;
    const BOTTOM: Dir = {} as Dir;

    RIGHT.after = [TOP, RIGHT, BOTTOM];
    TOP.after = [LEFT, TOP, RIGHT];
    LEFT.after = [BOTTOM, LEFT, TOP];
    BOTTOM.after = [RIGHT, BOTTOM, LEFT];

    RIGHT.step = [1, 0];
    TOP.step = [0, -1];
    LEFT.step = [-1, 0];
    BOTTOM.step = [0, 1];

    RIGHT.point = [1, 1];
    TOP.point = [-1, 1];
    LEFT.point = [-1, -1];
    BOTTOM.point = [1, -1];

    RIGHT.vertical = false;
    TOP.vertical = true;
    LEFT.vertical = false;
    BOTTOM.vertical = true;

    const path: BABYLON.Vector2[] = [];
    const groupMeshes = [mesh, ...mesh.getChildren()] as BABYLON.Mesh[];

    let topLeftMesh = mesh;
    let topLeftData = piecesMap.get(mesh)!;

    for (const c of groupMeshes) {
        const cData = piecesMap.get(c);
        if (!cData) continue;

        if (
            cData.xIndex < topLeftData.xIndex ||
            (cData.xIndex === topLeftData.xIndex && cData.zIndex < topLeftData.zIndex)
        ) {
            topLeftMesh = c;
            topLeftData = cData;
        }
    }

    let xIndex = topLeftData.xIndex;
    let zIndex = topLeftData.zIndex;

    let boundingBox = topLeftMesh.getBoundingInfo().boundingBox;
    let xOffset = (boundingBox.maximum.x - boundingBox.minimum.x) * topLeftMesh.scaling.x / 2;
    let zOffset = (boundingBox.maximum.z - boundingBox.minimum.z) * topLeftMesh.scaling.z / 2;

    let meshPos = topLeftMesh.getAbsolutePosition();
    let startPoint = new BABYLON.Vector2(meshPos.x - xOffset, meshPos.z + zOffset);
    path.push(startPoint);

    let nextPoint = new BABYLON.Vector2(meshPos.x + xOffset, meshPos.z + zOffset);
    let direction = RIGHT;

    let leakSafe = 0;
    do {
        leakSafe++;
        let xTry = xIndex + direction.step[0];
        let zTry = zIndex + direction.step[1];

        let tryMesh = tryGetMesh(xTry, zTry, groupMeshes);
        if (tryMesh) {
            let xTry2 = xTry + direction.after[0].step[0];
            let zTry2 = zTry + direction.after[0].step[1];

            let tryMesh2 = tryGetMesh(xTry2, zTry2, groupMeshes);
            if (tryMesh2) {
                boundingBox = tryMesh2.getBoundingInfo().boundingBox;
                xOffset = (boundingBox.maximum.x - boundingBox.minimum.x) * tryMesh2.scaling.x / 2;
                zOffset = (boundingBox.maximum.z - boundingBox.minimum.z) * tryMesh2.scaling.z / 2;
                meshPos = tryMesh2.getAbsolutePosition();

                direction = direction.after[0];
                xIndex = xTry2;
                zIndex = zTry2;

                if (direction.vertical) {
                    nextPoint.x = meshPos.x + direction.after[0].point[0] * xOffset;
                } else {
                    nextPoint.y = meshPos.z + direction.after[0].point[1] * zOffset;
                }
                path.push(nextPoint);
            } else {
                boundingBox = tryMesh.getBoundingInfo().boundingBox;
                xOffset = (boundingBox.maximum.x - boundingBox.minimum.x) * tryMesh.scaling.x / 2;
                zOffset = (boundingBox.maximum.z - boundingBox.minimum.z) * tryMesh.scaling.z / 2;
                meshPos = tryMesh.getAbsolutePosition();

                direction = direction.after[1];
                xIndex = xTry;
                zIndex = zTry;
            }
        } else {
            path.push(nextPoint);
            direction = direction.after[2];
        }
        nextPoint = new BABYLON.Vector2(
            meshPos.x + direction.point[0] * xOffset,
            meshPos.z + direction.point[1] * zOffset
        );
    } while ((xIndex !== topLeftData.xIndex || zIndex !== topLeftData.zIndex || direction !== TOP) && leakSafe < 100);

    const polygon = new BABYLON.PolygonMeshBuilder("tetris_piece", path, scene!);
    const extrudedMesh = polygon.build(false, 0.1);
    extrudedMesh.position.y = 5;
    extrudedMesh.physicsImpostor = new BABYLON.PhysicsImpostor(
        extrudedMesh,
        BABYLON.PhysicsImpostor.BoxImpostor,
        { mass: 0.1, friction: 0.7, restitution: 0.01 },
        scene!
    );

    addDragBehavior(extrudedMesh);
}

function addShakeBehavior(meshes: BABYLON.Mesh[]): void {
    const origPosMap = new Map<BABYLON.Mesh, BABYLON.Vector3>();
    const origMin = new BABYLON.Vector3(minX, minY, minZ);
    const origMax = new BABYLON.Vector3(maxX, 0, maxZ);

    for (const m of meshes) {
        origPosMap.set(m, m.position.clone());

        const dragBehavior = new BABYLON.PointerDragBehavior();

        dragBehavior.onDragStartObservable.add(() => {
            togglePhysicsAndShake();
        });

        dragBehavior.onDragObservable.add(() => {
            dragMovements();
        });

        dragBehavior.onDragEndObservable.add(() => {
            dragMovements();
            moveArcRotateCamera(3 * Math.PI / 2, 0, 42, dragBehavior.attachedNode.position);

            for (const mesh of meshes) {
                removeDragBehavior(mesh);
                mesh.isPickable = false;
            }
        });

        function dragMovements(): void {
            const attachedNode = dragBehavior.attachedNode as BABYLON.Mesh;
            const moveVector = attachedNode.position.subtract(origPosMap.get(attachedNode)!);

            for (const mesh of meshes) {
                if (mesh !== attachedNode) {
                    mesh.position.copyFrom(origPosMap.get(mesh)!.add(moveVector));
                }
            }

            minX = origMin.x + moveVector.x;
            minY = origMin.y + moveVector.y;
            minZ = origMin.z + moveVector.z;
            maxX = origMax.x + moveVector.x;
            maxZ = origMax.z + moveVector.z;
        }

        m.addBehavior(dragBehavior);
    }
}

function removeDragBehavior(mesh: BABYLON.Mesh): void {
    const behaviors = mesh.behaviors.slice();
    for (const behavior of behaviors) {
        if (behavior instanceof BABYLON.PointerDragBehavior) {
            mesh.removeBehavior(behavior);
        }
    }
}

function addDragBehavior(mesh: BABYLON.Mesh): void {
    const dragBehavior = new BABYLON.PointerDragBehavior({ dragPlaneNormal: new BABYLON.Vector3(0, 1, 0) });
    dragBehavior.useObjectOrientationForDragging = false;

    dragBehavior.onDragStartObservable.add(() => {
        let node = dragBehavior.attachedNode as BABYLON.Mesh;
        animateRotationToZero(node);

        while (node.parent) node = node.parent as BABYLON.Mesh;

        if (node.physicsImpostor) {
            node.physicsImpostor.dispose();
            node.physicsImpostor = null;
        }
    });

    dragBehavior.onDragEndObservable.add(() => {
        let draggedNode = dragBehavior.attachedNode as BABYLON.Mesh;
        scene!.stopAnimation(draggedNode);
        draggedNode.animations = [];

        while (draggedNode.parent) draggedNode = draggedNode.parent as BABYLON.Mesh;

        if (draggedNode) {
            for (const node of getAllRelated(draggedNode)) {
                const data = piecesMap.get(node);
                if (!data) continue;

                const neighbours: BABYLON.Mesh[] = [];
                if (data.xIndex > 0) neighbours.push(piecesArray[data.xIndex - 1][data.zIndex]);
                if (data.xIndex < numX - 1) neighbours.push(piecesArray[data.xIndex + 1][data.zIndex]);
                if (data.zIndex > 0) neighbours.push(piecesArray[data.xIndex][data.zIndex - 1]);
                if (data.zIndex < numZ - 1) neighbours.push(piecesArray[data.xIndex][data.zIndex + 1]);

                for (const n of neighbours) {
                    if (areMeshesRelated(n, node)) continue;

                    const nData = piecesMap.get(n)!;
                    const origRelativePosXZ = new BABYLON.Vector3(
                        data.origPos.x - nData.origPos.x,
                        0,
                        data.origPos.z - nData.origPos.z
                    );

                    const currentRelativePosXZ = new BABYLON.Vector3(
                        node.getAbsolutePosition().x - n.getAbsolutePosition().x,
                        0,
                        node.getAbsolutePosition().z - n.getAbsolutePosition().z
                    );

                    const topParent = getTopParent(node);

                    const posEpsilon = 2;
                    const rotEpsilon = 1;

                    const identityQuaternion = BABYLON.Quaternion.Identity();
                    const positionMatch = BABYLON.Vector3.Distance(origRelativePosXZ, currentRelativePosXZ) < posEpsilon;
                    const rotationMatch =
                        BABYLON.Quaternion.Dot(topParent.rotationQuaternion!, identityQuaternion) > 1 - rotEpsilon &&
                        BABYLON.Quaternion.Dot(n.rotationQuaternion!, identityQuaternion) > 1 - rotEpsilon;

                    if (positionMatch && rotationMatch) {
                        const topParentData = piecesMap.get(topParent)!;
                        removeDragBehavior(topParent);

                        const neighbourTopParent = getTopParent(n);
                        if (neighbourTopParent.physicsImpostor) {
                            neighbourTopParent.physicsImpostor.dispose();
                            neighbourTopParent.physicsImpostor = null;
                        }

                        topParent.setParent(neighbourTopParent);
                        topParent.rotationQuaternion = identityQuaternion;
                        neighbourTopParent.rotationQuaternion = identityQuaternion;

                        const ntData = piecesMap.get(neighbourTopParent)!;
                        topParent.position.x = topParentData.origPos.x - ntData.origPos.x;
                        topParent.position.z = topParentData.origPos.z - ntData.origPos.z;

                        topParent.computeWorldMatrix(true);
                        topParent.refreshBoundingInfo();

                        makeChildrenSiblings(topParent);
                        removeDragBehavior(neighbourTopParent);
                        makePolygon(neighbourTopParent);

                        if (neighbourTopParent.getChildren().length + 1 === piecesCount) {
                            alert("Job done!");
                        }
                        return;
                    }
                }
            }

            if (!draggedNode.physicsImpostor && !draggedNode.parent) {
                draggedNode.physicsImpostor = new BABYLON.PhysicsImpostor(
                    draggedNode,
                    BABYLON.PhysicsImpostor.BoxImpostor,
                    { mass: 0.1, friction: 0.7, restitution: 0.01 },
                    scene!
                );
            }
        }
    });

    mesh.addBehavior(dragBehavior);
}

function makeChildrenSiblings(mesh: BABYLON.Mesh): void {
    if (!mesh.parent) {
        console.warn("The mesh has no parent. Children cannot become siblings.");
        return;
    }

    const parent = mesh.parent as BABYLON.Mesh;
    mesh.computeWorldMatrix(true);

    mesh.getChildMeshes().forEach(child => {
        child.computeWorldMatrix(true);

        const worldPosition = child.getAbsolutePosition();
        const worldRotation = new BABYLON.Quaternion();
        child.getWorldMatrix().decompose(undefined, worldRotation, undefined);

        child.parent = parent;

        const invParentMatrix = parent.getWorldMatrix().invert();
        child.position = BABYLON.Vector3.TransformCoordinates(worldPosition, invParentMatrix);
        child.rotationQuaternion = parent.rotationQuaternion
            ? parent.rotationQuaternion.invert().multiply(worldRotation)
            : worldRotation;
    });
}

function areMeshesRelated(meshA: BABYLON.Mesh, meshB: BABYLON.Mesh): boolean {
    const ancestorA = getTopParent(meshA);
    const ancestorB = getTopParent(meshB);
    return ancestorA === ancestorB;
}

function getAllRelated(mesh: BABYLON.Mesh): BABYLON.Mesh[] {
    const rootMesh = getTopParent(mesh);
    return getAllChildren(rootMesh);
}

function getTopParent(mesh: BABYLON.Mesh): BABYLON.Mesh {
    while (mesh.parent && piecesMap.has(mesh.parent as BABYLON.Mesh)) {
        mesh = mesh.parent as BABYLON.Mesh;
    }
    return mesh;
}

function getAllChildren(mesh: BABYLON.Mesh): BABYLON.Mesh[] {
    let children: BABYLON.Mesh[] = [];
    for (const ch of mesh.getChildren()) {
        children = [...children, ...getAllChildren(ch as BABYLON.Mesh)];
    }
    return [mesh, ...children];
}

function getEdgePosition(
    mesh: BABYLON.Mesh,
    func: (edge: BABYLON.Vector3, current: BABYLON.Vector3) => boolean
): BABYLON.Vector3 {
    let edgePosition = mesh.getAbsolutePosition();

    for (const m of getAllRelated(mesh)) {
        const absPos = m.getAbsolutePosition();
        if (func(edgePosition, absPos)) {
            edgePosition = absPos;
        }
    }

    return edgePosition;
}

function tryGetMesh(x: number, z: number, toContain: BABYLON.Mesh[] | null = null): BABYLON.Mesh | null {
    if (x >= 0 && z >= 0 && x < numX && z < numZ) {
        const tryMesh = piecesArray[x][z];
        if (!toContain || toContain.includes(tryMesh)) {
            return tryMesh;
        }
    }
    return null;
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

function moveArcRotateCamera(
    newAlpha: number,
    newBeta: number,
    newRadius: number,
    newTarget: BABYLON.Vector3,
    duration: number = 60
): void {
    const frameRate = 60;

    const createAnimation = (property: string, from: number, to: number) => {
        const animation = new BABYLON.Animation(
            `${property}Anim`,
            property,
            frameRate,
            BABYLON.Animation.ANIMATIONTYPE_FLOAT,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
        );
        animation.setKeys([
            { frame: 0, value: from },
            { frame: duration, value: to }
        ]);
        return animation;
    };

    const alphaAnim = createAnimation("alpha", camera.alpha, newAlpha);
    const betaAnim = createAnimation("beta", camera.beta, newBeta);
    const radiusAnim = createAnimation("radius", camera.radius, newRadius);

    const targetXAnim = createAnimation("target.x", camera.target.x, newTarget.x);
    const targetYAnim = createAnimation("target.y", camera.target.y, newTarget.y);
    const targetZAnim = createAnimation("target.z", camera.target.z, newTarget.z);

    camera.animations = [
        alphaAnim,
        betaAnim,
        radiusAnim,
        targetXAnim,
        targetYAnim,
        targetZAnim
    ];

    scene.beginAnimation(camera, 0, duration, false);
}
function togglePhysicsAndShake(): void {
    jigsawPieces.forEach(piece => {
        excludeFromParent(piece);
    });

    jigsawPieces.forEach(piece => {
        ensureDragBehavior(piece);

        if (piece.physicsImpostor) {
            piece.physicsImpostor.dispose();
        }

        piece.physicsImpostor = new BABYLON.PhysicsImpostor(
            piece,
            BABYLON.PhysicsImpostor.BoxImpostor,
            { mass: 0.2, friction: 0.3, restitution: 0.1 },
            scene!
        );
    });

    jigsawPieces.forEach(piece => {
        const shakePower = 20;
        const randomImpulse = new BABYLON.Vector3(
            (Math.random() - 0.5) * shakePower - piece.position.x * 0.01,
            (Math.random() - 0.5) * shakePower,
            (Math.random() - 0.5) * shakePower - piece.position.z * 0.01
        );
        piece.physicsImpostor!.applyImpulse(randomImpulse, piece.getAbsolutePosition());
    });
}

function animateRotationToZero(mesh: BABYLON.Mesh): void {
    if (!mesh.rotationQuaternion) return;

    const easing = new BABYLON.QuadraticEase();
    easing.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEOUT);

    let anim = new BABYLON.Animation(
        "rotationAnim",
        "rotationQuaternion",
        60,
        BABYLON.Animation.ANIMATIONTYPE_QUATERNION,
        BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
    );

    let keys = [
        { frame: 0, value: mesh.rotationQuaternion.clone() },
        { frame: 100, value: BABYLON.Quaternion.Identity() }
    ];

    anim.setKeys(keys);
    anim.setEasingFunction(easing);

    mesh.animations = [];
    mesh.animations.push(anim);

    anim = new BABYLON.Animation(
        "liftAnim",
        "position.y",
        60,
        BABYLON.Animation.ANIMATIONTYPE_FLOAT,
        BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
    );

    let keys2 = [
        { frame: 0, value: mesh.position.y },
        { frame: 100, value: 3 }
    ];

    anim.setKeys(keys2);
    anim.setEasingFunction(easing);

    mesh.animations.push(anim);

    scene!.beginAnimation(mesh, 0, 100, false);
}

function excludeFromParent(mesh: BABYLON.Mesh): void {
    if (!mesh.parent) return;

    const parent = mesh.parent as BABYLON.Mesh;
    mesh.computeWorldMatrix(true);

    const worldPosition = mesh.getAbsolutePosition();
    const worldRotation = new BABYLON.Quaternion();
    mesh.getWorldMatrix().decompose(undefined, worldRotation, undefined);

    mesh.parent = null;
    mesh.position = worldPosition;
    mesh.rotationQuaternion = worldRotation;

    mesh.computeWorldMatrix(true);
    mesh.refreshBoundingInfo();
    parent.computeWorldMatrix(true);
    parent.refreshBoundingInfo();
}

function ensureDragBehavior(mesh: BABYLON.Mesh): void {
    const hasDrag = mesh.behaviors.some(behavior => behavior instanceof BABYLON.PointerDragBehavior);
    if (!hasDrag) {
        addDragBehavior(mesh);
    }
}
