import { CSG2, Mesh, MeshBuilder, StandardMaterial, Texture, Vector3 } from "@babylonjs/core";
import ctx from "../common/SceneContext";
import puzzleBuilder from "./PuzzleBuilder";
import shakeBehaviorManager from "../behaviors/ShakeBehaviorManager";
import physicsImpostorBuilder from "./PhysicsImpostorBuilder";

class PuzzleGameBuilder {
    private _texture: Texture | null = null;
    private _building: boolean = false;
    private _lathe!: Mesh;
    private _ground!: Mesh;
    private _groundVis!: Mesh;
    private _groundCover!: Mesh;
    private _topLeft!: Mesh;
    private _top!: Mesh;
    private _left!: Mesh;
    private _middle!: Mesh;

    get texture(): Texture | null {
        return this._texture;
    }
    get building(): boolean {
        return this._building;
    }
    get underCoverMeshes(): Mesh[] {
        return [this._lathe, this._ground, this._groundVis, this._groundCover];
    }
    

    public init() {
        const mat = new StandardMaterial("mat", ctx.scene);
        mat.backFaceCulling = false;

        const myShape = [
            new Vector3(0.975, 0, 0),
            new Vector3(1, 0, 0),
            new Vector3(1, 1, 0),
            new Vector3(0.975, 1, 0)
        ];

        this._lathe = MeshBuilder.CreateLathe("lathe", { shape: myShape, radius: 1, tessellation: 4, sideOrientation: Mesh.DOUBLESIDE }, ctx.scene);
        this._lathe.convertToFlatShadedMesh();
        this._lathe.material = mat;
        this._lathe.rotation.y = Math.PI / 4;
        this._lathe.bakeCurrentTransformIntoVertices();
        this._lathe.scaling = new Vector3(ctx.latheWidth, ctx.latheHeight, ctx.latheDepth);

        this._ground = MeshBuilder.CreateGround("ground", { width: ctx.xLimit * 2, height: ctx.zLimit * 2 }, ctx.scene);
        this._ground.visibility = 0;
        
        physicsImpostorBuilder.attachGroundImpostor(this._ground);

        this._groundVis = MeshBuilder.CreateGround("ground", { width: ctx.xLimit * 2, height: ctx.zLimit * 2 }, ctx.scene);

        this._groundCover = MeshBuilder.CreateGround("ground", { width: ctx.xLimit * 2, height: ctx.zLimit * 2 }, ctx.scene);
        this._groundCover.visibility = 0;

        this._topLeft = puzzleBuilder.createPuzzlePiece(true, true, 0);
        this._top = puzzleBuilder.createPuzzlePiece(true, false, 1);
        this._left = puzzleBuilder.createPuzzlePiece(false, true, 2);
        this._middle = puzzleBuilder.createPuzzlePiece(false, false, 3);

        shakeBehaviorManager.addShakeBehavior([this._lathe, this._ground, this._groundVis, this._groundCover]);
    }

    public clear() {
        ctx.jigsawPieces.forEach(piece => piece.dispose());
        ctx.jigsawPieces = [];
        ctx.piecesArray = [];

        ctx.piecesMap.clear();

        ctx.polygonMap.forEach((polygon, mesh) => {
            polygon.dispose();
            mesh.dispose();
        })
        
        ctx.polygonMap.clear();
        ctx.helpBoxMap.clear();
    }

    public build(cover: Mesh) {
        this._building = true;

        shakeBehaviorManager.enableDragBehaviors();

        const puzzleTexture = (cover.material as StandardMaterial).diffuseTexture as Texture;
        this._texture = puzzleTexture;

        ctx.resetBoundings(cover.position);

        this._lathe.position = cover.position.clone();
        this._lathe.position.y = ctx.minY - 0.48;
        this._ground.position = cover.position.clone();
        this._ground.position.y = ctx.minY + 0.26;
        this._groundVis.position = cover.position.clone();
        this._groundVis.position.y = ctx.minY - 0.5;
        this._groundCover.position = cover.position.clone();
        this._groundCover.position.y = ctx.minY + 1;

        const startX = -ctx.kitWidth / 2;
        const startZ = ctx.kitHeight / 2;

        const box = puzzleBuilder.createFlatBox(ctx.kitWidth, ctx.kitHeight, 0.1, cover);

        let usePiece: Mesh;
        for (let i = 0; i < ctx.numX; i++) {
            const rowArray: Mesh[] = [];
            ctx.piecesArray.push(rowArray);

            for (let j = 0; j < ctx.numZ; j++) {
                if (i === 0 && j === 0) {
                    usePiece = this._topLeft;
                } else if (i === 0) {
                    usePiece = this._left;
                } else if (j === 0) {
                    usePiece = this._top;
                } else {
                    usePiece = this._middle;
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

                newMeshHolePlate.position.addInPlace(cover.position);
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

        this._building = false;
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

const puzzleGameBuilder = new PuzzleGameBuilder();
export default puzzleGameBuilder;