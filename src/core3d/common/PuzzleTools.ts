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

    /**
     * Format date as YYYYMMDD string
     * @param date The date to format
     * @returns Formatted date string
     */
    public static getDateString(date: Date): string {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}${month}${day}`;
    }
}
