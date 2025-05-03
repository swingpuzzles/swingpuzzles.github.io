import gameModeManager, { GameMode } from "../components/behaviors/GameModeManager";
import popupHint from "./PopupHint";
import screenShader, { ShaderMode } from "./ScreenShader";

class TutorialManager {
    init() {
        screenShader.init();
        popupHint.init();

        let message = `Welcome to PuzzleVerse 3D! 🧩

    Get ready to explore, solve, and enjoy amazing 3D jigsaw puzzles right inside your browser. Every piece fits into a world of adventure!
        
    By continuing, you agree to our use of cookies to ensure the best experience.
        
    Let's start building!`;
        
        const hasAcceptedCookies = localStorage.getItem("cookiesAccepted") === "true";

        if (hasAcceptedCookies) {
            this.afterCookiesAccepted();
        } else {
            popupHint.show(message, "WELCOME!", 0.66, ShaderMode.SHADOW_FULL, this.afterCookiesAccepted);
        }

        gameModeManager.addObserver((prevMode) => {
            if (gameModeManager.currentMode === GameMode.Solve) {
                this.finishTutorial();
            }
        });
    }

    private afterCookiesAccepted() {
        localStorage.setItem("cookiesAccepted", "true");

        let dimensionHint = `🧩 Choose Your Challenge!

Use the highlighted dropdown at the top center to pick your desired puzzle dimensions. 

More pieces, more fun – or keep it simple and relaxing. The choice is yours!`;

        popupHint.show(dimensionHint, "HINT: SIZE", 0.56, ShaderMode.SHADOW_WINDOW, this.showPuzzleChooserHint);
    }

    public showPuzzleChooserHint() {
        let browseHint = `📚 Browse and Play!

Swipe left or right to explore different puzzles.

Each puzzle is shown as a cover box — click or tap on one to select it, or just hit the ▶️ Play button to dive right in!`;

        popupHint.show(browseHint, "HINT: CHOICE", 0.56, ShaderMode.NONE, () => { popupHint.hide() });
    }

    public showShakeHint() {
        let shakeHint = `🧩 Give it a good shake!
    
Drag the puzzle box around to shake it — this will mix up the pieces so you can start solving!`;
    
        popupHint.show(shakeHint, "SHAKE IT!", 0.47, ShaderMode.NONE, () => { this.finishTutorial() });
    }

    private finishTutorial() {
        localStorage.setItem("tutorialDone", "true");
        popupHint.hide();
    }
}

const tutorialManager = new TutorialManager();
export default tutorialManager;

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
