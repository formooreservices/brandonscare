import { supabase } from './supabase.js';
import { NAV_GROUPS, findSection } from './config.js';
import { renderDashboard, renderLogPage, renderStaticPage, renderHistoryPage } from './pages.js';

export function renderApp(root) {
  root.innerHTML = `
    <div class="shell">
      <button class="mobile-menu-btn" id="menu-btn">\u2630 Menu</button>
      <aside class="sidebar" id="sidebar">
        <a href="#/" class="sidebar-brand">Brandon's Care<span>Care Dashboard</span></a>
        ${NAV_GROUPS.map((g) => `
          <div class="nav-group">
            <div class="nav-group-label">${g.label}</div>
            ${g.items.map((i) => `<a class="nav-link" data-slug="${i.slug}" href="#/${i.slug}">${i.title}</a>`).join('')}
          </div>
        `).join('')}
        <div class="sidebar-foot">
          <button class="signout-btn" id="signout-btn">Sign out</button>
        </div>
      </aside>
      <main class="main" id="main"></main>
    </div>
  `;

  root.querySelector('#menu-btn').addEventListener('click', () => {
    root.querySelector('#sidebar').classList.toggle('open');
  });

  root.querySelector('#signout-btn').addEventListener('click', async () => {
    await supabase.auth.signOut();
  });

  const main = root.querySelector('#main');

  async function route() {
    const slug = decodeURIComponent((location.hash.replace(/^#\//, '')) || '');
    root.querySelectorAll('.nav-link').forEach((a) => {
      a.classList.toggle('active', a.getAttribute('data-slug') === slug);
    });
    root.querySelector('#sidebar').classList.remove('open');

    if (slug === '') {
      await renderDashboard(main);
      return;
    }
    if (slug === 'history') {
      await renderHistoryPage(main);
      return;
    }
    const section = findSection(slug);
    if (!section) {
      main.innerHTML = `<div class="topbar"><h1 class="page-title">Not found</h1></div><p>That page doesn't exist yet.</p>`;
      return;
    }
    if (section.type === 'log') {
      await renderLogPage(main, slug);
    } else {
      renderStaticPage(main, slug);
    }
  }

  window.addEventListener('hashchange', route);
  route();
}
