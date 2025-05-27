import { Control } from "@babylonjs/gui";

export default interface ISelector {
    get ui(): Control;
    resize(height: number): void;
}