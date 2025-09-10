import { PolygonMeshBuilder, Vector2 } from "@babylonjs/core";
import ctx from "../common/SceneContext";
import * as earcut from "earcut";
import physicsAggregateBuilder from "./PhysicsAggregateBuilder";
import polygonDragManager from "../behaviors/PolygonDragManager";
window.earcut = earcut;
class DragPolygonBuilder {
    makePolygon(mesh) {
        const LEFT = {};
        const TOP = {};
        const RIGHT = {};
        const BOTTOM = {};
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
        const path = [];
        const groupMeshes = [mesh, ...mesh.getChildren()];
        let topLeftMesh = mesh;
        let topLeftData = ctx.piecesMap.get(mesh);
        for (const c of groupMeshes) {
            const cData = ctx.piecesMap.get(c);
            if (!cData)
                continue;
            if (cData.xIndex < topLeftData.xIndex ||
                (cData.xIndex === topLeftData.xIndex && cData.zIndex < topLeftData.zIndex)) {
                topLeftMesh = c;
                topLeftData = cData;
            }
        }
        let xIndex = topLeftData.xIndex;
        let zIndex = topLeftData.zIndex;
        let boundingBox = topLeftMesh.getBoundingInfo().boundingBox;
        let xOffset = (boundingBox.maximum.x - boundingBox.minimum.x) * topLeftMesh.scaling.x / 2;
        let zOffset = (boundingBox.maximum.z - boundingBox.minimum.z) * topLeftMesh.scaling.z / 2;
        topLeftMesh.computeWorldMatrix(true);
        topLeftMesh.refreshBoundingInfo();
        let meshPos = topLeftMesh.getAbsolutePosition();
        let startPoint = new Vector2(meshPos.x - xOffset, meshPos.z + zOffset);
        path.push(startPoint);
        let nextPoint = new Vector2(meshPos.x + xOffset, meshPos.z + zOffset);
        let direction = RIGHT;
        let leakSafe = 0;
        do {
            leakSafe++;
            let xTry = xIndex + direction.step[0];
            let zTry = zIndex + direction.step[1];
            let tryMesh = this.tryGetMesh(xTry, zTry, groupMeshes);
            if (tryMesh) {
                let xTry2 = xTry + direction.after[0].step[0];
                let zTry2 = zTry + direction.after[0].step[1];
                let tryMesh2 = this.tryGetMesh(xTry2, zTry2, groupMeshes);
                if (tryMesh2) {
                    boundingBox = tryMesh2.getBoundingInfo().boundingBox;
                    xOffset = (boundingBox.maximum.x - boundingBox.minimum.x) * tryMesh2.scaling.x / 2;
                    zOffset = (boundingBox.maximum.z - boundingBox.minimum.z) * tryMesh2.scaling.z / 2;
                    tryMesh2.computeWorldMatrix(true);
                    tryMesh2.refreshBoundingInfo();
                    meshPos = tryMesh2.getAbsolutePosition();
                    direction = direction.after[0];
                    xIndex = xTry2;
                    zIndex = zTry2;
                    if (direction.vertical) {
                        nextPoint.x = meshPos.x + direction.point[0] * xOffset;
                    }
                    else {
                        nextPoint.y = meshPos.z + direction.point[1] * zOffset;
                    }
                    path.push(nextPoint);
                }
                else {
                    boundingBox = tryMesh.getBoundingInfo().boundingBox;
                    xOffset = (boundingBox.maximum.x - boundingBox.minimum.x) * tryMesh.scaling.x / 2;
                    zOffset = (boundingBox.maximum.z - boundingBox.minimum.z) * tryMesh.scaling.z / 2;
                    tryMesh.computeWorldMatrix(true);
                    tryMesh.refreshBoundingInfo();
                    meshPos = tryMesh.getAbsolutePosition();
                    direction = direction.after[1];
                    xIndex = xTry;
                    zIndex = zTry;
                }
            }
            else {
                path.push(nextPoint);
                direction = direction.after[2];
            }
            nextPoint = new Vector2(meshPos.x + direction.point[0] * xOffset, meshPos.z + direction.point[1] * zOffset);
        } while ((xIndex !== topLeftData.xIndex || zIndex !== topLeftData.zIndex || direction !== TOP) && leakSafe < 100);
        path.reverse();
        let minX = Number.MAX_VALUE;
        let minZ = Number.MAX_VALUE;
        let maxX = Number.MIN_VALUE;
        let maxZ = Number.MIN_VALUE;
        for (let p of path) {
            minX = Math.min(minX, p.x);
            minZ = Math.min(minZ, p.y);
            maxX = Math.max(maxX, p.x);
            maxZ = Math.max(maxZ, p.y);
        }
        const centerX = (minX + maxX) / 2;
        const centerZ = (minZ + maxZ) / 2;
        for (let p of path) {
            p.x -= centerX;
            p.y -= centerZ;
        }
        const polygon = new PolygonMeshBuilder("tetris_piece", path, ctx.scene, earcut.default);
        const extrudedMesh = polygon.build(false, 1);
        extrudedMesh.position.x = centerX;
        extrudedMesh.position.z = centerZ;
        extrudedMesh.position.y = ctx.minY + 2;
        physicsAggregateBuilder.attachDragPolygonAggregate(extrudedMesh);
        polygonDragManager.addDragBehavior(extrudedMesh);
        extrudedMesh.visibility = 0;
        return extrudedMesh;
    }
    tryGetMesh(x, z, toContain = null) {
        if (x >= 0 && z >= 0 && x < ctx.numX && z < ctx.numZ) {
            const tryMesh = ctx.piecesArray[x][z];
            if (!toContain || toContain.includes(tryMesh)) {
                return tryMesh;
            }
        }
        return null;
    }
}
const dragPolygonBuilder = new DragPolygonBuilder();
export default dragPolygonBuilder;
