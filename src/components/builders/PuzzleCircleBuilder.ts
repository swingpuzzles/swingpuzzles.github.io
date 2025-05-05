import { Vector3, Mesh, HighlightLayer, Color3 } from '@babylonjs/core';
import amazonData from '../../assets/amazon-jigsaw.json';
import puzzleCoverBuilder from './PuzzleCoverBuilder';
import ctx from '../common/SceneContext';
import gameModeManager from '../behaviors/GameModeManager';

interface CoverData {
    imgCoverUrl: string;
    link: string;
}

class PuzzleCircleBuilder {
    private covers: Map<Mesh, CoverData> = new Map();
    private highlightedCover: Mesh | null = null;
    private highlightLayer!: HighlightLayer;
    private closestMesh: Mesh | null = null;

    constructor() {
    }

    public get selectedLink(): string {
        return this.covers.get(this.closestMesh!)!.link;
    }

    public get selectedCoverUrl(): string {
        return this.covers.get(this.closestMesh!)!.imgCoverUrl;
    }

    public get selectedCover(): Mesh {
        return this.closestMesh!;
    }

    build() {
        // Create the highlight layer when the builder is constructed
        this.highlightLayer = new HighlightLayer("coverHighlightLayer", ctx.scene, {
            blurHorizontalSize: 10,
            blurVerticalSize: 10,
            alphaBlendingMode: 2, // Use alpha blending mode for better performance
        });

        const radius = 100;
        const count = amazonData.length;

        amazonData.forEach((obj, index) => {
            const angle = (2 * Math.PI * index) / count;
            const x = radius * Math.cos(angle);
            const z = radius * Math.sin(angle);
            const position = new Vector3(x, -38, z);
            const cover = puzzleCoverBuilder.createCover(obj.imgSmallUrl, obj.imgBigUrl);
            cover.position = position;
            cover.rotation.y = -angle + Math.PI / 2;

            this.covers.set(cover, { imgCoverUrl: obj.imgCoverUrl, link: obj.link });
        });

        ctx.scene.onBeforeRenderObservable.add(() => {
            this.highlightClosestCover();
        });
    }

    private highlightClosestCover() {
        if (!ctx.camera) return;

        if (!gameModeManager.initialMode) {
            if (this.highlightedCover) {
                this.highlightLayer.removeMesh(this.highlightedCover);
                this.highlightedCover = null;
            }

            return;
        }

        let minDistance = Infinity;

        for (const [cover, link] of this.covers) {
            const dist = Vector3.Distance(cover.position, ctx.camera.position);
            if (dist < minDistance) {
                minDistance = dist;
                this.closestMesh = cover;
            }
        }

        if (this.closestMesh !== this.highlightedCover) {
            if (this.highlightedCover) {
                this.highlightLayer.removeMesh(this.highlightedCover);
            }

            if (this.closestMesh) {
                this.highlightLayer.addMesh(this.closestMesh, new Color3(0.5, 1, 0));
            }

            this.highlightedCover = this.closestMesh;
        }
    }
}

const puzzleCircleBuilder = new PuzzleCircleBuilder();
export default puzzleCircleBuilder;
