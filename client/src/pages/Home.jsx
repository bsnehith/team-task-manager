import { useEffect, useState } from "react";
import "../styles/home.css";

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    const prog = document.getElementById("scroll-progress");
    const navbar = document.getElementById("navbar");
    const reveals = document.querySelectorAll(".reveal");
    const track = document.getElementById("carouselTrack");
    const dotsContainer = document.getElementById("carouselDots");
    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");
    if (!prog || !navbar || !track || !dotsContainer || !prevBtn || !nextBtn) return;

    const handleScrollProgress = () => {
      const pct =
        (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
      prog.style.width = `${pct}%`;
      navbar.classList.toggle("scrolled", window.scrollY > 60);
    };

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            entry.target.style.transitionDelay = `${(i % 4) * 0.1}s`;
            entry.target.classList.add("visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 },
    );
    reveals.forEach((el) => revealObserver.observe(el));

    const animateCounter = (el) => {
      const target = Number(el.dataset.target);
      const duration = 1600;
      const start = performance.now();
      const tick = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const ease = 1 - (1 - progress) ** 3;
        el.textContent = `${Math.round(ease * target)}${el.dataset.suffix || ""}`;
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll(".counter").forEach(animateCounter);
            counterObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 },
    );
    document.querySelectorAll(".stats-section").forEach((el) => counterObserver.observe(el));

    const slides = track.querySelectorAll(".carousel-slide");
    let current = 0;
    slides.forEach((_, i) => {
      const dot = document.createElement("div");
      dot.className = `carousel-dot${i === 0 ? " active" : ""}`;
      dot.addEventListener("click", () => goTo(i));
      dotsContainer.appendChild(dot);
    });

    const goTo = (n) => {
      current = (n + slides.length) % slides.length;
      track.style.transform = `translateX(-${current * 100}%)`;
      document
        .querySelectorAll(".carousel-dot")
        .forEach((d, i) => d.classList.toggle("active", i === current));
    };

    prevBtn.addEventListener("click", () => goTo(current - 1));
    nextBtn.addEventListener("click", () => goTo(current + 1));

    let autoplay = setInterval(() => goTo(current + 1), 5000);
    const wrapper = track.parentElement;
    const stopAutoplay = () => clearInterval(autoplay);
    const startAutoplay = () => {
      autoplay = setInterval(() => goTo(current + 1), 5000);
    };
    wrapper.addEventListener("mouseenter", stopAutoplay);
    wrapper.addEventListener("mouseleave", startAutoplay);

    let touchStart = 0;
    track.addEventListener(
      "touchstart",
      (e) => {
        touchStart = e.touches[0].clientX;
      },
      { passive: true },
    );
    track.addEventListener(
      "touchend",
      (e) => {
        const diff = touchStart - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) goTo(diff > 0 ? current + 1 : current - 1);
      },
      { passive: true },
    );

    const links = document.querySelectorAll('a[href^="#"]');
    const smoothHandler = (e) => {
      const target = document.querySelector(e.currentTarget.getAttribute("href"));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    };
    links.forEach((a) => a.addEventListener("click", smoothHandler));

    window.addEventListener("scroll", handleScrollProgress, { passive: true });
    return () => {
      clearInterval(autoplay);
      window.removeEventListener("scroll", handleScrollProgress);
      revealObserver.disconnect();
      counterObserver.disconnect();
      links.forEach((a) => a.removeEventListener("click", smoothHandler));
    };
  }, []);

  return (
    <div className="home-wrap">
      <div id="scroll-progress" />
      <div className="bg-orb orb-1" />
      <div className="bg-orb orb-2" />
      <div className="bg-orb orb-3" />

      <nav id="navbar">
        <div className="container nav-inner">
          <a href="#" className="logo">Team<span>Flow</span></a>
          <button
            className="mobile-nav-toggle"
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
          >
            {mobileMenuOpen ? "Close" : "Menu"}
          </button>
          <div className="nav-links">
            <a href="#features" className="btn-ghost">Features</a>
            <a href="#how" className="btn-ghost">How it works</a>
            <a href="#tech" className="btn-ghost">Tech Stack</a>
            <a href="#cta" className="btn-primary">Get Started</a>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="container mobile-nav-links">
            <a href="#features" className="btn-ghost" onClick={() => setMobileMenuOpen(false)}>Features</a>
            <a href="#how" className="btn-ghost" onClick={() => setMobileMenuOpen(false)}>How it works</a>
            <a href="#tech" className="btn-ghost" onClick={() => setMobileMenuOpen(false)}>Tech Stack</a>
            <a href="#cta" className="btn-primary" onClick={() => setMobileMenuOpen(false)}>Get Started</a>
          </div>
        )}
      </nav>

      <section className="hero">
        <div className="container">
          <div className="hero-inner">
            <div>
              <div className="hero-badge"><div className="dot" /> Full-stack Collaboration Platform</div>
              <h1 className="hero-title">Manage projects<br /><span className="gradient-text">like a real product team</span></h1>
              <p className="hero-sub">TeamFlow brings your team together with smart task tracking, role-based access, live dashboards, and JWT-secured authentication — built for real workflows.</p>
              <div className="hero-actions">
                <a href="#cta" className="btn-hero btn-hero-primary">Get Started Free <span className="hero-arrow">→</span></a>
                <a href="#features" className="btn-hero btn-hero-secondary">Explore Features</a>
              </div>
            </div>
            <div className="hero-visual">
              <div className="floating-card top-left"><div className="fc-label">Tasks Done Today</div><div className="fc-val">↑ 12 Tasks</div></div>
              <div className="dashboard-mock">
                <div className="mock-header">
                  <div className="mock-dots"><div className="mock-dot" /><div className="mock-dot" /><div className="mock-dot" /></div>
                  <div className="mock-title">TeamFlow Dashboard</div>
                </div>
                <div className="stat-grid">
                  <div className="stat-card"><div className="stat-label">Total Tasks</div><div className="stat-val blue">48</div></div>
                  <div className="stat-card"><div className="stat-label">In Progress</div><div className="stat-val violet">12</div></div>
                  <div className="stat-card"><div className="stat-label">Completed</div><div className="stat-val cyan">31</div></div>
                </div>
                <div className="task-list">
                  <div className="task-item"><div className="task-status status-done" /><div className="task-name">Design login page UI</div><div className="task-badge badge-low">Low</div><div className="avatar av-blue">AS</div></div>
                  <div className="task-item"><div className="task-status status-prog" /><div className="task-name">Build REST API endpoints</div><div className="task-badge badge-high">High</div><div className="avatar av-violet">KR</div></div>
                  <div className="task-item"><div className="task-status status-prog" /><div className="task-name">Setup Prisma ORM schema</div><div className="task-badge badge-med">Med</div><div className="avatar av-cyan">TM</div></div>
                  <div className="task-item"><div className="task-status status-todo" /><div className="task-name">Write API documentation</div><div className="task-badge badge-low">Low</div><div className="avatar av-pink">NP</div></div>
                </div>
              </div>
              <div className="floating-card bot-right"><div className="fc-label">Team Velocity</div><div className="fc-val">98% 🚀</div></div>
            </div>
          </div>
        </div>
      </section>

      <section className="logos-section">
        <div className="container">
          <div className="logos-label">Powered by modern tech</div>
          <div className="logos-track">
            <div className="tech-pill"><span>⚛️</span> React + Vite</div>
            <div className="tech-pill"><span>🟢</span> Node.js</div>
            <div className="tech-pill"><span>🐘</span> PostgreSQL</div>
            <div className="tech-pill"><span>🔷</span> Prisma ORM</div>
            <div className="tech-pill"><span>🔑</span> JWT Auth</div>
            <div className="tech-pill"><span>✅</span> Zod Validation</div>
          </div>
        </div>
      </section>

      <section className="stats-section reveal">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-big"><span className="stat-big-num counter" data-target="6">0</span><div className="stat-big-label">Core Modules</div></div>
            <div className="stat-big"><span className="stat-big-num counter" data-target="15">0</span><div className="stat-big-label">API Endpoints</div></div>
            <div className="stat-big"><span className="stat-big-num counter" data-target="4">0</span><div className="stat-big-label">Task Priorities</div></div>
            <div className="stat-big"><span className="stat-big-num counter" data-target="100">0</span><div className="stat-big-label">% Type-Safe API</div></div>
          </div>
        </div>
      </section>

      <section className="features-section" id="features">
        <div className="container">
          <div className="section-header reveal">
            <div className="section-tag">Platform Features</div>
            <h2 className="section-title">Everything your team needs</h2>
            <p className="section-sub">From JWT authentication to live dashboard analytics — TeamFlow is built for serious project workflows.</p>
          </div>
          <div className="features-grid">
            <div className="feature-card reveal"><div className="feature-icon icon-blue">🔐</div><div className="feature-name">Secure Authentication</div><div className="feature-desc">Signup and login with JWT sessions, password rules enforcement (8–20 chars, uppercase, numbers, special chars) and show/hide password UI.</div></div>
            <div className="feature-card reveal"><div className="feature-icon icon-violet">👥</div><div className="feature-name">Role-Based Access</div><div className="feature-desc">Admins create and manage projects and tasks. Members work within permitted project scopes. Clear admin/member permission hierarchy.</div></div>
            <div className="feature-card reveal"><div className="feature-icon icon-cyan">📋</div><div className="feature-name">Smart Task Management</div><div className="feature-desc">Create tasks with title, description, due dates, priority levels, and assignees. Update status (TODO → IN_PROGRESS → DONE), edit, and delete.</div></div>
            <div className="feature-card reveal"><div className="feature-icon icon-green">📊</div><div className="feature-name">Live Dashboard Insights</div><div className="feature-desc">Monitor total tasks, status splits, overdue tasks, and team velocity — all in real time from the central dashboard.</div></div>
            <div className="feature-card reveal"><div className="feature-icon icon-pink">🗂️</div><div className="feature-name">Project Management</div><div className="feature-desc">Create projects, manage team members, view project lists, open project details, and delete projects as an admin.</div></div>
            <div className="feature-card reveal"><div className="feature-icon icon-amber">⚡</div><div className="feature-name">Automation Ready</div><div className="feature-desc">Architecture designed for n8n workflow integration. Automate media operations and repetitive tasks with RESTful API hooks.</div></div>
          </div>
        </div>
      </section>

      <section className="how-section" id="how">
        <div className="container">
          <div className="section-header reveal">
            <div className="section-tag">User Flow</div>
            <h2 className="section-title">Up and running in minutes</h2>
            <p className="section-sub">From landing page to full team workflow — six simple steps.</p>
          </div>
          <div className="steps-grid reveal">
            <div className="step"><div className="step-num">1</div><div className="step-title">Visit Landing Page</div><div className="step-desc">Arrive at the public marketing page. Explore features and benefits.</div></div>
            <div className="step"><div className="step-num">2</div><div className="step-title">Sign Up or Login</div><div className="step-desc">Register with secure JWT auth or log into your existing account.</div></div>
            <div className="step"><div className="step-num">3</div><div className="step-title">Enter Dashboard</div><div className="step-desc">Access the protected /app dashboard with live stats and project overview.</div></div>
            <div className="step"><div className="step-num">4</div><div className="step-title">Manage & Track</div><div className="step-desc">Admin creates projects and tasks. Team updates statuses and tracks progress.</div></div>
          </div>
        </div>
      </section>

      <section className="carousel-section" id="carousel">
        <div className="container">
          <div className="section-header reveal"><div className="section-tag">Deep Dive</div><h2 className="section-title">Built for real teams</h2></div>
          <div className="reveal">
            <div className="carousel-wrapper">
              <div className="carousel-track" id="carouselTrack">
                <div className="carousel-slide"><div className="slide-content"><div><div className="slide-tag">🔒 Authentication</div><div className="slide-title">Bulletproof security from day one</div><div className="slide-body">TeamFlow uses JWT tokens for all protected routes, ensuring only authenticated users can access the app. Password policy enforces complexity rules, and Zod validates every API request before it touches the database.</div></div><div className="slide-visual"><div className="slide-row"><span className="slide-row-icon">🔑</span><span className="slide-row-text">JWT token on login</span><span className="slide-row-badge badge-low">Active</span></div><div className="slide-row"><span className="slide-row-icon">🛡️</span><span className="slide-row-text">Password strength rules</span><span className="slide-row-badge badge-low">Enforced</span></div><div className="slide-row"><span className="slide-row-icon">✅</span><span className="slide-row-text">Zod request validation</span><span className="slide-row-badge badge-med">All Routes</span></div><div className="slide-row"><span className="slide-row-icon">🔐</span><span className="slide-row-text">bcryptjs password hashing</span><span className="slide-row-badge badge-low">Secure</span></div></div></div></div>
                <div className="carousel-slide"><div className="slide-content"><div><div className="slide-tag">👑 Role-Based Access</div><div className="slide-title">Admin power, member clarity</div><div className="slide-body">Admins have full control — they create projects, manage members, assign tasks, and delete anything. Members work within their permitted scope. Role checks protect every sensitive operation in the backend.</div></div><div className="slide-visual"><div className="slide-row"><span className="slide-row-icon">👑</span><span className="slide-row-text">Admin: create, edit, delete all</span><span className="slide-row-badge badge-med">Admin</span></div><div className="slide-row"><span className="slide-row-icon">👤</span><span className="slide-row-text">Member: view and update tasks</span><span className="slide-row-badge badge-med">Member</span></div><div className="slide-row"><span className="slide-row-icon">🚫</span><span className="slide-row-text">Role checks on delete/edit ops</span><span className="slide-row-badge badge-high">Protected</span></div><div className="slide-row"><span className="slide-row-icon">🗑️</span><span className="slide-row-text">Account deletion clears all data</span><span className="slide-row-badge badge-med">Instant</span></div></div></div></div>
                <div className="carousel-slide"><div className="slide-content"><div><div className="slide-tag">📊 Dashboard Analytics</div><div className="slide-title">Live visibility across all projects</div><div className="slide-body">The TeamFlow dashboard gives admins and members real-time insight into project health. Track total tasks, status distributions, overdue items, and team velocity — no manual reporting needed.</div></div><div className="slide-visual"><div className="slide-row"><span className="slide-row-icon">📈</span><span className="slide-row-text">Total task count — live</span><span className="slide-row-badge badge-low">Real-time</span></div><div className="slide-row"><span className="slide-row-icon">🔄</span><span className="slide-row-text">Status split: TODO / IN_PROGRESS / DONE</span><span className="slide-row-badge badge-med">Visual</span></div><div className="slide-row"><span className="slide-row-icon">⏰</span><span className="slide-row-text">Overdue task alerts</span><span className="slide-row-badge badge-high">Flagged</span></div><div className="slide-row"><span className="slide-row-icon">🚀</span><span className="slide-row-text">Team velocity tracking</span><span className="slide-row-badge badge-low">Active</span></div></div></div></div>
                <div className="carousel-slide"><div className="slide-content"><div><div className="slide-tag">🛠️ Tech Stack</div><div className="slide-title">Production-grade full-stack architecture</div><div className="slide-body">React + Vite frontend with Tailwind CSS. Node.js + Express REST API backend with Prisma ORM on PostgreSQL. All validated with Zod and secured with JWT + bcryptjs — ready for Railway deployment.</div></div><div className="slide-visual"><div className="slide-row"><span className="slide-row-icon">⚛️</span><span className="slide-row-text">React, Vite, Tailwind, Axios</span><span className="slide-row-badge badge-med">Frontend</span></div><div className="slide-row"><span className="slide-row-icon">🟢</span><span className="slide-row-text">Node.js, Express, REST API</span><span className="slide-row-badge badge-low">Backend</span></div><div className="slide-row"><span className="slide-row-icon">🐘</span><span className="slide-row-text">PostgreSQL + Prisma ORM</span><span className="slide-row-badge badge-med">Database</span></div><div className="slide-row"><span className="slide-row-icon">🚀</span><span className="slide-row-text">Railway deployment ready</span><span className="slide-row-badge badge-med">Deploy</span></div></div></div></div>
              </div>
            </div>
            <div className="carousel-controls">
              <button className="carousel-btn" id="prevBtn">←</button>
              <div className="carousel-dots" id="carouselDots" />
              <button className="carousel-btn" id="nextBtn">→</button>
            </div>
          </div>
        </div>
      </section>

      <section className="testimonials-section">
        <div className="container">
          <div className="section-header reveal"><div className="section-tag">What Teams Say</div><h2 className="section-title">Built for real workflows</h2></div>
          <div className="testimonials-grid">
            <div className="testi-card reveal"><div className="testi-stars"><span className="star">★</span><span className="star">★</span><span className="star">★</span><span className="star">★</span><span className="star">★</span></div><div className="testi-text">"TeamFlow completely replaced our messy spreadsheet workflow. The role-based access means admins control the chaos while developers stay focused."</div><div className="testi-author"><div className="testi-avatar av-blue">RS</div><div><div className="testi-name">Rahul Sharma</div><div className="testi-role">Engineering Lead</div></div></div></div>
            <div className="testi-card reveal"><div className="testi-stars"><span className="star">★</span><span className="star">★</span><span className="star">★</span><span className="star">★</span><span className="star">★</span></div><div className="testi-text">"The dashboard gives me exactly what I need: who's working on what, what's overdue, and how the team is trending. No noise, just signal."</div><div className="testi-author"><div className="testi-avatar av-violet">PM</div><div><div className="testi-name">Priya Menon</div><div className="testi-role">Product Manager</div></div></div></div>
            <div className="testi-card reveal"><div className="testi-stars"><span className="star">★</span><span className="star">★</span><span className="star">★</span><span className="star">★</span><span className="star">★</span></div><div className="testi-text">"The JWT auth and Zod validation story is clean. I deployed to Railway in under 10 minutes and the whole stack just worked."</div><div className="testi-author"><div className="testi-avatar av-cyan">AK</div><div><div className="testi-name">Arjun Kumar</div><div className="testi-role">Backend Developer</div></div></div></div>
          </div>
        </div>
      </section>

      <section className="tech-section" id="tech">
        <div className="container">
          <div className="section-header reveal"><div className="section-tag">Technology</div><h2 className="section-title">Modern stack, proven tools</h2><p className="section-sub">Every technology chosen for developer experience, type safety, and production reliability.</p></div>
          <div className="tech-grid reveal">
            <div className="tech-card"><span className="tech-icon">⚛️</span><div className="tech-name">React</div><div className="tech-sub">+ Vite</div></div>
            <div className="tech-card"><span className="tech-icon">🟢</span><div className="tech-name">Node.js</div><div className="tech-sub">+ Express</div></div>
            <div className="tech-card"><span className="tech-icon">🐘</span><div className="tech-name">PostgreSQL</div><div className="tech-sub">Database</div></div>
            <div className="tech-card"><span className="tech-icon">🔷</span><div className="tech-name">Prisma</div><div className="tech-sub">ORM</div></div>
            <div className="tech-card"><span className="tech-icon">🔑</span><div className="tech-name">JWT</div><div className="tech-sub">+ bcryptjs</div></div>
            <div className="tech-card"><span className="tech-icon">✅</span><div className="tech-name">Zod</div><div className="tech-sub">Validation</div></div>
          </div>
        </div>
      </section>

      <section className="cta-section" id="cta">
        <div className="container">
          <div className="cta-box reveal">
            <h2 className="cta-title">Ready to build with your team?</h2>
            <p className="cta-sub">TeamFlow gives you everything you need — auth, projects, tasks, dashboards — in one production-ready full-stack platform.</p>
            <div className="cta-actions">
              <a href="/signup" className="btn-cta-primary">Start for Free →</a>
              <a href="/login" className="btn-cta-secondary">Login to Dashboard</a>
            </div>
          </div>
        </div>
      </section>

      <footer>
        <div className="container">
          <div className="footer-inner">
            <div className="footer-brand">
              <a href="#" className="logo">Team<span>Flow</span></a>
              <div className="footer-desc">Full-stack team collaboration platform.</div>
            </div>
            <div className="footer-links">
              <a href="#features" className="footer-link">Features</a>
              <a href="#how" className="footer-link">How it Works</a>
              <a href="#tech" className="footer-link">Tech Stack</a>
              <a href="/signup" className="footer-link">Sign Up</a>
              <a href="/login" className="footer-link">Login</a>
            </div>
          </div>
          <div className="footer-copy">© {currentYear} TeamFlow. Built with React, Node.js, PostgreSQL & Prisma.</div>
        </div>
      </footer>
    </div>
  );
}
