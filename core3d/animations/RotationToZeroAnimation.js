import { QuadraticEase, Animation, EasingFunction, Quaternion } from "@babylonjs/core";
import ctx from "../common/SceneContext";
class RotationToZeroAnimation {
    animate(mesh) {
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
        anim = new Animation("liftAnim", "position.y", 60, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CONSTANT);
        let keys2 = [
            { frame: 0, value: mesh.position.y },
            { frame: 30, value: ctx.minY + 5 }
        ];
        anim.setKeys(keys2);
        anim.setEasingFunction(easing);
        mesh.animations.push(anim);
        ctx.scene.beginAnimation(mesh, 0, 30, false);
    }
}
const rotationToZeroAnimation = new RotationToZeroAnimation();
export default rotationToZeroAnimation;
