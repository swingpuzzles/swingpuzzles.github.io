import { Mesh, PointerDragBehavior } from "@babylonjs/core";

class DragHelpers {
    removeDragBehavior(mesh: Mesh): void {
        const behaviors = mesh.behaviors.slice();
        for (const behavior of behaviors) {
            if (behavior instanceof PointerDragBehavior) {
                mesh.removeBehavior(behavior);
            }
        }
    }
}

const dragHelpers = new DragHelpers();
export default dragHelpers;