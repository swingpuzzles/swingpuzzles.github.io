import { TextBlock } from "@babylonjs/gui";
import { GuiHelpers } from "./GuiHelpers";

export default class TextTyper {
    private typingSessionId = 0;
    private inputTextArea!: TextBlock;
    private bakedText: string = "";
    private hotText: string = "";
    private hotStartIndex: number = 0;
    private currentIndex: number = 0;
    private lastSpaceIndex: number = 0;
    private maxWidth: number = 0;

    constructor(inputTextArea: TextBlock) {
        this.inputTextArea = inputTextArea;
    }
    
    public typeTextLetterByLetter(fullText: string, maxWidth: number) {
        this.currentIndex = 0;
        this.hotStartIndex = 0;
        this.bakedText = "";
        this.hotText = "";
        this.lastSpaceIndex = 0;
        this.maxWidth = maxWidth;

        // Invalidate any previous typing session
        const currentSessionId = ++this.typingSessionId;
    
        const addNextChar = () => {
            // Stop if a new session has started
            if (currentSessionId !== this.typingSessionId) return;
    
            if (this.currentIndex < fullText.length) {
                if (fullText[this.currentIndex] === "\n") {
                    this.bakedText += this.hotText + "\n";
                    this.hotText = "";
                    this.hotStartIndex = this.currentIndex + 1;
                } else {
                    if (fullText[this.currentIndex] === " ") {
                        this.lastSpaceIndex = this.currentIndex;
                    }

                    this.hotText += fullText[this.currentIndex];

                    if (this.textTooLong()) {
                        this.bakedText += fullText.substring(this.hotStartIndex, this.lastSpaceIndex) + "\n";
                        this.hotText = fullText.substring(this.lastSpaceIndex + 1, this.currentIndex + 1);
                        this.hotStartIndex = this.lastSpaceIndex + 1;
                        this.lastSpaceIndex = 0;
                    }
                }
    
                const currentWrapped = this.bakedText + this.hotText;
                this.inputTextArea.text = currentWrapped;

                this.currentIndex++;
                window.setTimeout(addNextChar, 0);
            }
        };
    
        // Start typing
        addNextChar();
    }

    private textTooLong(): boolean {
        return 3.2 * GuiHelpers.measureText(this.hotText, this.inputTextArea.fontSizeInPixels, this.inputTextArea.fontWeight, this.inputTextArea.fontFamily).width > this.maxWidth;
    }
}