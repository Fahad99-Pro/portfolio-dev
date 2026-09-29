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
      if (p < 1) requestAnimationFrame(tick);
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

  const openModal = (projectId) => {
    const project = PROJECTS.find((p) => p.id === projectId);
    if (!project || !modalOverlay || !modalContent) return;

    lastFocusedEl = document.activeElement;
    modalContent.innerHTML = buildModalHTML(project);
    modalOverlay.classList.add("open");
    document.body.style.overflow = "hidden";
    if (modalClose) modalClose.focus();
  };

  const closeModal = () => {
    if (!modalOverlay) return;
    modalOverlay.classList.remove("open");
    document.body.style.overflow = "";
    if (lastFocusedEl) lastFocusedEl.focus();
  };

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
});

/* ==================================================================
 * CASE-STUDY DATA
 * Replace names, metrics and stories with your real work.
 * ================================================================= */
const PROJECTS = [
  {
    id: "verdant",
    title: "Verdant Roots",
    tagline: "An organic plant shop that grew 42% in online sales",
    category: "E-commerce",
    year: "2026",
    role: "Sole designer & developer. Brand refresh, UX/UI design, Shopify development, and product photography direction — for the founder of a small organic nursery.",
    summary:
      "Verdant Roots came to me with a beautiful product and a clunky website. Together we rebuilt the store from the ground up: clearer storytelling, faster shopping, and a checkout that finally converts on mobile.",
    challenge:
      "The old site loaded slowly, buried the plants behind confusing navigation, and lost 7 in 10 mobile shoppers before checkout. The founder needed the site to do the work of a full-time salesperson on a small-business budget.",
    process: [
      "Discovery workshop with the founder — mapped customers, goals and the 3 best-selling plant families",
      "Low-fidelity wireframes → a shop structure organised by plant care level, not just category",
      "Art-directed product photography and built a fresh visual system (green, earthy, editorial)",
      "Shopify build with custom sections, speed optimisation, and a 2-tap mobile checkout",
    ],
    results: [
      { metric: "+42%", label: "online sales in 3 months" },
      { metric: "-38%", label: "checkout abandonment" },
      { metric: "1.4s", label: "mobile load time" },
    ],
    quote:
      "Fahmid didn't just redesign the site — he understood my little nursery. My online orders now outpace my market stall.",
    quoteBy: "Nusrat Jahan, Founder of Verdant Roots",
    className: "art-verdant",
    monogram: "VR",
  },
  {
    id: "cafe",
    title: "Café Lumière",
    tagline: "A cosy bistro brand and reservations site that fills tables",
    category: "Hospitality",
    year: "2025",
    role: "Solo project: brand identity, full website design, Webflow build, and an online menu system. Food photography by the owner; I directed the shots.",
    summary:
      "A neighbourhood bistro that wanted to feel as warm online as it does in person — and turn Instagram scrollers into booked tables.",
    challenge:
      "Café Lumière relied entirely on walk-ins and phone bookings. Their previous one-page site couldn't show the menu, the atmosphere, or take reservations during busy service.",
    process: [
      "Brand sprint: name story, warm palette, and a hand-drawn light motif",
      "Designed an appetite-first layout — big imagery, short copy, menu that's readable in seconds",
      "Built in Webflow with embedded reservations, events calendar, and bilingual menu management",
      "Added structured data + local SEO so the café shows up in 'near me' searches",
    ],
    results: [
      { metric: "+65%", label: "online reservations" },
      { metric: "2.3k", label: "monthly site visits" },
      { metric: "#1", label: "local search ranking" },
    ],
    quote:
      "Guests now quote our website when they walk in. Fahmid made us look like the place we always wanted to be.",
    quoteBy: "Marc Delacroix, Owner of Café Lumière",
    className: "art-cafe",
    monogram: "CL",
  },
  {
    id: "peakform",
    title: "PeakForm Studio",
    tagline: "A coaching platform that books clients while the coach sleeps",
    category: "Health & Fitness",
    year: "2025",
    role: "UX/UI design and frontend development. The client's small dev team built the backend booking engine — I designed and built everything the customer sees, and handed off a documented component library.",
    summary:
      "A strength coach with a growing following needed one place to sell programs, take bookings, and prove his method works.",
    challenge:
      "Bookings lived in DMs, programs were sold through spreadsheets, and the brand looked inconsistent across five different tools. The coach needed a system, not just a site.",
    process: [
      "Mapped the client journey from Instagram post → booked intro call",
      "Designed a bold, high-energy interface that matches the coach's style",
      "Built the marketing frontend and a reusable component library in React",
      "Integrated the team's booking engine and automated the follow-up emails",
    ],
    results: [
      { metric: "+120%", label: "consultation bookings" },
      { metric: "8 hrs", label: "admin saved weekly" },
      { metric: "94%", label: "mobile satisfaction" },
    ],
    quote:
      "The site sells my coaching while I'm on the gym floor. Best investment I've made in the business.",
    quoteBy: "Danny Okafor, Head Coach at PeakForm",
    className: "art-peak",
    monogram: "PF",
  },
  {
    id: "nimbus",
    title: "Nimbus Ledger",
    tagline: "A fintech landing page that made a complex product feel simple",
    category: "Tech & SaaS",
    year: "2026",
    role: "Landing page design and build for a small SaaS team. I also contributed to their design system; the dashboard UI itself was designed by their in-house designer — full credit there.",
    summary:
      "A young fintech startup with a powerful invoicing tool — and a landing page nobody understood. We rebuilt the story around one question: what does this do for my business?",
    challenge:
      "The original page led with features instead of outcomes. Bounce rates were high, and trial signups from paid ads weren't paying back.",
    process: [
      "Interviewed 6 real users to find the words they actually use for their pain",
      "Rewrote the narrative: outcome-first headline, proof-driven sections, honest pricing",
      "Designed and built the page with scroll-triggered product demos and clean diagrams",
      "A/B tested hero variants — the winner lifted trials by 31%",
    ],
    results: [
      { metric: "+31%", label: "trial signups" },
      { metric: "-22%", label: "bounce rate" },
      { metric: "2×", label: "ad conversion" },
    ],
    quote:
      "Fahmid asked better questions than our whole team did. The page finally sounds like us — and sells like we hoped.",
    quoteBy: "Priya Menon, Co-founder of Nimbus Ledger",
    className: "art-nimbus",
    monogram: "NL",
  },
  {
    id: "wanderlight",
    title: "Wanderlight Travel",
    tagline: "A boutique travel agency site that inspires the trip first",
    category: "Travel & Lifestyle",
    year: "2024",
    role: "Solo freelancer on this one: strategy, content structure, visual design, WordPress development, and SEO setup — direct with the agency owners.",
    summary:
      "A small tour operator with incredible itineraries and a website that looked like a 2010 brochure. We turned it into a destination-discovery experience.",
    challenge:
      "Travel is an emotional purchase. The old site led with prices and forms — it never made anyone *feel* the journey, and it ranked for nothing beyond the brand name.",
    process: [
      "Photographed-feel art direction using their real trip photography",
      "Designed destination-first pages that tell each trip as a story",
      "Built a custom WordPress theme the owners can update without touching code",
      "SEO foundations: destination guides, structured data, and internal linking",
    ],
    results: [
      { metric: "+58%", label: "enquiry form fills" },
      { metric: "3.2×", label: "organic traffic in 8 months" },
      { metric: "0", label: "developer calls needed" },
    ],
    quote:
      "Our clients tell us they booked because of the website. That never happened before Fahmid.",
    quoteBy: "Ayesha & Tanvir, Owners of Wanderlight Travel",
    className: "art-wander",
    monogram: "WT",
  },
  {
    id: "kintsugi",
    title: "Kintsugi Ceramics",
    tagline: "An artisan pottery shop where every piece tells its story",
    category: "Craft & Retail",
    year: "2026",
    role: "Solo project for a one-woman studio: brand identity, art direction, Shopify store design and build, plus product storytelling templates she can reuse herself.",
    summary:
      "A ceramicist selling at craft fairs wanted an online home that felt handmade — not like a generic template shop.",
    challenge:
      "Handmade goods lose their soul in standard product grids. The challenge: honour the wabi-sabi aesthetic while still making it effortless to browse and buy.",
    process: [
      "Brand identity rooted in the Japanese art of golden repair",
      "Product pages designed like gallery placards — story, process, and maker's notes",
      "Shopify build with custom templates and a firing-process journal section",
      "Taught the maker how to photograph and upload new pieces in her own style",
    ],
    results: [
      { metric: "+87%", label: "average order value" },
      { metric: "3 days", label: "to sell out first drop" },
      { metric: "100%", label: "client self-sufficiency" },
    ],
    quote:
      "People read my pots' stories before buying. The site feels like my studio finally has a front door.",
    quoteBy: "Hana Yamamoto, Maker at Kintsugi Ceramics",
    className: "art-kintsugi",
    monogram: "KC",
  },
];

/* Build modal HTML from a project object */
function buildModalHTML(p) {
  return `
    <div class="modal-hero ${p.className}">
      <div class="mh-title">${p.title}</div>
    </div>
    <div class="modal-body">
      <div class="modal-meta">
        <span class="chip">${p.category}</span>
        <span class="chip">${p.year}</span>
        <span class="chip">Case study</span>
      </div>

      <p class="modal-summary">${p.summary}</p>

      <div class="modal-section">
        <h4>The challenge</h4>
        <p>${p.challenge}</p>
      </div>

      <div class="modal-section">
        <h4>How I worked</h4>
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
        <h4>Results</h4>
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
        <h4>My role (exactly what I did)</h4>
        <div class="role-box"><strong>Honest scope:</strong> ${p.role}</div>
      </div>

      <div class="modal-section">
        <div class="modal-quote">
          “${p.quote}”
          <br><small style="font-style:normal;font-family:var(--font-body);color:var(--muted);font-size:0.88rem;">— ${p.quoteBy}</small>
        </div>
      </div>

      <div class="modal-actions">
        <a class="btn btn-coral" href="#contact" onclick="document.getElementById('modalClose').click();">
          Start a project like this
          <span class="btn-arrow">→</span>
        </a>
        <a class="btn btn-ink" href="#work" onclick="document.getElementById('modalClose').click();">
          Back to all work
        </a>
      </div>
    </div>
  `;
}
