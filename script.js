// ===== DOM Elements =====
const navbar = document.getElementById('navbar');
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');
const navLinks = document.querySelectorAll('.nav-item');
const backToTop = document.getElementById('backToTop');
const popup = document.getElementById('discountPopup');
const popupClose = document.getElementById('popupClose');
const popupCta = document.getElementById('popupCta');
const contactForm = document.getElementById('contactForm');
const bgCanvas = document.getElementById('bgCanvas');
const scrollParticlesContainer = document.getElementById('scrollParticles');
const heroParticles = document.getElementById('heroParticles');

// ===== Discount Popup =====
function initPopup() {
    const hasSeen = sessionStorage.getItem('techaz_popup_seen');
    if (hasSeen) return;

    setTimeout(() => {
        popup.classList.add('active');
        sessionStorage.setItem('techaz_popup_seen', 'true');
        document.body.style.overflow = 'hidden';
    }, 1500);

    popupClose.addEventListener('click', closePopup);
    popupCta.addEventListener('click', closePopup);
    popup.addEventListener('click', (e) => {
        if (e.target === popup) closePopup();
    });
}

function closePopup() {
    popup.classList.remove('active');
    document.body.style.overflow = '';
}

// ===== Fireworks Burst in Popup =====
function initPopupFireworks() {
    const canvas = document.getElementById('popupFireworks');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let particles = [], running = false;

    function resize() {
        const rect = canvas.parentElement.getBoundingClientRect();
        canvas.width = Math.max(1, Math.round(rect.width));
        canvas.height = Math.max(1, Math.round(rect.height));
    }

    function launch(burst) {
        const px = canvas.width * (0.25 + Math.random() * 0.5);
        const py = canvas.height * (0.25 + Math.random() * 0.35);
        const colors = ['#ff6a00', '#ffa500', '#ffd27a', '#ff2d55', '#fff1c1'];
        const count = burst ? 70 : 50;
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 5.5 + 1.2;
            particles.push({
                x: px,
                y: py,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1,
                decay: 0.012 + Math.random() * 0.02,
                color: colors[Math.floor(Math.random() * colors.length)],
                size: Math.random() * 2.6 + 0.8,
                grav: 0.035
            });
        }
    }

    function loop() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const visible = popup.classList.contains('active');
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += p.grav;
            p.life -= p.decay;
            if (p.life <= 0 || !visible) {
                particles.splice(i, 1);
                continue;
            }
            ctx.globalAlpha = Math.max(0, p.life);
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 10;
            ctx.fill();
            ctx.shadowBlur = 0;
        }
        ctx.globalAlpha = 1;
        if (visible && particles.length < 25 && Math.random() < 0.03) launch(true);
        requestAnimationFrame(loop);
    }

    resize();
    window.addEventListener('resize', resize);
    launch(false);
    if (!running) { running = true; loop(); }
    setInterval(() => {
        if (popup.classList.contains('active')) launch(true);
    }, 2200);
}

// ===== Tech Particle Network Background (connected nodes, smooth flow, pulse) =====
function initHeroCanvas() {
    const ctx = bgCanvas.getContext('2d');
    let width, height, particles = [], mouse = { x: null, y: null };
    let isMobile = window.innerWidth <= 768;
    const MAX_DIST = 170;
    const MOUSE_RADIUS = 200;

    function resize() {
        width = bgCanvas.width = window.innerWidth;
        height = bgCanvas.height = window.innerHeight;
    }

    class Node {
        constructor(initial) {
            this.reset(initial);
        }

        reset(initial) {
            this.x = Math.random() * width;
            this.y = initial ? Math.random() * height : -30 - Math.random() * height * 0.3;
            this.speedY = Math.random() * 0.6 + 0.35;
            this.speedX = (Math.random() - 0.5) * 0.4;
            this.phase = Math.random() * Math.PI * 2;
            this.baseRadius = Math.random() * 2.4 + 1.1;
            this.opacity = Math.random() * 0.5 + 0.3;
        }

        update() {
            this.y += this.speedY;
            this.x += this.speedX + Math.sin(this.phase) * 0.18;
            this.phase += 0.02;

            if (this.x < -30) this.x = width + 30;
            if (this.x > width + 30) this.x = -30;
            if (this.y > height + 40) this.reset(false);
            if (this.y < -40) this.y = height + 30;

            if (mouse.x !== null) {
                const dx = this.x - mouse.x;
                const dy = this.y - mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < MOUSE_RADIUS && dist > 0.01) {
                    const force = (1 - dist / MOUSE_RADIUS) * 0.9;
                    this.x += (dx / dist) * force;
                    this.y += (dy / dist) * force;
                }
            }
        }

        draw() {
            const pulse = 1 + Math.sin(this.phase * 1.5) * 0.3;
            const r = this.baseRadius * pulse;
            let boost = 1;
            if (mouse.x !== null) {
                const dx = this.x - mouse.x;
                const dy = this.y - mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 130) boost = 1.7;
            }

            ctx.beginPath();
            ctx.arc(this.x, this.y, r * boost * 3.5, 0, Math.PI * 2);
            const glow = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, r * boost * 3.5);
            glow.addColorStop(0, `rgba(255, 140, 50, ${Math.min(0.85, this.opacity * 0.6 * boost)})`);
            glow.addColorStop(1, 'rgba(255, 140, 50, 0)');
            ctx.fillStyle = glow;
            ctx.fill();

            ctx.beginPath();
            ctx.arc(this.x, this.y, r * boost, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 150, 60, ${Math.min(1, this.opacity * boost)})`;
            ctx.fill();
        }
    }

    function init() {
        resize();
        particles = [];
        const count = isMobile ? 42 : 125;
        for (let i = 0; i < count; i++) {
            particles.push(new Node(true));
        }
    }

    function drawConnections() {
        const maxDist = isMobile ? 105 : MAX_DIST;
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < maxDist) {
                    const t = 1 - dist / maxDist;
                    const opacity = t * 0.3;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(255, 120, 45, ${opacity})`;
                    ctx.lineWidth = 0.5 + t * 0.9;
                    ctx.stroke();
                }
            }
        }
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);
        particles.forEach(p => { p.update(); p.draw(); });
        drawConnections();
        requestAnimationFrame(animate);
    }

    bgCanvas.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    bgCanvas.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
    });

    window.addEventListener('resize', () => {
        const next = window.innerWidth <= 768;
        resize();
        if (next !== isMobile) {
            isMobile = next;
            init();
        }
    });
    init();
    animate();
}

// ===== Hero Floating Particles =====
function initHeroParticles() {
    const count = 30;
    for (let i = 0; i < count; i++) {
        const p = document.createElement('div');
        p.className = 'hero-particle';
        p.style.left = Math.random() * 100 + '%';
        p.style.animationDuration = (Math.random() * 8 + 6) + 's';
        p.style.animationDelay = (Math.random() * 8) + 's';
        p.style.width = p.style.height = (Math.random() * 3 + 1) + 'px';
        heroParticles.appendChild(p);
    }
}

// ===== Navbar =====
function initNavbar() {
    // Scroll effect
    let lastScrollY = window.scrollY;

    window.addEventListener('scroll', () => {
        const currentY = window.scrollY;
        const menuOpen = navMenu.classList.contains('active');

        if (currentY > 90 && currentY > lastScrollY && !menuOpen) {
            navbar.classList.add('nav-hidden');
        } else if (currentY < lastScrollY || currentY <= 90 || menuOpen) {
            navbar.classList.remove('nav-hidden');
        }
        lastScrollY = currentY;

        if (currentY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Back to top
        if (currentY > 400) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }

        // Active nav link
        updateActiveNav();
    });

    // Mobile toggle
    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Nav link clicks
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
        });

        link.addEventListener('mousemove', (e) => {
            const r = link.getBoundingClientRect();
            link.style.setProperty('--mx', (e.clientX - r.left) + 'px');
            link.style.setProperty('--my', (e.clientY - r.top) + 'px');
        });
    });

    // Back to top
    backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

function updateActiveNav() {
    const sections = document.querySelectorAll('section[id]');
    const scrollPos = window.scrollY + 150;

    sections.forEach(section => {
        const top = section.offsetTop;
        const height = section.offsetHeight;
        const id = section.getAttribute('id');

        if (scrollPos >= top && scrollPos < top + height) {
            navLinks.forEach(item => item.classList.remove('active'));
            const activeLink = document.querySelector(`.nav-link[href="#${id}"]`);
            if (activeLink) {
                activeLink.closest('.nav-item').classList.add('active');
            }
        }
    });
}

// ===== Portfolio Filter =====
function initPortfolioFilter() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const items = document.querySelectorAll('.portfolio-item');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filter = btn.dataset.filter;

            items.forEach(item => {
                const shouldShow = filter === 'all' || item.dataset.category === filter;
                item.style.opacity = shouldShow ? '1' : '0.2';
                item.style.transform = shouldShow ? 'scale(1)' : 'scale(0.95)';
                item.style.transition = 'all 0.5s cubic-bezier(0.25,0.46,0.45,0.94)';
            });
        });
    });
}

// ===== Counter Animation =====
function initCounters() {
    const statNumbers = document.querySelectorAll('.stat-number');
    let animated = false;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !animated) {
                animated = true;
                statNumbers.forEach(el => {
                    const target = parseInt(el.dataset.target);
                    const duration = 2000;
                    const step = target / (duration / 16);
                    let current = 0;

                    const timer = setInterval(() => {
                        current += step;
                        if (current >= target) {
                            current = target;
                            clearInterval(timer);
                        }
                        el.textContent = Math.floor(current);
                    }, 16);
                });
            }
        });
    }, { threshold: 0.5 });

    const statsSection = document.querySelector('.hero-stats');
    if (statsSection) observer.observe(statsSection);
}

// ===== Scroll Reveal Animations =====
function initScrollReveal() {
    const elements = document.querySelectorAll(
        '.service-card, .industry-card, .blog-card, .portfolio-item, .contact-card, .about-content, .section-header'
    );

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, index * 80);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    elements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s cubic-bezier(0.25,0.46,0.45,0.94)';
        observer.observe(el);
    });
}

// ===== Packages Cards Reveal =====
function initPackagesReveal() {
    document.querySelectorAll('.packages-grid').forEach(grid => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    grid.classList.add('visible');
                    observer.unobserve(grid);
                }
            });
        }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
        observer.observe(grid);
    });
}

// ===== Bright Shooting Stars on Scroll =====
function initScrollParticles() {
    let lastScrollY = window.scrollY;
    let lastSpawn = 0;

    window.addEventListener('scroll', () => {
        const isMobile = window.innerWidth <= 768;
        const currentY = window.scrollY;
        const now = Date.now();
        const delta = currentY - lastScrollY;
        lastScrollY = currentY;

        if (delta <= 0 || now - lastSpawn < (isMobile ? 550 : 220)) return;
        lastSpawn = now;

        const speed = Math.min(delta, 40);
        const count = isMobile ? (Math.random() < 0.4 ? 1 : 0) : Math.max(1, Math.floor(speed / 18));
        if (!count) return;

        for (let i = 0; i < count; i++) {
            const star = document.createElement('div');
            star.className = 'lava-star';
            const w = (Math.random() * (isMobile ? 0.9 : 1.5) + (isMobile ? 1.2 : 2)) + 'px';
            const len = (isMobile ? Math.random() * 28 + 34 : Math.random() * 50 + 60) + 'px';
            star.style.width = w;
            star.style.height = len;
            star.style.left = (Math.random() * 100) + 'vw';
            const duration = (Math.random() * 1.4 + 1.8).toFixed(2);
            const delay = (Math.random() * 0.25).toFixed(2);
            star.style.animationDuration = duration + 's';
            star.style.animationDelay = delay + 's';
            scrollParticlesContainer.appendChild(star);
            setTimeout(() => {
                if (star.parentNode) star.remove();
            }, (parseFloat(duration) + parseFloat(delay)) * 1000 + 200);
        }
    }, { passive: true });
}

// ===== Contact Form =====
function initContactForm() {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const btn = contactForm.querySelector('.btn');
        const originalHTML = btn.innerHTML;
        btn.innerHTML = '<span class="btn-text">Message Sent!</span><span class="btn-icon"><i class="fas fa-check"></i></span>';
        btn.style.background = 'linear-gradient(135deg, #27ae60, #2ecc71)';

        setTimeout(() => {
            btn.innerHTML = originalHTML;
            btn.style.background = '';
            contactForm.reset();
        }, 3000);
    });
}

// ===== Smooth Scroll for all anchor links =====
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}

// ===== Team Flow Network (scroll reveal) =====
function initFlowNetwork() {
    const hub = document.querySelector('.flow-hub');
    const steps = Array.from(document.querySelectorAll('.flow-step'));
    if (!hub || !steps.length) return;

    function revealAll() {
        steps.forEach((step, i) => {
            setTimeout(() => {
                step.classList.add('revealed');
                if (step.dataset.line) {
                    document.querySelectorAll(step.dataset.line).forEach(line => line.classList.add('draw'));
                }
            }, i * 140);
        });
    }

    if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    revealAll();
                    io.unobserve(hub);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
        io.observe(hub);
    } else {
        revealAll();
    }
}

// ===== Service Cards Tilt Effect =====
function initTiltEffect() {
    document.querySelectorAll('.service-card, .industry-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;

            card.style.transform = `translateY(-8px) perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0) perspective(1000px) rotateX(0) rotateY(0)';
        });
    });
}

// ===== Blog Read Article Toggle =====
function initBlogToggles() {
    document.querySelectorAll('.blog-read-more').forEach(btn => {
        btn.addEventListener('click', () => {
            const body = btn.closest('.blog-card').querySelector('.blog-body');
            const open = body.classList.toggle('open');
            btn.classList.toggle('open', open);
            btn.setAttribute('aria-expanded', open);
            btn.innerHTML = open
                ? 'Close Article <i class="fas fa-arrow-right"></i>'
                : 'Read Article <i class="fas fa-arrow-right"></i>';
        });
    });
}

// ===== Initialize Everything =====
document.addEventListener('DOMContentLoaded', () => {
    initPopup();
    initPopupFireworks();
    initHeroCanvas();
    initHeroParticles();
    initNavbar();
    initPortfolioFilter();
    initCounters();
    initScrollReveal();
    initPackagesReveal();
    initScrollParticles();
    initContactForm();
    initSmoothScroll();
    initTiltEffect();
    initFlowNetwork();
    initBlogToggles();
});
