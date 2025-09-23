// Translation key constants for better type safety and maintainability
export const TranslationKeys = {
    // Tutorial and Welcome Messages
    TUTORIAL: {
        WELCOME: {
            TITLE: "tutorial.welcome.title",
            MESSAGE: "tutorial.welcome.message",
            GIFT_TITLE: "tutorial.welcome.giftTitle", 
            GIFT_MESSAGE: "tutorial.welcome.giftMessage"
        },
        HINTS: {
            SIZE_TITLE: "tutorial.hints.sizeTitle",
            SIZE_MESSAGE: "tutorial.hints.sizeMessage",
            CHOICE_TITLE: "tutorial.hints.choiceTitle", 
            CHOICE_MESSAGE: "tutorial.hints.choiceMessage",
            SHAKE_TITLE: "tutorial.hints.shakeTitle",
            SHAKE_MESSAGE: "tutorial.hints.shakeMessage",
            STYLE_TITLE: "tutorial.hints.styleTitle",
            STYLE_MESSAGE: "tutorial.hints.styleMessage"
        },
        CONGRATS: {
            TITLE: "tutorial.congrats.title",
            MESSAGE: "tutorial.congrats.message",
            BUY_TITLE: "tutorial.congrats.buyTitle",
            BUY_MESSAGE: "tutorial.congrats.buyMessage"
        },
        BAD_WORD: {
            TITLE: "tutorial.badWord.title",
            MESSAGE: "tutorial.badWord.message"
        }
    },

    // UI Labels and Buttons
    UI: {
        BUTTONS: {
            CONTINUE: "ui.buttons.continue",
            GOT_IT: "ui.buttons.gotIt",
            NOT_NOW: "ui.buttons.notNow",
            YES_I_DID: "ui.buttons.yesIDid",
            GET_IT_ON_AMAZON: "ui.buttons.getItOnAmazon",
            BACK: "ui.buttons.back",
            NEXT: "ui.buttons.next",
            PREVIOUS: "ui.buttons.previous",
            MENU: "ui.buttons.menu",
            PLAY: "ui.buttons.play",
            MORE_PUZZLES: "ui.buttons.morePuzzles"
        },
        LABELS: {
            FRIENDS_NAME: "ui.labels.friendsName",
            COMING_AGE: "ui.labels.comingAge", 
            WISH_LANGUAGE: "ui.labels.wishLanguage",
            PUZZLE_PIECES: "ui.labels.puzzlePieces",
            CATEGORY: "ui.labels.category",
            PIECES_FORMAT: "ui.labels.piecesFormat"
        },
        PLACEHOLDERS: {
            FRIENDS_NAME: "ui.placeholders.friendsName",
            COMING_AGE: "ui.placeholders.comingAge"
        }
    },

    // Gift Making
    GIFT: {
        TITLE: "gift.title",
        INTRO_MESSAGE: "gift.introMessage",
        COPY_LINK_LABEL: "gift.copyLinkLabel",
        TRY_FIRST_LABEL: "gift.tryFirstLabel", 
        TURN_INTO_REAL_LABEL: "gift.turnIntoRealLabel",
        PIECES_COUNT_LABEL: "gift.piecesCountLabel",
        AMAZON_INSTRUCTION: "gift.amazonInstruction"
    },

  // Navigation
    NAVIGATION: {
        EMAIL_UPDATE_QUESTION: "navigation.emailUpdateQuestion",
        EMAIL_UPDATE_QUESTION_ALT: "navigation.emailUpdateQuestionAlt",
        RESUME_SOLVING_LABEL: "navigation.resumeSolvingLabel",
        PLAY_AGAIN_QUESTION: "navigation.playAgainQuestion",
        SHUFFLE_RESTART_LABEL: "navigation.shuffleRestartLabel",
        RETURN_TO_GALLERY_LABEL: "navigation.returnToGalleryLabel",
        CONGRATS_MESSAGE_COMPLETED: "navigation.congratsMessageCompleted",
        CONGRATS_MESSAGE_FIRST_TIME: "navigation.congratsMessageFirstTime",
        PUZZLE_PAUSED_MESSAGE: "navigation.puzzlePausedMessage",
        BUTTON_ADD_EMAIL: "navigation.buttonAddEmail",
        BUTTON_ADD_ANOTHER: "navigation.buttonAddAnother",
    BUTTON_CONTINUE: "navigation.buttonContinue",
    BUTTON_RESTART: "navigation.buttonRestart",
    BUTTON_MAIN_MENU: "navigation.buttonMainMenu",
    TITLE_PUZZLE_SOLVED: "navigation.titlePuzzleSolved",
    TITLE_GAME_PAUSED: "navigation.titleGamePaused"
  },

    // Categories
    CATEGORIES: {
        GENERAL: "categories.general",
        ANIMALS: "categories.animals", 
        BEACH: "categories.beach",
        FLORAL: "categories.floral",
        MAKE_A_GIFT: "categories.makeAGift"
    },

    // Cookie and Legal
    COOKIES: {
        ACCEPT: "cookies.accept",
        REJECT: "cookies.reject",
        BANNER_MESSAGE: "cookies.bannerMessage",
        LEARN_MORE: "cookies.learnMore",
        PRIVACY_POLICY: "cookies.privacyPolicy",
        TERMS_OF_SERVICE: "cookies.termsOfService"
    },
    
    // Fullscreen
    FULLSCREEN: {
        REQUIRED_MESSAGE: "fullscreen.requiredMessage",
        ENTER_BUTTON: "fullscreen.enterButton",
        EXIT_BUTTON: "fullscreen.exitButton"
    },
    
    // Legal Pages
    LEGAL: {
        BACK_TO_GAME: "legal.backToGame",
        PAGE_NOT_FOUND: "legal.pageNotFound",
        PAGE_NOT_FOUND_MESSAGE: "legal.pageNotFoundMessage"
    },

    // Error Messages
    ERRORS: {
        SHARING_NOT_SUPPORTED: "errors.sharingNotSupported",
        COPY_FAILED: "errors.copyFailed",
        DECODE_FAILED: "errors.decodeFailed"
    },

    // Special Mode Messages
    SPECIAL_MODE: {
        PUZZLE_SOLVED_MESSAGE: "specialMode.puzzleSolvedMessage",
        GAME_MONETIZE: {
            WELCOME_MESSAGE: "specialMode.gameMonetize.welcomeMessage",
            AD_MESSAGE: "specialMode.gameMonetize.adMessage",
            PUZZLE_SOLVED_MESSAGE_COMPLETED: "specialMode.gameMonetize.puzzleSolvedMessageCompleted",
            PUZZLE_SOLVED_MESSAGE_FIRST_TIME: "specialMode.gameMonetize.puzzleSolvedMessageFirstTime",
            PUZZLE_PAUSED_MESSAGE: "specialMode.gameMonetize.puzzlePausedMessage"
        }
    },

    // Gift Overview Messages
    GIFT_OVERVIEW: {
        TITLE: "giftOverview.title",
        MESSAGE: "giftOverview.message",
        ORIENTATION_TITLE: "giftOverview.orientationTitle",
        ORIENTATION_MESSAGE: "giftOverview.orientationMessage",
        ORIENTATION_HORIZONTAL_LABEL: "giftOverview.orientationHorizontalLabel",
        ORIENTATION_VERTICAL_LABEL: "giftOverview.orientationVerticalLabel",
        SIZE_TITLE: "giftOverview.sizeTitle",
        SIZE_INSTRUCTION: "giftOverview.sizeInstruction"
    }
} as const;

// Type for all translation keys
export type TranslationKey = string;

// Helper function to get nested keys
export function getTranslationKey(section: string, ...keys: string[]): string {
    return [section, ...keys].join('.');
}
