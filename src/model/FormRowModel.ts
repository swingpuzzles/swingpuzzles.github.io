import ISelector from "../interfaces/ISelector";

export type FormRowModel =
  | TextInputModel
  | NumericInputModel
  | SelectionInputModel
  | ShareActionModel
  | ButtonActionModel
  | RadioButtonActionModel;

interface BaseFormRowModel {
  id: string;
  label: string;
  placeHolder?: string;
  required?: boolean;
}

interface TextInputModel extends BaseFormRowModel {
  type: "text";
  defaultValue?: string;
  maxLength?: number;
}

interface NumericInputModel extends BaseFormRowModel {
  type: "number";
  min?: number;
  max?: number;
  defaultValue?: number;
}

interface SelectionInputModel extends BaseFormRowModel {
  type: "selection";
  selector: ISelector;
}

interface ButtonActionModel extends BaseFormRowModel {
  type: "button";
  buttonText: string;
  background: string;
  color?: string;
  action: () => void;
}

interface RadioButtonActionModel extends BaseFormRowModel {
  type: "radioButton";
  buttonText: string;
  background: string;
  action: () => void;
  selected?: boolean;
}

interface ShareActionModel extends BaseFormRowModel {
  type: "share";
  link: string;
}
