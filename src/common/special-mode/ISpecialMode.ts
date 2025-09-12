export interface ISpecialMode {
    categoryDropdownVisible(defaultVisible: boolean): boolean;
    bannerButtonVisible(defaultVisible: boolean): boolean;
    nextButtonVisible(defaultVisible: boolean): boolean;
    prevButtonVisible(defaultVisible: boolean): boolean;
    menuButtonVisible(defaultVisible: boolean): boolean;
    morePuzzlesButtonVisible(defaultVisible: boolean): boolean;
    mainMenuButtonText(defaultText: string): string;
    handleGoBackAction(): boolean;
    handleShowBuyOfferMessage(): boolean;
    getPuzzleSolvedMessage(defaultMessage: string, emailCaptured: boolean, puzzleFinished: boolean): string;
    cookiesBannerVisible(defaultVisible: boolean): boolean;
    useCookies(defaultUse: boolean): boolean;
    handleWelcomeAction(defaultAction: boolean): boolean;
}