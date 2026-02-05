/* ------------------ Données & utils ------------------ */

function chordSVG({ name, frets, fingers, mute, open, fromFret=1 }) {
  // frets: array length 6 (strings E A D G B e) with fret number or 0
  // fingers: array length 6 with finger number (1-4) or 0
  // mute/open: arrays of string indices (0..5) to mark X or O on top
  const W = 280, H = 320;
  const padL = 42, padR = 18, padT = 52, padB = 18;
  const gridW = W - padL - padR;
  const gridH = H - padT - padB;

  const strings = 6;
  const fretsCount = 5;

  const xForString = (s) => padL + (gridW * s) / (strings - 1); // s: 0..5
  const yForFretLine = (f) => padT + (gridH * f) / fretsCount;  // f: 0..5 lines
  const yForFretCenter = (f) => {
    // center between fret lines: f=1..5
    const y1 = yForFretLine(f-1);
    const y2 = yForFretLine(f);
    return (y1 + y2) / 2;
  };

  const stringNames = ["Mi grave", "La", "Ré", "Sol", "Si", "Mi aigu"];
  const marks = new Array(6).fill("");
  (mute||[]).forEach(i => marks[i] = "X");
  (open||[]).forEach(i => marks[i] = "O");

  const svg = [];
  svg.push(`<svg class="chord-svg" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Diagramme accord ${name}">`);
  svg.push(`<text x="${padL}" y="28" fill="currentColor" font-size="18" font-weight="800">${name}</text>`);
  svg.push(`<text x="${W-padR}" y="28" fill="rgba(232,238,247,.7)" font-size="12" text-anchor="end">Case ${fromFret}</text>`);

  // top markers (X/O) + string labels
  for (let s=0; s<6; s++){
    const x = xForString(s);
    const mark = marks[s];
    if (mark){
      svg.push(`<text x="${x}" y="${padT-18}" fill="currentColor" font-size="14" text-anchor="middle" font-weight="800">${mark}</text>`);
    }
    svg.push(`<text x="${x}" y="${padT-2}" fill="rgba(232,238,247,.55)" font-size="10" text-anchor="middle">${stringNames[s]}</text>`);
  }

  // nut / first fret thick line
  svg.push(`<line x1="${padL}" y1="${padT}" x2="${W-padR}" y2="${padT}" stroke="currentColor" stroke-width="5" stroke-linecap="round" opacity="0.85"/>`);

  // fret lines
  for (let f=1; f<=fretsCount; f++){
    const y = yForFretLine(f);
    svg.push(`<line x1="${padL}" y1="${y}" x2="${W-padR}" y2="${y}" stroke="currentColor" stroke-width="1" opacity="0.35"/>`);
  }

  // string lines
  for (let s=0; s<strings; s++){
    const x = xForString(s);
    svg.push(`<line x1="${x}" y1="${padT}" x2="${x}" y2="${H-padB}" stroke="currentColor" stroke-width="1" opacity="0.35"/>`);
  }

  // finger dots
  for (let s=0; s<6; s++){
    const fret = frets[s];
    const finger = fingers[s];
    if (!fret || fret === 0) continue;

    const x = xForString(s);
    const y = yForFretCenter(fret - fromFret + 1);
    svg.push(`<circle cx="${x}" cy="${y}" r="12" fill="currentColor" opacity="0.9"/>`);
    if (finger){
      svg.push(`<text x="${x}" y="${y+4}" fill="#0b0f14" font-size="12" text-anchor="middle" font-weight="900">${finger}</text>`);
    }
  }

  svg.push(`</svg>`);
  return svg.join("");
}

function helpBlock(items){
  return `
    <details class="help">
      <summary>Problèmes fréquents (clique)</summary>
      <ul>
        ${items.map(i => `<li>${i}</li>`).join("")}
      </ul>
    </details>
  `;
}

function coachLesson({ title, intro, steps, strum, exercise, chord }) {
  return `
  <div class="coach">
    <div class="bubble">
      <div class="who">👨‍🏫 Coach</div>
      <div>${intro}</div>
    </div>

    <div class="grid2">
      <div class="chord-card">
        <div class="chord-title">
          <b>${chord.name}</b>
          <small>Diagramme + doigts</small>
        </div>
        ${chordSVG(chord)}
        <div class="kv">
          <div><b>Cordes à jouer</b></div><div>${chord.play}</div>
          <div><b>Cordes à éviter</b></div><div>${chord.avoid}</div>
          <div><b>Astuce</b></div><div>${chord.tip}</div>
        </div>
      </div>

      <div class="chord-card">
        <div class="chord-title"><b>Étapes</b><small>Position des doigts</small></div>
        <div class="kv">
          ${steps.map(s => `<div><b>${s.label}</b></div><div>${s.text}</div>`).join("")}
        </div>

        <div style="margin-top:10px" class="chord-title"><b>Rythme</b><small>à tester</small></div>
        <div class="lesson-text" style="margin-top:0">${strum}</div>

        <div style="margin-top:10px" class="chord-title"><b>Exercice</b><small>objectif</small></div>
        <div class="lesson-text" style="margin-top:0">${exercise}</div>
      </div>
    </div>
  </div>
  `;
}

/* ------------------ Leçons (B + C : texte + dialogue + visuels) ------------------ */

const lessons = [
  {
    id: 1,
    title: "Jour 1 — Accord Em (Mi mineur)",
    html: coachLesson({
      title: "Em",
      intro: "On commence avec <b>Mi mineur (Em)</b>. Il est simple et il sonne tout de suite “musique”.",
      chord: {
        name: "Em",
        frets: [0,2,2,0,0,0],           // E A D G B e
        fingers: [0,1,2,0,0,0],
        mute: [],
        open: [0,3,4,5],
        fromFret: 1,
        play: "✅ Toutes les cordes",
        avoid: "🚫 Aucune",
        tip: "Doigts arrondis + appuie près de la frette (pas au milieu)."
      },
      steps: [
        { label: "Index (1)", text: "2e frette, corde <b>La</b> (5e corde)." },
        { label: "Majeur (2)", text: "2e frette, corde <b>Ré</b> (4e corde)." },
        { label: "Vérifie", text: "Les autres cordes sont à vide (libres). Ne touche pas les cordes voisines." },
      ],
      strum: "Bas — Bas — Bas — Bas-Haut",
      exercise: "30 sec propre → 10 sec pause, répète 5 fois.",
    }) + helpBlock([
      "Ça “buzz” : rapproche ton doigt de la frette (sans être dessus) et appuie un peu plus.",
      "Une corde ne sonne pas : ton doigt touche sûrement une corde voisine → arrondis le doigt.",
      "Poignet tendu : baisse l’épaule, relâche la main, puis replace doucement."
    ])
  },

  {
    id: 2,
    title: "Jour 2 — Accord G (Sol majeur)",
    html: coachLesson({
      title: "G",
      intro: "Aujourd’hui : <b>Sol (G)</b>. Il est un peu plus “étiré”, mais ultra utile pour plein de chansons.",
      chord: {
        name: "G",
        frets: [3,2,0,0,0,3],
        fingers: [2,1,0,0,0,3],
        mute: [],
        open: [2,3,4],
        fromFret: 1,
        play: "✅ Toutes les cordes",
        avoid: "🚫 Aucune",
        tip: "Garde le pouce derrière le manche. Main ouverte, pas crispée."
      },
      steps: [
        { label: "Majeur (2)", text: "3e frette, corde <b>Mi grave</b> (6e)." },
        { label: "Index (1)", text: "2e frette, corde <b>La</b> (5e)." },
        { label: "Annulaire (3)", text: "3e frette, corde <b>Mi aigu</b> (1re)." },
      ],
      strum: "Bas — Bas — Bas — Bas (lent)",
      exercise: "Enchaîne <b>Em → G → Em → G</b> : 20 fois lentement.",
    }) + helpBlock([
      "Ça sonne étouffé : doigts trop à plat → pointe des doigts + ongles courts si possible.",
      "Douleur pouce : pouce trop haut → recule-le derrière le manche.",
      "Tu rates la 1re corde : annulaire trop bas → relève légèrement l’annulaire."
    ])
  },

  {
    id: 3,
    title: "Jour 3 — Accord C (Do majeur)",
    html: coachLesson({
      title: "C",
      intro: "On apprend <b>Do (C)</b>. Ici, il y a une règle : <b>on évite la corde Mi grave</b>.",
      chord: {
        name: "C",
        frets: [0,3,2,0,1,0],
        fingers: [0,3,2,0,1,0],
        mute: [0],
        open: [3,5],
        fromFret: 1,
        play: "✅ De la corde La jusqu’à Mi aigu",
        avoid: "🚫 Mi grave (6e corde)",
        tip: "Pour éviter la 6e corde : vise la 5e corde en premier avec le médiator."
      },
      steps: [
        { label: "Index (1)", text: "1re frette, corde <b>Si</b> (2e)." },
        { label: "Majeur (2)", text: "2e frette, corde <b>Ré</b> (4e)." },
        { label: "Annulaire (3)", text: "3e frette, corde <b>La</b> (5e)." },
      ],
      strum: "Bas (à partir de La) — Bas — Bas",
      exercise: "20 fois : <b>G → C</b> (très lent). Cherche un son propre.",
    }) + helpBlock([
      "Tu touches Mi grave : déplace ton attaque, commence sur La (5e corde).",
      "Ça frise sur Si : index trop loin → rapproche-le de la frette 1.",
      "Main tendue : recule un peu le coude, relâche l’épaule."
    ])
  },

  {
    id: 4,
    title: "Jour 4 — Accord D (Ré majeur)",
    html: coachLesson({
      title: "D",
      intro: "Aujourd’hui : <b>Ré (D)</b>. On va surtout jouer les cordes du bas. C’est un accord “propre”.",
      chord: {
        name: "D",
        frets: [0,0,0,2,3,2],
        fingers: [0,0,0,1,3,2],
        mute: [0,1],
        open: [2],
        fromFret: 1,
        play: "✅ Sol + Si + Mi aigu (et Ré si tu veux)",
        avoid: "🚫 Mi grave et La (cordes du haut)",
        tip: "Attaque plutôt à partir de la corde Ré (4e) ou Sol (3e)."
      },
      steps: [
        { label: "Index (1)", text: "2e frette, corde <b>Sol</b> (3e)." },
        { label: "Annulaire (3)", text: "3e frette, corde <b>Si</b> (2e)." },
        { label: "Majeur (2)", text: "2e frette, corde <b>Mi aigu</b> (1re)." },
      ],
      strum: "Bas (cordes du bas) — Bas-Haut — Bas-Haut",
      exercise: "Fais sonner chaque corde une par une, puis gratte doucement.",
    }) + helpBlock([
      "Tu joues trop de cordes : vise à partir de Ré/Sol, pas depuis le haut.",
      "Ça buzz sur Mi aigu : majeur trop loin → près de la frette 2.",
      "Doigts se touchent : écarte légèrement index/majeur (forme un petit “triangle”)."
    ])
  },

  {
    id: 5,
    title: "Jour 5 — Accord Am (La mineur)",
    html: coachLesson({
      title: "Am",
      intro: "Voici <b>La mineur (Am)</b>. Très important. Il ressemble à Do, mais plus simple à jouer.",
      chord: {
        name: "Am",
        frets: [0,0,2,2,1,0],
        fingers: [0,0,2,3,1,0],
        mute: [0],
        open: [1,5],
        fromFret: 1,
        play: "✅ De la corde La jusqu’à Mi aigu",
        avoid: "🚫 Mi grave (6e corde)",
        tip: "Index “barre” légère sur Si (2e corde), bien arrondi."
      },
      steps: [
        { label: "Index (1)", text: "1re frette, corde <b>Si</b> (2e)." },
        { label: "Majeur (2)", text: "2e frette, corde <b>Ré</b> (4e)." },
        { label: "Annulaire (3)", text: "2e frette, corde <b>Sol</b> (3e)." },
      ],
      strum: "Bas (à partir de La) — Bas — Bas-Haut",
      exercise: "20 changements : <b>Am ↔ Em</b> lentement.",
    }) + helpBlock([
      "Corde Si étouffée : index touche Mi aigu → replie/arrondis l’index.",
      "Tu touches Mi grave : commence ton grattage sur La (5e corde).",
      "Main fatiguée : fais 2 minutes, pause 30 sec, puis recommence."
    ])
  },

  {
    id: 6,
    title: "Jour 6 — Enchaînements (Em → G → C → D)",
    html: `
      <div class="coach">
        <div class="bubble">
          <div class="who">👨‍🏫 Coach</div>
          <div>
            Aujourd’hui, on devient fluide : <b>Em → G → C → D</b>.
            Objectif : changer sans panique, même si c’est lent.
          </div>
        </div>

        <div class="grid2">
          <div class="chord-card">
            <div class="chord-title"><b>Règle d’or</b><small>précision</small></div>
            <div class="lesson-text">
              1) Pose les doigts “ensemble” plutôt qu’un par un.<br/>
              2) Si un accord sonne faux : <b>arrête</b>, corrige, puis repars.<br/>
              3) Mieux vaut <b>lent et propre</b> que rapide et sale.
            </div>

            <div class="pills" id="comboPills">
              <div class="pill" data-combo="Em → G">Em → G</div>
              <div class="pill" data-combo="G → C">G → C</div>
              <div class="pill" data-combo="C → D">C → D</div>
              <div class="pill" data-combo="D → Em">D → Em</div>
            </div>
            <p class="muted" id="comboHint">Clique sur un enchaînement pour voir une astuce.</p>
          </div>

          <div class="chord-card">
            <div class="chord-title"><b>Exercice</b><small>5 minutes</small></div>
            <div class="lesson-text">
              Mets un rythme simple : <b>Bas — Bas — Bas — Bas</b><br/>
              4 temps par accord, et tu changes.<br/><br/>
              1) Em (4 temps)<br/>
              2) G (4 temps)<br/>
              3) C (4 temps) (évite Mi grave)<br/>
              4) D (4 temps) (cordes du bas)<br/><br/>
              Fais 5 tours.
            </div>
          </div>
        </div>
      </div>
      ${helpBlock([
        "Si tu bloques sur G→C : fais juste G↔C 20 fois, sans rythme au début.",
        "Si C sonne faux : vérifie que tu ne joues pas Mi grave.",
        "Si D est brouillon : vise les cordes du bas (Ré/Sol/Si/Mi aigu)."
      ])}
    `
  },

  {
    id: 7,
    title: "Jour 7 — Mini chanson (G → D → Em → C)",
    html: `
      <div class="coach">
        <div class="bubble">
          <div class="who">👨‍🏫 Coach</div>
          <div>
            Aujourd’hui : ta première “chanson” avec une progression classique :
            <b>G → D → Em → C</b>. Bravo, c’est un vrai cap.
          </div>
        </div>

        <div class="grid2">
          <div class="chord-card">
            <div class="chord-title"><b>Rythme</b><small>simple</small></div>
            <div class="lesson-text">
              4 temps par accord :<br/>
              <b>Bas — Bas — Bas — Bas</b><br/><br/>
              Puis si tu veux monter :<br/>
              <b>Bas-Haut — Bas-Haut</b>
            </div>

            <div class="chord-title" style="margin-top:10px"><b>Important</b><small>cordes</small></div>
            <div class="lesson-text">
              Pour <b>D</b> : plutôt les cordes du bas.<br/>
              Pour <b>C</b> : évite la corde Mi grave.
            </div>
          </div>

          <div class="chord-card">
            <div class="chord-title"><b>Exercice</b><small>3 minutes</small></div>
            <div class="lesson-text">
              Fais la boucle sans t’arrêter :<br/>
              G (4 temps) → D (4 temps) → Em (4 temps) → C (4 temps)<br/><br/>
              Objectif : rester régulier. Même lent, c’est parfait.
            </div>
          </div>
        </div>
      </div>
      ${helpBlock([
        "Si tu te perds : dis les accords à voix haute pendant que tu joues.",
        "Si le rythme casse : ralentis et repars sur Bas — Bas — Bas — Bas.",
        "Si C/D sonnent bizarres : respecte les cordes à éviter."
      ])}
    `
  }
];

/* ------------------ UI existante (avec améliorations) ------------------ */

const els = {
  lessonList: document.getElementById("lessonList"),
  lessonTitle: document.getElementById("lessonTitle"),
  lessonText: document.getElementById("lessonText"),
  speakBtn: document.getElementById("speakBtn"),
  stopBtn: document.getElementById("stopBtn"),
  toggleDoneBtn: document.getElementById("toggleDoneBtn"),
  doneCount: document.getElementById("doneCount"),
  resetProgress: document.getElementById("resetProgress"),
  voiceSelect: document.getElementById("voiceSelect"),
  rate: document.getElementById("rate"),
  rateVal: document.getElementById("rateVal"),
  videoUrl: document.getElementById("videoUrl"),
  applyVideo: document.getElementById("applyVideo"),
  videoFrame: document.getElementById("videoFrame"),
  minutes: document.getElementById("minutes"),
  startTimer: document.getElementById("startTimer"),
  stopTimer: document.getElementById("stopTimer"),
  timerStatus: document.getElementById("timerStatus"),
};

let currentLessonId = null;
let timerHandle = null;
let timerEnd = null;

const storageKey = "guitare7_progress_v1";
const videoKey = "guitare7_video_urls_v1";

function loadProgress(){
  try { return JSON.parse(localStorage.getItem(storageKey)) || {}; }
  catch { return {}; }
}
function saveProgress(p){ localStorage.setItem(storageKey, JSON.stringify(p)); }

function loadVideos(){
  try { return JSON.parse(localStorage.getItem(videoKey)) || {}; }
  catch { return {}; }
}
function saveVideos(v){ localStorage.setItem(videoKey, JSON.stringify(v)); }

function updateDoneCount(){
  const p = loadProgress();
  const done = lessons.filter(l => p[l.id]).length;
  els.doneCount.textContent = String(done);
}

function renderLessonList(){
  const p = loadProgress();
  els.lessonList.innerHTML = "";
  lessons.forEach(l => {
    const li = document.createElement("li");
    const btn = document.createElement("button");
    btn.textContent = l.title;
    btn.className = p[l.id] ? "done" : "";
    btn.onclick = () => selectLesson(l.id);
    li.appendChild(btn);
    els.lessonList.appendChild(li);
  });
  updateDoneCount();
}

function selectLesson(id){
  currentLessonId = id;
  const lesson = lessons.find(l => l.id === id);
  els.lessonTitle.textContent = lesson.title;

  // IMPORTANT : on affiche du HTML (dialogue + diagrammes)
  els.lessonText.innerHTML = lesson.html;

  const p = loadProgress();
  els.toggleDoneBtn.textContent = p[id] ? "↩️ Marquer comme non fait" : "✅ Marquer comme fait";

  const vids = loadVideos();
  els.videoUrl.value = vids[id] || "";
  applyVideoEmbed(els.videoUrl.value);

  // Petit bonus interactif jour 6
  if (id === 6){
    const pills = document.getElementById("comboPills");
    const hint = document.getElementById("comboHint");
    if (pills && hint){
      pills.querySelectorAll(".pill").forEach(el => {
        el.onclick = () => {
          const combo = el.getAttribute("data-combo");
          const tips = {
            "Em → G": "Astuce : garde l’index “ancre” près de la 2e case, et bouge le reste.",
            "G → C": "Astuce : vise d’abord l’annulaire du C (3e frette La), puis complète.",
            "C → D": "Astuce : remonte la main vers les cordes du bas, attaque depuis Ré/Sol.",
            "D → Em": "Astuce : relâche, puis pose index+majeur ensemble sur la 2e case."
          };
          hint.textContent = tips[combo] || "Astuce : fais-le très lentement, propre.";
        };
      });
    }
  }
}

function toggleDone(){
  if (!currentLessonId) return;
  const p = loadProgress();
  p[currentLessonId] = !p[currentLessonId];
  saveProgress(p);
  renderLessonList();
  selectLesson(currentLessonId);
}

function resetProgress(){
  localStorage.removeItem(storageKey);
  renderLessonList();
  if (currentLessonId) selectLesson(currentLessonId);
}

/* ---------- TTS (gratuit navigateur) ---------- */
function populateVoices(){
  const voices = speechSynthesis.getVoices() || [];
  const fr = voices.filter(v => (v.lang || "").toLowerCase().startsWith("fr"));
  els.voiceSelect.innerHTML = "";

  const list = fr.length ? fr : voices;
  list.forEach((v, idx) => {
    const opt = document.createElement("option");
    opt.value = String(idx);
    opt.textContent = `${v.name} (${v.lang})`;
    els.voiceSelect.appendChild(opt);
  });

  const frIndex = list.findIndex(v => (v.lang || "").toLowerCase().startsWith("fr"));
  els.voiceSelect.selectedIndex = frIndex >= 0 ? frIndex : 0;
}

function getSelectedVoice(){
  const voices = speechSynthesis.getVoices() || [];
  const fr = voices.filter(v => (v.lang || "").toLowerCase().startsWith("fr"));
  const list = fr.length ? fr : voices;
  const idx = Number(els.voiceSelect.value || 0);
  return list[idx] || null;
}

function speakCurrent(){
  if (!currentLessonId) return;
  speechSynthesis.cancel();

  const lesson = lessons.find(l => l.id === currentLessonId);

  // On lit une version “texte” (sans HTML)
  const tmp = document.createElement("div");
  tmp.innerHTML = lesson.html;
  const plain = tmp.innerText;

  const utt = new SpeechSynthesisUtterance(plain);
  utt.lang = "fr-FR";
  const v = getSelectedVoice();
  if (v) utt.voice = v;
  utt.rate = Number(els.rate.value || 1);

  speechSynthesis.speak(utt);
}

function stopSpeak(){ speechSynthesis.cancel(); }

/* ---------- Vidéo embed ---------- */
function applyVideoEmbed(url){
  els.videoFrame.innerHTML = "";
  const trimmed = (url || "").trim();
  if (!trimmed) return;

  let embed = trimmed;

  // Shorts -> watch?v=
  const shorts = trimmed.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/);
  if (shorts) embed = `https://www.youtube.com/embed/${shorts[1]}`;

  // YouTube watch
  const ytWatch = trimmed.match(/youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/);
  if (ytWatch) embed = `https://www.youtube.com/embed/${ytWatch[1]}`;

  // youtu.be
  const youtuBe = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
  if (youtuBe) embed = `https://www.youtube.com/embed/${youtuBe[1]}`;

  const iframe = document.createElement("iframe");
  iframe.src = embed;
  iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
  iframe.allowFullscreen = true;
  els.videoFrame.appendChild(iframe);
}

function saveVideoUrl(){
  if (!currentLessonId) return;
  const vids = loadVideos();
  vids[currentLessonId] = els.videoUrl.value.trim();
  saveVideos(vids);
  applyVideoEmbed(vids[currentLessonId]);
}

/* ---------- Timer ---------- */
function startTimer(){
  const mins = Math.max(1, Math.min(60, Number(els.minutes.value || 5)));
  const ms = mins * 60 * 1000;
  timerEnd = Date.now() + ms;

  if (timerHandle) clearInterval(timerHandle);
  timerHandle = setInterval(() => {
    const left = timerEnd - Date.now();
    if (left <= 0){
      clearInterval(timerHandle);
      timerHandle = null;
      els.timerStatus.textContent = "Terminé ✅";
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.frequency.value = 880;
        g.gain.value = 0.06;
        o.start();
        setTimeout(() => { o.stop(); ctx.close(); }, 200);
      } catch {}
      return;
    }
    const sec = Math.ceil(left / 1000);
    const m = Math.floor(sec / 60);
    const s = String(sec % 60).padStart(2, "0");
    els.timerStatus.textContent = `En cours… ${m}:${s} restantes`;
  }, 250);

  els.timerStatus.textContent = "En cours…";
}

function stopTimer(){
  if (timerHandle) clearInterval(timerHandle);
  timerHandle = null;
  els.timerStatus.textContent = "Arrêté.";
}

/* ---------- Events ---------- */
els.speakBtn.onclick = speakCurrent;
els.stopBtn.onclick = stopSpeak;
els.toggleDoneBtn.onclick = toggleDone;
els.resetProgress.onclick = resetProgress;
els.applyVideo.onclick = saveVideoUrl;

els.rate.oninput = () => { els.rateVal.textContent = Number(els.rate.value).toFixed(2); };

els.startTimer.onclick = startTimer;
els.stopTimer.onclick = stopTimer;

window.addEventListener("beforeunload", () => stopSpeak());
speechSynthesis.onvoiceschanged = populateVoices;

renderLessonList();
populateVoices();
selectLesson(1);