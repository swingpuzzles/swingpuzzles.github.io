import sceneInitializer from "./components/SceneInitializer";

sceneInitializer.init();

/*function requestFullscreen(element: HTMLElement) {
    if (element.requestFullscreen) {
        element.requestFullscreen();
    } else if ((element as any).webkitRequestFullscreen) {
        (element as any).webkitRequestFullscreen();
    } else if ((element as any).msRequestFullscreen) {
        (element as any).msRequestFullscreen();
    }
}*/

/*function isMobileDevice(): boolean {
    //return true;
    return /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
}*/

/*function showForceFullscreenDialog() {
    (document.getElementById("fullscreen-required-dialog") as HTMLElement).style.display = "flex";
}

function hideForceFullscreenDialog() {
    (document.getElementById("fullscreen-required-dialog") as HTMLElement).style.display = "none";
}*/

/*function enterFullscreenAgain() {
    requestFullscreen(document.getElementById("game-container") ?? document.body);
    hideForceFullscreenDialog();
}*/

// Expose it to the global window object so HTML can call it
//(window as any).enterFullscreenAgain = enterFullscreenAgain;

/*function updateExitButtonVisibility() {
    const isFullscreen = document.fullscreenElement || (document as any).webkitFullscreenElement || (document as any).msFullscreenElement;
    const btn = document.getElementById("exitFullscreenBtn") as HTMLElement;
    btn.style.display = isFullscreen ? "block" : "none";
}*/

/*function handleFullscreenChange() {
    const isFullscreen = document.fullscreenElement || (document as any).webkitFullscreenElement || (document as any).msFullscreenElement;

    if (isFullscreen) {
        hasEverEnteredFullscreen = true;
        hideForceFullscreenDialog();
    } else {
        if (hasEverEnteredFullscreen) {
            showForceFullscreenDialog();
        }
    }

    updateExitButtonVisibility();
}*/

/*document.addEventListener("fullscreenchange", handleFullscreenChange);
document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
document.addEventListener("msfullscreenchange", handleFullscreenChange);*/

// Exit Fullscreen
/*(document.getElementById("exitFullscreenBtn") as HTMLElement).addEventListener("click", () => {
    if (document.exitFullscreen) {
        document.exitFullscreen();
    } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
    } else if ((document as any).msExitFullscreen) {
        (document as any).msExitFullscreen();
    }
});*/

/*window.addEventListener("load", () => {
    (document.getElementById("fullscreen-required-dialog") as HTMLElement).style.display = "none";
    const hasAcceptedCookies = localStorage.getItem("cookiesAccepted") === "true";
    const isMobile = isMobileDevice();

    if (!hasAcceptedCookies) {
        (document.getElementById("cookie-consent") as HTMLElement).style.display = "block";

        (document.getElementById("acceptCookies") as HTMLElement).addEventListener("click", () => {
            localStorage.setItem("cookiesAccepted", "true");
            (document.getElementById("cookie-consent") as HTMLElement).style.display = "none";
        
            // ✅ Only mobile AND no fullscreen yet
            if (isMobileDevice()) {
                maybePromptFullscreen();
            }
        });
    } else {
        console.log("[Cookie] Already accepted cookies");

        // ✅ Still show fullscreen dialog if not accepted yet AND is mobile
        if (isMobile) {
            maybePromptFullscreen();
        }    
    }
});*/

/*function maybePromptFullscreen() {
    (document.getElementById("fullscreen-required-dialog") as HTMLElement).style.display = "flex";
}

(document.getElementById("enterFullscreenBtn") as HTMLElement).addEventListener("click", () => {
    const container = document.getElementById("game-container") ?? document.body;
    requestFullscreen(container);
    localStorage.setItem("fullscreenAccepted", "true");
    hideForceFullscreenDialog();
});*/