import { supabase } from './supabase.js';
import { NAV_GROUPS, LOG_FIELDS, STATIC_CONTENT, findSection } from './config.js';

function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function fmtDate(iso) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

async function fetchEntries(section, limit = 200) {
  const { data, error } = await supabase
    .from('entries')
    .select('*')
    .eq('section', section)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
}

async function insertEntry(section, fields) {
  const { data: userData } = await supabase.auth.getUser();
  const { error } = await supabase.from('entries').insert({
    section,
    data: fields,
    user_id: userData.user.id,
  });
  if (error) throw error;
}

async function deleteEntry(id) {
  const { error } = await supabase.from('entries').delete().eq('id', id);
  if (error) throw error;
}

/* ---------------- Dashboard ---------------- */

export async function renderDashboard(main) {
  main.innerHTML = `
    <div class="topbar">
      <h1 class="page-title">Brandon's Care Dashboard</h1>
      <span class="page-date">${new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</span>
    </div>
    <div id="rhythm" class="rhythm-strip"></div>
    <div class="section-title">Jump to</div>
    <div class="card-grid" id="dash-tiles"></div>
  `;

  const tiles = main.querySelector('#dash-tiles');
  const quick = ['todays-schedule', 'daily-mood-check', 'medications', 'supplies-inventory', 'daily-checklist-form', 'calendar-appointments'];
  tiles.innerHTML = quick.map((slug) => {
    const item = findSection(slug);
    return `<a class="tile" href="#/${slug}">
      <div class="tile-label">Open</div>
      <div class="tile-title">${escapeHtml(item.title)}</div>
    </a>`;
  }).join('');

  // Rhythm strip: today's entries bucketed into 4 parts of day, across
  // schedule / checklist / medications / mood sections.
  const rhythmEl = main.querySelector('#rhythm');
  const slots = [
    { label: 'Morning', from: 0, to: 12 },
    { label: 'Midday', from: 12, to: 16 },
    { label: 'Evening', from: 16, to: 21 },
    { label: 'Overnight', from: 21, to: 24 },
  ];

  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const { data, error } = await supabase
      .from('entries')
      .select('*')
      .in('section', ['todays-schedule', 'daily-checklist-form', 'medications', 'daily-mood-check'])
      .gte('created_at', startOfDay.toISOString())
      .order('created_at', { ascending: true });
    if (error) throw error;

    rhythmEl.innerHTML = slots.map((slot) => {
      const inSlot = (data || []).filter((e) => {
        const h = new Date(e.created_at).getHours();
        return h >= slot.from && h < slot.to;
      });
      const dots = inSlot.length
        ? inSlot.map(() => '<span class="rhythm-dot done"></span>').join('')
        : '<span class="rhythm-dot"></span>';
      return `
        <div class="rhythm-block">
          <div class="slot-label">${slot.label}</div>
          <div class="rhythm-dot-row">${dots}</div>
          <div class="slot-note">${inSlot.length ? inSlot.length + ' logged' : 'Nothing logged yet'}</div>
        </div>`;
    }).join('');
  } catch (err) {
    rhythmEl.innerHTML = `<div class="empty-state">Couldn't load today's activity (${escapeHtml(err.message)}).</div>`;
  }
}

/* ---------------- Generic log page ---------------- */

export async function renderLogPage(main, slug) {
  const section = findSection(slug);
  const fields = LOG_FIELDS[slug] || [];

  main.innerHTML = `
    <div class="topbar">
      <h1 class="page-title">${escapeHtml(section.title)}</h1>
    </div>
    <div class="panel">
      <form id="entry-form">
        <div class="form-row">
          ${fields.map((f) => renderField(f)).join('')}
          <button class="btn" type="submit">Add entry</button>
        </div>
      </form>
    </div>
    <div class="section-title">History</div>
    <div class="panel" id="log-list"><div class="empty-state">Loading\u2026</div></div>
  `;

  main.querySelector('#entry-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const values = {};
    fields.forEach((f) => {
      values[f.key] = form.querySelector(`[name="${f.key}"]`).value;
    });
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    try {
      await insertEntry(slug, values);
      form.reset();
      await loadList();
    } catch (err) {
      alert('Could not save: ' + err.message);
    } finally {
      btn.disabled = false;
    }
  });

  async function loadList() {
    const listEl = main.querySelector('#log-list');
    try {
      const rows = await fetchEntries(slug);
      if (!rows.length) {
        listEl.innerHTML = `<div class="empty-state">No entries yet — add the first one above.</div>`;
        return;
      }
      listEl.innerHTML = `
        <table class="log-table">
          <thead><tr>
            <th>When</th>
            ${fields.map((f) => `<th>${escapeHtml(f.label)}</th>`).join('')}
            <th></th>
          </tr></thead>
          <tbody>
            ${rows.map((r) => `
              <tr data-id="${r.id}">
                <td class="ts">${fmtDate(r.created_at)}</td>
                ${fields.map((f) => `<td>${renderCell(slug, f, r.data ? r.data[f.key] : '')}</td>`).join('')}
                <td><button class="btn-danger" data-delete="${r.id}">Delete</button></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
      listEl.querySelectorAll('[data-delete]').forEach((btn) => {
        btn.addEventListener('click', async () => {
          if (!confirm('Delete this entry?')) return;
          await deleteEntry(btn.getAttribute('data-delete'));
          loadList();
        });
      });
    } catch (err) {
      listEl.innerHTML = `<div class="empty-state">Couldn't load entries (${escapeHtml(err.message)}).</div>`;
    }
  }

  loadList();
}

function renderField(f) {
  const name = f.key;
  if (f.type === 'textarea') {
    return `<div class="field"><label>${escapeHtml(f.label)}</label><textarea name="${name}" placeholder="${escapeHtml(f.placeholder || '')}"></textarea></div>`;
  }
  if (f.type === 'select') {
    return `<div class="field"><label>${escapeHtml(f.label)}</label>
      <select name="${name}">
        ${f.options.map((o) => `<option value="${escapeHtml(o)}">${escapeHtml(o)}</option>`).join('')}
      </select>
    </div>`;
  }
  return `<div class="field"><label>${escapeHtml(f.label)}</label><input name="${name}" type="${f.type}" placeholder="${escapeHtml(f.placeholder || '')}" /></div>`;
}

function renderCell(slug, f, value) {
  if (slug === 'supplies-inventory' && f.key === 'quantity') {
    return escapeHtml(value);
  }
  if (f.type === 'datetime-local' && value) {
    return escapeHtml(new Date(value).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }));
  }
  return escapeHtml(value);
}

/* ---------------- Static / guide page ---------------- */

export function renderStaticPage(main, slug) {
  const section = findSection(slug);
  const content = STATIC_CONTENT[slug];
  main.innerHTML = `
    <div class="topbar">
      <h1 class="page-title">${escapeHtml(section.title)}</h1>
    </div>
    <div class="prose">
      <div class="prose-placeholder">
        ${escapeHtml(content ? content.intro : 'Content for this page goes here.')}
        <br/><br/>
        This is a placeholder — edit <code>src/config.js</code> (STATIC_CONTENT) to add the real guide content from your current site.
      </div>
    </div>
  `;
}

/* ---------------- History (all sections combined) ---------------- */

export async function renderHistoryPage(main) {
  main.innerHTML = `
    <div class="topbar"><h1 class="page-title">History</h1></div>
    <div class="panel" id="history-list"><div class="empty-state">Loading\u2026</div></div>
  `;
  const listEl = main.querySelector('#history-list');
  try {
    const { data, error } = await supabase
      .from('entries')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);
    if (error) throw error;
    if (!data.length) {
      listEl.innerHTML = `<div class="empty-state">Nothing logged yet.</div>`;
      return;
    }
    listEl.innerHTML = `
      <table class="log-table">
        <thead><tr><th>When</th><th>Section</th><th>Summary</th></tr></thead>
        <tbody>
          ${data.map((r) => {
            const section = findSection(r.section);
            const summary = Object.values(r.data || {}).filter(Boolean).join(' \u2014 ');
            return `<tr>
              <td class="ts">${fmtDate(r.created_at)}</td>
              <td>${escapeHtml(section ? section.title : r.section)}</td>
              <td>${escapeHtml(summary).slice(0, 140)}</td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    `;
  } catch (err) {
    listEl.innerHTML = `<div class="empty-state">Couldn't load history (${escapeHtml(err.message)}).</div>`;
  }
}

export { NAV_GROUPS };
