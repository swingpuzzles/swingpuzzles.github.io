export class PuzzleTools {
    public static PI2: number = 2 * Math.PI;
    public static normalizeAngle(angle: number): number {
        return ((angle % PuzzleTools.PI2) + PuzzleTools.PI2) % PuzzleTools.PI2;
    }
}
