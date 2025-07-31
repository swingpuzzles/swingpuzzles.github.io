export type SelectorModel =
  | TextSelectorModel
  | ImageSelectorModel;

interface BaseSelectorModel {
  id: string;
  selected?: boolean
}

export interface TextSelectorModel extends BaseSelectorModel {
  text: string;
}

export interface ImageSelectorModel extends BaseSelectorModel {
  highResUrl: string;
  lowResUrl?: string;
}
