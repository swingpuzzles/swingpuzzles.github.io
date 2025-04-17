import { GroundMesh, Mesh, PhysicsImpostor } from "@babylonjs/core";
import ctx from "../common/SceneContext";

class PhysicsImpostorBuilder {
    attachGroundImpostor(ground: Mesh) {
        ground.physicsImpostor = new PhysicsImpostor(
            ground,
            PhysicsImpostor.BoxImpostor,
            { mass: 0, friction: 0.5, restitution: 0.2 },
            ctx.scene
        );
    }

    attachDragPolygonImpostor(mesh : Mesh) {
        mesh.physicsImpostor = new PhysicsImpostor(
            mesh,
            PhysicsImpostor.BoxImpostor,
            { mass: 1, friction: 0.7, restitution: 0.01 },
            ctx.scene
        );
    }

    attachPuzzlePieceImpostor(mesh : Mesh) {
        mesh.physicsImpostor = new PhysicsImpostor(
            mesh,
            PhysicsImpostor.BoxImpostor,
            { mass: 0.1, friction: 0.7, restitution: 0.01 },
            ctx.scene
        );
    }

    attachInitialPuzzlePieceImpostor(mesh : Mesh) {
        mesh.physicsImpostor = new PhysicsImpostor(
            mesh,
            PhysicsImpostor.BoxImpostor,
            { mass: 0.2, friction: 0.3, restitution: 0.1 },
            ctx.scene
        );
    }
}

const physicsImpostorBuilder = new PhysicsImpostorBuilder();
export default physicsImpostorBuilder;