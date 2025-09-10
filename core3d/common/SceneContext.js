import { Vector3 } from "@babylonjs/core";
import { GiftBoxBuilder } from "../builders/GiftBoxBuilder";
export const Categories = {
    General: { key: "General", text: "General", tags: ["General"], url: "assets/categories/category-general.webp" },
    Animals: { key: "Animals", text: "Animals", tags: ["Theme_Animals"], url: "assets/categories/category-animal.webp" },
    Beach: { key: "Beach", text: "Beach", tags: ["Theme_Beach"], url: "assets/categories/category-beach.webp" },
    Flowers: { key: "Flowers", text: "Flowers", tags: ["Theme_Floral"], url: "assets/categories/category-floral.webp" },
    Gift: { key: "Gift", text: "Make a Gift", tags: [], url: "assets/categories/giftbox.webp" },
};
export const CategoryKeys = Object.keys(Categories);
class SceneContext {
    constructor() {
        this._debugMode = true; // TODO from properties
        this._scene = null;
        this._jigsawPieces = [];
        this._piecesArray = [];
        this._piecesMap = new Map();
        this._helpBoxMap = new Map();
        this._polygonMap = new Map();
        this._numX = 25;
        this._numZ = 20;
        this._xLimit = 22;
        this._zLimit = 16.5;
        this._latheMulti = 1.454;
        this._latheMultiY = 1 / 6;
        this._latheWidth = this._xLimit * this._latheMulti;
        this._latheHeight = this._zLimit * this._latheMultiY;
        this._latheDepth = this._zLimit * this._latheMulti;
        this._coverMulti = 2.1;
        this._coverWidth = this._xLimit * this._coverMulti;
        this._coverHeight = this._zLimit * this._coverMulti;
        this._coverDepth = this._xLimit * 1 / 6;
        this._camera = null;
        this._canvas = null;
        this._engine = null;
        this._pieceEdge = 2;
        this._kitWidth = this._xLimit * 1.4;
        this._kitHeight = this._zLimit * 1.4;
        this._pieceStepX = this._kitWidth / this._numX;
        this._pieceStepZ = this._kitHeight / this._numZ;
        this._pieceScaleX = this._pieceStepX / this._pieceEdge;
        this._pieceScaleZ = this._pieceStepZ / this._pieceEdge;
        this._pieceWidth = 2.5 * this._pieceScaleX;
        this._pieceHeight = 0.4;
        this._pieceDepth = 2.5 * this._pieceScaleZ;
        this._pieceHeightHalf = this._pieceHeight / 2;
        this._pieceWidthHalf = this._pieceWidth / 2;
        this._pieceDepthHalf = this._pieceDepth / 2;
        this._minX = -this._xLimit;
        this._maxX = this._xLimit;
        this._minZ = -this._zLimit;
        this._maxZ = this._zLimit;
        this._minY = -0.36;
        this._piecesCount = this._numX * this._numZ;
        this._category = null;
        this.originalCoverState = { position: GiftBoxBuilder.BASE_POS.clone(), rotation: Vector3.Zero() };
        this.originalCameraState = null;
    }
    init(scene, camera, canvas, engine) {
        this._scene = scene;
        this._camera = camera;
        this._canvas = canvas;
        this._engine = engine;
        this.originalCameraState = {
            alpha: this._camera.alpha,
            beta: this._camera.beta,
            radius: this._camera.radius,
            target: this._camera.target.clone()
        };
        const isPortrait = ctx.engine.getRenderHeight() > ctx.engine.getRenderWidth();
        if (isPortrait) {
            let help = this._xLimit;
            this._xLimit = this._zLimit;
            this._zLimit = help;
            this._latheWidth = this._xLimit * this._latheMulti;
            this._latheHeight = this._xLimit * this._latheMultiY;
            this._latheDepth = this._zLimit * this._latheMulti;
            this._coverWidth = this._xLimit * this._coverMulti;
            this._coverHeight = this._zLimit * this._coverMulti;
            this._coverDepth = this._xLimit * 1 / 6;
            this._kitWidth = this._xLimit * 1.4;
            this._kitHeight = this._zLimit * 1.4;
            this._pieceStepX = this._kitWidth / this._numX;
            this._pieceStepZ = this._kitHeight / this._numZ;
            this._pieceScaleX = this._pieceStepX / this._pieceEdge;
            this._pieceScaleZ = this._pieceStepZ / this._pieceEdge;
            this._pieceWidth = 2.5 * this._pieceScaleX;
            this._pieceDepth = 2.5 * this._pieceScaleZ;
            this._pieceHeight = 0.4;
            this._pieceHeightHalf = this._pieceHeight / 2;
            this._pieceWidthHalf = this._pieceWidth / 2;
            this._pieceDepthHalf = this._pieceDepth / 2;
            this._minX = -this._xLimit;
            this._maxX = this._xLimit;
            this._minZ = -this._zLimit;
            this._maxZ = this._zLimit;
            this._minY = -0.36;
            this._piecesCount = this._numX * this._numZ;
        }
    }
    get debugMode() {
        return this._debugMode;
    }
    get scene() {
        return this._scene;
    }
    get camera() {
        return this._camera;
    }
    get cameraObject() {
        return this._camera;
    }
    get cameraAlpha() {
        return this.camera.alpha;
    }
    get cameraBeta() {
        return this.camera.beta;
    }
    get cameraRadius() {
        return this.camera.radius;
    }
    get cameraTarget() {
        return this.camera.target.clone();
    }
    set cameraAlpha(value) {
        this.camera.alpha = value;
    }
    set cameraBeta(value) {
        this.camera.beta = value;
    }
    set cameraRadius(value) {
        this.camera.radius = value;
    }
    set cameraTarget(value) {
        this.camera.target = value.clone();
    }
    get cameraUpperAlphaLimit() {
        return this.camera.upperAlphaLimit;
    }
    get cameraLowerAlphaLimit() {
        return this.camera.lowerAlphaLimit;
    }
    get cameraUpperBetaLimit() {
        return this.camera.upperBetaLimit;
    }
    get cameraLowerBetaLimit() {
        return this.camera.lowerBetaLimit;
    }
    set cameraUpperAlphaLimit(value) {
        this.camera.upperAlphaLimit = value;
    }
    set cameraLowerAlphaLimit(value) {
        this.camera.lowerAlphaLimit = value;
    }
    set cameraUpperBetaLimit(value) {
        this.camera.upperBetaLimit = value;
    }
    set cameraLowerBetaLimit(value) {
        this.camera.lowerBetaLimit = value;
    }
    cameraAttachControl(value) {
        this.camera.attachControl(this._canvas, value);
    }
    cameraDetachControl() {
        this.camera.detachControl();
    }
    get cameraInitialized() {
        return this._camera !== null;
    }
    get cameraPosition() {
        return this.camera.position.clone();
    }
    /*get camera(): ArcRotateCamera {
        return this._camera!;
    }*/
    get canvas() {
        return this._canvas;
    }
    get engine() {
        return this._engine;
    }
    get jigsawPieces() {
        return this._jigsawPieces;
    }
    get piecesArray() {
        return this._piecesArray;
    }
    get piecesMap() {
        return this._piecesMap;
    }
    get helpBoxMap() {
        return this._helpBoxMap;
    }
    get polygonMap() {
        return this._polygonMap;
    }
    get numX() {
        return this._numX;
    }
    get numZ() {
        return this._numZ;
    }
    get xLimit() {
        return this._xLimit;
    }
    get zLimit() {
        return this._zLimit;
    }
    get coverWidth() {
        return this._coverWidth;
    }
    get coverHeight() {
        return this._coverHeight;
    }
    get coverDepth() {
        return this._coverDepth;
    }
    get pieceEdge() {
        return this._pieceEdge;
    }
    get kitWidth() {
        return this._kitWidth;
    }
    get kitHeight() {
        return this._kitHeight;
    }
    get latheWidth() {
        return this._latheWidth;
    }
    get latheHeight() {
        return this._latheHeight;
    }
    get latheDepth() {
        return this._latheDepth;
    }
    get pieceScaleX() {
        return this._pieceScaleX;
    }
    get pieceScaleZ() {
        return this._pieceScaleZ;
    }
    get pieceStepX() {
        return this._pieceStepX;
    }
    get pieceStepZ() {
        return this._pieceStepZ;
    }
    get pieceWidth() {
        return this._pieceWidth;
    }
    get pieceHeight() {
        return this._pieceHeight;
    }
    get pieceDepth() {
        return this._pieceDepth;
    }
    get pieceHeightHalf() {
        return this._pieceHeightHalf;
    }
    get pieceWidthHalf() {
        return this._pieceWidthHalf;
    }
    get pieceDepthHalf() {
        return this._pieceDepthHalf;
    }
    get piecesCount() {
        return this._piecesCount;
    }
    get minX() {
        return this._minX;
    }
    get maxX() {
        return this._maxX;
    }
    get minZ() {
        return this._minZ;
    }
    get maxZ() {
        return this._maxZ;
    }
    get minY() {
        return this._minY;
    }
    get category() {
        return this._category;
    }
    set minX(value) {
        this._minX = value;
    }
    set maxX(value) {
        this._maxX = value;
    }
    set minZ(value) {
        this._minZ = value;
    }
    set maxZ(value) {
        this._maxZ = value;
    }
    set minY(value) {
        this._minY = value;
    }
    set numX(value) {
        this._numX = value;
        this._piecesCount = this._numX * this._numZ;
        this._pieceStepX = this._kitWidth / this._numX;
        this._pieceScaleX = this._pieceStepX / this._pieceEdge;
        this._pieceWidth = 2.5 * this._pieceScaleX;
        this._pieceWidthHalf = this._pieceWidth / 2;
    }
    set numZ(value) {
        this._numZ = value;
        this._piecesCount = this._numX * this._numZ;
        this._pieceStepZ = this._kitHeight / this._numZ;
        this._pieceScaleZ = this._pieceStepZ / this._pieceEdge;
        this._pieceDepth = 2.5 * this._pieceScaleZ;
        this._pieceDepthHalf = this._pieceDepth / 2;
    }
    set jigsawPieces(value) {
        this._jigsawPieces = value;
    }
    set piecesArray(value) {
        this._piecesArray = value;
    }
    set piecesMap(value) {
        this._piecesMap = value;
    }
    set helpBoxMap(value) {
        this._helpBoxMap = value;
    }
    set polygonMap(value) {
        this._polygonMap = value;
    }
    set category(value) {
        this._category = value;
    }
    resetBoundings(centerPos) {
        this._minX = centerPos.x - this._xLimit;
        this._maxX = centerPos.x + this._xLimit;
        this._minZ = centerPos.z - this._zLimit;
        this._maxZ = centerPos.z + this._zLimit;
        this._minY = centerPos.y - 0.36;
    }
}
const ctx = new SceneContext();
export default ctx;
