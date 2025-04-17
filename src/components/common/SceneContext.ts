import { ArcRotateCamera, Engine, Mesh, Scene, Vector3 } from "@babylonjs/core";

class SceneContext {
    private _scene: Scene | null = null;
    private _jigsawPieces: Mesh[] = [];
    private _piecesArray: Mesh[][] = [];
    private _piecesMap: Map<Mesh, {
        origPos: Vector3;
        xIndex: number;
        zIndex: number;
        shapeMesh: Mesh;
    }> = new Map();
    private _helpBoxMap: Map<Mesh, Mesh> = new Map();
    private _polygonMap: Map<Mesh, Mesh> = new Map();
    private _numX: number = 25;
    private _numZ: number = 20;
    private _xLimit: number = 22;
    private _zLimit: number = 16.5;
    private _latheMulti: number = 1.454;
    private _latheMultiY: number = 1 / 6;
    private _latheWidth = this._xLimit * this._latheMulti;
    private _latheHeight = this._zLimit * this._latheMultiY;
    private _latheDepth = this._zLimit * this._latheMulti;
    private _coverMulti: number = 2.1;
    private _coverWidth: number = this._xLimit * this._coverMulti;
    private _coverHeight: number = this._zLimit * this._coverMulti;
    private _coverDepth: number = this._xLimit * 1 / 6;
    private _camera: ArcRotateCamera | null = null;
    private _canvas: HTMLCanvasElement | null = null;
    private _engine: Engine | null = null;
    private _pieceEdge: number = 2;
    private _kitWidth: number = this._xLimit * 1.4;
    private _kitHeight: number = this._zLimit * 1.4;
    private _pieceStepX: number = this._kitWidth / this._numX;
    private _pieceStepZ: number = this._kitHeight / this._numZ;
    private _pieceScaleX: number = this._pieceStepX / this._pieceEdge;
    private _pieceScaleZ: number = this._pieceStepZ / this._pieceEdge;
    private _pieceWidth = 2.5 * this._pieceScaleX;
    private _pieceHeight = 0.4;
    private _pieceDepth = 2.5 * this._pieceScaleZ;
    private _pieceHeightHalf = this._pieceHeight / 2;
    private _pieceWidthHalf = this._pieceWidth / 2;
    private _pieceDepthHalf = this._pieceDepth / 2;
    private _minX: number = -this._xLimit;
    private _maxX: number = this._xLimit;
    private _minZ: number = -this._zLimit;
    private _maxZ: number = this._zLimit;
    private _minY: number = -0.36;
    private _piecesCount = this._numX * this._numZ;

    init(scene: Scene, camera: ArcRotateCamera, canvas: HTMLCanvasElement, engine: Engine): void {
        this._scene = scene;
        this._camera = camera;
        this._canvas = canvas;
        this._engine = engine;
    }

    get scene(): Scene {
        return this._scene!;
    }
    get camera(): ArcRotateCamera {
        return this._camera!;
    }
    get canvas(): HTMLCanvasElement {
        return this._canvas!;
    }
    get engine(): Engine {
        return this._engine!;
    }
    get jigsawPieces(): Mesh[] {
        return this._jigsawPieces;
    }
    get piecesArray(): Mesh[][] {
        return this._piecesArray;
    }
    get piecesMap(): Map<Mesh, {
        origPos: Vector3;
        xIndex: number;
        zIndex: number;
        shapeMesh: Mesh;
    }> {
        return this._piecesMap;
    }
    get helpBoxMap(): Map<Mesh, Mesh> {
        return this._helpBoxMap;
    }
    get polygonMap(): Map<Mesh, Mesh> {
        return this._polygonMap;
    }
    get numX(): number {
        return this._numX;
    }
    get numZ(): number {
        return this._numZ;
    }
    get xLimit(): number {
        return this._xLimit;
    }
    get zLimit(): number {
        return this._zLimit;
    }
    get coverWidth(): number {
        return this._coverWidth;
    }
    get coverHeight(): number {
        return this._coverHeight;
    }
    get coverDepth(): number {
        return this._coverDepth;
    }
    get pieceEdge(): number {
        return this._pieceEdge;
    }
    get kitWidth(): number {
        return this._kitWidth;
    }
    get kitHeight(): number {
        return this._kitHeight;
    }
    get latheWidth(): number {
        return this._latheWidth;
    }
    get latheHeight(): number {
        return this._latheHeight;
    }
    get latheDepth(): number {
        return this._latheDepth;
    }
    get pieceScaleX(): number {
        return this._pieceScaleX;
    }
    get pieceScaleZ(): number {
        return this._pieceScaleZ;
    }
    get pieceStepX(): number {
        return this._pieceStepX;
    }
    get pieceStepZ(): number {
        return this._pieceStepZ;
    }
    get pieceWidth(): number {
        return this._pieceWidth;
    }
    get pieceHeight(): number {
        return this._pieceHeight;
    }
    get pieceDepth(): number {
        return this._pieceDepth;
    }
    get pieceHeightHalf(): number {
        return this._pieceHeightHalf;
    }
    get pieceWidthHalf(): number {
        return this._pieceWidthHalf;
    }
    get pieceDepthHalf(): number {
        return this._pieceDepthHalf;
    }
    get piecesCount(): number {
        return this._piecesCount;
    }
    get minX(): number {
        return this._minX;
    }
    get maxX(): number {
        return this._maxX;
    }
    get minZ(): number {
        return this._minZ;
    }
    get maxZ(): number {
        return this._maxZ;
    }
    get minY(): number {
        return this._minY;
    }

    set minX(value: number) {
        this._minX = value;
    }
    set maxX(value: number) {
        this._maxX = value;
    }
    set minZ(value: number) {
        this._minZ = value;
    }
    set maxZ(value: number) {
        this._maxZ = value;
    }
    set minY(value: number) {
        this._minY = value;
    }
    set numX(value: number) {
        this._numX = value;
        this._piecesCount = this._numX * this._numZ;
        this._pieceStepX = this._kitWidth / this._numX;
        this._pieceScaleX = this._pieceStepX / this._pieceEdge;
        this._pieceWidth = 2.5 * this._pieceScaleX;
    }
    set numZ(value: number) {
        this._numZ = value;
        this._piecesCount = this._numX * this._numZ;
        this._pieceStepZ = this._kitHeight / this._numZ;
        this._pieceScaleZ = this._pieceStepZ / this._pieceEdge;
        this._pieceDepth = 2.5 * this._pieceScaleZ;
    }
    set jigsawPieces(value: Mesh[]) {
        this._jigsawPieces = value;
    }
    set piecesArray(value: Mesh[][]) {
        this._piecesArray = value;
    }
    set piecesMap(value: Map<Mesh, {
        origPos: Vector3;
        xIndex: number;
        zIndex: number;
        shapeMesh: Mesh;
    }>) {
        this._piecesMap = value;
    }
    set helpBoxMap(value: Map<Mesh, Mesh>) {
        this._helpBoxMap = value;
    }
    set polygonMap(value: Map<Mesh, Mesh>) {
        this._polygonMap = value;
    }
    
    public originalCoverState: { position: Vector3; rotation: Vector3 } | null = null;
    public originalCameraState: { alpha: number; beta: number; radius: number; target: Vector3 } | null = null;

    public currentCover!: Mesh;

    public resetBoundings(centerPos: Vector3): void {
        this._minX = centerPos.x - this._xLimit;
        this._maxX = centerPos.x + this._xLimit;
        this._minZ = centerPos.z - this._zLimit;
        this._maxZ = centerPos.z + this._zLimit;
        this._minY = centerPos.y - 0.36;
    }
}

const ctx = new SceneContext();
export default ctx;