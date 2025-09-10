import { Control, TextBlock } from "@babylonjs/gui";
import guiManager from "./GuiManager";
import timerManager from "../core3d/misc/TimerManager";
export class DialogTyper {
    constructor(options = {}) {
        var _a, _b, _c, _d, _e, _f, _g;
        this.queue = [];
        this.isTyping = false;
        this.skipRequested = false;
        this.speed = (_a = options.speed) !== null && _a !== void 0 ? _a : 50;
        this.autoSkipDelay = (_b = options.autoSkipDelay) !== null && _b !== void 0 ? _b : null;
        this.textBlock = new TextBlock();
        this.textBlock.color = (_c = options.color) !== null && _c !== void 0 ? _c : "white";
        this.textBlock.fontSize = (_d = options.fontSize) !== null && _d !== void 0 ? _d : 24;
        this.textBlock.textWrapping = true;
        this.textBlock.width = (_e = options.width) !== null && _e !== void 0 ? _e : "80%";
        this.textBlock.height = (_f = options.height) !== null && _f !== void 0 ? _f : "200px";
        this.textBlock.top = (_g = options.top) !== null && _g !== void 0 ? _g : "40%";
        this.textBlock.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        this.textBlock.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        guiManager.advancedTexture.addControl(this.textBlock);
        this.textBlock.onPointerClickObservable.add(() => {
            if (this.isTyping) {
                this.skipRequested = true;
            }
        });
    }
    showDialog(messages, onComplete) {
        this.queue = [...messages];
        this._nextMessage(onComplete);
    }
    _nextMessage(onComplete) {
        if (this.queue.length === 0) {
            if (onComplete)
                onComplete();
            return;
        }
        const message = this.queue.shift();
        this._typeText(message, () => {
            if (this.autoSkipDelay !== null) {
                timerManager.setTimeout(() => this._nextMessage(onComplete), this.autoSkipDelay);
            }
            else {
                this.textBlock.onPointerClickObservable.addOnce(() => {
                    this._nextMessage(onComplete);
                });
            }
        });
    }
    _typeText(text, callback) {
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
