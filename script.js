const menuButton = document.querySelector(".menu-toggle");
const menuLabel = document.querySelector(".menu-label");
const menu = document.querySelector(".main-nav");
const header = document.querySelector(".site-header");
const hero = document.querySelector(".hero");
const heroVideo = document.querySelector(".hero-video");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let lockedScrollY = 0;
let heroSequenceStarted = false;

document.body.classList.add("motion-ready");

function releaseHeroIntro() {
  document.documentElement.classList.remove("hero-intro-lock");
  hero?.classList.add("is-complete");
}

function startHeroSequence() {
  if (heroSequenceStarted) return;
  heroSequenceStarted = true;

  requestAnimationFrame(() => {
    requestAnimationFrame(() => hero?.classList.add("is-entered"));
  });

  window.setTimeout(releaseHeroIntro, 1200);
}

if (reduceMotion) {
  hero?.classList.add("is-entered");
  heroVideo?.removeAttribute("autoplay");
  releaseHeroIntro();
} else {
  heroVideo?.querySelectorAll("source[data-src]").forEach((source) => {
    source.src = source.dataset.src;
  });

  if (heroVideo) {
    heroVideo.muted = true;
    heroVideo.defaultMuted = true;

    heroVideo.addEventListener("canplay", () => heroVideo.classList.add("is-ready"), { once: true });
    heroVideo.addEventListener("playing", startHeroSequence, { once: true });
    heroVideo.addEventListener("error", () => {
      heroVideo.classList.add("has-error");
      startHeroSequence();
    }, { once: true });
    heroVideo.load();
    heroVideo.play().catch(() => startHeroSequence());
  }

  window.setTimeout(startHeroSequence, 180);
  window.setTimeout(releaseHeroIntro, 1400);
}

function updateHeader() {
  header?.classList.toggle("is-scrolled", window.scrollY > 24);
}

updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

function lockPageScroll() {
  lockedScrollY = window.scrollY;
  document.body.style.position = "fixed";
  document.body.style.top = `-${lockedScrollY}px`;
  document.body.style.right = "0";
  document.body.style.left = "0";
  document.body.style.width = "100%";
  document.body.classList.add("menu-open");
}

function unlockPageScroll() {
  document.body.classList.remove("menu-open");
  document.body.style.removeProperty("position");
  document.body.style.removeProperty("top");
  document.body.style.removeProperty("right");
  document.body.style.removeProperty("left");
  document.body.style.removeProperty("width");
  window.scrollTo(0, lockedScrollY);
}

function closeMenu({ returnFocus = false } = {}) {
  const wasOpen = menuButton?.getAttribute("aria-expanded") === "true";
  menuButton?.setAttribute("aria-expanded", "false");
  menuButton?.setAttribute("aria-label", "Abrir menu");
  if (menuLabel) menuLabel.textContent = "Menu";
  menu?.classList.remove("is-open");
  header?.classList.remove("menu-active");

  if (wasOpen) unlockPageScroll();
  if (returnFocus) menuButton?.focus();
}

menuButton?.addEventListener("click", () => {
  const willOpen = menuButton.getAttribute("aria-expanded") !== "true";
  menuButton.setAttribute("aria-expanded", String(willOpen));
  menuButton.setAttribute("aria-label", willOpen ? "Fechar menu" : "Abrir menu");
  if (menuLabel) menuLabel.textContent = willOpen ? "Fechar" : "Menu";
  menu?.classList.toggle("is-open", willOpen);
  header?.classList.toggle("menu-active", willOpen);

  if (willOpen) {
    lockPageScroll();
    menu?.querySelector("a:not(.nav-atuacao)")?.focus({ preventScroll: true });
  } else {
    unlockPageScroll();
  }
});

menu?.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeMenu({ returnFocus: true });
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 860) closeMenu();
});

window.addEventListener("pageshow", () => closeMenu());

const revealItems = document.querySelectorAll(".reveal");

document.querySelectorAll(".service-grid, .fact-grid").forEach((group) => {
  [...group.children]
    .filter((item) => item.classList.contains("reveal"))
    .forEach((item, index) => item.style.setProperty("--reveal-delay", `${index * 85}ms`));
});

if (reduceMotion || !("IntersectionObserver" in window)) {
  revealItems.forEach((item) => item.classList.add("is-visible"));
} else {
  const observer = new IntersectionObserver(
    (entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        currentObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
  );

  revealItems.forEach((item) => observer.observe(item));
}
