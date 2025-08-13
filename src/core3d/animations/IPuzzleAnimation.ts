import { Mesh } from "@babylonjs/core";

export default interface IPuzzleAnimation {
    animate(mesh: Mesh, action: (() => void) | null): void;
}