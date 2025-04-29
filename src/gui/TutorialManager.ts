import { Sprite, SpriteManager, Animation } from "@babylonjs/core";
import ctx from "../components/common/SceneContext";

class TutorialManager {
    /*private _sprite: Sprite;
    private _pendingHint: boolean;
    
    constructor() {
        this._pendingHint = true;
        // Add a sprite manager
        var spriteManager = new SpriteManager("spriteManager", "https://raw.githubusercontent.com/xMichal123/publictests/main/hand.png", 1, {width: 83, height: 146}, ctx.scene);

        // Create a sprite
        this._sprite = new Sprite("sprite", spriteManager);
        //this._sprite.position = new Vector3(minSwitchX + 3 * railLength / 4, 0, 0); // Starting position
        this._sprite.invertU = true;
        this._sprite.invertV = true;
        const scale = 0.5;
        this._sprite.width = 0.57 * scale;
        this._sprite.height = scale;
        this._sprite.isVisible = false;

        // Create the animation
        this.createSmoothUpDownAnimation(0.7, 0.2); // Start from y=1 and move smoothly up/down by 2 units
    }

    // Function to create the up-and-down animation using sine wave
    createSmoothUpDownAnimation(point: number, length: number) {
        var frameRate = 60;
        var animation = new Animation("smoothUpDown", "position.y", frameRate, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CYCLE);

        // Define animation keys
        var keys = [];
        for (var i = 0; i <= frameRate; i++) {
            var frame = i;
            var value = point + length * Math.sin((i / frameRate) * 2 * Math.PI); // Sine wave for smooth motion
            keys.push({ frame: frame, value: value });
        }

        animation.setKeys(keys);

        // Attach animation to the sprite
        this._sprite.animations!.push(animation);

        // Start the animation
        ctx.scene.beginAnimation(this._sprite, 0, frameRate, true, 0.4);
    }*/

    /*switched() {
        if (this._pendingHint) {
            trainDispatcher.resume();

            this._sprite.dispose();
        }

        this._pendingHint = false;
    }

    tryHint(train) {
        if (this._pendingHint && train.position.x - 2 * railLength <= minSwitchX) {

            trainDispatcher.pause();

            this._sprite.isVisible = true;
        }
    }*/
}
