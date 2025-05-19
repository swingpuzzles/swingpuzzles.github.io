export class PuzzleTools {
    public static PI2: number = 2 * Math.PI;

    public static normalizeAngle(angle: number): number {
        return ((angle % PuzzleTools.PI2) + PuzzleTools.PI2) % PuzzleTools.PI2;
    }

    public static hasIntersection(a: any[], b: any[]): boolean {
        const setA = new Set(a);
        for (const item of b) {
            if (setA.has(item)) return true;
        }
        return false;
    }
}
