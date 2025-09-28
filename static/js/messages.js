// static/js/messages.js
(function () {
  // Create container if missing
  function createContainer() {
    let container = document.getElementById("toast-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "toast-container";
      container.style.position = "fixed";
      container.style.top = "1rem";
      container.style.right = "1rem";
      container.style.zIndex = "2000";
      container.style.display = "flex";
      container.style.flexDirection = "column";
      container.style.gap = "0.5rem";
      document.body.appendChild(container);
      console.debug("[toast] created container");
    }
    return container;
  }

  // Map django message tags to type
  function mapLevel(level) {
    if (!level) return "info";
    const l = level.toLowerCase();
    if (l.includes("error") || l.includes("danger")) return "error";
    if (l.includes("success")) return "success";
    if (l.includes("warning")) return "warning";
    return "info";
  }

  // Progress controller: handles accurate elapsed tracking and pause/resume
  function createProgressController(progressEl, duration, onComplete) {
    let rafId = null;
    let startTime = null; // performance.now() when current run started
    let elapsed = 0; // accumulated elapsed ms from previous runs
    let stopped = false;

    // ensure initial full width
    progressEl.style.width = "100%";

    function step(ts) {
      if (stopped) return;
      if (!startTime) startTime = ts;
      const runElapsed = ts - startTime;
      const totalElapsed = elapsed + runElapsed;
      const ratio = Math.max(0, 1 - totalElapsed / duration); // 1 -> 0
      progressEl.style.width = `${ratio * 100}%`;

      if (totalElapsed < duration) {
        rafId = requestAnimationFrame(step);
      } else {
        // complete
        progressEl.style.width = "0%";
        rafId = null;
        if (typeof onComplete === "function") onComplete();
      }
    }

    function start() {
      if (stopped) return;
      if (rafId) return;
      startTime = null;
      rafId = requestAnimationFrame(step);
    }

    function pause() {
      if (stopped) return;
      if (!rafId) return;
      cancelAnimationFrame(rafId);
      rafId = null;
      const now = performance.now();
      if (startTime) elapsed += now - startTime;
      startTime = null;
    }

    function resume() {
      if (stopped) return;
      if (rafId) return;
      if (elapsed >= duration) {
        progressEl.style.width = "0%";
        if (typeof onComplete === "function") onComplete();
        return;
      }
      startTime = null;
      rafId = requestAnimationFrame(step);
    }

    function stop() {
      stopped = true;
      if (rafId) cancelAnimationFrame(rafId);
      rafId = null;
    }

    // auto-start
    start();

    return { pause, resume, stop };
  }

  // Show a toast (CSS must define .toast .success/.error/.info/.warning backgrounds)
  function showToast(message, level = "info", duration = 4000) {
    const container = createContainer();
    const toast = document.createElement("div");
    toast.className = `toast ${level}`;
    toast.style.position = "relative";
    toast.style.minWidth = "220px";
    toast.style.padding = "0.85rem 1rem";
    toast.style.borderRadius = "8px";
    toast.style.color = "#fff";
    toast.style.boxShadow = "0 6px 18px rgba(0,0,0,0.18)";
    toast.style.overflow = "hidden";
    toast.style.cursor = "pointer";
    toast.style.display = "flex";
    toast.style.alignItems = "center";
    toast.style.gap = "0.75rem";
    toast.style.opacity = "0";
    toast.style.transform = "translateY(-8px)";
    toast.style.transition = "all 260ms cubic-bezier(.2,.9,.2,1)";

    // text
    const text = document.createElement("div");
    text.className = "toast-text";
    text.style.flex = "1";
    text.style.fontWeight = "600";
    text.textContent = message || "";

    // progress bar (left → right shrink)
    const progress = document.createElement("div");
    progress.className = "toast-progress";
    progress.style.position = "absolute";
    progress.style.bottom = "0";
    progress.style.left = "0";
    progress.style.height = "4px";
    progress.style.background = "rgba(255,255,255,0.85)";
    progress.style.width = "100%";

    // close
    const closeBtn = document.createElement("button");
    closeBtn.setAttribute("aria-label", "dismiss");
    closeBtn.style.background = "transparent";
    closeBtn.style.border = "none";
    closeBtn.style.color = "inherit";
    closeBtn.style.cursor = "pointer";
    closeBtn.style.padding = "4px";
    closeBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;

    closeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      removeToast(toast);
    });

    toast.appendChild(text);
    toast.appendChild(closeBtn);
    toast.appendChild(progress);
    container.appendChild(toast);

    // animate in
    requestAnimationFrame(() => {
      toast.style.opacity = "1";
      toast.style.transform = "translateY(0)";
    });

    // controller triggers remove when finished
    const onComplete = () => removeToast(toast);
    const controller = createProgressController(progress, duration, onComplete);

    // safety fallback timeout (slightly longer than duration)
    toast._hideTimeout = setTimeout(() => removeToast(toast), duration + 200);
    toast._progressController = controller;

    // hover handlers: pause/resume (do NOT recreate controller)
    toast.addEventListener("mouseenter", () => {
      try {
        controller.pause();
        clearTimeout(toast._hideTimeout);
      } catch (e) {}
    });
    toast.addEventListener("mouseleave", () => {
      try {
        controller.resume();
        toast._hideTimeout = setTimeout(() => removeToast(toast), duration);
      } catch (e) {}
    });

    // click to remove
    toast.addEventListener("click", () => removeToast(toast));

    return toast;
  }

  // remove toast cleanly
  function removeToast(toast) {
    if (!toast || !toast.parentNode) return;
    try {
      if (toast._progressController && typeof toast._progressController.stop === "function") {
        toast._progressController.stop();
      }
      if (toast._hideTimeout) clearTimeout(toast._hideTimeout);
    } catch (e) {}
    toast.style.transition = "all 180ms ease";
    toast.style.opacity = "0";
    toast.style.transform = "translateY(-8px)";
    setTimeout(() => {
      try {
        toast.remove();
      } catch (e) {}
    }, 200);
  }

  // read Django messages and show toasts
  function processDjangoMessages() {
    const hidden = document.getElementById("django-messages");
    if (!hidden) {
      console.debug("[toast] no #django-messages element found");
      return;
    }
    const nodes = hidden.querySelectorAll(".django-message");
    if (!nodes.length) {
      console.debug("[toast] no .django-message nodes found (no messages)");
    }
    nodes.forEach((node) => {
      const text = node.getAttribute("data-message") || node.dataset.message;
      const level = node.getAttribute("data-level") || node.dataset.level;
      console.debug("[toast] message found:", { text, level });
      showToast(text, mapLevel(level), 4500);
      node.remove();
    });
    hidden.remove();
  }

  // init
  document.addEventListener("DOMContentLoaded", () => {
    console.debug("[toast] DOMContentLoaded running");
    createContainer();
    setTimeout(processDjangoMessages, 50);
  });

  // expose globally
  window.showToast = showToast;
})();
