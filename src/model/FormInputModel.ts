import ISelector from "../interfaces/ISelector";

export type FormInputModel =
  | TextInputModel
  | NumericInputModel
  | SelectionInputModel;

interface BaseInputModel {
  id: string;
  label: string;
  placeHolder?: string;
  required?: boolean;
}

interface TextInputModel extends BaseInputModel {
  type: "text";
  defaultValue?: string;
  maxLength?: number;
}

interface NumericInputModel extends BaseInputModel {
  type: "number";
  min?: number;
  max?: number;
  defaultValue?: number;
}

interface SelectionInputModel extends BaseInputModel {
  type: "selection";
  selector: ISelector;
}