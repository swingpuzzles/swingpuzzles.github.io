import sceneInitializer from "./core3d/SceneInitializer";
import analyticsInitializer from "./common/AnalyticsInitializer";
import specialModeManager from "./common/special-mode/SpecialModeManager";
import type { PhysicsAggregate } from "@babylonjs/core/Physics/v2";

declare module "@babylonjs/core/Meshes/abstractMesh" {
  interface AbstractMesh {
    physicsAggregate?: PhysicsAggregate;
  }
}

// Make special mode manager available globally for cookie banner
(window as any).specialModeManager = specialModeManager;

// Initialize analytics
analyticsInitializer.init();

sceneInitializer.init();
