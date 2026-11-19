const header = document.getElementById("header");
const burger = document.getElementById("burger");
const nav = document.getElementById("nav");
const tabs = document.querySelectorAll(".tab");
const cards = document.querySelectorAll("#set-grid .card");
const showAll = document.getElementById("show-all");
const extraCards = document.querySelectorAll(".extra-card");
const form = document.getElementById("order-form");
const success = document.getElementById("form-success");
const zoneModal = document.getElementById("zone-modal");
const checkZone = document.getElementById("check-zone");
const zoneConfirm = document.getElementById("zone-confirm");
const zoneSelect = document.getElementById("zone-select");
const zoneResult = document.getElementById("zone-result");
const interest = document.getElementById("interest");

window.addEventListener("scroll", () => {
  header.classList.toggle("is-scrolled", window.scrollY > 8);
}, { passive: true });

burger.addEventListener("click", () => {
  const open = nav.classList.toggle("is-open");
  burger.setAttribute("aria-expanded", String(open));
});

nav.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    nav.classList.remove("is-open");
    burger.setAttribute("aria-expanded", "false");
  });
});

function applyFilter(filter) {
  cards.forEach((card) => {
    const match = filter === "all" || card.dataset.cat === filter;
    const isExtra = card.classList.contains("extra-card");
    const extrasOpen = showAll.dataset.open === "true";
    card.hidden = !match || (isExtra && !extrasOpen);
  });
}

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((t) => {
      t.classList.remove("is-active");
      t.setAttribute("aria-selected", "false");
    });
    tab.classList.add("is-active");
    tab.setAttribute("aria-selected", "true");
    applyFilter(tab.dataset.filter);
  });
});

showAll.addEventListener("click", () => {
  const open = showAll.dataset.open === "true";
  showAll.dataset.open = String(!open);
  extraCards.forEach((card, i) => {
    card.hidden = open;
    if (!open) {
      card.style.setProperty("--d", `${i * 70}ms`);
      requestAnimationFrame(() => card.classList.add("is-in"));
    }
  });
  showAll.textContent = open ? "Показать все наборы" : "Свернуть";
  const active = document.querySelector(".tab.is-active");
  applyFilter(active ? active.dataset.filter : "all");
});

document.querySelectorAll("[data-set]").forEach((btn) => {
  btn.addEventListener("click", () => {
    interest.value = "Набор";
    const comment = document.getElementById("comment");
    comment.value = `Хочу набор «${btn.dataset.set}»`;
    document.getElementById("order").scrollIntoView({ behavior: "smooth" });
  });
});

checkZone.addEventListener("click", () => zoneModal.showModal());

zoneConfirm.addEventListener("click", () => {
  if (!zoneSelect.value) {
    zoneSelect.focus();
    return;
  }
  zoneResult.hidden = false;
  zoneResult.textContent = `Доставляем: ${zoneSelect.value}. Бесплатно от 1 500 ₽.`;
});

function setInvalid(el, on) {
  el.classList.toggle("is-invalid", on);
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("name");
  const phone = document.getElementById("phone");
  const district = document.getElementById("district");
  const agree = document.getElementById("agree");
  const agreeLabel = agree.closest(".agree");

  const phoneOk = /[\d]{10,}/.test(phone.value.replace(/\D/g, ""));
  const checks = [
    [name.closest(".field"), name.value.trim().length > 1],
    [phone.closest(".field"), phoneOk],
    [district.closest(".field"), Boolean(district.value)],
    [interest.closest(".field"), Boolean(interest.value)],
  ];

  let valid = true;
  checks.forEach(([field, ok]) => {
    setInvalid(field, !ok);
    if (!ok) valid = false;
  });
  setInvalid(agreeLabel, !agree.checked);
  if (!agree.checked) valid = false;

  if (!valid) {
    form.querySelector(".is-invalid input, .is-invalid select")?.focus();
    return;
  }

  success.hidden = false;
  form.querySelectorAll("input, select, textarea, button[type='submit']").forEach((el) => {
    if (el.id !== "agree") el.disabled = true;
  });
});

document.querySelectorAll(".field input, .field select").forEach((input) => {
  input.addEventListener("input", () => input.closest(".field").classList.remove("is-invalid"));
});

const stickyCta = document.querySelector(".sticky-cta");
const orderSection = document.getElementById("order");
if (stickyCta && orderSection && "IntersectionObserver" in window) {
  const io = new IntersectionObserver(([entry]) => {
    stickyCta.classList.toggle("is-hidden", entry.isIntersecting);
  }, { threshold: 0.2 });
  io.observe(orderSection);
}

const reviewTrack = document.getElementById("review-track");
const revPrev = document.getElementById("rev-prev");
const revNext = document.getElementById("rev-next");

function reviewStep() {
  const card = reviewTrack?.querySelector(".review");
  if (!card) return 0;
  const styles = getComputedStyle(reviewTrack);
  const gap = parseFloat(styles.columnGap || styles.gap) || 18;
  return card.getBoundingClientRect().width + gap;
}

function updateReviewButtons() {
  if (!reviewTrack || !revPrev || !revNext) return;
  const max = reviewTrack.scrollWidth - reviewTrack.clientWidth - 4;
  revPrev.disabled = reviewTrack.scrollLeft <= 4;
  revNext.disabled = reviewTrack.scrollLeft >= max;
}

if (reviewTrack && revPrev && revNext) {
  revPrev.addEventListener("click", () => {
    reviewTrack.scrollBy({ left: -reviewStep(), behavior: "smooth" });
  });
  revNext.addEventListener("click", () => {
    reviewTrack.scrollBy({ left: reviewStep(), behavior: "smooth" });
  });
  reviewTrack.addEventListener("scroll", updateReviewButtons, { passive: true });
  window.addEventListener("resize", updateReviewButtons);
  updateReviewButtons();
}

const mapRoot = document.querySelector(".map");
if (mapRoot) {
  const districts = [...mapRoot.querySelectorAll("[data-zone]")];
  const zoneRows = [...document.querySelectorAll(".zones [data-zone]")];
  const syncZone = (id, on) => {
    districts.forEach((el) => el.classList.toggle("is-on", on && el.dataset.zone === id));
    zoneRows.forEach((el) => el.classList.toggle("is-on", on && el.dataset.zone === id));
  };
  [...districts, ...zoneRows].forEach((el) => {
    el.addEventListener("mouseenter", () => syncZone(el.dataset.zone, true));
    el.addEventListener("mouseleave", () => syncZone(el.dataset.zone, false));
  });
}

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if (!reduceMotion && "IntersectionObserver" in window) {
  const staggered = [
    [".step", 90],
    ["#set-grid .card:not(.extra-card)", 80],
    [".benefits li", 80],
    [".zones li", 45],
    [".review", 70],
    [".guarantees li", 70],
    [".accordion details", 70],
  ];
  staggered.forEach(([sel, gap]) => {
    document.querySelectorAll(sel).forEach((el, i) => {
      el.setAttribute("data-animate", "");
      el.style.setProperty("--d", `${i * gap}ms`);
    });
  });

  document.querySelectorAll(".section-head, .quote-banner, .delivery__terms, .map, .order__copy, .form, .tabs, .hero__districts").forEach((el) => {
    el.setAttribute("data-animate", "");
  });
  document.querySelector(".why__photo")?.setAttribute("data-animate", "left");
  document.querySelector(".why__copy")?.setAttribute("data-animate", "right");
  extraCards.forEach((el) => el.setAttribute("data-animate", ""));

  const reveal = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-in");
      reveal.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
  document.querySelectorAll("[data-animate]").forEach((el) => reveal.observe(el));

  const heroImg = document.querySelector(".hero__photo img");
  if (heroImg) {
    window.addEventListener("scroll", () => {
      heroImg.style.setProperty("--pan", `${Math.min(window.scrollY, 420) * 0.08}px`);
    }, { passive: true });
  }
} else {
  document.querySelectorAll("[data-animate]").forEach((el) => el.classList.add("is-in"));
}
