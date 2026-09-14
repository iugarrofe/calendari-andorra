(() => {
  "use strict";

  const MESOS = ['Gener','Febrer','Març','Abril','Maig','Juny','Juliol','Agost','Setembre','Octubre','Novembre','Desembre'];
  const DIES_SETMANA = ['Dl','Dt','Dc','Dj','Dv','Ds','Dg'];
  const DIES_LLARGS = ['Dilluns','Dimarts','Dimecres','Dijous','Divendres','Dissabte','Diumenge'];

  const GREEN = '#34c759';
  const ESPANYA_RED = '#ff3b30';
  const ORANGE = '#ff9f0a';

  const STORE_KEY = 'calendariAdEs.marks.v1';

  const today = new Date();
  const todayId = dateId(today.getFullYear(), today.getMonth(), today.getDate());

  const state = {
    marks: loadMarks(),
    calYear: today.getFullYear(),
    sheet: { open: false, sel: null, period: null },
    tab: 'today',
  };

  function loadMarks() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch { return {}; }
  }
  function saveMarks() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state.marks)); } catch {}
  }

  function dateId(y, m, d) { return y + '-' + m + '-' + d; }
  function colorOf(v) { return v === 'AD' ? GREEN : v === 'ES' ? ESPANYA_RED : null; }

  function dayFill(day) {
    if (!day) return null;
    const cs = ['dia', 'nit'].map(k => colorOf(day[k]));
    const set = cs.filter(Boolean);
    if (!set.length) return null;
    if (set.length === 2 && cs[0] === cs[1]) return cs[0];
    const seg = cs.map(c => c || 'rgba(255,255,255,0.10)');
    return 'linear-gradient(180deg,' + seg[0] + ' 0 50%,' + seg[1] + ' 50% 100%)';
  }
  function dayInk(day) {
    if (!day) return '#fff';
    const cs = ['dia', 'nit'].map(k => colorOf(day[k]));
    if (cs[0] && cs[0] === cs[1] && day.dia === 'AD') return '#04240f';
    return '#fff';
  }

  function getMark(id) { return state.marks[id] || null; }
  function setMark(id, patch) {
    const day = { ...(state.marks[id] || {}), ...patch };
    const hasAny = day.dia || day.nit || day.tiquet;
    if (hasAny) state.marks = { ...state.marks, [id]: day };
    else { const m = { ...state.marks }; delete m[id]; state.marks = m; }
    saveMarks();
  }
  function clearDay(id) {
    const m = { ...state.marks };
    delete m[id];
    state.marks = m;
    saveMarks();
  }

  // ---------- stats ----------
  function yearStats(year) {
    const counts = { AD: 0, ES: 0 };
    for (const id in state.marks) {
      const y = Number(id.split('-')[0]);
      if (y !== year) continue;
      const d = state.marks[id];
      ['dia', 'nit'].forEach(k => { if (d[k]) counts[d[k]]++; });
    }
    const total = counts.AD + counts.ES;
    const pctAD = total ? Math.round(counts.AD / total * 100) : 0;
    const pctES = total ? 100 - pctAD : 0;
    const fmt = n => (n / 2).toFixed(1).replace(/\.0$/, '').replace('.', ',');
    return {
      AD: { count: counts.AD, days: fmt(counts.AD), pct: pctAD },
      ES: { count: counts.ES, days: fmt(counts.ES), pct: pctES },
    };
  }

  // ---------- render: AVUI ----------
  function renderToday() {
    const w = DIES_LLARGS[(today.getDay() + 6) % 7];
    document.getElementById('today-title').textContent =
      w + ' ' + today.getDate() + ' de ' + MESOS[today.getMonth()].toLowerCase();

    const stats = yearStats(today.getFullYear());
    const day = getMark(todayId) || {};
    const activeAD = day.dia === 'AD' && day.nit === 'AD';
    const activeES = day.dia === 'ES' && day.nit === 'ES';

    const cardAD = document.getElementById('card-andorra');
    const cardES = document.getElementById('card-espanya');
    cardAD.dataset.active = String(activeAD);
    cardES.dataset.active = String(activeES);

    document.getElementById('days-andorra').textContent =
      stats.AD.days + (stats.AD.days === '1' ? ' dia equivalent' : ' dies equivalents');
    document.getElementById('pct-andorra').textContent = stats.AD.pct + '%';
    document.getElementById('count-andorra').textContent = fr(stats.AD.count);

    document.getElementById('days-espanya').textContent =
      stats.ES.days + (stats.ES.days === '1' ? ' dia equivalent' : ' dies equivalents');
    document.getElementById('pct-espanya').textContent = stats.ES.pct + '%';
    document.getElementById('count-espanya').textContent = fr(stats.ES.count);
  }
  function fr(n) { return n + (n === 1 ? ' franja marcada' : ' franges marcades'); }

  function toggleTodayCountry(country) {
    const day = getMark(todayId) || {};
    const already = day.dia === country && day.nit === country;
    if (already) setMark(todayId, { dia: undefined, nit: undefined });
    else setMark(todayId, { dia: country, nit: country });
    renderToday();
    if (state.tab === 'calendar') renderCalendar();
  }

  // ---------- render: CALENDARI ----------
  function renderWeekdayRow() {
    const row = document.getElementById('weekday-row');
    row.innerHTML = DIES_SETMANA.map(d => '<span>' + d + '</span>').join('');
  }

  function monthGrid(year, month) {
    const first = new Date(year, month, 1);
    const start = (first.getDay() + 6) % 7;
    const days = new Date(year, month + 1, 0).getDate();
    let html = '';
    for (let i = 0; i < start; i++) html += '<div class="day-cell empty"></div>';
    for (let d = 1; d <= days; d++) {
      const id = dateId(year, month, d);
      const isToday = id === todayId;
      const mark = getMark(id);
      const fill = dayFill(mark);
      const ink = fill ? dayInk(mark) : (isToday ? '#ff453a' : '#fff');
      const bg = fill ? fill : (isToday ? 'rgba(255,69,58,0.22)' : 'transparent');
      const weight = fill || isToday ? 600 : 400;
      const tsh = fill && ink === '#fff' ? 'text-shadow:0 1px 2px rgba(0,0,0,0.55);' : '';
      const dot = mark && mark.tiquet ? ORANGE : 'transparent';
      html += '<button class="day-cell" data-id="' + id + '">' +
        '<div class="day-num" style="background:' + bg + ';color:' + ink + ';font-weight:' + weight + ';' + tsh + '">' + d + '</div>' +
        '<div class="day-dot" style="background:' + dot + '"></div>' +
        '</button>';
    }
    return html;
  }

  function renderCalendar() {
    document.getElementById('cal-year').textContent = state.calYear;
    const scroll = document.getElementById('cal-scroll');
    let html = '';
    for (let m = 0; m < 12; m++) {
      html += '<div class="month-block">' +
        '<div class="month-label">' + MESOS[m] + '</div>' +
        '<div class="month-grid">' + monthGrid(state.calYear, m) + '</div>' +
        '</div>';
    }
    scroll.innerHTML = html;
  }

  // ---------- sheet ----------
  function openSheet(id) {
    state.sheet = { open: true, sel: id, period: null };
    renderSheet();
    document.getElementById('sheet-backdrop').classList.remove('hidden');
    document.getElementById('sheet').classList.remove('hidden');
  }
  function closeSheet() {
    state.sheet = { open: false, sel: null, period: null };
    document.getElementById('sheet-backdrop').classList.add('hidden');
    document.getElementById('sheet').classList.add('hidden');
    renderCalendar();
    renderToday();
  }

  function renderSheet() {
    const id = state.sheet.sel;
    if (!id) return;
    const day = getMark(id) || {};
    const parts = id.split('-').map(Number);
    document.getElementById('sheet-title').textContent = parts[2] + ' ' + MESOS[parts[1]].toLowerCase();

    const per = state.sheet.period;
    const PL = { dia: 'Dia', nit: 'Nit' };
    document.getElementById('sheet-subtitle').textContent = per ? PL[per] : '';

    const periodsEl = document.getElementById('sheet-periods');
    const countryEl = document.getElementById('sheet-country');

    if (!per) {
      periodsEl.classList.remove('hidden');
      countryEl.classList.add('hidden');
      const HINT = { dia: 'Matí i tarda', nit: 'Vespre i nit' };
      let html = '';
      ['dia', 'nit'].forEach(k => {
        const v = day[k];
        const c = colorOf(v);
        const value = v === 'AD' ? 'Andorra' : v === 'ES' ? 'Espanya' : 'Sense marcar';
        html += '<button class="period-row" data-period="' + k + '">' +
          '<span class="period-chip" style="background:' + (c || 'rgba(255,255,255,0.12)') + '"></span>' +
          '<span class="period-info">' +
            '<div class="period-label">' + PL[k] + '</div>' +
            '<div class="period-hint">' + HINT[k] + '</div>' +
          '</span>' +
          '<span class="period-value" style="color:' + (c || '#8e8e93') + '">' + value + '</span>' +
          '<span class="period-arrow" style="color:#48484a">›</span>' +
          '</button>';
      });
      const tiquetOn = !!day.tiquet;
      html += '<button class="period-row" id="toggle-tiquet">' +
        '<span class="period-chip" style="background:' + (tiquetOn ? ORANGE : 'rgba(255,255,255,0.12)') + '"></span>' +
        '<span class="period-info">' +
          '<div class="period-label">Tiquet</div>' +
          '<div class="period-hint">Marca el dia sencer</div>' +
        '</span>' +
        '<span class="period-value" style="color:' + (tiquetOn ? ORANGE : '#8e8e93') + '">' + (tiquetOn ? 'Activat' : 'Desactivat') + '</span>' +
        '<span class="period-arrow" style="color:' + (tiquetOn ? ORANGE : '#48484a') + '">' + (tiquetOn ? '✓' : '○') + '</span>' +
        '</button>';
      periodsEl.innerHTML = html;
    } else {
      periodsEl.classList.add('hidden');
      countryEl.classList.remove('hidden');
      const cur = day[per];
      paintCountryCard('andorra', 'AD', cur);
      paintCountryCard('espanya', 'ES', cur);
    }
  }

  function paintCountryCard(suffix, code, cur) {
    const card = document.getElementById('pick-' + suffix);
    const check = document.getElementById('check-' + suffix);
    const color = code === 'AD' ? GREEN : ESPANYA_RED;
    const active = cur === code;
    card.style.background = active ? color : 'rgba(255,255,255,0.07)';
    card.style.borderColor = active ? color : 'rgba(255,255,255,0.1)';
    const ink = active ? (code === 'AD' ? '#000' : '#fff') : color;
    card.querySelector('.country-name').style.color = ink;
    check.style.color = ink;
    check.textContent = active ? '✓' : '';
  }

  function setPeriodCountry(mark) {
    const id = state.sheet.sel, per = state.sheet.period;
    if (!id || !per) return;
    const day = getMark(id) || {};
    const next = day[per] === mark ? undefined : mark;
    setMark(id, { [per]: next });
    renderSheet();
  }

  // ---------- tabs ----------
  function switchTab(tab) {
    state.tab = tab;
    document.querySelectorAll('.screen').forEach(el => el.classList.add('hidden'));
    document.getElementById('screen-' + tab).classList.remove('hidden');
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
    if (tab === 'today') renderToday();
    if (tab === 'calendar') renderCalendar();
  }

  // ---------- wiring ----------
  function init() {
    renderWeekdayRow();
    switchTab('today');

    document.querySelectorAll('.tab-btn').forEach(b => {
      b.addEventListener('click', () => switchTab(b.dataset.tab));
    });

    document.getElementById('card-andorra').addEventListener('click', () => toggleTodayCountry('AD'));
    document.getElementById('card-espanya').addEventListener('click', () => toggleTodayCountry('ES'));

    document.getElementById('year-prev').addEventListener('click', () => { state.calYear--; renderCalendar(); });
    document.getElementById('year-next').addEventListener('click', () => { state.calYear++; renderCalendar(); });

    document.getElementById('cal-scroll').addEventListener('click', e => {
      const cell = e.target.closest('.day-cell');
      if (cell && cell.dataset.id) openSheet(cell.dataset.id);
    });

    document.getElementById('sheet-backdrop').addEventListener('click', closeSheet);
    document.getElementById('sheet-done').addEventListener('click', closeSheet);
    document.getElementById('sheet-clear').addEventListener('click', () => {
      clearDay(state.sheet.sel);
      renderSheet();
    });
    document.getElementById('sheet-back').addEventListener('click', () => {
      state.sheet.period = null;
      renderSheet();
    });
    document.getElementById('pick-andorra').addEventListener('click', () => setPeriodCountry('AD'));
    document.getElementById('pick-espanya').addEventListener('click', () => setPeriodCountry('ES'));

    document.getElementById('sheet-periods').addEventListener('click', e => {
      const toggle = e.target.closest('#toggle-tiquet');
      if (toggle) {
        const id = state.sheet.sel;
        const day = getMark(id) || {};
        setMark(id, { tiquet: !day.tiquet });
        renderSheet();
        return;
      }
      const row = e.target.closest('.period-row[data-period]');
      if (row) {
        state.sheet.period = row.dataset.period;
        renderSheet();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', init);

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').catch(() => {});
    });
  }
})();
