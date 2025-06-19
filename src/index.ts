import sceneInitializer from "./core3d/SceneInitializer";
import type { PhysicsAggregate } from "@babylonjs/core/Physics/v2";

declare module "@babylonjs/core/Meshes/abstractMesh" {
  interface AbstractMesh {
    physicsAggregate?: PhysicsAggregate;
  }
}

sceneInitializer.init();
