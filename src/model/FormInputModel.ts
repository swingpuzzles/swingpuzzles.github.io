export type FormInputModel =
  | TextInputModel
  | NumericInputModel;

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