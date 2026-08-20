const toggle = document.querySelector('.menu-toggle');
const menu = document.querySelector('#menu');
const menuLinks = [...(menu?.querySelectorAll('a[href^="#"]') ?? [])];

toggle?.addEventListener('click', () => {
const open = menu.classList.toggle('open');
toggle.setAttribute('aria-expanded', String(open));
toggle.textContent = open ? 'Cerrar' : 'Menú';
});

menuLinks.forEach(link => {
link.addEventListener('click', () => {
menu.classList.remove('open');
toggle?.setAttribute('aria-expanded', 'false');
if (toggle) toggle.textContent = 'Menú';
});
});

document.addEventListener('keydown', event => {
if (event.key !== 'Escape' || !menu?.classList.contains('open')) return;
menu.classList.remove('open');
toggle?.setAttribute('aria-expanded', 'false');
if (toggle) toggle.textContent = 'Menú';
toggle?.focus();
});

const navSections = menuLinks
.map(link => document.querySelector(link.getAttribute('href')))
.filter(Boolean);

if ('IntersectionObserver' in window && navSections.length) {
const navObserver = new IntersectionObserver(entries => {
const visible = entries
.filter(entry => entry.isIntersecting)
.sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

if (!visible) return;

menuLinks.forEach(link => {
const active = link.getAttribute('href') === `#${visible.target.id}`;
link.classList.toggle('active', active);
if (active) link.setAttribute('aria-current', 'location');
else link.removeAttribute('aria-current');
});
}, {
rootMargin: '-30% 0px -55% 0px',
threshold: [0, .08, .2]
});

navSections.forEach(section => navObserver.observe(section));
}

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const revealTargets = [...document.querySelectorAll(
'.section-heading, .cards, .steps, .work-grid, .about-grid, .contact-box'
)];

if (!reduceMotion && 'IntersectionObserver' in window && revealTargets.length) {
revealTargets.forEach(target => target.classList.add('reveal-target'));
document.documentElement.classList.add('reveal-ready');

const revealObserver = new IntersectionObserver(entries => {
entries.forEach(entry => {
if (!entry.isIntersecting) return;
entry.target.classList.add('is-visible');
revealObserver.unobserve(entry.target);
});
}, {
rootMargin: '0px 0px -22% 0px',
threshold: .12
});

revealTargets.forEach(target => revealObserver.observe(target));
}
