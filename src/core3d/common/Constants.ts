import { TranslationKeys } from "../../common/i18n";

export const Categories = {
    General: { key: "General", translationKey: TranslationKeys.CATEGORIES.GENERAL, tags: [ "General" ], url: "assets/categories/category-general.webp" },
    Animals: { key: "Animals", translationKey: TranslationKeys.CATEGORIES.ANIMALS, tags: [ "Theme_Animals" ], url: "assets/categories/category-animal.webp" },
    Beach: { key: "Beach", translationKey: TranslationKeys.CATEGORIES.BEACH, tags: [ "Theme_Beach" ], url: "assets/categories/category-beach.webp" },
    Flowers: { key: "Flowers", translationKey: TranslationKeys.CATEGORIES.FLORAL, tags: [ "Theme_Floral" ], url: "assets/categories/category-floral.webp" },
    Gift: { key: "Gift", translationKey: TranslationKeys.CATEGORIES.MAKE_A_GIFT, tags: [ ], url: "assets/categories/giftbox.webp" },
}

export type Category = (typeof Categories)[keyof typeof Categories];

export const CategoryKeys: string[] = Object.keys(Categories);

export default class Constants {
    public static readonly ISELECTOR = "ISELECTOR";
}