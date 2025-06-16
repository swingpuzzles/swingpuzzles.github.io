import { Control } from "@babylonjs/gui";

export default interface ISelector {
    get ui(): Control;
    resize(height: number): void;
    get id(): string;
    get selectedItem(): any;
    set selectedItem(value: any);
}