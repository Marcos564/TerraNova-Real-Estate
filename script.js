(() => {
  const FRAME_COUNT = 120;
  const FRAME_PATH = (i) => `frames/frame_${String(i).padStart(4, "0")}.jpg`;
  const EASE = 0.09; // lower = smoother/laggier catch-up

  const canvas = document.getElementById("frameCanvas");
  const ctx = canvas.getContext("2d");
  const spacer = document.getElementById("frameSpacer");
  const nextSection = document.getElementById("nextSection");
  const navbar = document.getElementById("navbar");
  const loader = document.getElementById("loader");
  const loaderFill = document.getElementById("loaderFill");
  const loaderText = document.getElementById("loaderText");
  const aboutPhoto = document.querySelector(".about-photo");

  const images = new Array(FRAME_COUNT);
  let loadedCount = 0;
  let ready = false;

  let targetFrame = 0;
  let currentFrame = 0;
  let dpr = Math.min(window.devicePixelRatio || 1, 2);

  function resizeCanvas() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
  }

  function drawFrame(index) {
    const img = images[Math.round(index)];
    if (!img || !img.complete || img.naturalWidth === 0) return;

    const canvasW = canvas.width;
    const canvasH = canvas.height;
    const imgW = img.naturalWidth;
    const imgH = img.naturalHeight;

    const scale = Math.max(canvasW / imgW, canvasH / imgH);
    const drawW = imgW * scale;
    const drawH = imgH * scale;
    const offsetX = (canvasW - drawW) / 2;
    const offsetY = (canvasH - drawH) / 2;

    ctx.clearRect(0, 0, canvasW, canvasH);
    ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
  }

  function getScrollProgress() {
    const rect = spacer.getBoundingClientRect();
    const scrollableDistance = spacer.offsetHeight - window.innerHeight;
    if (scrollableDistance <= 0) return 0;
    const scrolled = -rect.top;
    return Math.min(Math.max(scrolled / scrollableDistance, 0), 1);
  }

  function onSequenceComplete(isComplete) {
    // Hook point for the next iteration: hero reveal, extra copy, etc.
    nextSection.classList.toggle("active", isComplete);
    navbar.classList.toggle("revealed", isComplete);
  }

  let lastProgressComplete = false;
  let aboutRevealed = false;

  function checkAboutReveal() {
    if (aboutRevealed || !aboutPhoto) return;
    const rect = aboutPhoto.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.85) {
      aboutRevealed = true;
      aboutPhoto.classList.add("in-view");
    }
  }

  function onScroll() {
    const progress = getScrollProgress();
    targetFrame = progress * (FRAME_COUNT - 1);

    const isComplete = progress >= 0.995;
    if (isComplete !== lastProgressComplete) {
      lastProgressComplete = isComplete;
      onSequenceComplete(isComplete);
    }

    checkAboutReveal();
  }

  function animate() {
    currentFrame += (targetFrame - currentFrame) * EASE;
    if (Math.abs(targetFrame - currentFrame) < 0.02) {
      currentFrame = targetFrame;
    }
    if (ready) drawFrame(currentFrame);
    requestAnimationFrame(animate);
  }

  function updateLoaderProgress() {
    const pct = Math.round((loadedCount / FRAME_COUNT) * 100);
    loaderFill.style.width = pct + "%";
    loaderText.textContent = pct + "%";
  }

  function preloadFrames() {
    for (let i = 0; i < FRAME_COUNT; i++) {
      const img = new Image();
      img.onload = img.onerror = () => {
        loadedCount++;
        updateLoaderProgress();
        if (loadedCount === FRAME_COUNT) {
          ready = true;
          loader.classList.add("hidden");
          onScroll();
          drawFrame(currentFrame);
        }
      };
      img.src = FRAME_PATH(i + 1);
      images[i] = img;
    }
  }

  window.addEventListener("resize", () => {
    resizeCanvas();
    drawFrame(currentFrame);
  });

  window.addEventListener("scroll", onScroll, { passive: true });

  document.querySelector(".hero-cta").addEventListener("click", () => {
    const section = document.getElementById("propertiesSection");
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
    const top =
      section.getBoundingClientRect().top + window.scrollY - navbar.offsetHeight + 2 * rem;
    window.scrollTo({ top, behavior: "smooth" });
  });

  resizeCanvas();
  preloadFrames();
  checkAboutReveal();
  requestAnimationFrame(animate);
})();
