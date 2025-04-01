import ammo from "ammojs-typed";
import "@babylonjs/loaders"; // Required if you load external models
import puzzleBuilder from "./components/PuzzleBuilder";
import behaviorManager from "./components/BehaviorManager";
import meshHelpers from "./components/MeshHelpers";
import createCover from "./components/elements/PuzzleCover";
import ctx from "./components/SceneContext";
import { AmmoJSPlugin, ArcRotateCamera, Engine, HemisphericLight, InitializeCSG2Async, Mesh, Quaternion, Scalar, Scene, Vector3 } from "@babylonjs/core";
import buildScene from "./components/SceneBuilder";


// Get the canvas element
const canvas = document.createElement("canvas");
document.body.appendChild(canvas);

// Create the js engine
const engine = new Engine(canvas, true);

window.addEventListener("DOMContentLoaded", async () => {
    const Ammo = await ammo.bind(window)()
  
    await createScene(); // Assuming createScene is already defined globally or imported

    engine.resize();


    engine.runRenderLoop(() => {
        ctx.scene.render();
    });
});

// Handle window resizing
window.addEventListener("resize", () => {
    engine.resize();
});

// ✅ Converted createScene function to TypeScript
const createScene = async function (): Promise<Scene> {
    let scene = new Scene(engine);
    let camera = new ArcRotateCamera("Camera", 3 * Math.PI / 2, Math.PI / 4, 60, Vector3.Zero(), scene);

    ctx.init(scene, camera);

    const light1 = new HemisphericLight("light1", new Vector3(0, 10, 0), scene);
    const light2 = new HemisphericLight("light2", new Vector3(0, -10, 5), scene);
    light1.intensity = 0.5;
    light2.intensity = 0.5;

    const physicsPlugin = new AmmoJSPlugin(true);
    scene.enablePhysics(new Vector3(0, -9.81, 0), physicsPlugin);

    await InitializeCSG2Async();

    buildScene();
 
    scene.onBeforeRenderObservable.add(checkPiecePositions);

    createCover();

    return scene;
};

function checkPiecePositions(): void {
    for (const [helpBox, groupBox] of ctx.helpBoxMap.entries()) {
        helpBox.position.copyFrom(groupBox.position);
        helpBox.rotationQuaternion = groupBox.rotationQuaternion!.clone();
    }

    ctx.jigsawPieces.forEach(piece => {
        const pieceData = ctx.piecesMap.get(piece);
        if (!pieceData) return;
        const shapeMesh = pieceData.shapeMesh;

        piece.computeWorldMatrix(true);
        shapeMesh.position.copyFrom(piece.getAbsolutePosition());

        const worldMatrix = piece.getWorldMatrix();
        const absoluteRotation = new Quaternion();
        worldMatrix.decompose(undefined, absoluteRotation, undefined);
        shapeMesh.rotationQuaternion = absoluteRotation;

        if (piece.parent) {
            piece.position.y = 0;
            piece.rotationQuaternion = Quaternion.Identity();
            return;
        }

        const power = piece.getChildren().length < 1 ? 1.5 : 0.04;

        const edgePosMinX = getEdgePosition(piece, (edge, pos) => pos.x - ctx.pieceWidthHalf < edge.x);
        const edgePosMaxX = getEdgePosition(piece, (edge, pos) => pos.x + ctx.pieceWidthHalf > edge.x);
        const edgePosMinZ = getEdgePosition(piece, (edge, pos) => pos.z - ctx.pieceDepthHalf < edge.z);
        const edgePosMaxZ = getEdgePosition(piece, (edge, pos) => pos.z + ctx.pieceDepthHalf > edge.z);
        const edgePosMinY = getEdgePosition(piece, (edge, pos) => pos.y - ctx.pieceHeightHalf < edge.y);

        let edgePos: Vector3 | null = null;

        if (edgePosMinX.x - ctx.pieceWidthHalf < ctx.minX) {
            piece.position.x += 0.2;
            edgePos = edgePosMinX;
        } else if (edgePosMaxX.x + ctx.pieceWidthHalf > ctx.maxX) {
            piece.position.x -= 0.2;
            edgePos = edgePosMaxX;
        } else if (edgePosMinZ.z - ctx.pieceDepthHalf < ctx.minZ) {
            piece.position.z += 0.2;
            edgePos = edgePosMinZ;
        } else if (edgePosMaxZ.z + ctx.pieceDepthHalf > ctx.maxZ) {
            piece.position.z -= 0.2;
            edgePos = edgePosMaxZ;
        } else if (edgePosMinY.y - ctx.pieceHeightHalf < ctx.minY - 0.1) {
            piece.position.y += 0.2;
            edgePos = edgePosMinY;
        } else {
            return;
        }

        const centerPoint = new Vector3((ctx.maxX + ctx.minX) / 2, 20 - ctx.minY, (ctx.maxZ + ctx.minZ) / 2);
        const directionToCenter = centerPoint.subtract(edgePos).normalize();

        if (piece.physicsImpostor) {
            piece.physicsImpostor.setLinearVelocity(Vector3.Zero());
            const centerImpulse = directionToCenter.scale(power);
            piece.physicsImpostor.applyImpulse(centerImpulse, edgePos);

            if (piece.getChildren().length >= 3) {
                const maxAngularSpeed = 1;
                const angularVelocity = piece.physicsImpostor.getAngularVelocity();

                if (angularVelocity) {
                    angularVelocity.x = Scalar.Clamp(angularVelocity.x, -maxAngularSpeed, maxAngularSpeed);
                    angularVelocity.y = Scalar.Clamp(angularVelocity.y, -maxAngularSpeed, maxAngularSpeed);
                    angularVelocity.z = Scalar.Clamp(angularVelocity.z, -maxAngularSpeed, maxAngularSpeed);
                }

                piece.physicsImpostor.setAngularVelocity(angularVelocity);
            }
        }
    });
}

function getEdgePosition(
    mesh: Mesh,
    func: (edge: Vector3, current: Vector3) => boolean
): Vector3 {
    let edgePosition = mesh.getAbsolutePosition();

    for (const m of meshHelpers.getAllRelated(mesh)) {
        const absPos = m.getAbsolutePosition();
        if (func(edgePosition, absPos)) {
            edgePosition = absPos;
        }
    }

    return edgePosition;
}
