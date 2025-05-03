import { Control, TextBlock } from "@babylonjs/gui";
import guiManager from "./GuiManager";

interface DialogTyperOptions {
    speed?: number;
    autoSkipDelay?: number | null;
    color?: string;
    fontSize?: number;
    width?: string;
    height?: string;
    top?: string;
}

export class DialogTyper {
    private textBlock: TextBlock;
    private speed: number;
    private autoSkipDelay: number | null;
    private queue: string[] = [];
    private isTyping = false;
    private skipRequested = false;

    constructor(options: DialogTyperOptions = {}) {
        this.speed = options.speed ?? 50;
        this.autoSkipDelay = options.autoSkipDelay ?? null;

        this.textBlock = new TextBlock();
        this.textBlock.color = options.color ?? "white";
        this.textBlock.fontSize = options.fontSize ?? 24;
        this.textBlock.textWrapping = true;
        this.textBlock.width = options.width ?? "80%";
        this.textBlock.height = options.height ?? "200px";
        this.textBlock.top = options.top ?? "40%";
        this.textBlock.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        this.textBlock.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;

        guiManager.advancedTexture.addControl(this.textBlock);

        this.textBlock.onPointerUpObservable.add(() => {
            if (this.isTyping) {
                this.skipRequested = true;
            }
        });
    }

    public showDialog(messages: string[], onComplete?: () => void): void {
        this.queue = [...messages];
        this._nextMessage(onComplete);
    }

    private _nextMessage(onComplete?: () => void): void {
        if (this.queue.length === 0) {
            if (onComplete) onComplete();
            return;
        }

        const message = this.queue.shift()!;
        this._typeText(message, () => {
            if (this.autoSkipDelay !== null) {
                setTimeout(() => this._nextMessage(onComplete), this.autoSkipDelay);
            } else {
                this.textBlock.onPointerUpObservable.addOnce(() => {
                    this._nextMessage(onComplete);
                });
            }
        });
    }

    private _typeText(text: string, callback: () => void): void {
        this.isTyping = true;
        this.skipRequested = false;
        this.textBlock.text = "";
        let i = 0;

        const interval = setInterval(() => {
            if (this.skipRequested) {
                this.textBlock.text = text;
                clearInterval(interval);
                this.isTyping = false;
                callback();
                return;
            }

            this.textBlock.text += text[i];
            i++;

            if (i >= text.length) {
                clearInterval(interval);
                this.isTyping = false;
                callback();
            }
        }, this.speed);
    }
}
