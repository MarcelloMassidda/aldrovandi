/**
 * Aldrovandi Tutorial System
 * Shows a sequence of tutorial modals after language selection.
 * Determines tutorial type based on APP.mode (kiosk) or APP.isVR_Device() (vr), else web.
 * Checks for at least one object asset before showing; if missing, skips to exploration.
 */

APP.showTutorial = () => {
    // Determine tutorial type
    let tutorialType = "web";
    if (APP.mode === "kiosk") tutorialType = "kiosk";
    else if (APP.isVR_Device()) tutorialType = "vr";

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
        } else {
            console.warn("Tutorial: one or more GIF sources not found, skipping tutorial.");
            APP.beginExploration();
        }
    });
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
                };
            }
        }
    });
};
