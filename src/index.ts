import sceneInitializer from "./core3d/SceneInitializer";
import analyticsInitializer from "./common/AnalyticsInitializer";
import type { PhysicsAggregate } from "@babylonjs/core/Physics/v2";

declare module "@babylonjs/core/Meshes/abstractMesh" {
  interface AbstractMesh {
    physicsAggregate?: PhysicsAggregate;
  }
}

// Initialize analytics
analyticsInitializer.init();

sceneInitializer.init();
