import { AdvancedDynamicTexture } from "@babylonjs/gui";
import ctx from "../components/common/SceneContext";
import PiecesCountDropdown from "./PiecesCountDropdown";

class GuiManager {
    init() {
        const advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI", true, ctx.scene);

        const piecesCountDropdown = new PiecesCountDropdown(advancedTexture);
    }
}

const guiManager = new GuiManager();
export default guiManager;