/**
 * Aldrovandi Tutorial System
 * Shows a sequence of tutorial modals after language selection.
 * Determines tutorial type based on APP.mode (kiosk), async VR detection, or web fallback.
 * Checks that all GIF sources exist before showing; if any is missing, skips to exploration.
 */

/**
 * Async VR headset browser detection.
 * Uses navigator.xr.isSessionSupported("immersive-vr") for accuracy,
 * plus Quest/Android UA checks to avoid false positives on desktop.
 * Returns true only when the browser is likely running inside a VR headset.
 */
APP._isVRHeadsetBrowser = async () => {
    const ua = navigator.userAgent || "";
    const platform = navigator.platform || "";

    let supportsImmersiveVR = false;
    if ("xr" in navigator && navigator.xr?.isSessionSupported) {
        try {
            supportsImmersiveVR = await navigator.xr.isSessionSupported("immersive-vr");
        } catch (e) {
            supportsImmersiveVR = false;
        }
    }

    const isQuestUA =
        /OculusBrowser/i.test(ua) ||
        /Meta Quest/i.test(ua)    ||
        /Quest/i.test(ua)         ||
        /Oculus/i.test(ua);

    const isAndroidLike = /Android/i.test(ua) || /Linux arm/i.test(platform);

    // Require both immersive-vr support AND a headset UA/platform signal
    // to avoid triggering on desktop Chrome which also exposes WebXR.
    return supportsImmersiveVR && (isQuestUA || isAndroidLike);
};

APP.showTutorial = () => {
    APP._isVRHeadsetBrowser().then(isVRHeadset => {

    // Determine tutorial type
    let tutorialType = "web";
    if (APP.mode === "kiosk") tutorialType = "kiosk";
    else if (isVRHeadset) tutorialType = "vr";

    // Get tutorial config
    const tutorialConfig = APP.config && APP.config.tutorial;
    if (!tutorialConfig || !tutorialConfig[tutorialType]) {
        APP.beginExploration();
        return;
    }

    const steps = tutorialConfig[tutorialType].steps;
    if (!steps || steps.length === 0) {
        APP.beginExploration();
        return;
    }

    // Check that every GIF source referenced in the steps actually exists.
    // If any source is missing, skip the tutorial entirely.
    const sources = steps.map(s => s.source).filter(Boolean);
    if (sources.length < steps.length) {
        // At least one step has no source defined — skip tutorial
        APP.beginExploration();
        return;
    }

    Promise.all(
        sources.map(src =>
            fetch(src, { method: "HEAD" })
                .then(r => r.ok)
                .catch(() => false)
        )
    ).then(results => {
        if (results.every(Boolean)) {
            APP._showTutorialStep(steps, 0);
            APP.popupShown = true;
        } else {
            console.warn("Tutorial: one or more GIF sources not found, skipping tutorial.");
            APP.beginExploration();
        }
    });

    }); // end _isVRHeadsetBrowser
};

APP._showTutorialStep = (steps, index) => {
    const step = steps[index];
    const total = steps.length;
    const lang = APP.currentLanguage || "ita";
    const isLast = index === total - 1;

    // --- Header ---
    const content = step[lang] || {};
    const titleText = content.title || "";
    const progressText = `(${index + 1}/${total})`;

    const headerEl = document.createElement("div");
    headerEl.className = "tutorial-header-content";

    const titleSpan = document.createElement("span");
    titleSpan.className = "tutorial-header-title";
    titleSpan.textContent = titleText;

    const progressSpan = document.createElement("span");
    progressSpan.className = "tutorial-header-progress";
    progressSpan.textContent = progressText;

    headerEl.appendChild(titleSpan);
    headerEl.appendChild(progressSpan);

    // --- Body ---
    const bodyEl = document.createElement("div");
    bodyEl.className = "tutorial-body";

    if (step.source) {
        const imgWrapper = document.createElement("div");
        imgWrapper.className = "tutorial-gif-wrapper";
        const img = document.createElement("img");
        img.src = step.source;
        img.className = "tutorial-gif";
        img.alt = titleText;
        imgWrapper.appendChild(img);
        bodyEl.appendChild(imgWrapper);
    }

    if (content.description) {
        const descEl = document.createElement("p");
        descEl.className = "tutorial-desc";
        descEl.textContent = content.description;
        bodyEl.appendChild(descEl);
    }

    // --- Footer ---
    const footerEl = document.createElement("div");
    footerEl.className = "tutorial-footer";

    if (!isLast) {
        const skipBtn = document.createElement("button");
        skipBtn.className = "tutorial-btn tutorial-btn-skip";
        skipBtn.textContent = lang === "ita" ? "Salta" : "Skip";
        skipBtn.onclick = () => {
            APP.closeModal();
            APP.beginExploration();
            APP.popupShown = false;
        };
        footerEl.appendChild(skipBtn);
    }

    const actionBtn = document.createElement("button");
    actionBtn.className = "tutorial-btn tutorial-btn-action";

    if (isLast) {
        actionBtn.textContent = lang === "ita" ? "Inizia" : "Start";
        actionBtn.onclick = () => {
            APP.closeModal();
            APP.beginExploration();
            APP.popupShown = false;
        };
    } else {
        actionBtn.textContent = lang === "ita" ? "Avanti" : "Next";
        actionBtn.onclick = () => {
            APP.closeModal();
            APP._showTutorialStep(steps, index + 1);
        };
    }

    footerEl.appendChild(actionBtn);

    APP.showModal({
        header: headerEl,
        body: bodyEl,
        footer: footerEl,
        width: "620px",
        closeOnOverlayClick: false,
        onShow: (modal) => {
            // Override the × close button so it ends the tutorial cleanly
            const closeBtn = modal.querySelector(".app-modal-close");
            if (closeBtn) {
                closeBtn.onclick = () => {
                    APP.closeModal();
                    APP.beginExploration();
                    APP.popupShown = false;
                };
            }
        }
    });
};
