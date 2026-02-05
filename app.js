const lessons = [
  {
    id: 1,
    title: "Jour 1 — Accord Em (Mi mineur)",
    text: `Aujourd’hui, on apprend ton premier accord : Mi mineur (Em).
Place ton index sur la 2e frette corde LA, et ton majeur sur la 2e frette corde RÉ.
Les autres cordes restent à vide.
Gratte doucement toutes les cordes : bas… bas… bas… puis bas-haut.
Objectif : 5 minutes, propre et détendu.`
  },
  {
    id: 2,
    title: "Jour 2 — Accord G (Sol majeur)",
    text: `Accord de Sol (G).
Majeur : 3e frette corde MI grave.
Index : 2e frette corde LA.
Annulaire : 3e frette corde MI aigu.
Gratte toutes les cordes. Objectif : son clair, sans friser.`
  },
  {
    id: 3,
    title: "Jour 3 — Accord C (Do majeur)",
    text: `Accord de Do (C).
Index : 1re frette corde SI.
Majeur : 2e frette corde RÉ.
Annulaire : 3e frette corde LA.
Ne joue pas la corde MI grave.
Objectif : placer les doigts sans toucher les autres cordes.`
  },
  {
    id: 4,
    title: "Jour 4 — Accord D (Ré majeur)",
    text: `Accord de Ré (D).
Index : 2e frette MI aigu.
Annulaire : 3e frette SI.
Majeur : 2e frette SOL.
Joue surtout les 4 cordes du bas.
Objectif : son propre + rythme régulier.`
  },
  {
    id: 5,
    title: "Jour 5 — Accord Am (La mineur)",
    text: `Accord de La mineur (Am).
Index : 1re frette SI.
Majeur : 2e frette RÉ.
Annulaire : 2e frette SOL.
Poignet détendu, doigts arrondis.
Objectif : 5 minutes + 20 changements Am ↔ Em.`
  },
  {
    id: 6,
    title: "Jour 6 — Enchaînements",
    text: `Enchaînement : Em → G → C → D.
Change lentement. 1 accord par seconde.
Cherche la précision, pas la vitesse.
Objectif : 10 passages propres.`
  },
  {
    id: 7,
    title: "Jour 7 — Première progression (G D Em C)",
    text: `Ta première progression : G → D → Em → C.
Fais 4 temps par accord.
Rythme : bas bas bas bas, puis bas-haut bas-haut.
Objectif : 3 minutes sans t’arrêter.`
  },
];

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
  els.lessonText.textContent = lesson.text;

  const p = loadProgress();
  els.toggleDoneBtn.textContent = p[id] ? "↩️ Marquer comme non fait" : "✅ Marquer comme fait";

  const vids = loadVideos();
  els.videoUrl.value = vids[id] || "";
  applyVideoEmbed(els.videoUrl.value);
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

  // Pré-sélection FR si possible
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
  const utt = new SpeechSynthesisUtterance(lesson.text);
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

  // YouTube simple (watch?v=) -> embed
  let embed = trimmed;
  const ytWatch = trimmed.match(/youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/);
  const youtuBe = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
  if (ytWatch) embed = `https://www.youtube.com/embed/${ytWatch[1]}`;
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
      // petit bip (si autorisé)
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

// Les voix arrivent parfois après chargement
speechSynthesis.onvoiceschanged = populateVoices;

renderLessonList();
populateVoices();
selectLesson(1);
