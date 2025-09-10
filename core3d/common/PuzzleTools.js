export class PuzzleTools {
    static normalizeAngle(angle) {
        return ((angle % PuzzleTools.PI2) + PuzzleTools.PI2) % PuzzleTools.PI2;
    }
    static hasIntersection(a, b) {
        const setA = new Set(a);
        for (const item of b) {
            if (setA.has(item))
                return true;
        }
        return false;
    }
}
PuzzleTools.PI2 = 2 * Math.PI;
