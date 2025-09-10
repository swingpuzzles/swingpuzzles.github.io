import { PhysicsAggregate, PhysicsShapeType } from "@babylonjs/core/Physics/v2";
import ctx from "../common/SceneContext";
class PhysicsAggregateBuilder {
    attachGroundAggregate(ground) {
        ground.physicsAggregate = new PhysicsAggregate(ground, PhysicsShapeType.BOX, { mass: 0, friction: 0.5, restitution: 0.2 }, ctx.scene);
    }
    attachDragPolygonAggregate(mesh) {
        mesh.physicsAggregate = new PhysicsAggregate(mesh, PhysicsShapeType.BOX, { mass: 0.1, friction: 0.9, restitution: 0.01 }, ctx.scene);
    }
    attachPuzzlePieceAggregate(mesh) {
        mesh.physicsAggregate = new PhysicsAggregate(mesh, PhysicsShapeType.BOX, { mass: 0.1, friction: 0.7, restitution: 0.01 }, ctx.scene);
    }
    attachInitialPuzzlePieceAggregate(mesh) {
        mesh.physicsAggregate = new PhysicsAggregate(mesh, PhysicsShapeType.BOX, { mass: 0.2, friction: 0.3, restitution: 0.1 }, ctx.scene);
    }
}
const physicsAggregateBuilder = new PhysicsAggregateBuilder();
export default physicsAggregateBuilder;
