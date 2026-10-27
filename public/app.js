// Theme Manager
const root = document.documentElement;
const themeButtons = document.querySelectorAll("[data-theme-choice]");
const savedTheme = window.localStorage.getItem("portfolio-theme");

function setTheme(theme) {
  root.dataset.theme = theme;
  window.localStorage.setItem("portfolio-theme", theme);
  themeButtons.forEach((btn) => {
    btn.setAttribute("aria-pressed", String(btn.dataset.themeChoice === theme));
  });
  window.dispatchEvent(new CustomEvent("portfolio:themechange", { detail: { theme } }));
}

if (["blue", "pink", "green", "purple", "red"].includes(savedTheme)) {
  setTheme(savedTheme);
} else {
  setTheme("blue");
}

themeButtons.forEach((btn) => {
  btn.addEventListener("click", () => setTheme(btn.dataset.themeChoice));
});

// Soft Pure White Cursor Spotlight Pool
const cursorSpotlight = document.querySelector("#cursor-spotlight");

let targetPointerX = window.innerWidth / 2;
let targetPointerY = window.innerHeight / 2;
let spotlightX = targetPointerX;
let spotlightY = targetPointerY;

document.addEventListener("pointermove", (e) => {
  targetPointerX = e.clientX;
  targetPointerY = e.clientY;

  // Update card spot coordinates for subtle holographic spotlight shimmer
  document.querySelectorAll("[data-tilt], .stack-deck-card, .skill-token-card, .cert-credential-badge, .resume-preview-card").forEach((card) => {
    const bounds = card.getBoundingClientRect();
    if (
      targetPointerX >= bounds.left - 50 &&
      targetPointerX <= bounds.right + 50 &&
      targetPointerY >= bounds.top - 50 &&
      targetPointerY <= bounds.bottom + 50
    ) {
      card.style.setProperty("--spot-x", `${targetPointerX - bounds.left}px`);
      card.style.setProperty("--spot-y", `${targetPointerY - bounds.top}px`);
    }
  });
}, { passive: true });

function updateSpotlight() {
  if (cursorSpotlight) {
    spotlightX += (targetPointerX - spotlightX) * 0.25;
    spotlightY += (targetPointerY - spotlightY) * 0.25;
    cursorSpotlight.style.transform = `translate3d(${spotlightX}px, ${spotlightY}px, 0)`;
  }
  requestAnimationFrame(updateSpotlight);
}
requestAnimationFrame(updateSpotlight);

// 3D Card Interactive Tilt Effect
const tiltElements = document.querySelectorAll("[data-tilt]");

tiltElements.forEach((el) => {
  el.addEventListener("pointermove", (e) => {
    // Keep cards level on touch devices to avoid stuck tilted states
    if (e.pointerType === "touch") return;

    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -6;
    const rotateY = ((x - centerX) / centerX) * 6;

    el.style.transform = `perspective(800px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-3px)`;
  });

  el.addEventListener("pointerleave", () => {
    el.style.transform = "perspective(800px) rotateX(0deg) rotateY(0deg) translateY(0px)";
  });
});

// Copy Email Button
const btnCopyEmail = document.querySelector("#btn-copy-email");
if (btnCopyEmail) {
  btnCopyEmail.addEventListener("click", async () => {
    const email = btnCopyEmail.dataset.email;
    if (!email) return;

    try {
      await navigator.clipboard.writeText(email);
      const originalHtml = btnCopyEmail.innerHTML;
      btnCopyEmail.innerHTML = `<span>Email Copied!</span><span aria-hidden="true">✓</span>`;
      btnCopyEmail.style.borderColor = "var(--accent)";
      setTimeout(() => {
        btnCopyEmail.innerHTML = originalHtml;
        btnCopyEmail.style.borderColor = "";
      }, 2500);
    } catch (err) {
      window.location.href = `mailto:${email}`;
    }
  });
}

// Active Nav Indicator on Scroll (Accounts for fixed header)
const sections = document.querySelectorAll("main > section");
const navLinks = document.querySelectorAll(".nav a");

window.addEventListener("scroll", () => {
  let currentSectionId = "";
  const scrollPos = window.scrollY + 160;

  sections.forEach((section) => {
    if (scrollPos >= section.offsetTop) {
      currentSectionId = section.getAttribute("id");
    }
  });

  navLinks.forEach((link) => {
    const href = link.getAttribute("href");
    if (href === `#${currentSectionId}`) {
      link.classList.add("nav-link--active");
    } else {
      link.classList.remove("nav-link--active");
    }
  });
}, { passive: true });

// 3D Stacking Card Deck on Scroll (Cards slide back on scroll-down, forward on scroll-up)
const deckCards = Array.from(document.querySelectorAll(".stack-deck-card"));
const stackDeckContainer = document.querySelector("#stack-deck");

function updateDeckStacking() {
  if (!deckCards.length || !stackDeckContainer) return;

  const stickyTop = 110;

  deckCards.forEach((card, idx) => {
    // If it's the last card, it doesn't need to recede behind another card
    if (idx === deckCards.length - 1) {
      card.style.transform = "scale(1) translate3d(0, 0, 0)";
      card.style.filter = "brightness(1)";
      return;
    }

    const nextCard = deckCards[idx + 1];
    if (!nextCard) return;

    const nextRect = nextCard.getBoundingClientRect();
    const cardRect = card.getBoundingClientRect();

    const overlapStart = stickyTop + cardRect.height * 0.9;
    const overlapEnd = stickyTop;

    if (nextRect.top < overlapStart) {
      const progress = Math.min(Math.max((overlapStart - nextRect.top) / (overlapStart - overlapEnd), 0), 1);
      
      const scale = 1 - progress * 0.06;
      const translateY = -progress * 16;
      const translateZ = -progress * 50;
      const brightness = 1 - progress * 0.22;

      card.style.transform = `perspective(1000px) scale(${scale.toFixed(3)}) translate3d(0, ${translateY.toFixed(1)}px, ${translateZ.toFixed(1)}px)`;
      card.style.filter = `brightness(${brightness.toFixed(2)})`;
      card.classList.toggle("is-stacked", progress > 0.4);
    } else {
      card.style.transform = "perspective(1000px) scale(1) translate3d(0, 0, 0)";
      card.style.filter = "brightness(1)";
      card.classList.remove("is-stacked");
    }
  });
}

window.addEventListener("scroll", updateDeckStacking, { passive: true });
window.addEventListener("resize", updateDeckStacking, { passive: true });
updateDeckStacking();

// Interactive Resume Viewer Modal (Only appears when user clicks Resume)
const resumeModal = document.querySelector("#resume-modal");
const openResumeButtons = document.querySelectorAll(
  "#btn-open-resume-header, #btn-open-resume-hero, #btn-open-resume-contact, #btn-open-resume-mobile, [data-open-resume]"
);
const closeResumeButtons = document.querySelectorAll("#btn-close-resume, #btn-close-resume-footer, .resume-modal-backdrop");

function openResume() {
  if (resumeModal) {
    resumeModal.classList.add("resume-modal--active");
    resumeModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }
}

function closeResume() {
  if (resumeModal) {
    resumeModal.classList.remove("resume-modal--active");
    resumeModal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }
}

openResumeButtons.forEach((btn) => btn.addEventListener("click", () => {
  closeMobileMenu();
  openResume();
}));
closeResumeButtons.forEach((btn) => btn.addEventListener("click", closeResume));

// Interactive Certificate Viewer Modal (Opens when user clicks any certificate or research certificate)
const certModal = document.querySelector("#cert-modal");
const certModalTitle = document.querySelector("#cert-modal-title");
const certModalSpecs = document.querySelector("#cert-modal-specs");
const certModalImg = document.querySelector("#cert-modal-img");
const certModalDownload = document.querySelector("#cert-modal-download");
const certModalFooterDownload = document.querySelector("#cert-modal-footer-download");
const certModalViewTab = document.querySelector("#cert-modal-view-tab");
const certModalBadge = document.querySelector("#cert-modal-badge");
const certModalIssuer = document.querySelector("#cert-modal-issuer");
const closeCertButtons = document.querySelectorAll("#btn-close-cert, #btn-close-cert-footer, #cert-modal-backdrop");
const certCards = document.querySelectorAll(".cert-credential-badge");
const btnViewResearchCert = document.querySelector("#btn-view-research-cert");

function openCertificate(data) {
  if (!certModal) return;

  const title = data.title || "Specialized Credential";
  const issuer = data.issuer || "Verified Accredited Organization";
  const badge = data.badge || "Verified Credential";
  const code = data.code || "CERT-RECORD";
  const imgSrc = data.image || "/certificates/niki_skill_infosis.jpeg";

  if (certModalTitle) certModalTitle.textContent = title;
  if (certModalSpecs) certModalSpecs.textContent = `${code} • ${issuer} • Authenticated`;
  if (certModalBadge) certModalBadge.textContent = badge;
  if (certModalIssuer) certModalIssuer.textContent = `Issuer: ${issuer}`;

  if (certModalImg) {
    certModalImg.src = imgSrc;
    certModalImg.alt = `${title} Certificate`;
  }

  const cleanFilename = `${title.replace(/[^a-zA-Z0-9_-]/g, "_")}_Certificate.jpeg`;
  if (certModalDownload) {
    certModalDownload.href = imgSrc;
    certModalDownload.setAttribute("download", cleanFilename);
  }
  if (certModalFooterDownload) {
    certModalFooterDownload.href = imgSrc;
    certModalFooterDownload.setAttribute("download", cleanFilename);
  }
  if (certModalViewTab) {
    certModalViewTab.href = imgSrc;
  }

  certModal.classList.add("resume-modal--active");
  certModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeCertificate() {
  if (certModal) {
    certModal.classList.remove("resume-modal--active");
    certModal.setAttribute("aria-hidden", "true");
    const anyModalOpen =
      (resumeModal && resumeModal.classList.contains("resume-modal--active")) ||
      (certModal && certModal.classList.contains("resume-modal--active"));
    if (!anyModalOpen) {
      document.body.style.overflow = "";
    }
  }
}

certCards.forEach((card) => {
  const handler = () => {
    openCertificate({
      image: card.dataset.certImg,
      title: card.dataset.certTitle,
      issuer: card.dataset.certIssuer,
      badge: card.dataset.certBadge,
      code: card.dataset.certCode,
    });
  };

  card.addEventListener("click", handler);
  card.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handler();
    }
  });
});

if (btnViewResearchCert) {
  btnViewResearchCert.addEventListener("click", () => {
    openCertificate({
      image: btnViewResearchCert.dataset.certImg,
      title: btnViewResearchCert.dataset.certTitle,
      issuer: btnViewResearchCert.dataset.certIssuer,
      badge: btnViewResearchCert.dataset.certBadge,
      code: btnViewResearchCert.dataset.certCode,
    });
  });
}

closeCertButtons.forEach((btn) => btn.addEventListener("click", closeCertificate));

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeResume();
    closeCertificate();
    closeMobileMenu();
  }
});

// Mobile Navigation Drawer Manager
const mobileMenuBtn = document.querySelector("#mobile-menu-btn");
const mobileNavDrawer = document.querySelector("#mobile-nav-drawer");
const mobileNavClose = document.querySelector("#mobile-nav-close");
const mobileNavBackdrop = document.querySelector("#mobile-nav-backdrop");
const mobileNavLinks = document.querySelectorAll(".mobile-nav-link");

function openMobileMenu() {
  if (mobileNavDrawer && mobileMenuBtn) {
    mobileNavDrawer.classList.add("mobile-nav-drawer--active");
    mobileNavDrawer.setAttribute("aria-hidden", "false");
    mobileMenuBtn.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
  }
}

function closeMobileMenu() {
  if (mobileNavDrawer && mobileMenuBtn) {
    mobileNavDrawer.classList.remove("mobile-nav-drawer--active");
    mobileNavDrawer.setAttribute("aria-hidden", "true");
    mobileMenuBtn.setAttribute("aria-expanded", "false");
    const anyModalOpen =
      (resumeModal && resumeModal.classList.contains("resume-modal--active")) ||
      (certModal && certModal.classList.contains("resume-modal--active"));
    if (!anyModalOpen) {
      document.body.style.overflow = "";
    }
  }
}

if (mobileMenuBtn) {
  mobileMenuBtn.addEventListener("click", () => {
    if (mobileNavDrawer && mobileNavDrawer.classList.contains("mobile-nav-drawer--active")) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  });
}

if (mobileNavClose) mobileNavClose.addEventListener("click", closeMobileMenu);
if (mobileNavBackdrop) mobileNavBackdrop.addEventListener("click", closeMobileMenu);
mobileNavLinks.forEach((link) => {
  link.addEventListener("click", closeMobileMenu);
});
