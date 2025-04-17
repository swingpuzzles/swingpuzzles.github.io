import { Mesh } from "@babylonjs/core";

export default interface IPuzzleAnimation {
    animate(mesh: Mesh): void;
}