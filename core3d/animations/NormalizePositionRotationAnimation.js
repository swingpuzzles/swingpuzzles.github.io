import { QuadraticEase, Animation, EasingFunction, Quaternion, Vector3 } from "@babylonjs/core";
import ctx from "../common/SceneContext";
class NormalizePositionRotationAnimation {
    set destinationX(value) {
        this._destinationX = value;
    }
    set destinationZ(value) {
        this._destinationZ = value;
    }
    animate(mesh, action) {
        if (!mesh.rotationQuaternion)
            return;
        const easing = new QuadraticEase();
        easing.setEasingMode(EasingFunction.EASINGMODE_EASEOUT);
        let anim = new Animation("rotationAnim", "rotationQuaternion", 60, Animation.ANIMATIONTYPE_QUATERNION, Animation.ANIMATIONLOOPMODE_CONSTANT);
        let keys = [
            { frame: 0, value: mesh.rotationQuaternion.clone() },
            { frame: 30, value: Quaternion.Identity() }
        ];
        anim.setKeys(keys);
        anim.setEasingFunction(easing);
        mesh.animations = [];
        mesh.animations.push(anim);
        anim = new Animation("centerAnim", "position", 60, Animation.ANIMATIONTYPE_VECTOR3, Animation.ANIMATIONLOOPMODE_CONSTANT);
        let keys2 = [
            { frame: 0, value: mesh.position.clone() },
            { frame: 30, value: new Vector3(this._destinationX, ctx.minY + 5, this._destinationZ) }
        ];
        anim.setKeys(keys2);
        anim.setEasingFunction(easing);
        mesh.animations.push(anim);
        ctx.scene.beginAnimation(mesh, 0, 30, false, 1, () => {
            if (action) {
                action();
            }
        });
    }
}
const normalizePositionRotationAnimation = new NormalizePositionRotationAnimation();
export default normalizePositionRotationAnimation;
