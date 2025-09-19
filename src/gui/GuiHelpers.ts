export class GuiHelpers {
    public static measureText(text: string, fontSize: number, fontWeight: string, fontFamily: string): TextMetrics {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        ctx!.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
        return ctx!.measureText(text);
    }

    public static calculateFontSize(text: string, maxWidth: number, maxHeight: number, fontWeight: string, fontFamily: string): number {
        const hugeFont = 1000;
        const hugeMetrics = this.measureText(text, hugeFont, fontWeight, fontFamily);

        return hugeFont * Math.min(maxWidth / hugeMetrics.width / 100, maxHeight / hugeFont);
    }
}
