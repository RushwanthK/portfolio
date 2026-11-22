(() => {
  "use strict";
  const root = document.documentElement;
  root.classList.add("js");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(pointer: fine)").matches;

  /* ---------- Reveal on scroll ---------- */
  // Hero animates in immediately; everything else reveals on scroll.
  setTimeout(() => document.querySelectorAll(".hero .reveal").forEach((el) => el.classList.add("in")), 30);
  const revealEls = document.querySelectorAll(".reveal:not(.hero .reveal)");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("in"));
  }

  /* ---------- Nav: scrolled state + active section ---------- */
  const nav = document.getElementById("nav");
  const onScroll = () => {
    const y = window.scrollY;
    nav.classList.toggle("is-scrolled", y > 24);
    document.body.classList.toggle("scrolled", y > window.innerHeight * 0.6);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  const links = [...document.querySelectorAll(".nav-links a")];
  const sections = links.map((a) => document.querySelector(a.getAttribute("href"))).filter(Boolean);
  if ("IntersectionObserver" in window) {
    const so = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        links.forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === "#" + e.target.id));
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach((s) => so.observe(s));
  }

  /* ---------- Mobile menu ---------- */
  const menuBtn = document.getElementById("menuBtn");
  const navLinks = document.getElementById("navLinks");
  const setMenu = (open) => {
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    navLinks.classList.toggle("open", open);
  };
  menuBtn.addEventListener("click", () => setMenu(menuBtn.getAttribute("aria-expanded") !== "true"));
  navLinks.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });

  /* ---------- Rotating headline word ---------- */
  const words = [...document.querySelectorAll(".rot-word")];
  if (words.length > 1) {
    if (!reduceMotion) {
      let i = 0;
      setInterval(() => {
        const cur = words[i];
        i = (i + 1) % words.length;
        const next = words[i];
        cur.classList.remove("is-active");
        cur.classList.add("is-leaving");
        next.classList.remove("is-leaving");
        next.classList.add("is-active");
        setTimeout(() => cur.classList.remove("is-leaving"), 750);
      }, 2600);
    }
  }

  /* ---------- Pointer effects: spotlight cards, cursor glow, magnetic buttons ---------- */
  if (finePointer && !reduceMotion) {
    const glow = document.querySelector(".cursor-glow");
    let gx = 0, gy = 0, tx = 0, ty = 0, raf = null;
    const tick = () => {
      gx += (tx - gx) * 0.12; gy += (ty - gy) * 0.12;
      glow.style.transform = `translate(${gx - 260}px, ${gy - 260}px)`;
      raf = Math.abs(tx - gx) + Math.abs(ty - gy) > 0.5 ? requestAnimationFrame(tick) : null;
    };
    window.addEventListener("pointermove", (e) => {
      document.body.classList.add("has-pointer");
      tx = e.clientX; ty = e.clientY;
      if (!raf) raf = requestAnimationFrame(tick);
    }, { passive: true });
    glow.style.left = "0"; glow.style.top = "0";

    document.querySelectorAll(".spotlight").forEach((card) => {
      card.addEventListener("pointermove", (e) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty("--mx", `${e.clientX - r.left}px`);
        card.style.setProperty("--my", `${e.clientY - r.top}px`);
      });
    });

    const tilt = document.getElementById("tilt");
    const hero = document.querySelector(".hero");
    if (tilt && hero) {
      hero.addEventListener("pointermove", (e) => {
        const r = tilt.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width / 2)) / window.innerWidth;
        const dy = (e.clientY - (r.top + r.height / 2)) / window.innerHeight;
        tilt.style.transform = `rotateY(${-8 + dx * 14}deg) rotateX(${4 - dy * 10}deg)`;
      });
      hero.addEventListener("pointerleave", () => { tilt.style.transform = ""; });
    }

    document.querySelectorAll(".magnetic").forEach((btn) => {
      btn.addEventListener("pointermove", (e) => {
        const r = btn.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * 0.18;
        const y = (e.clientY - r.top - r.height / 2) * 0.28;
        btn.style.transform = `translate(${x}px, ${y}px)`;
      });
      btn.addEventListener("pointerleave", () => { btn.style.transform = ""; });
    });
  }

  /* ---------- Copy email ---------- */
  const copyBtn = document.getElementById("copyEmail");
  const hint = document.getElementById("copyHint");
  if (copyBtn) {
    copyBtn.addEventListener("click", async () => {
      const email = copyBtn.dataset.email;
      try {
        await navigator.clipboard.writeText(email);
        copyBtn.classList.add("copied");
        hint.textContent = "copied to clipboard ✓";
        setTimeout(() => { copyBtn.classList.remove("copied"); hint.textContent = "click to copy"; }, 2200);
      } catch {
        window.location.href = "mailto:" + email;
      }
    });
  }
})();
