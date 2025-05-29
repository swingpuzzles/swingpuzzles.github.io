import { Button, Container, Control, StackPanel, Image } from "@babylonjs/gui";
import gameModeManager, { GameMode } from "../../components/behaviors/GameModeManager";

export class Dropdown extends Container {
    private button: Button;
    private options: StackPanel;
    private categoryIcon: Image | null = null;
    private buttonBackground: string;
    private buttonColor: string;
    private itemHeight = 0;
    //private width = 0;

    constructor(config: {
        gameModes: GameMode[];
        background: string;
        color: string;
        thickness?: number;
        icon?: string;
        valign?: number;
        halign?: number;
    }) {
        super();

        this.buttonBackground = config.background;
        this.buttonColor = config.color;

        this.verticalAlignment = config.valign ?? Control.VERTICAL_ALIGNMENT_TOP;
        this.horizontalAlignment = config.halign ?? Control.HORIZONTAL_ALIGNMENT_CENTER;
        this.isHitTestVisible = false;
        this.zIndex = 30;

        // Create button
        if (config.icon) {
            this.button = Button.CreateImageOnlyButton("Please Select", config.icon)
            
            this.button.background = "";
            this.button.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
            this.button.width = "20%"

            // Create and store the nested image (category icon)
            this.categoryIcon = new Image("categoryIcon", "");
            this.categoryIcon.width = "75%";
            this.categoryIcon.height = "75%";
            this.categoryIcon.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
            this.categoryIcon.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
            this.categoryIcon.paddingRight = "5%";
            this.categoryIcon.paddingBottom = "20%";

            this.button.addControl(this.categoryIcon);
        } else {
            this.button = Button.CreateSimpleButton("Please Select", "Please Select ▼");
            this.button.background = this.buttonBackground;
            this.button.textBlock!.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
        }

        this.button.hoverCursor = "pointer";
        this.button.thickness = config.thickness ?? 1;
        this.button.color = this.buttonColor;
        this.button.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;

        // Create options
        this.options = new StackPanel();
        this.options.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        this.options.isVisible = false;
        this.options.isVertical = true;

        this.button.onPointerClickObservable.add(() => {
            this.options.isVisible = !this.options.isVisible;
        });

        this.onPointerEnterObservable.add(() => {
            this.zIndex = 555;
        });

        this.onPointerOutObservable.add(() => {
            this.zIndex = 30;
            this.options.isVisible = false;
        });

        this.addControl(this.button);
        this.addControl(this.options);
        
        gameModeManager.addGameModeChangedObserver(() => {
            this.isVisible = config.gameModes.includes(gameModeManager.currentMode);
        });
    }

    resize(height: number) {
        this.itemHeight = height;
        const width = height * 7;

        this.widthInPixels = width;
        this.topInPixels = this.itemHeight / 4;
        this.options.topInPixels = this.itemHeight;

        if (this.button.textBlock) {
            this.button.textBlock.paddingRightInPixels = this.itemHeight / 4;
            this.button.textBlock.fontSizeInPixels = this.itemHeight / 2;
            this.button.heightInPixels = this.itemHeight;
        } else {
            this.leftInPixels = this.itemHeight / 4;
            this.button.heightInPixels = this.itemHeight * 1.8;
        }

        for (const o of this.options.children) {
            o.heightInPixels = this.itemHeight;
            (o as Button).textBlock!.fontSizeInPixels = this.itemHeight / 2;
        }
    }

    setContent(text: string, url: string | null = null, fontFamily: string | null = null) {
        if (this.button.textBlock) {
            this.button.textBlock.text = text;

            if (fontFamily) {
                this.button.textBlock.fontFamily = fontFamily;
            }
        }

        if (url && this.categoryIcon) {
            this.categoryIcon.source = url;
        }
    }

    addItem(text: string, callback: () => void, imageUrl: string | null = null, fontFamily: string | null = null): void {
        let button: Button;

        if (imageUrl) {
            button = Button.CreateImageButton(text, text, imageUrl);
            button.image!.width = "22%";
            button.image!.stretch = Image.STRETCH_UNIFORM;
            button.image!.paddingTop = "1%";
            button.image!.paddingBottom = "1%";
            button.image!.paddingLeft = "5%";
            button.image!.paddingRight = "5%";
        } else {
            button = Button.CreateSimpleButton(text, text);
        }

        if (fontFamily && button.textBlock) {
            button.textBlock.fontFamily = fontFamily;
        }

        button.heightInPixels = this.itemHeight;
        button.paddingTopInPixels = -1;
        button.background = this.buttonBackground;
        button.color = this.buttonColor;

        button.onPointerClickObservable.add(() => {
            this.options.isVisible = false;
        });

        button.onPointerClickObservable.add(callback);

        this.options.addControl(button);
    }
}
