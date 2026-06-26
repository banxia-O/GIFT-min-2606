(function () {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const revealItems = document.querySelectorAll(".reveal");
  const heroKicker = document.querySelector("#hero-kicker");
  const heroTitle = document.querySelector("#hero-title");
  const visuals = document.querySelectorAll(".scene__visual");
  const lightbox = document.querySelector("#lightbox");
  const lightboxContent = document.querySelector(".lightbox__content");
  const lightboxImage = document.querySelector("#lightbox-image");
  const lightboxPlaceholder = document.querySelector("#lightbox-placeholder");
  const lightboxClose = document.querySelector(".lightbox__close");

  function setupReveal() {
    if (!("IntersectionObserver" in window) || prefersReducedMotion) {
      revealItems.forEach((item) => item.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18, rootMargin: "0px 0px -8% 0px" }
    );

    revealItems.forEach((item) => observer.observe(item));
  }

  function typeHeroTitle() {
    if (!heroTitle) {
      return;
    }

    const text = heroTitle.dataset.typeText || "";

    if (prefersReducedMotion) {
      heroTitle.textContent = text;
      heroTitle.classList.add("is-complete");
      return;
    }

    let index = 0;
    let lastTime = 0;
    const delay = 92;

    function step(time) {
      if (!lastTime) {
        lastTime = time;
      }

      if (time - lastTime >= delay) {
        heroTitle.textContent = text.slice(0, index + 1);
        index += 1;
        lastTime = time;
      }

      if (index < text.length) {
        requestAnimationFrame(step);
      } else {
        heroTitle.classList.add("is-complete");
      }
    }

    window.setTimeout(() => requestAnimationFrame(step), 760);
  }

  function setupImages() {
    visuals.forEach((figure) => {
      const image = figure.querySelector("img");
      if (!image) {
        return;
      }

      if (image.complete && image.naturalWidth > 0) {
        figure.classList.add("is-loaded");
      }

      image.addEventListener("load", () => figure.classList.add("is-loaded"));
      image.addEventListener("error", () => figure.classList.remove("is-loaded"));
    });
  }

  function updateParallax() {
    if (prefersReducedMotion) {
      return;
    }

    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

    visuals.forEach((figure) => {
      const rect = figure.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > viewportHeight) {
        return;
      }

      const progress = (rect.top + rect.height / 2 - viewportHeight / 2) / viewportHeight;
      const offset = Math.max(-20, Math.min(20, progress * -20));
      figure.style.setProperty("--parallax-y", offset.toFixed(1) + "px");
    });
  }

  var scrollY = 0;

  function openLightbox(figure) {
    const image = figure.querySelector("img");
    const isLoaded = figure.classList.contains("is-loaded") && image && image.naturalWidth > 0;
    const placeholder = figure.dataset.placeholder || "图片待替换";

    lightboxContent.classList.toggle("is-image", isLoaded);
    lightboxImage.src = isLoaded ? image.currentSrc || image.src : "";
    lightboxImage.alt = isLoaded ? image.alt : "";
    lightboxPlaceholder.textContent = placeholder;
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    scrollY = window.scrollY;
    document.body.style.position = "fixed";
    document.body.style.top = -scrollY + "px";
    document.body.style.width = "100%";
  }

  function closeLightbox() {
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    lightboxImage.src = "";
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.width = "";
    window.scrollTo(0, scrollY);
  }

  function setupLightbox() {
    if (!lightbox) {
      return;
    }

    visuals.forEach((figure) => {
      figure.addEventListener("click", () => openLightbox(figure));
      figure.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openLightbox(figure);
        }
      });
      figure.setAttribute("tabindex", "0");
      figure.setAttribute("role", "button");
    });

    lightbox.addEventListener("click", (event) => {
      if (event.target === lightbox || event.target === lightboxContent) {
        closeLightbox();
      }
    });

    lightboxClose.addEventListener("click", closeLightbox);
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && lightbox.classList.contains("is-open")) {
        closeLightbox();
      }
    });
  }

  function setupSparkles() {
    if (prefersReducedMotion) {
      return;
    }

    document.querySelectorAll(".sparkles").forEach(function (container) {
      var count = 18;
      for (var i = 0; i < count; i++) {
        var dot = document.createElement("span");
        dot.className = "sparkle";
        dot.style.left = Math.random() * 100 + "%";
        dot.style.top = Math.random() * 100 + "%";
        dot.style.setProperty("--dur", (3 + Math.random() * 4).toFixed(1) + "s");
        dot.style.setProperty("--delay", (Math.random() * -5).toFixed(1) + "s");
        container.appendChild(dot);
      }
    });
  }

  setupReveal();
  setupImages();
  setupLightbox();
  setupSparkles();
  typeHeroTitle();

  if (heroKicker) {
    window.setTimeout(() => heroKicker.classList.add("is-visible"), prefersReducedMotion ? 0 : 180);
  }

  let ticking = false;
  window.addEventListener(
    "scroll",
    () => {
      if (ticking) {
        return;
      }

      ticking = true;
      requestAnimationFrame(() => {
        updateParallax();
        ticking = false;
      });
    },
    { passive: true }
  );
  window.addEventListener("resize", updateParallax);
  updateParallax();
})();
