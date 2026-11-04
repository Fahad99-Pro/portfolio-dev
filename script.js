/* ==========================================================================
   Fahmid Islam Fahad — Creative Freelance Portfolio · script.js
   Vanilla JS: scroll progress, nav, reveals, filters, case-study modal,
   counters, copy email, form handling.
   ========================================================================== */

/* Email assembled from parts at runtime → never appears as a plain
   address in any file's source. Stops "[email protected]" obfuscation
   (Cloudflare etc.) and makes scraper harvesting harder. */
const EMAIL_PARTS = ["iam.fahmidislamfahad", "gmail", "com"];
function getEmail() {
  return EMAIL_PARTS[0] + "@" + EMAIL_PARTS[1] + "." + EMAIL_PARTS[2];
}

/* Before/After slider — clip-path + range input (keyboard-accessible) */
function initBaSlider(root) {
  root.querySelectorAll(".ba-slider").forEach((slider) => {
    const range = slider.querySelector(".ba-range");
    if (!range) return;
    const update = () => slider.style.setProperty("--pos", range.value + "%");
    range.addEventListener("input", update);
    update();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  /* ------------------------------------------------------------------
   * 1. Scroll progress bar + sticky header state
   * ---------------------------------------------------------------- */
  const progressBar = document.getElementById("progressBar");
  const header = document.getElementById("siteHeader");

  const onScroll = () => {
    const scrollTop = window.scrollY;
    const docHeight =
      document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? scrollTop / docHeight : 0;
    if (progressBar) progressBar.style.transform = `scaleX(${progress})`;
    if (header) header.classList.toggle("scrolled", scrollTop > 40);
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ------------------------------------------------------------------
   * 2. Mobile navigation
   * ---------------------------------------------------------------- */
  const navToggle = document.getElementById("navToggle");
  const navMobile = document.getElementById("navMobile");

  const closeMobileNav = () => {
    if (!navToggle || !navMobile) return;
    navToggle.setAttribute("aria-expanded", "false");
    navMobile.classList.remove("open");
    document.body.style.overflow = "";
  };

  if (navToggle && navMobile) {
    navToggle.addEventListener("click", () => {
      const open = navToggle.getAttribute("aria-expanded") === "true";
      navToggle.setAttribute("aria-expanded", String(!open));
      navMobile.classList.toggle("open", !open);
      document.body.style.overflow = open ? "" : "hidden";
    });

    navMobile.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMobileNav);
    });
  }

  /* ------------------------------------------------------------------
   * 3. Scroll-reveal (IntersectionObserver)
   * ---------------------------------------------------------------- */
  const revealEls = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window && !prefersReducedMotion) {
    const revealObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach((el) => revealObserver.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("visible"));
  }

  /* ------------------------------------------------------------------
   * 4. Animated stat counters
   * ---------------------------------------------------------------- */
  const animateCounter = (el) => {
    const target = parseInt(el.dataset.count, 10);
    const suffix = el.dataset.suffix || "";
    const duration = 1400;
    const startTime = performance.now();

    const tick = (now) => {
      const p = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3); // ease-out cubic
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) {
        requestAnimationFrame(tick);
      } else {
        el.classList.add("count-done");
      }
    };

    if (prefersReducedMotion) {
      el.textContent = target + suffix;
    } else {
      requestAnimationFrame(tick);
    }
  };

  const counterEls = document.querySelectorAll("[data-count]");
  if ("IntersectionObserver" in window) {
    const counterObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    counterEls.forEach((el) => counterObserver.observe(el));
  } else {
    counterEls.forEach(animateCounter);
  }

  /* ------------------------------------------------------------------
   * 5. Work filters
   * ---------------------------------------------------------------- */
  const filterBtns = document.querySelectorAll(".filter-btn");
  const projectCards = document.querySelectorAll(".project-card");

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const filter = btn.dataset.filter;

      projectCards.forEach((card) => {
        const match =
          filter === "all" || card.dataset.category === filter;
        card.classList.toggle("hidden", !match);
      });
    });
  });

  /* ------------------------------------------------------------------
   * 6. Case-study modal
   * ---------------------------------------------------------------- */
  const modalOverlay = document.getElementById("modalOverlay");
  const modalContent = document.getElementById("modalContent");
  const modalClose = document.getElementById("modalClose");
  let lastFocusedEl = null;

  const openModal = (projectId, updateHash = true) => {
    const project = PROJECTS.find((p) => p.id === projectId);
    if (!project || !modalOverlay || !modalContent) return;

    lastFocusedEl = document.activeElement;
    modalContent.innerHTML = buildModalHTML(project);
    initBaSlider(modalContent);
    modalOverlay.classList.add("open");
    document.body.style.overflow = "hidden";
    if (modalClose) modalClose.focus();

    /* Shareable deep link: #project/<id> */
    if (updateHash && location.hash !== "#project/" + projectId) {
      history.pushState(null, "", "#project/" + projectId);
    }
  };

  const closeModal = () => {
    if (!modalOverlay || !modalOverlay.classList.contains("open")) return;
    modalOverlay.classList.remove("open");
    document.body.style.overflow = "";
    if (lastFocusedEl) lastFocusedEl.focus();
    if (location.hash.startsWith("#project/")) {
      history.replaceState(null, "", location.pathname + location.search);
    }
  };

  /* Delegated close links inside the modal (no inline JS) */
  if (modalContent) {
    modalContent.addEventListener("click", (e) => {
      if (e.target.closest(".js-close-modal")) closeModal();
    });
  }

  /* Deep links: open on load + respond to back/forward or manual URL edits */
  window.addEventListener("hashchange", () => {
    const match = location.hash.match(/^#project\/([\w-]+)$/);
    if (match) {
      if (!modalOverlay.classList.contains("open")) openModal(match[1], false);
    } else {
      closeModal();
    }
  });
  const initialMatch = location.hash.match(/^#project\/([\w-]+)$/);
  if (initialMatch) openModal(initialMatch[1], false);

  projectCards.forEach((card) => {
    card.addEventListener("click", () => openModal(card.dataset.project));
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openModal(card.dataset.project);
      }
    });
  });

  if (modalClose) modalClose.addEventListener("click", closeModal);

  if (modalOverlay) {
    modalOverlay.addEventListener("click", (e) => {
      if (e.target === modalOverlay) closeModal();
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeModal();
      closeMobileNav();
      return;
    }
    if (
      e.key === "Tab" &&
      modalOverlay &&
      modalOverlay.classList.contains("open")
    ) {
      const focusables = modalOverlay.querySelectorAll(
        'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  /* ------------------------------------------------------------------
   * 7. Email: render address via JS + copy button
   * ---------------------------------------------------------------- */
  const emailAddress = getEmail();
  document.querySelectorAll(".js-mail").forEach((el) => {
    el.textContent = emailAddress;
    el.href = "mailto:" + emailAddress;
  });

  const copyBtn = document.getElementById("copyEmail");
  if (copyBtn) {
    copyBtn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(emailAddress);
        const original = copyBtn.textContent;
        copyBtn.textContent = "Copied ✓";
        setTimeout(() => (copyBtn.textContent = original), 1800);
      } catch {
        window.location.href = "mailto:" + emailAddress;
      }
    });
  }

  /* ------------------------------------------------------------------
   * 8. Contact form → functional mailto composer (no backend needed)
   * ---------------------------------------------------------------- */
  const contactForm = document.getElementById("contactForm");
  const formSuccess = document.getElementById("formSuccess");

  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = new FormData(contactForm);
      const name = (data.get("name") || "").toString().trim();
      const replyTo = (data.get("email") || "").toString().trim();
      const type = (data.get("type") || "").toString();
      const budget = (data.get("budget") || "").toString();
      const message = (data.get("message") || "").toString().trim();

      const subject = "Project enquiry — " + type + " — " + name;
      const body = [
        "Hi Fahmid,",
        "",
        message,
        "",
        "————————————",
        "Name: " + name,
        "Reply to: " + replyTo,
        "Project type: " + type,
        "Budget: " + budget,
        "",
        "Sent from your portfolio contact form",
      ].join("\n");

      window.location.href =
        "mailto:" +
        getEmail() +
        "?subject=" +
        encodeURIComponent(subject) +
        "&body=" +
        encodeURIComponent(body);

      if (formSuccess) {
        formSuccess.classList.add("show");
        formSuccess.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
      /* Form keeps its content in case the mail app didn't open. */
    });
  }

  /* ------------------------------------------------------------------
   * 9. Footer year
   * ---------------------------------------------------------------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ------------------------------------------------------------------
   * 10. Magnetic buttons (subtle, motion-safe)
   * ---------------------------------------------------------------- */
  if (!prefersReducedMotion && window.matchMedia("(pointer: fine)").matches) {
    document.querySelectorAll(".btn").forEach((btn) => {
      btn.addEventListener("mousemove", (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.15}px, ${y * 0.25}px)`;
      });
      btn.addEventListener("mouseleave", () => {
        btn.style.transform = "";
      });
    });
  }

  /* ------------------------------------------------------------------
   * 13. Dynamic "available" month label (auto-updates over time)
   * ---------------------------------------------------------------- */
  const availDate = document.getElementById("availDate");
  if (availDate) {
    availDate.textContent = new Date().toLocaleString("en-US", {
      month: "long",
      year: "numeric",
    });
  }
});

/* ==================================================================
 * CASE-STUDY DATA
 * Replace names, metrics and stories with your real work.
 * ================================================================= */
// Case-study data. Optional: add video: "https://youtu.be/…" (or a Loom URL)
// to any project and a "Watch the walkthrough" button appears in its case study.
const PROJECTS = [
  {
    id: "ironpulse",
    title: "Iron Pulse Gym",
    tagline: "A gym site that turns trial visits into loyal members",
    category: "Gym & Fitness",
    year: "2026",
    role: "Solo project: strategy, UX/UI design, custom front-end build, and the member-signup flow. Photography directed on location at the gym.",
    summary:
      "Iron Pulse had the best coaches in town but a website that felt like every other gym template. We rebuilt it around what members actually want: schedules, prices and proof \u2014 all one thumb-scroll away.",
    challenge:
      "The old site hid the class schedule behind three clicks, listed no prices, and couldn't take a trial booking. Most new members arrived by walking past the door \u2014 the website was closing zero deals.",
    process: [
      "Mapped the member journey \u2014 walk-in curiosity → trial session → membership \u2014 and designed each page around the next step",
      "Art direction: bold type, real coaching photography, and a dark, energetic visual system",
      "Custom build with live class timetable, trainer profiles and a 2-tap trial booking",
      "Local SEO for 'gym near me' queries + a Google-review feed for instant social proof",
    ],
    results: [
      { metric: "+58%", label: "trial sign-ups in 90 days" },
      { metric: "2.1k", label: "monthly local searches" },
      { metric: "-37%", label: "first-week no-shows" },
    ],
    quote:
      "The site does what my best trainers do \u2014 it sells the first session. Trial bookings doubled and I didn't touch a thing. Worth every taka.",
    quoteBy: "Ryan Mercer, Owner of Iron Pulse Gym",
    className: "art-ironpulse",
    monogram: "IP",
  },
  {
    id: "saffron",
    title: "The Saffron Table",
    tagline: "A restaurant brand and reservations site that fills tables",
    category: "Restaurant",
    year: "2025",
    role: "Solo project: brand identity, website design, custom build, online menu and reservation system. Food photography by the owner; I directed the shots.",
    summary:
      "A family-run dining room famous for its weekend brunch \u2014 but invisible online. We turned the website into their ma\u00eetre d': appetite-first, reservation-ready, always open.",
    challenge:
      "The restaurant relied on phone bookings and a social page that scrolled away. Walk-ins dipped on weeknights, and the old one-page site couldn't show the menu, the mood, or take a reservation after closing time.",
    process: [
      "Brand sprint: name story, a warm spice palette, and a signature light motif",
      "Designed an appetite-first layout \u2014 big imagery, short copy, a menu readable in seconds",
      "Custom build with embedded reservations, an events calendar and bilingual menu management",
      "Structured data + local SEO so the restaurant shows up in 'near me' dinner searches",
    ],
    results: [
      { metric: "+65%", label: "online reservations" },
      { metric: "2.3k", label: "monthly site visits" },
      { metric: "#1", label: "local search ranking" },
    ],
    quote:
      "Guests now book tables at midnight straight from the site. Fahmid captured the warmth of our dining room perfectly \u2014 and weeknights are full again.",
    quoteBy: "Priya Sharma, Owner of The Saffron Table",
    className: "art-saffron",
    monogram: "ST",
  },
  {
    id: "coralbay",
    title: "Coral Bay Resort",
    tagline: "A resort site that lifts direct bookings and fills suites",
    category: "Hotel",
    year: "2026",
    role: "Solo project: content strategy, visual design, custom booking experience and speed optimisation. Worked directly with the general manager and head of guest relations.",
    summary:
      "A boutique beachfront resort losing bookings to third-party platforms. The new site sells the stay itself \u2014 sunrise to checkout \u2014 and keeps the commission in-house.",
    challenge:
      "The old site loaded slowly on mobile \u2014 exactly where 7 in 10 guests browse \u2014 and funneled every booking to an OTA. The resort needed a direct-booking site that felt like the destination.",
    process: [
      "Content strategy around the guest journey: dream → compare rooms → book → anticipate the stay",
      "Designed a full-bleed, photography-led experience with a room comparison that answers real questions",
      "Custom booking flow with date availability, rate tiers and add-on experiences (spa, dives, transfers)",
      "Speed rebuild: responsive imagery, lazy loading and a 1.6s mobile load target",
    ],
    results: [
      { metric: "+72%", label: "direct bookings" },
      { metric: "-31%", label: "OTA commission paid" },
      { metric: "1.6s", label: "mobile load time" },
    ],
    quote:
      "For the first time, guests arrive already in love with the place. The site books suites while we sleep \u2014 and it looks like us, not like a template.",
    quoteBy: "Daniel Reyes, General Manager of Coral Bay Resort",
    className: "art-coralbay",
    monogram: "CB",
  },
  {
    id: "novacart",
    title: "NovaCart",
    tagline: "An online store built to convert on every screen",
    category: "E-commerce",
    year: "2026",
    role: "Sole designer & developer. Store architecture, UX/UI design, custom e-commerce development, and checkout optimisation for the founding team.",
    summary:
      "NovaCart's gadgets had a fanbase \u2014 but the store leaked sales at every step. We rebuilt the shopping experience around speed, trust and a checkout that takes two taps on a phone.",
    challenge:
      "The previous store loaded slowly, buried products behind confusing navigation, and lost 7 in 10 mobile shoppers before checkout. The founders needed the site to work like a full-time salesperson.",
    process: [
      "Discovery sprint \u2014 mapped customers, goals and the five best-selling product families",
      "Wireframed a shop organised by use-case, not just category, with comparison built in",
      "Art-directed product imagery and built a crisp, high-contrast visual system",
      "Custom storefront with modular sections, speed optimisation and a 2-tap mobile checkout",
    ],
    results: [
      { metric: "+51%", label: "online sales in 3 months" },
      { metric: "-38%", label: "checkout abandonment" },
      { metric: "1.2s", label: "mobile load time" },
    ],
    quote:
      "Fahmid didn't just redesign the store \u2014 he understood the business behind it. Online orders now outpace every channel we've ever tried.",
    quoteBy: "Tanvir Ahmed, Co-founder of NovaCart",
    className: "art-novacart",
    monogram: "NC",
  },
  {
    id: "brightpath",
    title: "BrightPath Academy",
    tagline: "A coaching center site that turns enquiries into enrolments",
    category: "Coaching Center",
    year: "2025",
    role: "Solo project: content structure, visual design, custom build, and an admissions enquiry system. Worked directly with the academic director.",
    summary:
      "BrightPath's tutors got results parents raved about \u2014 but the website couldn't explain a single course. We built an enrolment engine that answers every parent question before they call.",
    challenge:
      "Parents landed on a cluttered page with no class times, no fees and no way to enquire outside office hours. The center was losing admissions to competitors with clearer sites.",
    process: [
      "Interviewed parents and tutors \u2014 mapped the real enrolment questions, in order",
      "Designed a course-first structure: programmes, schedules, fees and tutor credentials at a glance",
      "Custom build with an admissions enquiry form, success-story wall and a class-timetable view",
      "Local SEO for tuition and coaching searches, plus structured data for courses",
    ],
    results: [
      { metric: "+83%", label: "enrolment enquiries" },
      { metric: "3\u00d7", label: "demo-class bookings" },
      { metric: "#1", label: "local search ranking" },
    ],
    quote:
      "Parents tell us the website answered everything before they even called. Enrolments tripled this term \u2014 the site finally works as hard as our tutors.",
    quoteBy: "Dr. Amina Rahman, Director of BrightPath Academy",
    className: "art-brightpath",
    monogram: "BP",
  },
];

/* Build modal HTML from a project object */
function buildModalHTML(p) {
  return `
    <div class="modal-hero ${p.className}">
      <div class="mh-title" id="modalTitle">${p.title}</div>
    </div>
    <div class="modal-body">
      <div class="modal-meta">
        <span class="chip">${p.category}</span>
        <span class="chip">${p.year}</span>
        <span class="chip">Case study</span>
        <span class="chip chip-concept">Concept project</span>
      </div>

      <p class="modal-summary">${p.summary}</p>

      <div class="modal-section">
        <h3>Before &amp; after</h3>
        <div class="ba-wrap">
          <div class="ba-slider">
            <div class="ba-layer ba-after ${p.className}">
              <div class="art-device">
                <div class="ad-bar"></div>
                <div class="ad-hero ${p.className}">${p.title}</div>
                <div class="ad-lines"><i></i><i></i><i></i></div>
              </div>
              <span class="ba-label ba-label-after">After</span>
            </div>
            <div class="ba-layer ba-before">
              <div class="ba-old">
                <div class="ba-old-header">~ Welcome to my website ~</div>
                <div class="ba-old-rows"><i></i><i></i><i></i><i></i></div>
                <div class="ba-old-btn">Click here</div>
              </div>
              <span class="ba-label ba-label-before">Before</span>
            </div>
            <div class="ba-handle" aria-hidden="true"><span>⟷</span></div>
            <input
              class="ba-range"
              type="range"
              min="0"
              max="100"
              value="50"
              aria-label="Drag to compare before and after"
            />
          </div>
          <p class="ba-caption">
            Drag the handle — this is the kind of transformation I design for.
          </p>
        </div>
      </div>

      <div class="modal-section">
        <h3>The challenge</h3>
        <p>${p.challenge}</p>
      </div>

      <div class="modal-section">
        <h3>How I worked</h3>
        <ul class="process-list">
          ${p.process
            .map(
              (step, i) => `
            <li>
              <span class="pl-num">0${i + 1}</span>
              <span>${step}</span>
            </li>`
            )
            .join("")}
        </ul>
      </div>

      <div class="modal-section">
        <h3>Results</h3>
        <div class="result-grid">
          ${p.results
            .map(
              (r) => `
            <div class="result-card">
              <b>${r.metric}</b>
              <span>${r.label}</span>
            </div>`
            )
            .join("")}
        </div>
      </div>

      <div class="modal-section">
        <h3>My role (exactly what I did)</h3>
        <div class="role-box"><strong>Honest scope:</strong> ${p.role}</div>
      </div>

      <div class="modal-section">
        <div class="modal-quote">
          “${p.quote}”
          <br><small style="font-style:normal;font-family:var(--font-body);color:var(--muted);font-size:0.88rem;">— ${p.quoteBy}</small>
        </div>
      </div>

      <div class="modal-actions">
        ${
          project.video
            ? `<a class="btn btn-ink" href="${project.video}" target="_blank" rel="noopener">
          Watch the walkthrough
          <span class="btn-arrow">→</span>
        </a>`
            : ""
        }
        <a class="btn btn-coral js-close-modal" href="#contact">
          Book a free 20-minute call
          <span class="btn-arrow">→</span>
        </a>
        <a class="btn btn-ink js-close-modal" href="#work">
          Back to all work
        </a>
      </div>
    </div>
  `;
}


/* ==================================================================
 * 14. MOTION LAYER — cursor follower, card tilt, parallax,
 *     back-to-top, header hide-on-scroll
 * ================================================================= */
(function motionLayer() {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = window.matchMedia("(pointer: fine)").matches;

  /* Cursor follower */
  const dot = document.getElementById("cursorDot");
  const ring = document.getElementById("cursorRing");
  if (dot && ring && fine && !reduced) {
    let mx = -100, my = -100, rx = -100, ry = -100, active = false;
    document.addEventListener("mousemove", (e) => {
      mx = e.clientX;
      my = e.clientY;
      if (!active) {
        document.body.classList.add("cursor-on");
        active = true;
      }
      dot.style.transform = `translate(${mx}px, ${my}px)`;
    });
    const loop = () => {
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      ring.style.transform = `translate(${rx}px, ${ry}px)`;
      requestAnimationFrame(loop);
    };
    loop();
    document
      .querySelectorAll("a, button, summary, .project-card, input, textarea, select, .skill, .testimonial")
      .forEach((el) => {
        el.addEventListener("mouseenter", () => ring.classList.add("grow"));
        el.addEventListener("mouseleave", () => ring.classList.remove("grow"));
      });
  }

  /* 3D tilt on project cards */
  if (fine && !reduced) {
    document.querySelectorAll(".project-card").forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transition = "transform 0.18s ease-out";
        card.style.transform =
          `perspective(900px) rotateX(${(-py * 8).toFixed(2)}deg) ` +
          `rotateY(${(px * 10).toFixed(2)}deg) translateY(-8px)`;
      });
      card.addEventListener("mouseleave", () => {
        card.style.transition = "transform 0.6s ease-out";
        card.style.transform = "";
      });
    });
  }

  /* Back to top */
  const toTop = document.getElementById("toTop");
  if (toTop) {
    const toggle = () => toTop.classList.toggle("show", window.scrollY > 700);
    window.addEventListener("scroll", toggle, { passive: true });
    toggle();
    toTop.addEventListener("click", () =>
      window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" })
    );
  }

  /* Header hides scrolling down, returns scrolling up */
  const header = document.getElementById("siteHeader");
  if (header) {
    let lastY = window.scrollY;
    window.addEventListener(
      "scroll",
      () => {
        const y = window.scrollY;
        if (y > 150 && y > lastY + 4) header.classList.add("header-hidden");
        else if (y < lastY - 4 || y <= 150) header.classList.remove("header-hidden");
        lastY = y;
      },
      { passive: true }
    );
  }

  /* Parallax via the `translate` property — never fights transform animations */
  const parEls = document.querySelectorAll("[data-parallax]");
  if (parEls.length && !reduced) {
    let ticking = false;
    const apply = () => {
      parEls.forEach((el) => {
        const speed = parseFloat(el.dataset.parallax) || 0.05;
        const rect = el.getBoundingClientRect();
        const offset =
          (rect.top + rect.height / 2 - window.innerHeight / 2) * -speed;
        el.style.setProperty("--par-y", `${offset.toFixed(1)}px`);
      });
      ticking = false;
    };
    window.addEventListener(
      "scroll",
      () => {
        if (!ticking) {
          ticking = true;
          requestAnimationFrame(apply);
        }
      },
      { passive: true }
    );
    apply();
  }
})();


/* ==================================================================
 * 15. MOTION WAVE 2 — intro cleanup, split-text titles,
 *     cursor spotlight, confetti bursts
 * ================================================================= */
(function motionWave2() {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Intro: skip on click + remove after it lifts */
  const intro = document.getElementById("intro");
  if (intro) {
    intro.addEventListener("click", () => intro.remove());
    setTimeout(() => intro.remove(), 2400);
  }

  /* Split section titles into rising words */
  document.querySelectorAll(".section-title").forEach((title) => {
    const parts = Array.from(title.childNodes);
    title.textContent = "";
    let idx = 0;
    const addWord = (content, tag) => {
      const wrap = document.createElement("span");
      wrap.className = "w";
      const inner = document.createElement("i");
      inner.style.setProperty("--d", (idx * 0.07).toFixed(2) + "s");
      if (tag) {
        const el = document.createElement(tag);
        el.textContent = content;
        inner.appendChild(el);
      } else {
        inner.textContent = content;
      }
      wrap.appendChild(inner);
      title.appendChild(wrap);
      title.appendChild(document.createTextNode(" "));
      idx += 1;
    };
    parts.forEach((n) => {
      if (n.nodeType === Node.TEXT_NODE) {
        n.textContent
          .trim()
          .split(/\s+/)
          .filter(Boolean)
          .forEach((t) => addWord(t));
      } else if (n.nodeName === "BR") {
        title.appendChild(n);
      } else {
        addWord(n.textContent, n.nodeName.toLowerCase());
      }
    });
  });

  /* Cursor spotlight on dark surfaces */
  if (!reduced) {
    document.querySelectorAll(".hero, #contact").forEach((zone) => {
      zone.addEventListener("mousemove", (e) => {
        const r = zone.getBoundingClientRect();
        zone.style.setProperty("--mx", e.clientX - r.left + "px");
        zone.style.setProperty("--my", e.clientY - r.top + "px");
      });
    });
  }

  /* Confetti bursts — hero name + copy button */
  const burst = (x, y) => {
    if (reduced) return;
    const colors = ["#ff4d2e", "#c8ff3d", "#2e4cff", "#f4f1ea", "#141419"];
    for (let i = 0; i < 26; i += 1) {
      const bit = document.createElement("div");
      bit.className = "confetti-bit";
      const size = 6 + Math.random() * 8;
      bit.style.cssText =
        `left:${x}px;top:${y}px;background:${colors[i % colors.length]};` +
        `width:${size}px;height:${size * (0.5 + Math.random())}px;`;
      document.body.appendChild(bit);
      const ang = Math.random() * Math.PI * 2;
      const dist = 60 + Math.random() * 170;
      const anim = bit.animate(
        [
          { transform: "translate(0,0) rotate(0deg)", opacity: 1 },
          {
            transform:
              `translate(${Math.cos(ang) * dist}px,` +
              `${Math.sin(ang) * dist + 130}px) rotate(${Math.random() * 680 - 340}deg)`,
            opacity: 0,
          },
        ],
        {
          duration: 850 + Math.random() * 650,
          easing: "cubic-bezier(.2,.65,.3,1)",
        }
      );
      anim.onfinish = () => bit.remove();
    }
  };
  const heroName = document.querySelector(".hero-name");
  if (heroName) {
    heroName.style.cursor = "pointer";
    heroName.title = "Click me";
    heroName.addEventListener("click", (e) => burst(e.clientX, e.clientY));
  }
  const copyBtn = document.querySelector(".copy-btn");
  if (copyBtn) {
    copyBtn.addEventListener("click", () => {
      const r = copyBtn.getBoundingClientRect();
      burst(r.left + r.width / 2, r.top + r.height / 2);
    });
  }
})();
