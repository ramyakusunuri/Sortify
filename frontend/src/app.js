/* ═══════════════════════════════════════════════════════════
   SORTIFY FINAL — app.js  (Self-contained, no external deps)
   ═══════════════════════════════════════════════════════════ */

'use strict';

// ── CONSTANTS ─────────────────────────────────────────────────
const API = 'http://localhost:5000/api';
const BADGES_INFO = {
  first_sort:      { name:'First Step',      icon:'🚀', desc:'Ran your first algorithm' },
  bubble_master:   { name:'Bubble Master',   icon:'🫧', desc:'Visualized Bubble Sort 5+ times' },
  tree_climber:    { name:'Tree Climber',     icon:'🌳', desc:'Visualized a tree structure' },
  quiz_ace:        { name:'Quiz Ace',         icon:'🧠', desc:'Scored 100% on a round' },
  centurion:       { name:'Centurion',        icon:'💯', desc:'Answered 100 quiz questions' },
  speed_demon:     { name:'Speed Demon',      icon:'🏎️', desc:'Used Auto Run 5 times' },
  comparison_king: { name:'Comparison King', icon:'👑', desc:'1000+ total comparisons' },
  quick_pro:       { name:'Quick Pro',        icon:'⚡', desc:'Mastered Quick Sort' },
  perfectionist:   { name:'Perfectionist',   icon:'⭐', desc:'Perfect score on a quiz round' },
  rb_expert:       { name:'RB Expert',        icon:'🔴', desc:'Built a Red-Black Tree' },
};
const LEVELS = [
  {level:1,title:'Beginner',min:0},   {level:2,title:'Learner',min:100},
  {level:3,title:'Practitioner',min:300},{level:4,title:'Intermediate',min:600},
  {level:5,title:'Advanced',min:1000}, {level:6,title:'Expert',min:1500},
  {level:7,title:'Master',min:2200},   {level:8,title:'Grandmaster',min:3000},
];

// ── STATE ──────────────────────────────────────────────────────
let _token = localStorage.getItem('sf4_token') || null;
let _user  = JSON.parse(localStorage.getItem('sf4_user') || 'null');
let _dark  = localStorage.getItem('sf4_dark') === '1';

// Guest/local progress — ONLY used when no _token (guest mode)
// Reset completely each time a guest session starts
let _localProg = { comps:0, swaps:0, quizRight:0, quizTotal:0, algos:{}, vizAlgos:[], badges:[] };

// Simulator state
let _arr=[], _steps=[], _stepIdx=0, _comps=0, _swaps=0, _sorted=new Set();
let _isSetup=false, _autoTimer=null, _isAuto=false, _autoRuns=0;

// Tree state
let _tSteps=[], _tIdx=0, _tSetup=false, _tAuto=false, _tTimer=null, _kdPts=[];

// Quiz state
let _qSection='sorting', _qAlgo=null, _qScore=0, _qTotal=0;
let _qUsedMap={}, _qRoundMap={}, _qQueue=[], _qPos=0, _qAnswered=false;

// ── UTILS ──────────────────────────────────────────────────────
function $id(id) { return document.getElementById(id); }
function setText(id,v){ const e=$id(id); if(e) e.textContent=v; }
function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function fmtNum(n){ return n>=1000?(n/1000).toFixed(1)+'k':n; }
function timeAgo(ts){
  const d=(Date.now()-ts*1000)/1000;
  if(d<60) return 'just now'; if(d<3600) return Math.floor(d/60)+'m ago';
  if(d<86400) return Math.floor(d/3600)+'h ago'; return Math.floor(d/86400)+'d ago';
}
function getLvl(xp){
  let l=LEVELS[0];
  for(const lv of LEVELS){ if(xp>=lv.min) l=lv; }
  const idx=LEVELS.indexOf(l), nxt=LEVELS[idx+1];
  return {...l, next_min:nxt?nxt.min:l.min, pct:nxt?Math.min(100,Math.round((xp-l.min)/(nxt.min-l.min)*100)):100};
}
// Guest progress is in-memory only — never persisted to localStorage
// This ensures a new guest always starts fresh
function saveLocal(){ /* intentionally no-op — guest data is ephemeral */ }

// ── TOAST ──────────────────────────────────────────────────────
function toast(msg, type='') {
  const wrap=$id('toasts'); if(!wrap) return;
  const t=document.createElement('div');
  t.className='toast'+(type?' '+type:''); t.textContent=msg;
  wrap.appendChild(t);
  setTimeout(()=>{ t.style.opacity='0'; t.style.transform='translateY(10px)'; t.style.transition='all .3s'; setTimeout(()=>t.remove(),300); },2600);
}

// ── THEME ──────────────────────────────────────────────────────
function applyTheme(){
  document.documentElement.setAttribute('data-theme',_dark?'dark':'');
  const btn=$id('theme-btn'); if(btn) btn.classList.toggle('on',_dark);
}
function toggleTheme(){ _dark=!_dark; localStorage.setItem('sf4_dark',_dark?'1':'0'); applyTheme(); }

// ── PAGE ROUTING ───────────────────────────────────────────────
function showPage(id){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  const pg=$id('page-'+id);
  if(pg){ pg.classList.add('active'); }
}

// ── VIEW ROUTING ───────────────────────────────────────────────
const VIEW_TITLES={ dashboard:'Dashboard',simulator:'Sorting Visualizer',trees:'Tree Visualizer',compare:'Compare Algorithms',quiz:'Practice Quiz',progress:'My Progress' };
function showView(id){
  document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
  const v=$id('view-'+id); if(v) v.classList.add('active');
  document.querySelectorAll('.sb-item').forEach(s=>s.classList.remove('active'));
  const sb=$id('sb-'+id); if(sb) sb.classList.add('active');
  setText('topbar-title', VIEW_TITLES[id]||id);
  if(id==='dashboard') loadDashboard();
  if(id==='progress')  loadProgress();
  if(id==='quiz' && !_qAlgo) initQuiz('sorting');
  if(id==='trees'){ renderTreeCx($id('tree-sel').value); renderTreePseudo($id('tree-sel').value); renderTreeExp($id('tree-sel').value); }
}

// ── AUTH ROUTING ───────────────────────────────────────────────
function goToAuth(tab){
  if(tab==='landing'){ showPage('landing'); return; }
  showPage('auth');
  switchAuthTab(tab||'login');
}
function switchAuthTab(tab){
  $id('auth-login-panel').style.display = tab==='login'?'':'none';
  $id('auth-reg-panel').style.display   = tab==='register'?'':'none';
  $id('tab-login').classList.toggle('active',tab==='login');
  $id('tab-register').classList.toggle('active',tab==='register');
  $id('auth-form-title').textContent = tab==='login'?'Welcome back':'Create account';
  $id('auth-form-sub').textContent   = tab==='login'?'Sign in to continue your learning journey':'Join Sortify and start mastering algorithms';
  document.querySelectorAll('.form-error').forEach(e=>{ e.textContent=''; e.classList.remove('show'); });
}

function startGuest(){
  _token=null; _user=null;
  // Always start FRESH for guest - clear any previous user's local data
  _localProg = {comps:0,swaps:0,quizRight:0,quizTotal:0,algos:{},vizAlgos:[],badges:[]};
  localStorage.removeItem('sf4_local');
  localStorage.removeItem('sf4_session');
  // Reset all runtime state
  _qUsedMap={}; _qRoundMap={}; _qQueue=[]; _qPos=0; _qScore=0; _qTotal=0;
  showPage('app'); showView('dashboard');
  updateUserUI();
  // Hide resume button for guest
  const rb=$id('resume-btn'); if(rb) rb.style.display='none';
  toast('Guest mode — fresh session started');
}

// ── AUTH FORM ERRORS ───────────────────────────────────────────
function setErr(id,msg){ const e=$id(id); if(e){e.textContent=msg;e.classList.add('show');} }
function clearErrs(){ document.querySelectorAll('.form-error').forEach(e=>{e.textContent='';e.classList.remove('show');}); }

// ── API CALL ───────────────────────────────────────────────────
async function apiCall(ep, method='GET', body=null){
  const opts={ method, headers:{'Content-Type':'application/json',...(_token?{'Authorization':'Bearer '+_token}:{})} };
  if(body) opts.body=JSON.stringify(body);
  try{
    const r=await fetch(API+ep,opts);
    const d=await r.json();
    return {ok:r.ok, data:d};
  }catch{ return {ok:false, data:{error:'Server unavailable — running in offline mode'}}; }
}

async function apiLog(info){
  // Update local state regardless
  if(info.comparisons) _localProg.comps+=info.comparisons;
  if(info.swaps) _localProg.swaps+=info.swaps;
  if(info.action==='quiz'&&info.score) _localProg.quizRight+=info.score;
  if(info.action==='quiz'&&info.total) _localProg.quizTotal+=info.total;
  if(info.algo&&info.action==='visualize'){
    if(!_localProg.vizAlgos.includes(info.algo)) _localProg.vizAlgos.push(info.algo);
    _localProg.algos[info.algo]=(_localProg.algos[info.algo]||0)+1;
  }
  // Badge checks local
  const b=_localProg.badges;
  if(!b.includes('first_sort')&&_localProg.vizAlgos.length>0) b.push('first_sort');
  if(!b.includes('comparison_king')&&_localProg.comps>=1000) b.push('comparison_king');
  if(!b.includes('centurion')&&_localProg.quizTotal>=100) b.push('centurion');
  if(!b.includes('speed_demon')&&_autoRuns>=5) b.push('speed_demon');
  if(info.algo==='Quick Sort'&&!b.includes('quick_pro')&&(_localProg.algos['Quick Sort']||0)>=3) b.push('quick_pro');
  saveLocal();
  if(!_token) return null;
  const r=await apiCall('/progress/log','POST',info);
  if(r.ok&&r.data.xp_earned>0){
    toast('+'+r.data.xp_earned+' XP earned!','xp');
    if(_user){ _user.xp=r.data.total_xp; _user.level=r.data.level; localStorage.setItem('sf4_user',JSON.stringify(_user)); }
    updateUserUI();
    if(r.data.new_badges&&r.data.new_badges.length) setTimeout(()=>toast('🏅 New badge earned!','success'),900);
  }
  return r.data;
}

// ── LOGIN ──────────────────────────────────────────────────────
async function doLogin(){
  clearErrs();
  const u=($id('l-user').value||'').trim().toLowerCase();
  const p=($id('l-pass').value||'');
  if(!u||!p){ setErr('login-err','Please enter username and password'); return; }
  const btn=$id('login-btn'); btn.disabled=true; btn.textContent='Signing in...';
  const r=await apiCall('/login','POST',{username:u,password:p});
  btn.disabled=false; btn.textContent='Sign In';
  if(r.ok){
    _token=r.data.token; _user=r.data.user;
    localStorage.setItem('sf4_token',_token);
    localStorage.setItem('sf4_user',JSON.stringify(_user));
    updateUserUI();
    showPage('app'); showView('dashboard');
    toast('Welcome back, '+_user.display+'! 👋','success');
    loadDashboard();
    if(r.data.last_session&&r.data.last_session.algo){ _offerResume(r.data.last_session); }
  } else {
    // Try offline fallback
    setErr('login-err', r.data.error||'Login failed. Start server or use Guest mode.');
  }
}

async function doRegister(){
  clearErrs();
  const display=($id('r-display').value||'').trim();
  const username=($id('r-user').value||'').trim().toLowerCase();
  const password=$id('r-pass').value;
  const confirm=$id('r-confirm').value;
  if(!display||!username||!password){ setErr('reg-err','All fields are required'); return; }
  if(password!==confirm){ setErr('reg-err','Passwords do not match'); return; }
  if(password.length<4){ setErr('reg-err','Password must be at least 4 characters'); return; }
  const btn=$id('reg-btn'); btn.disabled=true; btn.textContent='Creating...';
  const r=await apiCall('/register','POST',{display,username,password});
  btn.disabled=false; btn.textContent='Create Account';
  if(r.ok){
    _token=r.data.token; _user=r.data.user;
    localStorage.setItem('sf4_token',_token);
    localStorage.setItem('sf4_user',JSON.stringify(_user));
    updateUserUI();
    showPage('app'); showView('dashboard');
    toast('Account created! Welcome, '+_user.display+'! 🎉','success');
  } else {
    setErr('reg-err', r.data.error||'Registration failed. Make sure the server is running.');
  }
}

async function doLogout(){
  await saveSession();
  if(_token) await apiCall('/logout','POST');
  _token=null; _user=null;
  localStorage.removeItem('sf4_token'); localStorage.removeItem('sf4_user');
  // Clear local progress on logout so next guest/user gets fresh state
  _localProg={comps:0,swaps:0,quizRight:0,quizTotal:0,algos:{},vizAlgos:[],badges:[]};
  localStorage.removeItem('sf4_local');
  // Don't remove session — stays for the user's own account (loaded on their next login)
  _qUsedMap={}; _qRoundMap={}; _qScore=0; _qTotal=0;
  updateUserUI(); showPage('landing');
  toast('Logged out successfully. Your progress is saved to your account.');
}

// ── SESSION SAVE / RESUME ──────────────────────────────────────
async function saveSession(){
  const ss={ page:'simulator', algo:($id('algo-sel')||{}).value||'Bubble Sort', array_values:_arr.length?_arr:[], step_index:_stepIdx||0, section:_qSection, tree_type:($id('tree-sel')||{}).value||'Red-Black Tree' };
  localStorage.setItem('sf4_session', JSON.stringify(ss));
  if(_token) await apiCall('/session/save','POST',ss);
  toast('Session saved!','success');
}

function _offerResume(ss){
  const btn=$id('resume-btn'); if(!btn||!ss) return;
  btn.style.display=''; btn.onclick=()=>_doResume(ss);
}

function _doResume(ss){
  if(!ss) return;
  showView('simulator');
  setTimeout(()=>{
    const sel=$id('algo-sel'); if(sel&&ss.algo) sel.value=ss.algo;
    if(ss.array_values&&ss.array_values.length) $id('arr-custom').value=ss.array_values.join(',');
    onAlgoChange(); doSetup();
    toast('Resumed: '+ss.algo,'success');
  },200);
}

function resumeSession(){
  let ss=null;
  try{ ss=JSON.parse(localStorage.getItem('sf4_session')||'null'); }catch{}
  if(ss) _doResume(ss); else toast('No saved session found');
}

// ── USER UI ────────────────────────────────────────────────────
function updateUserUI(){
  const u=_user;
  const initial = u ? u.display.charAt(0).toUpperCase() : 'G';
  const color   = (u && u.avatar_color) || '#f97316';
  const name    = u ? u.display : 'Guest';
  const xp      = u ? (u.xp || 0) : 0;  // guests always show 0 XP
  const lv      = u ? (u.level || getLvl(xp)) : getLvl(0);

  // Avatar + name
  [$id('sb-av'),$id('tb-av'),$id('p-av')].forEach(el=>{
    if(el){ el.textContent=initial; el.style.background=color; }
  });
  setText('sb-nm', name);
  setText('tb-nm', name);
  setText('sb-lv', 'Level '+(lv.level||1)+' • '+(lv.title||'Beginner'));
  setText('tb-xp', xp+' XP');

  // Sidebar XP bar + labels
  const sbXp=$id('sb-xp'); if(sbXp) sbXp.style.width=(lv.pct||0)+'%';
  setText('sb-xp-cur', xp+' XP');
  if(lv.next_min > lv.min) setText('sb-xp-nxt', (lv.next_min-xp)+' to next');
  else setText('sb-xp-nxt', 'Max level!');

  // Profile page
  setText('hero-greeting', 'Hello, '+name+' 👋');
  setText('p-nm', name);
  setText('p-un', u ? '@'+u.username : 'Guest — not logged in');
  setText('p-lvl-tag', 'Level '+(lv.level||1)+' — '+(lv.title||'Beginner'));
  setText('p-xp-val', xp+' XP');
  const xpFill=$id('xp-fill'); if(xpFill) xpFill.style.width=(lv.pct||0)+'%';
  setText('xp-cur', xp+' XP');
  if(lv.next_min>lv.min) setText('xp-nxt', (lv.next_min-xp)+' XP to next level');
  else setText('xp-nxt', '🎉 Maximum level!');

  // Only offer resume for logged-in users, not guests
  if(u && _token){
    let ss=null;
    try{ ss=JSON.parse(localStorage.getItem('sf4_session')||'null'); }catch{}
    if(ss && ss.algo) _offerResume(ss);
  } else {
    // Hide resume button for guests
    const rb=$id('resume-btn'); if(rb) rb.style.display='none';
  }
}

// ── DASHBOARD ──────────────────────────────────────────────────
async function loadDashboard(){
  updateUserUI();
  let comps=_localProg.comps, swaps=_localProg.swaps;
  let algosCount=_localProg.vizAlgos.length;
  let acc=_localProg.quizTotal>0?Math.round(_localProg.quizRight/_localProg.quizTotal*100):0;
  let recent=[], badges=_localProg.badges||[];

  if(_token){
    const r=await apiCall('/progress/summary');
    if(r.ok){
      const t=r.data.totals||{};
      comps=t.tc||comps; swaps=t.ts||swaps;
      algosCount=t.algos_used||algosCount;
      const qs=r.data.quiz_stats||[];
      const qRight=qs.reduce((s,x)=>s+(x.correct||0),0);
      const qTotal=qs.reduce((s,x)=>s+(x.attempted||0),0);
      acc=qTotal>0?Math.round(qRight/qTotal*100):acc;
      recent=r.data.recent||[];
      if(_user) badges=JSON.parse(localStorage.getItem('sf4_user')||'{}').badges||[];
      _renderDashAlgoProg(r.data.viz_stats||[], qs);
      _renderActivity('d-activity',recent,6);
    }
  } else {
    _renderDashAlgoProgLocal();
    _renderActivity('d-activity',[],0);
  }

  setText('d-comps',fmtNum(comps)); setText('d-swaps',fmtNum(swaps));
  setText('d-algos',algosCount); setText('d-acc',acc+'%');
  _renderBadges('d-badges', badges);
}

function _renderDashAlgoProg(vizStats, quizStats){
  const el=$id('d-algo-prog'); if(!el) return;
  if(!vizStats.length&&!quizStats.length){ el.innerHTML='<div style="color:var(--text-3);font-size:13px">Start visualizing to see progress!</div>'; return; }
  const vzM={}, qzM={};
  vizStats.forEach(r=>vzM[r.algo]=r); quizStats.forEach(r=>qzM[r.algo]=r);
  const all=['Bubble Sort','Quick Sort','Merge Sort','Insertion Sort','Heap Sort','Selection Sort','Shell Sort'];
  const colors=['#5b6af0','#f97316','#22c55e','#a855f7','#06b6d4','#f59e0b','#ef4444'];
  const icons=['🫧','⚡','🔀','🃏','🏔','🎯','🐚'];
  el.innerHTML=all.map((a,i)=>{
    const q=qzM[a]||{},v=vzM[a]||{};
    const acc=q.attempted>0?Math.round(q.correct/q.attempted*100):0;
    const pct=Math.min(acc||(v.views>0?15:0),100);
    return `<div class="prog-item"><div class="prog-icon" style="background:${colors[i]}22;color:${colors[i]}">${icons[i]}</div><div class="prog-info"><div class="prog-name">${a}</div><div class="prog-bar"><div class="prog-bar-fill" style="width:${pct}%;background:${colors[i]}"></div></div></div><div class="prog-pct">${pct}%</div></div>`;
  }).join('');
}

function _renderDashAlgoProgLocal(){
  const el=$id('d-algo-prog'); if(!el) return;
  const alg=_localProg.algos||{};
  if(!Object.keys(alg).length){ el.innerHTML='<div style="color:var(--text-3);font-size:13px">Start visualizing to see progress!</div>'; return; }
  const colors=['#5b6af0','#f97316','#22c55e','#a855f7','#06b6d4','#f59e0b','#ef4444'];
  el.innerHTML=Object.entries(alg).map(([a,c],i)=>`<div class="prog-item"><div class="prog-icon" style="background:${colors[i%7]}22;color:${colors[i%7]}">⚡</div><div class="prog-info"><div class="prog-name">${a}</div><div class="prog-bar"><div class="prog-bar-fill" style="width:${Math.min(c*10,100)}%;background:${colors[i%7]}"></div></div></div><div class="prog-pct">${c}x</div></div>`).join('');
}

function _renderActivity(containerId, items, max){
  const el=$id(containerId); if(!el) return;
  if(!items.length){ el.innerHTML='<div style="color:var(--text-3);font-size:13px">No activity yet. Start learning!</div>'; return; }
  const icons={visualize:'⚡',quiz:'🧠',auto_run:'▶'};
  el.innerHTML=items.slice(0,max||6).map(r=>`<div class="act-item"><div class="act-icon">${icons[r.action]||'📌'}</div><div style="flex:1"><div class="act-name">${r.algo}</div><div class="act-meta">${r.action}${r.action==='quiz'?' — '+r.score+'/'+r.total+' correct':''}</div></div><div class="act-time">${timeAgo(r.created_at)}</div></div>`).join('');
}

function _renderBadges(containerId, earned){
  const el=$id(containerId); if(!el) return;
  el.innerHTML=Object.entries(BADGES_INFO).map(([key,b])=>{
    const isE=(earned||[]).includes(key);
    return `<div class="badge-chip ${isE?'earned':'locked'}" title="${b.desc}"><span>${b.icon}</span>${b.name}</div>`;
  }).join('');
}

// ── PROGRESS PAGE ──────────────────────────────────────────────
async function loadProgress(){
  updateUserUI();
  let comps=_localProg.comps, swaps=_localProg.swaps;
  let qTotal=_localProg.quizTotal, badges=_localProg.badges||[];
  let weekly=[], quizPerf=[];

  if(_token){
    const r=await apiCall('/progress/summary');
    if(r.ok){
      const t=r.data.totals||{}; comps=t.tc||comps; swaps=t.ts||swaps; qTotal=t.qt||qTotal;
      if(_user) badges=(JSON.parse(localStorage.getItem('sf4_user')||'{}').badges||[]);
      weekly=r.data.weekly||[]; quizPerf=r.data.quiz_stats||[];
      _renderActivity('pr-activity',r.data.recent||[],10);
    }
  } else {
    $id('pr-activity').innerHTML='<div style="color:var(--text-3);font-size:13px">Login to see detailed activity</div>';
  }

  setText('pr-c',fmtNum(comps)); setText('pr-s',fmtNum(swaps));
  setText('pr-q',qTotal); setText('pr-b',badges.length);
  setText('pr-b-count',badges.length+' / '+Object.keys(BADGES_INFO).length+' earned');
  _renderAllBadges(badges);
  _renderWeeklyChart(weekly);
  _renderQuizPerf(quizPerf);
}

function _renderAllBadges(earned){
  const el=$id('pr-badges'); if(!el) return;
  el.innerHTML=Object.entries(BADGES_INFO).map(([key,b])=>{
    const isE=(earned||[]).includes(key);
    return `<div class="badge-chip ${isE?'earned':'locked'}" title="${b.desc}" style="flex-direction:column;align-items:flex-start;width:auto;padding:10px 14px;gap:4px"><div style="display:flex;align-items:center;gap:6px"><span style="font-size:20px">${b.icon}</span><span style="font-size:12.5px;font-weight:700">${b.name}</span></div><div style="font-size:10.5px;color:var(--text-3)">${b.desc}</div></div>`;
  }).join('');
}

function _renderWeeklyChart(weekly){
  const el=$id('wk-chart'); if(!el) return;
  if(!weekly.length){ el.innerHTML='<div style="color:var(--text-3);font-size:13px">No data yet</div>'; return; }
  const maxA=Math.max(...weekly.map(d=>d.actions),1);
  el.innerHTML=weekly.map(d=>{
    const h=Math.max(6,Math.round(d.actions/maxA*100));
    const day=new Date(d.day).toLocaleDateString('en',{weekday:'short'});
    return `<div class="wc-bar-wrap"><div class="wc-bar" style="height:${h}%"></div><div class="wc-lbl">${day}</div></div>`;
  }).join('');
}

function _renderQuizPerf(stats){
  const el=$id('pr-quiz-perf'); if(!el) return;
  if(!stats.length){ el.innerHTML='<div style="color:var(--text-3);font-size:13px">No quiz data yet</div>'; return; }
  el.innerHTML=stats.map(r=>{
    const acc=r.attempted>0?Math.round(r.correct/r.attempted*100):0;
    return `<div class="prog-item"><div class="prog-info"><div class="prog-name">${r.algo} <span style="font-size:11px;color:var(--text-3)">${r.rounds} rounds</span></div><div class="prog-bar"><div class="prog-bar-fill" style="width:${acc}%;background:var(--green)"></div></div></div><div class="prog-pct">${acc}%</div></div>`;
  }).join('');
}

// ══════════════════════════════════════════════════════════════
// SIMULATOR
// ══════════════════════════════════════════════════════════════
function getLang(){ return ($id('lang-sel')||{}).value||'python'; }

function onAlgoChange(){
  const name=($id('algo-sel')||{}).value||'Bubble Sort';
  renderCode(name, getLang());
  renderPseudo(name);
  renderExplain(name);
  renderSimCx(name);
  if(_isSetup) doReset();
}

function onLangChange(){
  renderCode(($id('algo-sel')||{}).value||'Bubble Sort', getLang());
}

function doSetup(){
  const name=($id('algo-sel')||{}).value||'Bubble Sort';
  const custom=($id('arr-custom').value||'').trim();
  if(custom){
    const parsed=custom.split(/[,\s]+/).map(Number).filter(n=>!isNaN(n)&&n>0&&n<10000);
    if(parsed.length<2){ toast('Enter at least 2 valid positive numbers','error'); return; }
    _arr=parsed;
  } else {
    const n=+($id('size-sel')||{}).value||8;
    _arr=Array.from({length:n},()=>Math.floor(Math.random()*900)+100);
  }
  _steps=generateSteps(name,[..._arr]);
  _stepIdx=0;_comps=0;_swaps=0;_sorted=new Set();_isSetup=true;
  _stopAuto();
  drawArr(_arr,{},{},_sorted);
  setText('s-comps','0');setText('s-swaps','0');setText('s-step','0');
  setText('s-total',_steps.length);setText('prog-txt','0 / '+_steps.length);
  setText('step-msg','Array ready — '+_steps.length+' steps. Press Next or Auto Run.');
  setText('sim-status','Ready'); setText('m-algo',name);
  setText('m-t',getCxTime(name));
  $id('prog-bar').style.width='0%';
  $id('next-btn').disabled=false; $id('auto-btn').disabled=false;
  $id('obs-list').innerHTML='';
  addObs(0,'Setup: ['+_arr.join(', ')+'] — '+_steps.length+' steps','info');
  apiLog({section:'sorting',algo:name,action:'visualize',comparisons:0,swaps:0});
  toast(name+' ready!');
}

function doReset(){
  _stopAuto();_isSetup=false;_steps=[];_stepIdx=0;_comps=0;_swaps=0;_sorted=new Set();
  const n=+($id('size-sel')||{}).value||8;
  _arr=Array.from({length:n},()=>Math.floor(Math.random()*900)+100);
  drawArr(_arr,{},{},new Set());
  ['s-comps','s-swaps','s-step','m-c','m-s'].forEach(id=>setText(id,'0'));
  setText('s-total','—');setText('prog-txt','0 / 0');
  setText('step-msg','Ready — click Setup to begin');
  $id('prog-bar').style.width='0%';
  $id('next-btn').disabled=true; $id('auto-btn').disabled=true;
  $id('obs-list').innerHTML='';
}

function doNext(){
  if(!_isSetup||_stepIdx>=_steps.length) return;
  applyStep(_steps[_stepIdx],_stepIdx+1); _stepIdx++;
  const pct=Math.round(_stepIdx/_steps.length*100);
  $id('prog-bar').style.width=pct+'%';
  setText('prog-txt',_stepIdx+' / '+_steps.length);
  setText('s-step',_stepIdx);
  if(_stepIdx>=_steps.length){
    _stopAuto(); setText('sim-status','Complete ✓');
    $id('next-btn').disabled=true; $id('auto-btn').disabled=true;
    setText('step-msg','✓ Sorting complete!'); toast('Sorted! 🎉','success');
    apiLog({section:'sorting',algo:($id('algo-sel')||{}).value,action:'visualize',comparisons:_comps,swaps:_swaps});
  }
}

function doAuto(){
  if(!_isSetup||_isAuto) return;
  _isAuto=true; _autoRuns++;
  $id('auto-btn').style.display='none';
  $id('pause-btn').style.display=''; $id('pause-btn').disabled=false;
  setText('sim-status','Running...');
  _tick();
  apiLog({section:'sorting',algo:($id('algo-sel')||{}).value,action:'auto_run'});
}

function doPause(){
  _stopAuto();
  $id('pause-btn').style.display='none';
  $id('auto-btn').style.display='';
  setText('sim-status','Paused');
}

function _tick(){
  if(!_isAuto||_stepIdx>=_steps.length){ doPause(); return; }
  doNext();
  const spd=+($id('spd')||{value:5}).value;
  _autoTimer=setTimeout(_tick,Math.max(30,Math.round(900/spd)));
}

function _stopAuto(){
  _isAuto=false; clearTimeout(_autoTimer);
  const pb=$id('pause-btn'),ab=$id('auto-btn');
  if(pb){ pb.style.display='none'; pb.disabled=true; }
  if(ab) ab.style.display='';
}

function applyStep(step,num){
  if(!step) return;
  const hl={};
  switch(step.type){
    case 'compare': _comps++; hl[step.i]='comparing';hl[step.j]='comparing';
      setText('s-comps',_comps);setText('m-c',_comps); break;
    case 'swap': _swaps++;[_arr[step.i],_arr[step.j]]=[_arr[step.j],_arr[step.i]];
      hl[step.i]='swapping';hl[step.j]='swapping';setText('s-swaps',_swaps);setText('m-s',_swaps); break;
    case 'pivot': hl[step.idx]='pivot'; break;
    case 'sorted': _sorted.add(step.idx); break;
    case 'set': _arr[step.idx]=step.val; break;
    case 'place': _arr[step.idx]=step.val; if(!_sorted.has(step.idx))hl[step.idx]='left-ptr'; break;
    case 'done': for(let i=0;i<_arr.length;i++)_sorted.add(i); break;
  }
  _sorted.forEach(i=>{if(!hl[i])hl[i]='sorted';});
  drawArr(_arr,hl,step.ptrs||{},_sorted);
  addObs(num,step.msg||'',step.msgType||'');
  setText('step-msg',step.msg||'');
  setText('m-step','Step '+num+' — '+(step.msgType||'info'));
  if(step.pseudo!==undefined) hlPseudo(step.pseudo);
  if(step.codeLine!==undefined) hlCode(step.codeLine);
}

function drawArr(arr,hl,ptrs,sorted){
  const bw=Math.max(42,Math.min(62,Math.floor(640/arr.length)));
  const be=$id('arr-boxes'),ie=$id('arr-idx'),pe=$id('arr-ptrs');
  if(!be) return;
  be.innerHTML=arr.map((v,i)=>{
    let cls='arr-box';
    if(sorted.has(i))cls+=' sorted';
    else if(hl[i]==='comparing')cls+=' comparing';
    else if(hl[i]==='swapping')cls+=' swapping';
    else if(hl[i]==='pivot')cls+=' pivot';
    else if(hl[i]==='left-ptr')cls+=' left-ptr';
    else if(hl[i]==='right-ptr')cls+=' right-ptr';
    return `<div class="${cls}" style="min-width:${bw}px">${v}</div>`;
  }).join('');
  if(ie) ie.innerHTML=arr.map((_,i)=>`<div class="arr-idx" style="min-width:${bw}px">${i}</div>`).join('');
  if(pe){
    const lbl=new Array(arr.length).fill('');
    if(ptrs.L!==undefined&&ptrs.L>=0&&ptrs.L<arr.length) lbl[ptrs.L]+='i';
    if(ptrs.R!==undefined&&ptrs.R>=0&&ptrs.R<arr.length) lbl[ptrs.R]+=(lbl[ptrs.R]?'/':'')+'j';
    if(ptrs.P!==undefined&&ptrs.P>=0&&ptrs.P<arr.length) lbl[ptrs.P]+=(lbl[ptrs.P]?'/':'')+'p';
    pe.innerHTML=lbl.map((l,i)=>{
      let cls='arr-ptr-cell';
      if(l.includes('i')&&!l.includes('j'))cls+=' ptr-i';
      else if(l.includes('j'))cls+=' ptr-j';
      else if(l.includes('p'))cls+=' ptr-p';
      return `<div class="${cls}" style="min-width:${bw}px">${l?'↑'+l:''}</div>`;
    }).join('');
  }
}

function addObs(num,msg,type){
  const list=$id('obs-list'); if(!list) return;
  const li=document.createElement('li'); li.className='obs-item';
  li.innerHTML=`<span class="obs-step">#${num}</span><span class="obs-text ${type}">${esc(msg)}</span>`;
  list.prepend(li);
  while(list.children.length>50) list.removeChild(list.lastChild);
}

// Code / Pseudo / Explain
function renderCode(name,lang,activeLine){
  const sn=typeof CODE_SNIPPETS!=='undefined'?CODE_SNIPPETS:{};
  const lines=(sn[name]&&sn[name][lang])?sn[name][lang]:['// No snippet available'];
  const el=$id('code-block'); if(!el) return;
  el.innerHTML=lines.map((l,i)=>`<span class="code-line${i===activeLine?' active':''}" id="cl-${i}">${esc(l)}</span>`).join('');
  if(activeLine!==undefined){const al=$id('cl-'+activeLine);if(al)al.scrollIntoView({block:'nearest',behavior:'smooth'});}
}
function renderPseudo(name,activeLine){
  const ps=typeof PSEUDOCODES!=='undefined'?PSEUDOCODES:{};
  const lines=ps[name]||[];
  const el=$id('pseudo-block'); if(!el) return;
  el.innerHTML=lines.map((l,i)=>`<span class="pseudo-line${i===activeLine?' active':''}" id="ps-${i}">${esc(l)}</span>`).join('');
}
function renderExplain(name){
  const ex=(typeof EXPLANATIONS!=='undefined'?EXPLANATIONS:{})[name]; if(!ex) return;
  setText('ex-title',name); setText('ex-how',ex.how);
  const ul=$id('ex-uses'); if(ul) ul.innerHTML=ex.uses.map(u=>`<li>${u}</li>`).join('');
}
function hlCode(line){ document.querySelectorAll('.code-line').forEach((e,i)=>e.classList.toggle('active',i===line)); }
function hlPseudo(line){ document.querySelectorAll('#pseudo-block .pseudo-line').forEach((e,i)=>e.classList.toggle('active',i===line)); }

function renderSimCx(name){
  const cx=(typeof COMPLEXITIES!=='undefined'?COMPLEXITIES:{})[name]; if(!cx) return;
  const tb=$id('sim-cx'); if(tb) tb.innerHTML=cx.rows.map((r,i)=>`<tr><td style="color:var(--text-3)">${r[0]}</td><td class="${['cx-green','cx-orange','cx-red'][i]}">${r[1]}</td></tr>`).join('');
  const ch=$id('sim-chips'); if(ch) ch.innerHTML=`<span class="chip ${cx.stable?'chip-green':'chip-red'}">${cx.stable?'✓ Stable':'✗ Unstable'}</span><span class="chip chip-blue">${cx.inPlace?'In-Place':'Extra Mem'}</span>`;
}
function getCxTime(name){
  const cx=(typeof COMPLEXITIES!=='undefined'?COMPLEXITIES:{})[name]; return cx?cx.rows[1][1]:'O(?)';
}

function switchCodeTab(tab,el){
  ['code','pseudo','explain'].forEach(t=>{const p=$id('ct-'+t);if(p)p.style.display=t===tab?'':'none';});
  document.querySelectorAll('.code-tab').forEach(t=>t.classList.remove('active'));
  if(el)el.classList.add('active');
  const name=($id('algo-sel')||{}).value||'Bubble Sort';
  if(tab==='code') renderCode(name,getLang());
  if(tab==='pseudo') renderPseudo(name);
  if(tab==='explain') renderExplain(name);
}

// ══════════════════════════════════════════════════════════════
// TREE VISUALIZER
// ══════════════════════════════════════════════════════════════
function onTreeChange(){
  const t=($id('tree-sel')||{}).value||'Red-Black Tree';
  const bOrd=$id('btree-ord-wrap'); if(bOrd) bOrd.style.display=t==='B-Tree'?'':'none';
  const kdWrap=$id('kd-plot-wrap'); if(kdWrap) kdWrap.style.display=t==='KD-Tree'?'':'none';
  const inp=$id('tree-custom'); if(inp) inp.placeholder=t==='KD-Tree'?'Points: x,y;x,y (e.g. 3,6;17,15)':'Values: 10,20,30...';
  treeReset();
  renderTreeCx(t); renderTreePseudo(t); renderTreeExp(t);
}

function treeSetup(){
  const t=($id('tree-sel')||{}).value||'Red-Black Tree';
  _tIdx=0; _tSetup=true; _tSteps=[];
  stopTreeAuto();

  if(t==='KD-Tree'){
    const custom=($id('tree-custom').value||'').trim();
    if(custom){
      _kdPts=custom.split(';').map(p=>p.trim().split(',').map(Number)).filter(p=>p.length===2&&!p.some(isNaN));
      if(_kdPts.length<2){ toast('Enter points as x,y;x,y','error'); return; }
    } else {
      const cnt=+($id('tree-sz')||{}).value||8;
      const used=new Set(); _kdPts=[];
      while(_kdPts.length<cnt){
        const x=Math.floor(Math.random()*90)+5,y=Math.floor(Math.random()*90)+5;
        if(!used.has(x+','+y)){used.add(x+','+y);_kdPts.push([x,y]);}
      }
    }
    _tSteps=generateKDTreeSteps(_kdPts);
    renderKDPoints('kd-plot',_kdPts,[]);
    const kw=$id('kd-plot-wrap'); if(kw) kw.style.display='';
  } else {
    const kw=$id('kd-plot-wrap'); if(kw) kw.style.display='none';
    const custom=($id('tree-custom').value||'').trim();
    let vals;
    if(custom){
      vals=custom.split(/[,\s]+/).map(Number).filter(n=>!isNaN(n)&&n>0&&n<10000);
      if(vals.length<2){ toast('Enter at least 2 valid numbers','error'); return; }
    } else {
      const cnt=+($id('tree-sz')||{}).value||7;
      const used=new Set(); vals=[];
      while(vals.length<cnt){const v=Math.floor(Math.random()*90)+10;if(!used.has(v)){used.add(v);vals.push(v);}}
    }
    if(t==='Red-Black Tree') _tSteps=generateRBSteps(vals);
    else if(t==='B-Tree') _tSteps=generateBTreeSteps(vals,+($id('btree-ord')||{value:2}).value||2);
    else if(t==='2-3 Tree') _tSteps=generateTwoThreeSteps(vals);
  }

  setText('t-total-n',_tSteps.length); setText('t-prog-txt','0 / '+_tSteps.length);
  $id('t-prog').style.width='0%';
  setText('t-msg',t+' ready — '+_tSteps.length+' steps');
  $id('t-next').disabled=false; $id('t-auto').disabled=false;
  $id('tree-obs').innerHTML='';
  treeRenderStep(0);
  apiLog({section:'trees',algo:t,action:'visualize'});
  toast(t+' ready!');
}

function treeNext(){
  if(!_tSetup||_tIdx>=_tSteps.length) return;
  treeRenderStep(_tIdx); _tIdx++;
  const pct=Math.round(_tIdx/_tSteps.length*100);
  $id('t-prog').style.width=pct+'%';
  setText('t-prog-txt',_tIdx+' / '+_tSteps.length);
  setText('t-step-n',_tIdx);
  if(_tIdx>=_tSteps.length){
    stopTreeAuto(); setText('t-status','Complete ✓');
    $id('t-next').disabled=true; $id('t-auto').disabled=true;
    setText('t-msg','✓ Tree construction complete!'); toast('Tree built! 🎉','success');
  }
}

function treeAuto(){
  if(!_tSetup||_tAuto) return;
  _tAuto=true;
  setText('t-status','Running...');
  _tTick();
}
function _tTick(){
  if(!_tAuto||_tIdx>=_tSteps.length){stopTreeAuto();return;}
  treeNext();
  const spd=+($id('t-spd')||{value:5}).value;
  _tTimer=setTimeout(_tTick,Math.max(50,Math.round(900/spd)));
}
function stopTreeAuto(){ _tAuto=false; clearTimeout(_tTimer); }

function treeReset(){
  stopTreeAuto();_tSetup=false;_tSteps=[];_tIdx=0;
  const c=$id('tree-canvas'); if(c) c.innerHTML='<div class="tree-empty">Press Setup to build a tree</div>';
  $id('tree-obs').innerHTML=''; setText('t-msg','Ready — press Setup');
  $id('t-prog').style.width='0%'; setText('t-prog-txt','0 / 0'); setText('t-step-n','0'); setText('t-total-n','—');
  $id('t-next').disabled=true; $id('t-auto').disabled=true;
  const kw=$id('kd-plot-wrap'); if(kw) kw.style.display='none';
}

function treeRenderStep(idx){
  if(idx>=_tSteps.length) return;
  const step=_tSteps[idx];
  const t=($id('tree-sel')||{}).value||'Red-Black Tree';
  const ttype=t==='Red-Black Tree'?'rb':t==='B-Tree'?'btree':t==='2-3 Tree'?'23':'kd';
  const canvas=$id('tree-canvas');
  if(canvas) renderTree('tree-canvas',step.tree,ttype,step.highlight||[]);
  setText('t-msg',step.msg||''); setText('t-status','Step '+(idx+1)+'/'+_tSteps.length);
  const list=$id('tree-obs'); if(list){
    const li=document.createElement('li'); li.className='obs-item';
    li.innerHTML=`<span class="obs-step">#${idx+1}</span><span class="obs-text">${esc(step.msg||'')}</span>`;
    list.prepend(li); while(list.children.length>50) list.removeChild(list.lastChild);
  }
  if(t==='KD-Tree'&&step.highlight) renderKDPoints('kd-plot',_kdPts,step.highlight);
}

function renderTreeCx(name){
  const cx=(typeof TREE_COMPLEXITIES!=='undefined'?TREE_COMPLEXITIES:{})[name]; if(!cx) return;
  const tb=$id('tree-cx'); if(tb) tb.innerHTML=cx.rows.map((r,i)=>`<tr><td style="color:var(--text-3);font-size:11px">${r[0]}</td><td class="${['cx-green','cx-orange','cx-red','cx-green'][i]}">${r[1]}</td></tr>`).join('');
}
function renderTreePseudo(name){
  const ps=(typeof TREE_PSEUDOCODES!=='undefined'?TREE_PSEUDOCODES:{})[name]||[];
  const el=$id('tree-pseudo'); if(!el) return;
  el.innerHTML=ps.map(l=>`<span class="pseudo-line">${esc(l)}</span>`).join('');
  setText('t-pseudo-name',name);
}
function renderTreeExp(name){
  const ex=(typeof TREE_EXPLANATIONS!=='undefined'?TREE_EXPLANATIONS:{})[name]; if(!ex) return;
  setText('tree-exp-title',name+' — How it works');
  setText('tree-exp-how',ex.how);
}

// ══════════════════════════════════════════════════════════════
// COMPARE
// ══════════════════════════════════════════════════════════════
let _cmpArr=[], _cmpStA=[], _cmpStB=[], _cmpIdxA=0, _cmpIdxB=0;
let _cmpCA=0,_cmpCB=0,_cmpSA=0,_cmpSB=0,_cmpTA=0,_cmpTB=0;
let _cmpDoneA=false,_cmpDoneB=false,_cmpTimer=null;

function setupCompare(){
  const n=+($id('cmp-sz')||{value:10}).value;
  _cmpArr=Array.from({length:n},()=>Math.floor(Math.random()*900)+100);
  const nameA=($id('cmp-a')||{}).value||'Bubble Sort';
  const nameB=($id('cmp-b')||{}).value||'Quick Sort';
  setText('cmp-na',nameA); setText('cmp-nb',nameB);
  _cmpStA=generateSteps(nameA,[..._cmpArr]);
  _cmpStB=generateSteps(nameB,[..._cmpArr]);
  _cmpIdxA=0;_cmpIdxB=0;_cmpCA=0;_cmpCB=0;_cmpSA=0;_cmpSB=0;_cmpTA=0;_cmpTB=0;
  _cmpDoneA=false;_cmpDoneB=false;
  let arrA=[..._cmpArr], arrB=[..._cmpArr];
  _drawCmp('cmp-boxes-a','cmp-idx-a','cmp-ptrs-a',arrA,{},{},new Set());
  _drawCmp('cmp-boxes-b','cmp-idx-b','cmp-ptrs-b',arrB,{},{},new Set());
  ['cmp-ca','cmp-cb','cmp-sa','cmp-sb'].forEach(id=>setText(id,'0'));
  setText('cmp-ta','0.00s'); setText('cmp-tb','0.00s');
  $id('cmp-pa').style.width='0%'; $id('cmp-pb').style.width='0%';
  $id('cmp-winner').style.display='none'; $id('cmp-result').style.display='none';
  $id('cmp-start').disabled=false;
}

function startCompare(){
  if(!_cmpStA.length){ toast('Press Setup first','error'); return; }
  $id('cmp-start').disabled=true;
  let arrA=[..._cmpArr], arrB=[..._cmpArr];
  const srtA=new Set(), srtB=new Set();
  const spd=+($id('cmp-spd')||{value:7}).value;
  const delay=Math.max(20,Math.round(700/spd));
  clearInterval(_cmpTimer);
  _cmpTimer=setInterval(()=>{
    if(!_cmpDoneA&&_cmpIdxA<_cmpStA.length){
      const s=_cmpStA[_cmpIdxA++];
      const hl={};
      if(s.type==='compare'){_cmpCA++;hl[s.i]='comparing';hl[s.j]='comparing';}
      else if(s.type==='swap'){_cmpSA++;[arrA[s.i],arrA[s.j]]=[arrA[s.j],arrA[s.i]];hl[s.i]='swapping';hl[s.j]='swapping';}
      else if(s.type==='sorted') srtA.add(s.idx);
      else if(s.type==='done') for(let i=0;i<arrA.length;i++) srtA.add(i);
      srtA.forEach(i=>{if(!hl[i])hl[i]='sorted';});
      _drawCmp('cmp-boxes-a','cmp-idx-a','cmp-ptrs-a',arrA,hl,s.ptrs||{},srtA);
      setText('cmp-ca',_cmpCA); setText('cmp-sa',_cmpSA);
      const pct=Math.round(_cmpIdxA/_cmpStA.length*100); $id('cmp-pa').style.width=pct+'%';
      _cmpTA=performance.now();
      if(_cmpIdxA>=_cmpStA.length){ _cmpDoneA=true; _cmpTA=(performance.now()-(window._cmpStart||0))/1000; setText('cmp-ta',_cmpTA.toFixed(3)+'s'); }
    }
    if(!_cmpDoneB&&_cmpIdxB<_cmpStB.length){
      const s=_cmpStB[_cmpIdxB++];
      const hl={};
      if(s.type==='compare'){_cmpCB++;hl[s.i]='comparing';hl[s.j]='comparing';}
      else if(s.type==='swap'){_cmpSB++;[arrB[s.i],arrB[s.j]]=[arrB[s.j],arrB[s.i]];hl[s.i]='swapping';hl[s.j]='swapping';}
      else if(s.type==='sorted') srtB.add(s.idx);
      else if(s.type==='done') for(let i=0;i<arrB.length;i++) srtB.add(i);
      srtB.forEach(i=>{if(!hl[i])hl[i]='sorted';});
      _drawCmp('cmp-boxes-b','cmp-idx-b','cmp-ptrs-b',arrB,hl,s.ptrs||{},srtB);
      setText('cmp-cb',_cmpCB); setText('cmp-sb',_cmpSB);
      const pct=Math.round(_cmpIdxB/_cmpStB.length*100); $id('cmp-pb').style.width=pct+'%';
      if(_cmpIdxB>=_cmpStB.length){ _cmpDoneB=true; _cmpTB=(performance.now()-(window._cmpStart||0))/1000; setText('cmp-tb',_cmpTB.toFixed(3)+'s'); }
    }
    if(_cmpDoneA&&_cmpDoneB){
      clearInterval(_cmpTimer);
      const na=($id('cmp-a')||{}).value,nb=($id('cmp-b')||{}).value;
      const winner=_cmpCA<_cmpCB?na:_cmpCB<_cmpCA?nb:'Tie';
      const wnr=$id('cmp-winner');
      wnr.style.display=''; wnr.textContent=winner==='Tie'?'🤝 It\'s a Tie!':'🏆 '+winner+' wins with fewer comparisons!';
      const rt=$id('cmp-result-tbl');
      if(rt) rt.innerHTML=`<tr><th>Metric</th><th>${na}</th><th>${nb}</th><th>Winner</th></tr><tr><td>Comparisons</td><td>${_cmpCA}</td><td>${_cmpCB}</td><td>${_cmpCA<=_cmpCB?na:nb}</td></tr><tr><td>Swaps</td><td>${_cmpSA}</td><td>${_cmpSB}</td><td>${_cmpSA<=_cmpSB?na:nb}</td></tr><tr><td>Steps</td><td>${_cmpStA.length}</td><td>${_cmpStB.length}</td><td>${_cmpStA.length<=_cmpStB.length?na:nb}</td></tr>`;
      $id('cmp-result').style.display='';
    }
  },delay);
  window._cmpStart=performance.now();
}

function resetCompare(){
  clearInterval(_cmpTimer); _cmpStA=[]; _cmpStB=[];
  ['cmp-boxes-a','cmp-boxes-b'].forEach(id=>{const e=$id(id);if(e)e.innerHTML='';});
  ['cmp-idx-a','cmp-idx-b','cmp-ptrs-a','cmp-ptrs-b'].forEach(id=>{const e=$id(id);if(e)e.innerHTML='';});
  ['cmp-ca','cmp-cb','cmp-sa','cmp-sb'].forEach(id=>setText(id,'0'));
  setText('cmp-ta','0.00s'); setText('cmp-tb','0.00s');
  $id('cmp-pa').style.width='0%'; $id('cmp-pb').style.width='0%';
  $id('cmp-winner').style.display='none'; $id('cmp-result').style.display='none';
  $id('cmp-start').disabled=true;
}

function _drawCmp(bid,iid,pid,arr,hl,ptrs,sorted){
  const bw=Math.max(34,Math.min(52,Math.floor(560/arr.length)));
  const be=$id(bid),ie=$id(iid),pe=$id(pid);
  if(!be) return;
  be.innerHTML=arr.map((v,i)=>{
    let cls='arr-box';
    if(sorted.has(i))cls+=' sorted';
    else if(hl[i]==='comparing')cls+=' comparing';
    else if(hl[i]==='swapping')cls+=' swapping';
    return `<div class="${cls}" style="min-width:${bw}px;height:42px;font-size:13px">${v}</div>`;
  }).join('');
  if(ie) ie.innerHTML=arr.map((_,i)=>`<div class="arr-idx" style="min-width:${bw}px">${i}</div>`).join('');
  if(pe){
    const lbl=new Array(arr.length).fill('');
    if(ptrs.L!==undefined&&ptrs.L>=0&&ptrs.L<arr.length) lbl[ptrs.L]+='i';
    if(ptrs.R!==undefined&&ptrs.R>=0&&ptrs.R<arr.length) lbl[ptrs.R]+=(lbl[ptrs.R]?'/':'')+'j';
    pe.innerHTML=lbl.map((l,i)=>`<div class="arr-ptr-cell" style="min-width:${bw}px">${l?'↑'+l:''}</div>`).join('');
  }
}

// ══════════════════════════════════════════════════════════════
// QUIZ
// ══════════════════════════════════════════════════════════════
function _getQData(){ return _qSection==='trees'?TREE_QUIZ_DATA:QUIZ_DATA; }
function _qKey(){ return _qSection+':'+_qAlgo; }
function _qUsed(){ return _qUsedMap[_qKey()]||new Set(); }
function _qRound(){ return _qRoundMap[_qKey()]||1; }

function initQuiz(section){
  _qSection=section||'sorting';
  const data=_getQData(), algos=Object.keys(data);
  if(!algos.length) return;
  if(!_qAlgo||!algos.includes(_qAlgo)) _qAlgo=algos[0];
  const list=$id('q-algo-list');
  if(list){
    list.innerHTML=algos.map(a=>{
      const active=a===_qAlgo?' active':'';
      const rnd=_qRoundMap[_qSection+':'+a]||1;
      const safeA=a.replace(/'/g,"\\'");
      return '<div class="q-algo-item'+active+'" onclick="setQAlgo(\'' +safeA+ '\',this)"><span>'+a+'</span><span class="q-rnd-badge">Rd '+rnd+'</span></div>';
    }).join('');
  }
  buildRound(); loadQQ();
}

function setQAlgo(name,el){
  _qAlgo=name;
  document.querySelectorAll('.q-algo-item').forEach(t=>t.classList.remove('active'));
  if(el) el.classList.add('active');
  buildRound(); loadQQ();
}

function switchQSection(section,el){
  _qSection=section;
  const btnS=$id('qs-sort'),btnT=$id('qs-tree');
  if(btnS&&btnT){
    if(section==='sorting'){btnS.className='btn btn-primary btn-sm';btnT.className='btn btn-ghost btn-sm';}
    else{btnT.className='btn btn-primary btn-sm';btnS.className='btn btn-ghost btn-sm';}
  }
  _qAlgo=null; initQuiz(section);
}

function buildRound(){
  const data=_getQData()[_qAlgo]||[],total=data.length;
  if(!total){_qQueue=[];_qPos=0;return;}
  const key=_qKey();
  // Init tracking structures if needed
  if(!_qUsedMap[key]) _qUsedMap[key]=new Set();
  if(!_qRoundMap[key]) _qRoundMap[key]=1;
  let used=_qUsedMap[key];
  // Only reset used questions after ALL questions in this topic have been seen
  if(used.size>=total){
    used=new Set(); _qUsedMap[key]=used; _qRoundMap[key]++;
  }
  // Pick questions NOT yet seen this cycle
  const avail=[...Array(total).keys()].filter(i=>!used.has(i));
  // Shuffle available questions
  for(let i=avail.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[avail[i],avail[j]]=[avail[j],avail[i]];}
  // Take up to 5 per round
  _qQueue=avail.slice(0,Math.min(5,avail.length)); _qPos=0;
}

function loadQQ(){
  _qAnswered=false;
  const el=$id('q-container'); if(!el) return;
  if(!_qQueue.length){el.innerHTML='<div class="quiz-card" style="padding:30px;text-align:center;color:var(--text-3)">No questions. Select a topic above.</div>';return;}
  if(_qPos>=_qQueue.length){showRoundComplete();return;}
  const data=_getQData()[_qAlgo]||[];
  const q=data[_qQueue[_qPos]]; if(!q) return;
  const letters=['A','B','C','D'];
  el.innerHTML=`<div class="quiz-card"><div class="quiz-meta"><span class="q-pill q-pill-blue">Round ${_qRound[_qKey()]||1}</span><span class="q-pill q-pill-orange">${_qAlgo}</span><span class="q-num">${_qPos+1} of ${_qQueue.length}</span></div><div class="quiz-q">${q.q}</div><div class="quiz-opts">${q.opts.map((o,i)=>`<button class="quiz-opt" id="qo-${i}" onclick="answerQ(${i},${q.ans})"><span class="opt-letter">${letters[i]}</span>${o}</button>`).join('')}</div><div class="quiz-fb" id="q-fb"></div><div class="quiz-exp-box" id="q-exp"></div><div class="quiz-next-row" id="q-next" style="display:none"><button class="btn btn-primary" onclick="nextQQ()">Next Question →</button><span style="font-size:12px;font-weight:700;color:var(--accent)" id="q-xp"></span></div></div>`;
}

function answerQ(chosen,correct){
  if(_qAnswered) return;
  _qAnswered=true; _qTotal++;
  document.querySelectorAll('.quiz-opt').forEach(b=>b.disabled=true);
  const isR=chosen===correct;
  if(isR) _qScore++;
  // Highlight chosen and correct options
  const choEl=$id('qo-'+chosen),corEl=$id('qo-'+correct);
  if(choEl) choEl.classList.add(isR?'correct':'wrong');
  if(!isR&&corEl) corEl.classList.add('correct');
  // Always show feedback banner
  const fb=$id('q-fb');
  if(fb){
    fb.textContent=isR?'✓ Correct!':'✗ Wrong — correct answer: '+(corEl?corEl.textContent.trim():'');
    fb.className='quiz-fb '+(isR?'correct':'wrong');
    fb.style.display='';
  }
  // ALWAYS show explanation (for both correct and wrong answers)
  const exp=$id('q-exp');
  const data=_getQData()[_qAlgo]||[], q=data[_qQueue[_qPos]];
  if(exp){
    if(q&&q.exp){
      exp.innerHTML='<strong>💡 Explanation:</strong> '+q.exp;
      exp.style.display='';
    } else {
      exp.style.display='none';
    }
  }
  // Show Next button
  const nr=$id('q-next'); if(nr) nr.style.display='';
  // Update score display
  setText('q-score',_qScore);
  setText('q-acc',_qTotal>0?Math.round(_qScore/_qTotal*100)+'%':'0%');
  // Mark question as used (won't appear again until all questions exhausted)
  const key=_qKey();
  if(!_qUsedMap[key]) _qUsedMap[key]=new Set();
  _qUsedMap[key].add(_qQueue[_qPos]);
  // Log XP
  apiLog({section:_qSection,algo:_qAlgo,action:'quiz_correct',score:isR?1:0,total:1}).then(d=>{if(d&&d.xp_earned) setText('q-xp','+'+d.xp_earned+' XP');});
}

function nextQQ(){ _qPos++; if(_qPos>=_qQueue.length) showRoundComplete(); else loadQQ(); }

function showRoundComplete(){
  const el=$id('q-container'); if(!el) return;
  const pct=_qTotal>0?Math.round(_qScore/_qTotal*100):0;
  const grade=pct>=90?'A+':pct>=80?'A':pct>=70?'B':pct>=60?'C':'D';
  const rnd=_qRound[_qKey()]||1;
  el.innerHTML=`<div class="quiz-card"><div class="round-complete"><div class="rc-icon">${pct>=80?'🎉':pct>=60?'👍':'📚'}</div><div class="rc-title">Round ${rnd} Complete!</div><div class="rc-sub">${pct>=80?'Excellent work!':pct>=60?'Good effort! Keep going.':'Review and try again!'}</div><div class="rc-stats"><div class="rc-stat"><div class="rc-val">${_qScore}</div><div class="rc-lbl">Correct</div></div><div class="rc-stat"><div class="rc-val">${_qTotal}</div><div class="rc-lbl">Total</div></div><div class="rc-stat"><div class="rc-val">${pct}%</div><div class="rc-lbl">Accuracy</div></div><div class="rc-stat"><div class="rc-val">${grade}</div><div class="rc-lbl">Grade</div></div></div><button class="btn btn-primary btn-lg" onclick="startNextRound()">Start Round ${rnd+1} →</button></div></div>`;
  apiLog({section:_qSection,algo:_qAlgo,action:'quiz',score:_qScore,total:_qTotal,round:rnd});
}

function startNextRound(){ buildRound(); loadQQ(); }

function resetQuiz(){
  _qScore=0;_qTotal=0;_qUsedMap={};_qRoundMap={};_qQueue=[];_qPos=0;
  setText('q-score',0);setText('q-acc','0%');
  initQuiz(_qSection); toast('Quiz reset!');
}

// ══════════════════════════════════════════════════════════════
// INIT
// ══════════════════════════════════════════════════════════════
window.addEventListener('DOMContentLoaded',async()=>{
  applyTheme();

  // Verify stored token
  if(_token){
    const r=await apiCall('/me');
    if(r.ok){ _user={..._user,...r.data}; localStorage.setItem('sf4_user',JSON.stringify(_user)); }
    else{ _token=null; _user=null; localStorage.removeItem('sf4_token'); localStorage.removeItem('sf4_user'); }
  }

  // Route to correct page
  if(_token&&_user){
    updateUserUI(); showPage('app'); showView('dashboard'); loadDashboard();
  } else {
    showPage('landing');
  }

  // Init simulator defaults
  const defName='Bubble Sort';
  renderCode(defName,'python'); renderPseudo(defName); renderExplain(defName); renderSimCx(defName);
  const n=8; _arr=Array.from({length:n},()=>Math.floor(Math.random()*900)+100);
  drawArr(_arr,{},{},new Set());

  // Init tree defaults
  const defTree='Red-Black Tree';
  renderTreeCx(defTree); renderTreePseudo(defTree); renderTreeExp(defTree);

  // Wire compare ids for compare.js compatibility (maps old IDs if needed)
  // We use our own compare implementation so nothing extra needed
});
