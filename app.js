(() => {
'use strict';

/* =========================================================
   Pakka prototype
   One trip, one person (the organiser), five screens after the hook.
   All people, budgets and payments are made up.
   ========================================================= */

/* ---------- data ---------- */

// Friends' answers are pre-filled so the organiser can see the group's replies come in.
// fri / wk = what they usually are on Fridays and Mon-Thu. Weekends default to green.
const PEOPLE = [
  { id: 'aman',  name: 'Aman',  tint: '#FFD9B8', vibes: ['hills', 'wild'],    budget: 9000,  fri: 'g', wk: 'r',
    over: [['2026-11-13', '2026-11-15', 'r'], ['2026-12-04', '2026-12-06', 'o']] },
  { id: 'riya',  name: 'Riya',  tint: '#FFC9D6', vibes: ['beach', 'culture'], budget: 8000,  fri: 'o', wk: 'r',
    over: [['2026-11-20', '2026-11-22', 'r'], ['2026-12-24', '2026-12-27', 'g']] },
  { id: 'karan', name: 'Karan', tint: '#C9E7FF', vibes: ['hills', 'beach'],   budget: 12000, fri: 'g', wk: 'o',
    over: [['2026-11-06', '2026-11-08', 'r'], ['2026-12-24', '2026-12-31', 'g']] },
  { id: 'meera', name: 'Meera', tint: '#D6F0C8', vibes: ['beach', 'hills'],   budget: 7000,  fri: 'o', wk: 'r',
    over: [['2026-11-27', '2026-11-29', 'o'], ['2026-12-11', '2026-12-13', 'r']] },
  { id: 'rohan', name: 'Rohan', tint: '#E4D4FF', vibes: ['culture', 'hills'], budget: 10000, fri: 'o', wk: 'r',
    over: [['2026-12-11', '2026-12-13', 'r'], ['2026-12-25', '2026-12-27', 'o']] },
];
const ALL = [{ id: 'you', name: 'You' }].concat(PEOPLE);
const person = id => ALL.find(p => p.id === id);
const tag = id => (id === 'you' ? 'Y' : person(id).name.slice(0, 2));

const VIBES = [
  { id: 'hills',   label: 'Hills',   icon: '🏔️' },
  { id: 'beach',   label: 'Beach',   icon: '🏖️' },
  { id: 'wild',    label: 'Wild',    icon: '🐅' },
  { id: 'culture', label: 'Culture', icon: '🏛️' },
];
const vibeIcon = id => VIBES.find(v => v.id === id).icon;

// Rough per-head costs from Bengaluru: base = travel, day = stay + food + local.
const PLACES = [
  { id: 'chikmagalur', name: 'Chikmagalur', vibes: ['hills'],             base: 1200, day: 1900, blurb: 'Coffee estates, cold mornings, a homestay with a bonfire.' },
  { id: 'coorg',       name: 'Coorg',       vibes: ['hills'],             base: 1500, day: 2000, blurb: 'Misty drives and waterfalls. Busier than it used to be.' },
  { id: 'wayanad',     name: 'Wayanad',     vibes: ['hills'],             base: 1800, day: 2100, blurb: 'Short treks, lakes and a lot of green.' },
  { id: 'munnar',      name: 'Munnar',      vibes: ['hills'],             base: 2800, day: 2300, blurb: 'Tea hills. Worth it if nobody minds the long drive.' },
  { id: 'gokarna',     name: 'Gokarna',     vibes: ['beach'],             base: 2500, day: 1800, blurb: 'Quiet beaches, cheap shacks, the Om Beach trek.' },
  { id: 'varkala',     name: 'Varkala',     vibes: ['beach'],             base: 3500, day: 1700, blurb: 'Cliff cafes and a calm shoreline.' },
  { id: 'goa',         name: 'Goa',         vibes: ['beach'],             base: 3000, day: 2800, blurb: 'Easy to plan, easier to overspend.' },
  { id: 'pondicherry', name: 'Pondicherry', vibes: ['beach', 'culture'],  base: 1800, day: 2200, blurb: 'French quarter by day, beach in the evening.' },
  { id: 'hampi',       name: 'Hampi',       vibes: ['culture'],           base: 1800, day: 1500, blurb: 'Ruins, boulders and sunset points.' },
  { id: 'kabini',      name: 'Kabini',      vibes: ['wild'],              base: 1800, day: 3200, blurb: 'Safari rides and a riverside stay.' },
];
const place = id => PLACES.find(p => p.id === id);

/* ---------- calendar helpers ---------- */

const WD = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MFULL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const pad = n => String(n).padStart(2, '0');
const iso = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parse = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };

const DAYS = [];
for (let d = new Date(2026, 10, 1); d <= new Date(2026, 11, 31); d = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1)) DAYS.push(new Date(d));
const ISOS = DAYS.map(iso);

function fmtRange(a, b) {
  const s = parse(a), e = parse(b);
  if (s.getMonth() === e.getMonth()) return `${WD[s.getDay()]} ${s.getDate()} – ${WD[e.getDay()]} ${e.getDate()} ${MN[e.getMonth()]}`;
  return `${WD[s.getDay()]} ${s.getDate()} ${MN[s.getMonth()]} – ${WD[e.getDay()]} ${e.getDate()} ${MN[e.getMonth()]}`;
}

/* ---------- state ---------- */

const S = {
  step: 0,
  name: 'Winter trip',
  days: 3,
  vibes: ['hills', 'beach'],
  budget: 9000,
  destId: null,
  mine: {},          // iso -> 'g' | 'o' | 'r'
  view: 'mine',
  winStart: null,    // iso of chosen window start
  pct: 50,
  rule: 'share',
  joined: [],
  sent: false,
  paid: {},          // id -> true
  nudged: false,
  bailWho: 'aman',
  bailed: false,
};

const inr = n => '₹' + Math.round(n).toLocaleString('en-IN');
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
const app = document.getElementById('app');

let timers = [];
const later = (fn, ms) => { const t = setTimeout(fn, ms); timers.push(t); return t; };
const clearTimers = () => { timers.forEach(clearTimeout); timers = []; };

/* ---------- logic: destination ---------- */

function placeCost(p) { return p.base + p.day * S.days; }

function rankPlaces() {
  const people = PEOPLE.map(x => ({ id: x.id, vibes: x.vibes, budget: x.budget }))
    .concat([{ id: 'you', vibes: S.vibes, budget: S.budget }]);
  return PLACES.map(p => {
    const cost = placeCost(p);
    let vibeMiss = 0, budgetMiss = 0;
    const ok = [];
    people.forEach(x => {
      const vibeOk = p.vibes.some(v => x.vibes.includes(v));
      if (!vibeOk) vibeMiss++;
      else if (x.budget < cost) budgetMiss++;
      else ok.push(x.id);
    });
    return { p, cost, ok, vibeMiss, budgetMiss };
  }).sort((a, b) => b.ok.length - a.ok.length || a.cost - b.cost);
}

function topPlaces() {
  const top = rankPlaces().slice(0, 3);
  if (!top.some(r => r.p.id === S.destId)) S.destId = top[0].p.id;
  return top;
}

const dest = () => (S.destId ? place(S.destId) : null);

/* ---------- logic: dates ---------- */

function friendState(p, i) {
  const k = ISOS[i];
  for (const [a, b, s] of p.over) if (k >= a && k <= b) return s;
  const dow = DAYS[i].getDay();
  if (dow === 0 || dow === 6) return 'g';
  return dow === 5 ? p.fri : p.wk;
}
const myState = i => S.mine[ISOS[i]] || null;
const hasMine = () => Object.keys(S.mine).length > 0;

function agg(states) {
  if (states.includes('r')) return 'r';
  if (states.some(s => s === 'o' || s === null)) return 'o';
  return 'g';
}

function rankWindows() {
  const L = S.days;
  const all = [];
  for (let i = 0; i + L <= DAYS.length; i++) {
    const idx = Array.from({ length: L }, (_, k) => i + k);
    const per = PEOPLE.map(p => ({ id: p.id, st: agg(idx.map(j => friendState(p, j))) }));
    if (hasMine()) per.push({ id: 'you', st: agg(idx.map(myState)) });
    const free = per.filter(x => x.st === 'g').length;
    const maybe = per.filter(x => x.st === 'o').length;
    const out = per.filter(x => x.st === 'r').length;
    all.push({ i, start: ISOS[i], end: ISOS[i + L - 1], per, free, maybe, out });
  }
  all.sort((a, b) => a.out - b.out || a.maybe - b.maybe || a.i - b.i);
  const picked = [];
  for (const w of all) {
    if (picked.every(p => Math.abs(p.i - w.i) >= L)) picked.push(w);
    if (picked.length === 3) break;
  }
  return picked;
}

function topWindows() {
  const top = rankWindows();
  if (!top.some(w => w.start === S.winStart)) S.winStart = top[0].start;
  return top;
}

function chosenWindow() {
  if (!S.winStart) return null;
  const i = ISOS.indexOf(S.winStart);
  return { start: S.winStart, end: ISOS[i + S.days - 1] };
}

/* ---------- logic: money ---------- */

function perHead() { const d = dest(); return d ? placeCost(d) : 0; }
function deposit() { return Math.round((perHead() * S.pct / 100) / 100) * 100; }
const paidCount = () => ALL.filter(p => S.paid[p.id]).length;
const allPaid = () => paidCount() === ALL.length;

/* ---------- small view helpers ---------- */

function av(id, size) {
  const p = person(id);
  const style = id === 'you' ? '' : `background:${p.tint};`;
  const sz = size ? `width:${size}px;height:${size}px;font-size:${Math.round(size * 0.42)}px;` : '';
  return `<span class="av ${id === 'you' ? 'me' : ''}" style="${style}${sz}" aria-hidden="true">${tag(id)}</span>`;
}

function ticket(mode) {
  const d = dest();
  const w = chosenWindow();
  const locked = S.step >= 4 && w && d;
  const where = d && S.step >= 2 ? d.name : '';
  const when = w && S.step >= 3 ? fmtRange(w.start, w.end) : '';
  const potDone = S.sent;
  const pot = potDone ? `${inr(deposit() * paidCount())} of ${inr(deposit() * ALL.length)}` : '';
  const slot = (label, val, empty) => `<div class="slot ${val ? 'done' : ''}"><span class="lbl">${label}</span><b>${val || empty}</b></div>`;
  return `
  <div class="ticket ${mode}" id="ticket">
    <div class="t-top"><span class="t-name" id="tname">${esc(S.name || 'Our trip')}</span><span class="t-brand">Pakka</span></div>
    <div class="t-perf"></div>
    <div class="t-slots">
      ${slot('Where', where, 'Not decided')}
      ${slot('When', when, 'Not decided')}
      ${slot('Money in', pot, locked ? 'Not started' : 'Nothing yet')}
    </div>
    ${mode === 'full' ? '<div class="stamp" id="stamp">Pakka</div>' : ''}
  </div>`;
}

function esc(s) { return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }

function refreshTicket() {
  const t = $('#ticket');
  if (!t) return;
  const mode = t.classList.contains('full') ? 'full' : 'mini';
  t.outerHTML = ticket(mode);
}

/* =========================================================
   Screens
   ========================================================= */

const STEP_NAMES = ['', 'Invite', 'Where', 'When', 'Lock in', 'Pakka'];

/* ----- 0: the chat that dies ----- */

const CHAT = [
  { k: 'in',  who: 'Riya',  c: '#C2185B', t: 'guys we should go somewhere before the year ends 🏔️' },
  { k: 'in',  who: 'Karan', c: '#1565C0', t: 'YESSS finally' },
  { k: 'in',  who: 'Aman',  c: '#E65100', t: "I'm in, whenever" },
  { k: 'in',  who: 'Meera', c: '#2E7D32', t: 'where tho' },
  { k: 'in',  who: 'Karan', c: '#1565C0', t: 'anywhere chalega' },
  { k: 'out', t: 'ok someone put dates' },
  { k: 'in',  who: 'Aman',  c: '#E65100', t: 'will check' },
  { k: 'gap', t: '4 days later' },
  { k: 'out', t: 'so are we going??' },
  { k: 'in',  who: 'Riya',  c: '#C2185B', t: 'work is a mess rn' },
  { k: 'in',  who: 'Karan', c: '#1565C0', t: 'maybe next month?' },
  { k: 'gap', t: '3 weeks later' },
  { k: 'out', t: 'ok forget it 🙃', seen: true },
];

function screen0() {
  return {
    html: () => `
      <div class="intro">
        <div class="wordmark">Pakka <small>prototype</small></div>
        <div class="chat" role="img" aria-label="A group chat where a trip plan slowly fades out">
          <div class="chat-head"><div class="ic">🏔️</div><div><b>Winter trip 🏔️</b><small>You, Aman, Riya, Karan, Meera, Rohan</small></div></div>
          <div class="chat-body" id="chat"></div>
        </div>
        <div id="after"></div>
      </div>`,
    mount() {
      const box = $('#chat');
      let t = 500;
      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        const sk = $('[data-act="skipchat"]'); if (sk) sk.remove();
        $('#after').innerHTML = `
          <div class="hook">
            <h2>Most trips die right here.</h2>
            <p>Nobody picked a place, nobody picked dates, and nobody has put a rupee down. So when work shows up, the trip is the easiest thing to drop.</p>
            <button class="btn grow" style="width:100%" data-act="start">Make this one pakka</button>
          </div>`;
        $('#after').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      };
      CHAT.forEach((m, i) => {
        later(() => {
          const el = document.createElement('div');
          if (m.k === 'gap') { el.className = 'gap'; el.textContent = m.t; }
          else {
            el.className = 'msg ' + m.k;
            el.innerHTML = (m.who ? `<span class="who" style="color:${m.c}">${m.who}</span>` : '') + esc(m.t) + (m.seen ? '<span class="seen">✓✓</span>' : '');
          }
          box.appendChild(el);
          if (i === CHAT.length - 1) later(finish, 700);
        }, t);
        t += m.k === 'gap' ? 900 : 1000;
      });
      S._skip = () => { clearTimers(); box.innerHTML = ''; CHAT.forEach(m => {
        const el = document.createElement('div');
        if (m.k === 'gap') { el.className = 'gap'; el.textContent = m.t; }
        else { el.className = 'msg ' + m.k; el.style.animation = 'none';
          el.innerHTML = (m.who ? `<span class="who" style="color:${m.c}">${m.who}</span>` : '') + esc(m.t) + (m.seen ? '<span class="seen">✓✓</span>' : ''); }
        box.appendChild(el);
      }); finish(); };
      const skip = document.createElement('button');
      skip.className = 'linkbtn skip';
      skip.textContent = 'Skip the chat';
      skip.dataset.act = 'skipchat';
      $('#after').before(skip);
    },
  };
}

/* ----- 1: invite ----- */

function screen1() {
  return {
    html: () => `
      ${ticket('mini')}
      <h2 class="title">Start the trip. Skip the group-chat nagging.</h2>
      <p class="lede">Name it, say how long, and send one link. Friends answer on their phones. No app to install.</p>

      <label class="label" for="nameIn">Trip name</label>
      <input id="nameIn" class="field" value="${esc(S.name)}" maxlength="28" autocomplete="off">

      <span class="label">How long?</span>
      <div class="seg" role="group" aria-label="Trip length">
        ${[2, 3, 4].map(n => `<button data-act="len" data-v="${n}" aria-pressed="${S.days === n}">${n} days</button>`).join('')}
      </div>

      <span class="label">Send this link to the group</span>
      <div class="link-card"><span id="linkTxt"></span><button class="btn small wa" data-act="share">Send on WhatsApp</button></div>

      <span class="label">Who has joined</span>
      <div class="people" id="joinList"></div>
    `,
    mount() {
      $('#linkTxt').textContent = location.href.replace(/^https?:\/\//, '').replace(/index\.html$/, '');
      renderJoin();
      const order = PEOPLE.map(p => p.id);
      order.forEach((id, i) => {
        if (S.joined.includes(id)) return;
        later(() => { if (!S.joined.includes(id)) S.joined.push(id); renderJoin(); updateBar(); }, 1100 + i * 900);
      });
    },
  };
}

function renderJoin() {
  const box = $('#joinList');
  if (!box) return;
  box.innerHTML = ALL.map(p => {
    const here = p.id === 'you' || S.joined.includes(p.id);
    const st = p.id === 'you' ? 'Organiser' : here ? 'Joined' : 'Waiting';
    return `<div class="person">${av(p.id)}<span class="nm">${p.name}</span><span class="st ${here ? 'ok' : 'wait'}">${st}</span></div>`;
  }).join('');
}

/* ----- 2: where ----- */

function screen2() {
  return {
    html: () => `
      ${ticket('mini')}
      <h2 class="title">Where, without the 40-message debate</h2>
      <p class="lede">Everyone answers two things privately: what kind of place, and what they can spend. We find the overlap.</p>

      <span class="label">What are you up for?</span>
      <div class="chips" role="group" aria-label="Your vibes">
        ${VIBES.map(v => `<button class="chip" data-act="vibe" data-v="${v.id}" aria-pressed="${S.vibes.includes(v.id)}">${v.icon} ${v.label}</button>`).join('')}
      </div>

      <span class="label">Your budget for the whole trip</span>
      <div class="range-top"><b id="budOut">${inr(S.budget)}</b><span class="hint">per person, ${S.days} days</span></div>
      <input type="range" id="bud" min="4000" max="15000" step="500" value="${S.budget}" aria-label="Your budget">

      <span class="label">Best fits for the group</span>
      <div class="cards" id="places"></div>
      <p class="note">Budgets stay private. We only tell you how many people a place doesn't fit.</p>
    `,
    mount() { renderPlaces(); },
  };
}

function renderPlaces() {
  const box = $('#places');
  if (!box) return;
  const top = topPlaces();
  box.innerHTML = top.map(r => {
    const dots = ALL.map(p => `<span class="dot ${r.ok.includes(p.id) ? 'ok' : ''}" title="${p.name}: ${r.ok.includes(p.id) ? 'happy with this' : 'does not fit'}">${tag(p.id)}</span>`).join('');
    const miss = [];
    if (r.vibeMiss) miss.push(`${r.vibeMiss} ${r.vibeMiss === 1 ? 'person wants' : 'people want'} a different vibe`);
    if (r.budgetMiss) miss.push(`${r.budgetMiss} over budget`);
    return `
    <button class="pcard" data-act="dest" data-v="${r.p.id}" aria-pressed="${S.destId === r.p.id}">
      <div class="row"><h3>${r.p.name}</h3><span class="cost">${inr(r.cost)} each</span></div>
      <p>${vibeIcon(r.p.vibes[0])} ${r.p.blurb}</p>
      <div class="dots">${dots}<span class="count">${r.ok.length} of ${ALL.length} in</span></div>
      ${miss.length ? `<div class="miss">${miss.join(', ')}</div>` : ''}
    </button>`;
  }).join('');
  refreshTicket();
}

/* ----- 3: when ----- */

function screen3() {
  return {
    html: () => `
      ${ticket('mini')}
      <h2 class="title">Dates, the honest way</h2>
      <p class="lede">Tap a day to mark it. Most people aren't free or busy, they're somewhere in between. Orange says so.</p>

      <div class="legend" style="margin-top:12px">
        <div><i class="sw g"></i> Pakka. I'm there.</div>
        <div><i class="sw o"></i> I can make it work.</div>
        <div><i class="sw r"></i> Can't.</div>
      </div>

      <div class="tools">
        <div class="seg" style="width:150px" role="group" aria-label="Calendar view">
          <button data-act="view" data-v="mine" aria-pressed="${S.view === 'mine'}">Mine</button>
          <button data-act="view" data-v="group" aria-pressed="${S.view === 'group'}">Group</button>
        </div>
        <span style="display:flex;gap:10px">
          <button class="linkbtn" data-act="fill">Fill my usual week</button>
          <button class="linkbtn" data-act="clear">Clear</button>
        </span>
      </div>
      <div id="cal"></div>

      <span class="label">Best ${S.days}-day windows</span>
      <div class="wins" id="wins"></div>
    `,
    mount() { renderCal(); renderWins(); },
  };
}

function renderCal() {
  const box = $('#cal');
  if (!box) return;
  const win = chosenWindow();
  const winSet = new Set();
  if (win) { const i = ISOS.indexOf(win.start); for (let k = 0; k < S.days; k++) winSet.add(i + k); }
  let html = '';
  [10, 11].forEach(m => {
    const idxs = DAYS.map((d, i) => [d, i]).filter(([d]) => d.getMonth() === m);
    const lead = (idxs[0][0].getDay() + 6) % 7;
    html += `<div class="month"><h3>${MFULL[m]} 2026</h3><div class="grid">`;
    html += ['M', 'T', 'W', 'T', 'F', 'S', 'S'].map(x => `<div class="dow">${x}</div>`).join('');
    html += '<div class="cell blank"></div>'.repeat(lead);
    idxs.forEach(([d, i]) => {
      let cls = 'cell', inner = d.getDate(), label = `${WD[d.getDay()]} ${d.getDate()} ${MN[m]}`;
      let style = '';
      if (S.view === 'mine') {
        const st = myState(i);
        if (st) cls += ' ' + st;
      } else {
        const sts = PEOPLE.map(p => friendState(p, i)).concat(hasMine() && myState(i) ? [myState(i)] : []);
        const g = sts.filter(s => s === 'g').length, o = sts.filter(s => s === 'o').length;
        const score = (g + o * 0.5) / sts.length;
        cls += ' heat';
        style = `background:rgba(30,158,90,${(0.08 + score * 0.85).toFixed(2)});color:${score > 0.6 ? '#fff' : 'var(--ink)'};`;
        inner = `${d.getDate()}<small>${g}</small>`;
      }
      if (winSet.has(i)) cls += ' inwin';
      html += `<button class="${cls}" style="${style}" data-act="cell" data-v="${i}" aria-label="${label}">${inner}</button>`;
    });
    html += '</div></div>';
  });
  box.innerHTML = html;
}

function renderWins() {
  const box = $('#wins');
  if (!box) return;
  const top = topWindows();
  const has = hasMine();
  box.innerHTML = top.map(w => {
    const rings = w.per.map(x => `<span class="ring ${x.st}" title="${person(x.id).name}: ${x.st === 'g' ? 'free' : x.st === 'o' ? 'can adjust' : 'out'}">${tag(x.id)}</span>`).join('');
    const bits = [`${w.free} free`];
    if (w.maybe) bits.push(`${w.maybe} can adjust`);
    if (w.out) bits.push(`${w.out} out`);
    return `
    <button class="win" data-act="win" data-v="${w.start}" aria-pressed="${S.winStart === w.start}">
      <div class="row"><b>${fmtRange(w.start, w.end)}</b><span class="sum">${bits.join(', ')}</span></div>
      <div class="pp">${rings}</div>
    </button>`;
  }).join('') + (has ? '' : '<div class="waiting">This is just the other 5 so far. Mark your own days and it updates.</div>');
  refreshTicket();
  renderCalSoft();
  updateBar();
}

// redraw only the outline of the chosen window without rebuilding every handler
function renderCalSoft() {
  const win = chosenWindow();
  const idxStart = win ? ISOS.indexOf(win.start) : -1;
  $$('#cal .cell[data-v]').forEach(c => {
    const i = Number(c.dataset.v);
    c.classList.toggle('inwin', idxStart >= 0 && i >= idxStart && i < idxStart + S.days);
  });
}

/* ----- 4: lock in ----- */

function screen4() {
  return {
    html: () => {
      const d = dest(), w = chosenWindow();
      return `
      ${ticket('mini')}
      <h2 class="title">Money on the table makes it real</h2>
      <p class="lede">Everyone puts in a deposit now. It sits with Pakka until the trip. That's what turns "maybe" into "I'm going".</p>

      <div class="sumline" style="margin-top:14px"><b>${d.name}</b>, ${fmtRange(w.start, w.end)}<br><span class="hint">${inr(perHead())} per head, ${ALL.length} people</span></div>

      <span class="label">Deposit</span>
      <div class="range-top"><b id="depOut"></b><span class="hint" id="depPct"></span></div>
      <input type="range" id="pct" min="30" max="70" step="10" value="${S.pct}" aria-label="Deposit percentage" ${S.sent ? 'disabled' : ''}>

      <span class="label">If someone bails after locking</span>
      <div class="rules">
        <button class="rule" data-act="rule" data-v="share" aria-pressed="${S.rule === 'share'}" ${S.sent ? 'disabled' : ''}><b>Their deposit goes to the group</b><span>Shared equally among those still going.</span></button>
        <button class="rule" data-act="rule" data-v="half" aria-pressed="${S.rule === 'half'}" ${S.sent ? 'disabled' : ''}><b>Half back, half to the group</b><span>Gentler. Still stings enough to think twice.</span></button>
      </div>
      <p class="note">Everyone gets a full refund if they back out within 48 hours of paying. After that, the rule above applies.</p>

      <div class="pot">
        <div class="big" id="potBig"></div>
        <div class="meter"><i id="potBar"></i></div>
      </div>

      <div class="people" id="payList"></div>
      <div style="margin-top:14px" id="payAct"></div>
      <p class="note">Prototype. Payments here are pretend.</p>`;
    },
    mount() { renderLock(); if (S.sent) schedulePayments(); },
  };
}

function renderLock() {
  const dep = deposit();
  const o = $('#depOut');
  if (!o) return;
  o.textContent = inr(dep);
  $('#depPct').textContent = `${S.pct}% of the trip, each`;
  $('#potBig').innerHTML = `${inr(dep * paidCount())} <small>of ${inr(dep * ALL.length)} in</small>`;
  $('#potBar').style.width = (paidCount() / ALL.length * 100) + '%';
  $('#payList').innerHTML = ALL.map(p => {
    const paid = S.paid[p.id];
    let st = '<span class="st">Not asked yet</span>';
    if (S.sent) st = paid ? '<span class="st ok">Paid</span>' : '<span class="st wait">Waiting</span>';
    const nudge = S.sent && !paid && p.id === 'rohan' ? `<button class="btn small ghost" data-act="nudge">${S.nudged ? 'Nudged' : 'Nudge on WhatsApp'}</button>` : '';
    return `<div class="person">${av(p.id)}<span class="nm">${p.name}</span>${nudge || st}</div>`;
  }).join('');
  $('#payAct').innerHTML = S.sent ? '' : `<button class="btn" style="width:100%" data-act="pay">Send to the group and pay ${inr(dep)}</button>`;
  refreshTicket();
  updateBar();
}

function schedulePayments() {
  const plan = { aman: 1200, riya: 2300, karan: 3300, meera: 4500 };
  Object.entries(plan).forEach(([id, ms]) => {
    if (S.paid[id]) return;
    later(() => { S.paid[id] = true; if (S.step === 4) renderLock(); }, ms);
  });
}

/* ----- 5: pakka ----- */

function screen5() {
  const d = dest(), w = chosenWindow();
  return {
    html: () => `
      ${ticket('full')}
      <h2 class="title">${esc(S.name)} is on.</h2>
      <p class="lede">${d.name}, ${fmtRange(w.start, w.end)}. ${inr(deposit() * ALL.length)} is in, from ${ALL.length} people who all said yes with money.</p>
      <div class="sharerow">
        <button class="btn wa" data-act="shareFinal">Tell the group</button>
        <button class="btn ghost" data-act="restart">Start over</button>
      </div>

      <section class="bail">
        <h3>Now the part that usually breaks a trip</h3>
        <p class="hint" style="margin-top:6px">Someone bails two weeks before. Pick who and see what happens.</p>
        <div class="chips" role="group" aria-label="Who bails">
          ${PEOPLE.map(p => `<button class="chip" data-act="bailwho" data-v="${p.id}" aria-pressed="${S.bailWho === p.id}">${p.name}</button>`).join('')}
        </div>
        <button class="btn" data-act="bail" ${S.bailed ? 'disabled' : ''}>${person(S.bailWho).name} bails</button>
        ${S.bailed ? `<button class="linkbtn" style="margin-left:12px" data-act="unbail">Undo</button>` : ''}
        <div id="bailOut"></div>
      </section>
    `,
    mount() {
      later(() => { const s = $('#stamp'); if (s) s.classList.add('slam'); }, 350);
      if (S.bailed) renderBail();
    },
  };
}

function renderBail() {
  const out = $('#bailOut');
  if (!out) return;
  const dep = deposit();
  const others = ALL.length - 1;
  const refund = S.rule === 'half' ? dep / 2 : 0;
  const credit = (dep - refund) / others;
  const who = person(S.bailWho).name;
  const w = chosenWindow();
  out.innerHTML = `
    <div class="result">
      <div class="math">
        <div><span>${who} paid in</span><b>${inr(dep)}</b></div>
        <div><span>${who} gets back</span><b>${inr(refund)}</b></div>
        <div><span>Each of the other ${others} gets off their final payment</span><b>${inr(credit)}</b></div>
      </div>
      <div class="bubble-pakka"><span class="who">Pakka</span>${who} can't make it. ${refund ? `${inr(refund)} goes back to ${who}, and the rest` : `Their ${inr(dep)}`} is split across the ${others} of you: ${inr(credit)} off each. Still on for ${fmtRange(w.start, w.end)}?</div>
      <p class="note">One fewer person means a bigger share of the stay and the cab for everyone else. The deposit softens that, and nobody has to chase anyone for it.</p>
    </div>`;
}

/* =========================================================
   Chrome: top bar, bottom bar, navigation
   ========================================================= */

const SCREENS = [screen0, screen1, screen2, screen3, screen4, screen5];
let current = null;

function go(n) {
  clearTimers();
  S.step = n;
  current = SCREENS[n]();
  const top = n === 0 ? '' : `
    <header class="top">
      <button class="back" data-act="back" aria-label="Back">‹</button>
      <div class="prog" aria-hidden="true">${[1, 2, 3, 4, 5].map(i => `<i class="${i <= n ? 'on' : ''}"></i>`).join('')}</div>
      <span class="stepname">${STEP_NAMES[n]}</span>
    </header>`;
  app.innerHTML = `${top}<div class="body" id="body">${current.html()}</div><div class="bar" id="bar"></div>`;
  $('#body').scrollTop = 0;
  window.scrollTo(0, 0);
  updateBar();
  current.mount();
}

function updateBar() {
  const bar = $('#bar');
  if (!bar) return;
  const n = S.step;
  const labels = { 1: 'Pick where to go', 2: 'Pick the dates', 3: 'Set the deposit', 4: 'Make it pakka' };
  if (n === 0 || n === 5) { bar.innerHTML = ''; return; }
  let disabled = false, label = labels[n];
  if (n === 1) { const j = S.joined.length; if (j < PEOPLE.length) label = `Pick where to go (${j} of ${PEOPLE.length} joined)`; }
  if (n === 3) disabled = !S.winStart;
  if (n === 4) disabled = !allPaid();
  bar.innerHTML = `<button class="btn grow" data-act="next" ${disabled ? 'disabled' : ''}>${label}</button>`;
}

/* =========================================================
   Events
   ========================================================= */

app.addEventListener('click', e => {
  const el = e.target.closest('[data-act]');
  if (!el || el.disabled) return;
  const v = el.dataset.v;
  switch (el.dataset.act) {
    case 'start': go(1); break;
    case 'skipchat': if (S._skip) S._skip(); el.remove(); break;
    case 'back': go(Math.max(0, S.step - 1)); break;
    case 'next': if (S.step === 1) topPlaces(); if (S.step === 2) topWindows(); go(S.step + 1); break;
    case 'restart': resetAll(); go(0); break;

    case 'len':
      S.days = Number(v);
      $$('[data-act="len"]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.v === v)));
      S.destId = null; S.winStart = null;
      break;
    case 'share': share(`Planning "${S.name}" on Pakka. Tell us what you're up for and which dates work, it takes two minutes: ${location.href}`); break;
    case 'shareFinal': {
      const d = dest(), w = chosenWindow();
      share(`${S.name} is pakka. ${d.name}, ${fmtRange(w.start, w.end)}. ${inr(deposit() * ALL.length)} is already in the pot.`);
      break;
    }

    case 'vibe': {
      const i = S.vibes.indexOf(v);
      if (i >= 0) { if (S.vibes.length > 1) S.vibes.splice(i, 1); } else S.vibes.push(v);
      $$('[data-act="vibe"]').forEach(b => b.setAttribute('aria-pressed', String(S.vibes.includes(b.dataset.v))));
      renderPlaces();
      break;
    }
    case 'dest': S.destId = v; renderPlaces(); break;

    case 'view': S.view = v; $$('[data-act="view"]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.v === v))); renderCal(); break;
    case 'cell': {
      const k = ISOS[Number(v)];
      const order = [undefined, 'g', 'o', 'r'];
      const next = order[(order.indexOf(S.mine[k]) + 1) % order.length];
      if (next) S.mine[k] = next; else delete S.mine[k];
      renderCal(); renderWins();
      break;
    }
    case 'fill':
      DAYS.forEach((d, i) => { const w = d.getDay(); S.mine[ISOS[i]] = (w === 0 || w === 6) ? 'g' : w === 5 ? 'o' : 'r'; });
      renderCal(); renderWins();
      break;
    case 'clear': S.mine = {}; renderCal(); renderWins(); break;
    case 'win': S.winStart = v; renderWins(); break;

    case 'rule': S.rule = v; $$('[data-act="rule"]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.v === v))); break;
    case 'pay':
      el.disabled = true; el.textContent = 'Paying…';
      later(() => { S.paid.you = true; S.sent = true; renderLock(); $('#pct').disabled = true; $$('.rule').forEach(b => b.disabled = true); schedulePayments(); }, 900);
      break;
    case 'nudge':
      if (S.nudged) break;
      S.nudged = true;
      share(`Rohan, the deposit for ${S.name} is the last one pending. Two minutes: ${location.href}`);
      renderLock();
      later(() => { S.paid.rohan = true; renderLock(); }, 1500);
      break;

    case 'bailwho':
      S.bailWho = v; S.bailed = false;
      $$('[data-act="bailwho"]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.v === v)));
      refreshBailButtons(); $('#bailOut').innerHTML = '';
      break;
    case 'bail': S.bailed = true; refreshBailButtons(); renderBail(); $('#bailOut').scrollIntoView({ behavior: 'smooth', block: 'nearest' }); break;
    case 'unbail': S.bailed = false; refreshBailButtons(); $('#bailOut').innerHTML = ''; break;
  }
});

app.addEventListener('input', e => {
  const t = e.target;
  if (t.id === 'nameIn') { S.name = t.value; const n = $('#tname'); if (n) n.textContent = S.name || 'Our trip'; }
  if (t.id === 'bud') { S.budget = Number(t.value); $('#budOut').textContent = inr(S.budget); renderPlaces(); }
  if (t.id === 'pct') { S.pct = Number(t.value); renderLock(); }
});

function refreshBailButtons() {
  const b = $('[data-act="bail"]');
  if (!b) return;
  b.disabled = S.bailed;
  b.textContent = `${person(S.bailWho).name} bails`;
  const u = $('[data-act="unbail"]');
  if (S.bailed && !u) b.insertAdjacentHTML('afterend', '<button class="linkbtn" style="margin-left:12px" data-act="unbail">Undo</button>');
  if (!S.bailed && u) u.remove();
}

function share(text) {
  window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank', 'noopener');
}

function resetAll() {
  Object.assign(S, {
    name: 'Winter trip', days: 3, vibes: ['hills', 'beach'], budget: 9000, destId: null, mine: {}, view: 'mine',
    winStart: null, pct: 50, rule: 'share', joined: [], sent: false, paid: {}, nudged: false, bailWho: 'aman', bailed: false,
  });
}

/* ---------- start ---------- */
// Deep-link for testing: index.html#3 jumps to a screen (fills in sensible defaults on the way).
const hash = Number((location.hash || '').slice(1));
if (hash >= 1 && hash <= 5) {
  S.joined = PEOPLE.map(p => p.id);
  topPlaces();
  if (hash >= 3) { topWindows(); }
  if (hash >= 4) { topWindows(); }
  if (hash >= 5) { ALL.forEach(p => S.paid[p.id] = true); S.sent = true; }
  go(hash);
} else {
  go(0);
}

})();
