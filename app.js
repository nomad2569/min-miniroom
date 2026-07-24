import * as THREE from 'three';

/* ================================================================
   ミンのミニルーム — Cyworld-style isometric miniroom
   Presentation mode: linear steps + camera focus + minimi reactions.
   All geometry = three.js primitives. No external assets.
   ================================================================ */

const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ── palette ──────────────────────────────────────── */
const COL = {
  /* night room — dark chic, warm accents survive in the dark */
  floorTop:   '#8A6B4E',
  floorLine:  '#6E5238',
  floorSide:  0x5E4732,
  wallBack:   0x453B47,
  wallLeft:   0x39443F,
  baseboard:  0x746C7A,
  pedestal:   0x241F28,
  wood:       0xA1754F,
  cream:      0x3A343E,
  white:      0xE8E2DA,
  navy:       0x3A4160,
  skin:       0xFFE0C7,
  hair:       0x4A3628,
  uniqloTee:  0xE8474F,
  pants:      0xFDFDFB,
  coral:      0xC96A5E,
  coralLight: 0xE08A78,
  lavender:   0x8F82B8,
  gold:       0xF2C14E,
  ttGreen:    '#3DBE87',
  uniqloRed:  '#E60012',
};

/* ── stories (presentation content) ───────────────── */
const ITEMS = {
  minimi: {
    tag: 'HELLO', name: 'ミンミ(ぼく)', title: 'はじめまして!',
    story: '韓国から来ました、キム・ミンギュと申します。「ミン」と呼んでください。TimeTree Korea の 10x チームで働いています。今日はよろしくお願いします!',
    en: "Hi! I'm Minkyu Kim from Korea — please call me Min. I work on the 10x team at TimeTree Korea.",
  },
  frame: {
    tag: '2000 — 仁川', name: '額縁', title: '仁川生まれです',
    story: '2000年、仁川(インチョン)生まれです。港と空港の街です。20歳からは、ソウルに住んでいます。',
    en: 'Born in Incheon in 2000 — the city of the port and the airport. Living in Seoul since I was 20.',
  },
  nameplate: {
    tag: 'MIN = ¬MAX', name: 'ネームプレート', title: '「Min」という名前の由来',
    story: 'ニックネームは、本当は「Max」にしたかったのですが、社内にすでに Max さんがいました。それで、反対の「Min」にしました。MIN = NOT MAX です。',
    en: 'I wanted the nickname "Max" — but TimeTree already had a Max. So I took the opposite: MIN = ¬MAX.',
  },
  beret: {
    tag: 'ARMY 2021→2022', name: 'ベレー帽', title: '軍隊では運転兵でした',
    story: '韓国の男性には兵役があります。陸軍で運転兵(ドライバー)として1年半服務して、兵長で満期除隊しました。おかげで運転は今でも得意です(笑)',
    en: 'Served 18 months in the Korean Army as a military driver, discharged as sergeant. Still a very confident driver!',
  },
  game: {
    tag: '2013 — LoL', name: 'ゲーム機', title: 'LoL 韓国サーバー 500位',
    story: '中学生のころ、LoL 韓国サーバーで500位まで行きました。でも、「これで食べていくのは難しい」と気づきました。ゲームは今も大好きです。',
    en: "Hit rank 500 on the Korean LoL server in middle school — then realized I couldn't make a living at it. Still love games, though.",
  },
  study: {
    tag: 'C → CS → STARTUP', name: '卒業帽', title: '開発者になった道',
    story: 'そこから C言語で勉強を始めて、高麗(コリョ)大学のコンピュータ学科に進みました。在学中は、スタートアップでフルスタックエンジニアとして働きました。',
    en: 'Started with C, studied Computer Science at Korea University, and worked at startups as a full-stack engineer along the way.',
  },
  calendar: {
    tag: '2023→2025 — NETY', name: 'カレンダー', title: 'カレンダーで起業しました',
    story: '大学生向けカレンダー「NETY」を創業しました。企画からフロントエンド、バックエンド、インフラまで、フルスタックで一人で開発しました。そして2025年、TimeTree に加わりました。',
    en: 'Founded NETY, a calendar for university students — built it full-stack solo, from planning to front-end, back-end and infra. Joined TimeTree in 2025.',
  },
  desk: {
    tag: 'WORK — TIMETREE', name: 'デスク', title: 'TimeTree でやってきたこと',
    story: '入社してから、こんなことをやってきました:',
    list: [
      'Ruby on Rails — oven-webapp 開発',
      'TTKR: LangGraph で学事日程の収集を自動化',
      'Partner API',
      'Planner アプリ',
      'SCE(これから参加予定)',
    ],
    en: 'At TimeTree: Rails (oven-webapp), automated academic-schedule collection with LangGraph at TTKR, the Partner API, the Planner app — and SCE next.',
  },
  gadget: {
    tag: 'GADGETS', name: 'キーボード', title: '電子機器、集めています',
    story: '電子機器を集めるのが趣味です。キーボードは REALFORCE R4。PC、モニター、ヘッドセット、ドライヤーまで、良いガジェットは全部欲しくなります。',
    en: "I collect gadgets — REALFORCE R4 keyboard, monitors, headsets… even hair dryers. If it's good hardware, I want it.",
  },
  server: {
    tag: 'HOMELAB', name: 'サーバーラック', title: '家にサーバーがあります',
    story: 'AWS の料金が痛くて、家にサーバーを建てました。Proxmox + Talos + Kubernetes、ArgoCD でアプリ50個以上が動いています。UPS と LTE のバックアップ回線まであります。',
    en: 'AWS bills hurt, so I built a home lab: Proxmox + Talos + Kubernetes, 50+ apps on ArgoCD — with UPS and LTE backup.',
  },
  sofa: {
    tag: 'OVERWATCH 2', name: 'ソファ', title: '妻とデュオを組んでいます',
    story: '去年、結婚しました。妻とオーバーウォッチ2で、DPS とヒーラーのデュオを組んでいます。チームワークは家庭でも大事です。',
    en: 'Married last year. My wife and I duo in Overwatch 2 — DPS and healer. Teamwork matters at home too.',
  },
  tennis: {
    tag: 'TENNIS', name: 'テニスラケット', title: 'テニスとフェデラー',
    story: 'テニスは大学のサークルで始めました。いちばん好きな選手はフェデラーです。日本のみなさん、今度一緒にどうですか?',
    en: 'Started tennis in a university club — Federer is my favorite. Anyone up for a match?',
  },
  books: {
    tag: '2025→2026 — 日本語', name: '本棚', title: '日本語、勉強中です',
    story: 'TimeTree に入ってから日本語を始めました。去年 JLPT N3 に合格して、今年は N2 に挑戦します。間違えたら、やさしく教えてください。',
    en: 'Started Japanese after joining TimeTree — passed JLPT N3, aiming for N2 this year. Please correct me kindly!',
  },
  figure: {
    tag: 'ANIME', name: 'フィギュア', title: '初めて完走したアニメ',
    story: '日本語の勉強を兼ねて、初めて完走したアニメが「進撃の巨人」です。夢中になりすぎて、勉強になったかは微妙です。この調査兵団のフィギュアは宝物です。',
    en: 'Attack on Titan was the first anime I ever finished — technically "for Japanese practice". This Survey Corps figure is my treasure.',
  },
  uniqlo: {
    tag: 'UNIQLO', name: 'ユニクロの袋', title: 'ユニクロ中毒です',
    story: '去年からユニクロにハマっています。日本に来るたびに、大型店で爆買いします。おすすめの店舗があったら、ぜひ教えてください!',
    en: 'Hooked on UNIQLO since last year — I binge-shop the big stores every Japan trip. Store recommendations welcome!',
  },
};
/* linear presentation order */
const ORDER = ['minimi', 'frame', 'nameplate', 'game', 'study', 'beret', 'calendar', 'desk', 'gadget', 'server', 'sofa', 'tennis', 'books', 'figure', 'uniqlo'];
const EMOTES = { minimi: '!', frame: '☆', nameplate: '!', game: '★', study: '✎', beret: '!', calendar: '✎', desk: '♪', gadget: '!', server: '◎', sofa: '♥', tennis: '!', books: 'あ', figure: '★', uniqlo: '☆', thanks: '♥' };
/* generated pixel emote icons (fallback: canvas bubble with the char above) */
const EMOTE_ASSET = {
  minimi: 'emote-ex', frame: 'emote-star', nameplate: 'emote-idea', game: 'emote-star',
  study: 'emote-idea', beret: 'emote-ex', calendar: 'emote-idea', desk: 'emote-note',
  gadget: 'emote-bolt', server: 'emote-bolt', sofa: 'emote-heart', tennis: 'emote-ex',
  books: 'emote-book', figure: 'emote-star', uniqlo: 'emote-heart', thanks: 'emote-heart',
};
const INTRO = {
  tag: 'START', title: 'ミンのミニルーム',
  story: 'スペースキー(または →)でプレゼンが進みます。家具を直接クリックしてもOK、ドラッグで部屋をまわせます。',
  en: 'Press Space (or →) to advance. Click any furniture directly — drag to spin the room.',
};
const THANKS = {
  tag: 'ありがとう', title: 'これからも、よろしくお願いします!',
  story: 'ご清聴ありがとうございました。TimeTree で、人類の時間管理をもっと良くするために、全力を尽くします。これからも、どうぞよろしくお願いいたします!',
  en: "Thank you for listening! I'll give my all at TimeTree to advance how humanity manages time. Yoroshiku onegaishimasu!",
  logo: true,
};

/* ── renderer / scene / camera ────────────────────── */
const stage = document.getElementById('stage');
/* perf: no MSAA (pixel-art scene), low-power GPU hint, capped DPR;
   shadow maps only matter for the 3D-fallback scene */
const HAS_PIXEL_SCENE = !!(typeof window !== 'undefined' && window.GEN_ASSETS && window.GEN_ASSETS['minimi-sprite']);
const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: 'low-power' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
renderer.shadowMap.enabled = !HAS_PIXEL_SCENE;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
stage.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 80);

const BASE_TARGET = new THREE.Vector3(0.2, 1.0, 0.2);
const curTarget = BASE_TARGET.clone();
const DIST = 17, CAM_H = 12.5;
const AZ_BASE = Math.PI / 4, AZ_MAX = THREE.MathUtils.degToRad(24);
let azOffset = 0, azTarget = 0;
let focusPoint = null;
let zoomTarget = 1;

function placeCamera() {
  const az = AZ_BASE + azOffset;
  camera.position.set(
    curTarget.x + Math.sin(az) * DIST,
    CAM_H + (curTarget.y - BASE_TARGET.y),
    curTarget.z + Math.cos(az) * DIST
  );
  camera.lookAt(curTarget);
}
function focusOn(wp) {
  focusPoint = new THREE.Vector3(
    THREE.MathUtils.clamp(wp.x, -4.2, 4.2),
    THREE.MathUtils.clamp(wp.y + 0.5, 1.0, 2.8),
    THREE.MathUtils.clamp(wp.z, -4.2, 4.2)
  );
  zoomTarget = 1.32;
}
function resetFocus() { focusPoint = null; zoomTarget = 1; }

function resize() {
  const w = stage.clientWidth, h = stage.clientHeight, aspect = w / h;
  let half = 6.3;
  if (half * aspect < 7.8) half = 7.8 / aspect;
  half = Math.min(half, 9.2);   /* portrait: crop room edges instead of shrinking it away */
  camera.left = -half * aspect; camera.right = half * aspect;
  camera.top = half; camera.bottom = -half;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
}
addEventListener('resize', resize);

/* ── lights (night) ───────────────────────────────── */
scene.add(new THREE.AmbientLight(0xC8BEDC, 0.5));
scene.add(new THREE.HemisphereLight(0x9FA8D8, 0x4A3A30, 0.35));
const sun = new THREE.DirectionalLight(0xFFDFAE, 1.15);   /* warm lamp key light */
sun.position.set(7, 13, 8);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -10; sun.shadow.camera.right = 10;
sun.shadow.camera.top = 10; sun.shadow.camera.bottom = -10;
sun.shadow.camera.far = 40;
sun.shadow.bias = -0.0004;
scene.add(sun);

/* ── helpers ──────────────────────────────────────── */
function mat(color, o = {}) {
  return new THREE.MeshStandardMaterial({
    color, roughness: o.rough ?? 0.92, metalness: o.metal ?? 0,
    map: o.map ?? null, side: o.side ?? THREE.FrontSide,
    transparent: o.transparent ?? false, opacity: o.opacity ?? 1,
    emissive: o.emissive ?? 0x000000, emissiveIntensity: o.ei ?? 1,
  });
}
function box(w, h, d, m) { const g = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); g.castShadow = g.receiveShadow = true; return g; }
function cyl(rt, rb, h, m, seg = 24) { const g = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), m); g.castShadow = g.receiveShadow = true; return g; }
function sph(r, m, w = 20, hh = 14) { const g = new THREE.Mesh(new THREE.SphereGeometry(r, w, hh), m); g.castShadow = g.receiveShadow = true; return g; }
function capsule(r, len, m) { const g = new THREE.Mesh(new THREE.CapsuleGeometry(r, len, 6, 14), m); g.castShadow = g.receiveShadow = true; return g; }
function torus(r, t, m, arc = Math.PI * 2) { const g = new THREE.Mesh(new THREE.TorusGeometry(r, t, 10, 28, arc), m); g.castShadow = g.receiveShadow = true; return g; }
function plane(w, h, m) { const g = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m); g.receiveShadow = true; return g; }
function ctex(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
/* AI-generated assets baked by scripts/bake_assets.py — null when absent,
   so every use site keeps its procedural fallback. */
const GEN = (typeof window !== 'undefined' && window.GEN_ASSETS) || {};
function genTex(name) {
  if (!GEN[name]) return null;
  const img = new Image();
  const t = new THREE.Texture(img);
  t.colorSpace = THREE.SRGBColorSpace;
  img.onload = () => { t.needsUpdate = true; };
  img.src = GEN[name];
  return t;
}
/* crisp pixel-art texture entry: { tex, aspect } (aspect fills in on load) */
function pixelTexEntry(name) {
  const img = new Image();
  const t = new THREE.Texture(img);
  t.colorSpace = THREE.SRGBColorSpace;
  t.magFilter = THREE.NearestFilter;
  t.minFilter = THREE.LinearFilter;
  t.generateMipmaps = false;
  const entry = { tex: t, aspect: 1 };
  img.onload = () => { entry.aspect = img.width / img.height; t.needsUpdate = true; };
  img.src = GEN[name];
  return entry;
}
const blobTexShared = ctex(128, 128, (x, w, h) => {
  const g2 = x.createRadialGradient(w / 2, h / 2, 4, w / 2, h / 2, w / 2);
  g2.addColorStop(0, 'rgba(0,0,0,0.45)'); g2.addColorStop(1, 'rgba(0,0,0,0)');
  x.fillStyle = g2; x.fillRect(0, 0, w, h);
});
function makeBlob(r) {
  const m = new THREE.Mesh(
    new THREE.CircleGeometry(r, 24),
    new THREE.MeshBasicMaterial({ map: blobTexShared, transparent: true, depthWrite: false })
  );
  m.rotation.x = -Math.PI / 2;
  return m;
}
/* generated pixel-art furniture: floor items = camera-facing sprite with a
   bottom pivot + soft blob shadow; wall items = plane fixed to the wall.
   Returns false when the asset is missing so the 3D builder can run instead. */
function spriteItem(id, asset, height, pos, opts = {}) {
  if (!GEN[asset]) return false;
  const g = new THREE.Group();
  const img = new Image();
  const tex = new THREE.Texture(img);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.LinearFilter;
  tex.generateMipmaps = false;
  const bottomPlane = (w, h) => {
    const geo = new THREE.PlaneGeometry(w, h);
    geo.translate(0, h / 2, 0);      /* pivot at the feet */
    return geo;
  };
  let node, blob = null;
  if (opts.wall) {
    node = new THREE.Mesh(
      new THREE.PlaneGeometry(height * 0.75, height),
      new THREE.MeshBasicMaterial({ map: tex, transparent: true, color: 0xD8D2CE })
    );
    if (opts.wall === 'left') node.rotation.y = Math.PI / 2;
  } else {
    /* upright plane facing the default camera — a billboard Sprite would lean
       back with the view and punch through the walls behind tall furniture */
    node = new THREE.Mesh(
      bottomPlane(height * 0.75, height),
      new THREE.MeshBasicMaterial({ map: tex, transparent: true, color: 0xD8D2CE, side: THREE.DoubleSide })
    );
    node.rotation.y = AZ_BASE;
    blob = makeBlob(1);
    blob.position.y = 0.015;
    blob.scale.set(height * 0.35, height * 0.16, 1);
    g.add(blob);
  }
  img.onload = () => {
    const w = height * img.width / img.height;
    node.geometry.dispose();
    node.geometry = opts.wall ? new THREE.PlaneGeometry(w, height) : bottomPlane(w, height);
    /* ground the sprite: elliptical shadow matched to its width */
    if (blob) blob.scale.set(w * 0.52, w * 0.2, 1);
    tex.needsUpdate = true;
  };
  img.src = GEN[asset];
  g.add(node);
  g.position.set(pos[0], pos[1], pos[2]);
  scene.add(g);
  if (id) register(g, id, opts.lift);
  return true;
}

/* ── interactables registry ───────────────────────── */
const interactables = [];
function register(group, id, liftVec) {
  group.userData.id = id;
  interactables.push({
    id, group,
    lift: 0, liftT: 0,
    vec: liftVec || new THREE.Vector3(0, 0.22, 0),
    baseP: group.position.clone(),
    baseS: group.scale.x,
  });
}

/* ================================================================
   ROOM
   ================================================================ */
{
  const ped = box(11.8, 0.55, 11.8, mat(COL.pedestal));
  ped.position.y = -0.6; ped.castShadow = false;
  scene.add(ped);
}
{
  const floorTex = ctex(512, 512, (x, w, h) => {
    x.fillStyle = COL.floorTop; x.fillRect(0, 0, w, h);
    x.strokeStyle = COL.floorLine; x.lineWidth = 3;
    const rows = 12, seg = w / 3;
    for (let r = 0; r < rows; r++) {
      const y = r * h / rows;
      x.beginPath(); x.moveTo(0, y); x.lineTo(w, y); x.stroke();
      const off = (r % 2) * seg * 0.5;
      for (let s = 0; s < 5; s++) {
        const px = ((s * seg + off) % w);
        x.beginPath(); x.moveTo(px, y); x.lineTo(px, y + h / rows); x.stroke();
      }
      x.fillStyle = r % 2 ? 'rgba(255,255,255,0.05)' : 'rgba(140,100,60,0.05)';
      x.fillRect(0, y, w, h / rows);
      x.fillStyle = COL.floorTop;
    }
  });
  const fl = box(10.6, 0.3, 10.6, [
    mat(COL.floorSide), mat(COL.floorSide), mat(0xffffff, { map: floorTex }),
    mat(COL.floorSide), mat(COL.floorSide), mat(COL.floorSide),
  ]);
  fl.position.y = -0.15;
  scene.add(fl);
}
{
  const wb = box(10.95, 6.6, 0.35, mat(COL.wallBack));
  wb.position.set(-0.175, 3.0, -5.125); wb.castShadow = false;
  scene.add(wb);
  const wl = box(0.35, 6.6, 10.6, mat(COL.wallLeft));
  wl.position.set(-5.125, 3.0, 0); wl.castShadow = false;
  scene.add(wl);
  const bb1 = box(10.6, 0.42, 0.1, mat(COL.baseboard));
  bb1.position.set(0, 0.21, -4.9); scene.add(bb1);
  const bb2 = box(0.1, 0.42, 10.6, mat(COL.baseboard));
  bb2.position.set(-4.9, 0.21, 0); scene.add(bb2);
}
/* window on back wall */
{
  const g = new THREE.Group();
  const skyTex = ctex(256, 208, (x, w, h) => {
    /* night sky: deep blue, stars, crescent moon */
    const gr = x.createLinearGradient(0, 0, 0, h);
    gr.addColorStop(0, '#141B3A'); gr.addColorStop(1, '#2A3560');
    x.fillStyle = gr; x.fillRect(0, 0, w, h);
    x.fillStyle = '#FFFFFF';
    [[30, 40, 1.6], [80, 24, 1.2], [140, 56, 1.8], [210, 36, 1.3], [60, 110, 1.2],
     [170, 130, 1.5], [228, 96, 1.1], [104, 88, 1.0], [40, 168, 1.4], [200, 172, 1.2]]
      .forEach(([sx, sy, r]) => { x.beginPath(); x.arc(sx, sy, r, 0, 7); x.fill(); });
    x.fillStyle = '#FFEFC2';
    x.beginPath(); x.arc(186, 60, 22, 0, 7); x.fill();
    x.fillStyle = '#1A2246';
    x.beginPath(); x.arc(178, 52, 19, 0, 7); x.fill();
  });
  const paneW = 2.1, paneH = 1.7;
  const pane = plane(paneW, paneH, mat(0xffffff, { map: skyTex, rough: 0.6, emissive: 0x8FA0FF, ei: 0.22 }));
  g.add(pane);
  const fm = mat(COL.white);
  const t = 0.1, d = 0.14;
  const top = box(paneW + 0.24, t + 0.06, d, fm); top.position.y = paneH / 2 + 0.06; g.add(top);
  const bot = box(paneW + 0.24, t + 0.06, d, fm); bot.position.y = -paneH / 2 - 0.06; g.add(bot);
  const lef = box(t, paneH + 0.28, d, fm); lef.position.x = -paneW / 2 - 0.06; g.add(lef);
  const rig = box(t, paneH + 0.28, d, fm); rig.position.x = paneW / 2 + 0.06; g.add(rig);
  const mulV = box(0.06, paneH, d * 0.7, fm); g.add(mulV);
  const mulH = box(paneW, 0.06, d * 0.7, fm); g.add(mulH);
  const sill = box(paneW + 0.5, 0.09, 0.3, fm); sill.position.set(0, -paneH / 2 - 0.16, 0.1); g.add(sill);
  g.position.set(1.7, 3.75, -4.92);
  scene.add(g);
}
/* rug */
{
  const rugTex = ctex(256, 256, (x, w, h) => {
    x.fillStyle = '#332D38'; x.beginPath(); x.arc(w / 2, h / 2, w / 2, 0, 7); x.fill();
    x.strokeStyle = '#F06A75'; x.lineWidth = 10; x.setLineDash([16, 12]);
    x.beginPath(); x.arc(w / 2, h / 2, w / 2 - 14, 0, 7); x.stroke();
    x.setLineDash([]);
    x.strokeStyle = '#4E9B81'; x.lineWidth = 6;
    x.beginPath(); x.arc(w / 2, h / 2, w / 2 - 34, 0, 7); x.stroke();
  });
  const rug = cyl(1.95, 1.95, 0.05, mat(0xffffff, { map: rugTex }), 40);
  rug.position.set(0.3, 0.03, 0.5); rug.castShadow = false;
  scene.add(rug);
}
/* plant */
if (!spriteItem(null, 'fx-plant', 1.25, [4.35, 0.02, -4.25])) {
  const g = new THREE.Group();
  const pot = cyl(0.26, 0.2, 0.36, mat(0xD98E73)); pot.position.y = 0.18; g.add(pot);
  const soil = cyl(0.22, 0.22, 0.04, mat(0x6B4A33)); soil.position.y = 0.37; g.add(soil);
  const f1 = sph(0.34, mat(0x8FCDA5)); f1.position.set(0, 0.72, 0); g.add(f1);
  const f2 = sph(0.26, mat(0x7DBD92)); f2.position.set(0.2, 0.95, 0.06); g.add(f2);
  const f3 = sph(0.22, mat(0x9ED8B2)); f3.position.set(-0.2, 0.92, -0.05); g.add(f3);
  g.position.set(4.35, 0, -4.25);
  scene.add(g);
}
/* fairy lights across the back wall */
const fairy = [];
{
  const pts = [];
  const N = 22;
  const cols = [0xF6A8C0, 0x9BD8C0, 0xFFD98A, 0xA8CBEA];
  for (let i = 0; i < N; i++) {
    const p = i / (N - 1);
    const xw = -4.7 + p * 9.4;
    const sag = Math.sin(((p * 3) % 1) * Math.PI) * 0.32;
    pts.push(new THREE.Vector3(xw, 5.7 - sag, -4.78));
  }
  const line = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(pts),
    new THREE.LineBasicMaterial({ color: 0xB99C8A })
  );
  scene.add(line);
  pts.forEach((p, i) => {
    if (i % 2 === 0) return;
    const c = cols[i % 4];
    const m = mat(c, { emissive: c, ei: 1.3, rough: 0.5 });
    const bulb = sph(0.065, m, 10, 8); bulb.castShadow = false;
    bulb.position.set(p.x, p.y - 0.06, p.z);
    scene.add(bulb);
    fairy.push({ mat: m, i });
  });
}
/* wall clock (TimeTree green) */
{
  const g = new THREE.Group();
  const faceTex = ctex(160, 160, (x, w, h) => {
    x.fillStyle = '#FFFFFF'; x.beginPath(); x.arc(w / 2, h / 2, w / 2, 0, 7); x.fill();
    x.strokeStyle = '#B99C8A'; x.lineWidth = 4;
    for (let i = 0; i < 12; i++) {
      const a = i * Math.PI / 6, r1 = 62, r2 = i % 3 ? 55 : 50;
      x.beginPath();
      x.moveTo(w / 2 + Math.sin(a) * r1, h / 2 - Math.cos(a) * r1);
      x.lineTo(w / 2 + Math.sin(a) * r2, h / 2 - Math.cos(a) * r2);
      x.stroke();
    }
    x.strokeStyle = COL.ttGreen; x.lineCap = 'round';
    x.lineWidth = 7; x.beginPath(); x.moveTo(w / 2, h / 2); x.lineTo(w / 2 - 28, h / 2 - 22); x.stroke();
    x.lineWidth = 5; x.beginPath(); x.moveTo(w / 2, h / 2); x.lineTo(w / 2 + 14, h / 2 - 40); x.stroke();
    x.fillStyle = COL.ttGreen; x.beginPath(); x.arc(w / 2, h / 2, 6, 0, 7); x.fill();
  });
  const face = new THREE.Mesh(new THREE.CircleGeometry(0.4, 32), mat(0xffffff, { map: faceTex }));
  g.add(face);
  const rim = torus(0.4, 0.05, mat(0x3DBE87, { rough: 0.6 }));
  g.add(rim);
  g.position.set(-3.55, 4.15, -4.9);
  scene.add(g);
}
/* dust motes */
let motes = null;
{
  const n = 70;
  const pos = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    pos[i * 3] = -4.5 + Math.random() * 9;
    pos[i * 3 + 1] = 0.3 + Math.random() * 5.2;
    pos[i * 3 + 2] = -4.5 + Math.random() * 9;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  motes = new THREE.Points(geo, new THREE.PointsMaterial({
    color: 0xFFF4D8, size: 3, sizeAttenuation: false,
    transparent: true, opacity: 0.5, depthWrite: false,
  }));
  scene.add(motes);
}

/* ================================================================
   MINIMI — 16-bit dot sprite billboard.
   Falls back to the procedural 3D chibi when no sprite is baked.
   ================================================================ */
const minimi = new THREE.Group();
const minimiHead = new THREE.Group();   /* 3D fallback only */
const mm = {};
const MINIMI_2D = !!GEN['minimi-sprite'];
const SPRITE_H = 2.35;

if (MINIMI_2D) {
  const img = new Image();
  const tex = new THREE.Texture(img);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.magFilter = THREE.NearestFilter;      /* dot art — crisp pixels */
  tex.minFilter = THREE.LinearFilter;
  tex.generateMipmaps = false;
  const spr = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true }));
  spr.center.set(0.5, 0);                   /* pivot at the feet */
  spr.material.color.set(0xE2DCD8);         /* slight dim so he sits in the night light */
  mm.sprite = spr;
  mm.standTex = tex;                        /* for swapping back after the bow */
  mm.spriteW = SPRITE_H * 0.41;
  spr.scale.set(mm.spriteW, SPRITE_H, 1);
  img.onload = () => {
    mm.spriteW = SPRITE_H * (img.width / img.height);
    tex.needsUpdate = true;
  };
  img.src = GEN['minimi-sprite'];
  minimi.add(spr);
  minimi.position.set(0.3, 0.02, 0.5);
} else {
  const hairM = () => mat(COL.hair, { rough: 0.85 });
  /* body: Uniqlo red tee */
  const body = capsule(0.36, 0.24, mat(COL.uniqloTee)); body.position.y = 0.64; minimi.add(body);
  const logoTex = ctex(64, 64, (x, w, h) => {
    x.fillStyle = '#FFFFFF'; x.fillRect(0, 0, w, h);
    x.fillStyle = COL.uniqloRed; x.textAlign = 'center';
    x.font = 'bold 20px "Helvetica Neue", Arial, sans-serif';
    x.fillText('UNI', w / 2, 28); x.fillText('QLO', w / 2, 52);
  });
  const chestLogo = plane(0.11, 0.11, mat(0xffffff, { map: logoTex }));
  chestLogo.position.set(0.15, 0.72, 0.34); minimi.add(chestLogo);
  /* arms with shoulder pivots (for waving) */
  const mkArm = (side) => {
    const ag = new THREE.Group();
    const a = capsule(0.085, 0.2, mat(COL.uniqloTee)); a.position.y = -0.15; ag.add(a);
    const hand = sph(0.07, mat(COL.skin)); hand.position.y = -0.3; ag.add(hand);
    ag.position.set(0.4 * side, 0.88, 0);
    ag.rotation.z = -0.5 * side;
    minimi.add(ag);
    return ag;
  };
  mm.armL = mkArm(-1); mm.armR = mkArm(1);
  /* legs + sneakers */
  [-1, 1].forEach(side => {
    const leg = capsule(0.1, 0.1, mat(COL.pants)); leg.position.set(0.16 * side, 0.2, 0); minimi.add(leg);
    const shoe = capsule(0.085, 0.08, mat(0xF2F2EE));
    shoe.rotation.x = Math.PI / 2; shoe.scale.y = 0.75;
    shoe.position.set(0.16 * side, 0.06, 0.06); minimi.add(shoe);
  });
  /* head */
  const head = sph(0.5, mat(COL.skin), 28, 20); minimiHead.add(head);
  const hair = new THREE.Mesh(
    new THREE.SphereGeometry(0.53, 28, 18, 0, Math.PI * 2, 0, Math.PI * 0.52),
    hairM()
  );
  hair.castShadow = true; hair.position.y = 0.04; hair.rotation.x = -0.12; minimiHead.add(hair);
  /* bangs along the hairline */
  [-0.32, -0.16, 0, 0.16, 0.32].forEach((bx, i) => {
    const by = 0.32 - Math.abs(bx) * 0.22;
    const bz = Math.sqrt(Math.max(0.3 - bx * bx - by * by, 0.02));
    const b = sph(0.1 - (i % 2) * 0.018, hairM());
    b.position.set(bx, by, bz); minimiHead.add(b);
  });
  /* side hair */
  [-1, 1].forEach(side => {
    const s = sph(0.12, hairM());
    s.position.set(0.45 * side, 0.0, 0.1); s.scale.set(0.7, 1.25, 0.9); minimiHead.add(s);
  });
  /* ahoge */
  const ahoge = torus(0.07, 0.014, hairM(), 2.4);
  ahoge.position.set(0.05, 0.62, 0); ahoge.rotation.set(0.3, 0.4, -0.6); minimiHead.add(ahoge);
  /* eyes in scale-wrappers (blink) */
  mm.eyes = [];
  [-1, 1].forEach(side => {
    const wrap = new THREE.Group();
    const white = sph(0.075, mat(0xFFFFFF, { rough: 0.35 })); white.scale.set(1, 1.15, 0.5); wrap.add(white);
    const iris = sph(0.045, mat(0x3A2A22, { rough: 0.3 })); iris.scale.set(1, 1.2, 0.5); iris.position.z = 0.03; wrap.add(iris);
    const hi = sph(0.016, mat(0xFFFFFF, { rough: 0.2 })); hi.position.set(0.016, 0.024, 0.052); hi.castShadow = false; wrap.add(hi);
    wrap.position.set(0.18 * side, 0.05, 0.45);
    minimiHead.add(wrap); mm.eyes.push(wrap);
  });
  /* brows */
  [-1, 1].forEach(side => {
    const br = box(0.1, 0.02, 0.02, mat(COL.hair)); br.castShadow = false;
    br.position.set(0.18 * side, 0.22, 0.42); br.rotation.z = -0.12 * side; minimiHead.add(br);
  });
  /* blush + mouth */
  [-1, 1].forEach(side => {
    const bl = sph(0.06, mat(0xF8A8B8)); bl.scale.set(1, 0.5, 0.4); bl.castShadow = false;
    bl.position.set(0.3 * side, -0.1, 0.37); minimiHead.add(bl);
  });
  const mouth = torus(0.07, 0.015, mat(0x8A5A50), Math.PI);
  mouth.position.set(0, -0.14, 0.48); mouth.rotation.z = Math.PI; mouth.castShadow = false;
  minimiHead.add(mouth);
  minimiHead.position.y = 1.45;
  minimi.add(minimiHead);

  minimi.position.set(0.3, 1.05, 0.5);
  minimi.rotation.y = Math.PI / 4;
  minimi.scale.setScalar(1.18);
}
scene.add(minimi);
register(minimi, 'minimi', new THREE.Vector3(0, 0.3, 0));

{
  /* soft shadow blob (world space, follows minimi) */
  const blobTex = ctex(128, 128, (x, w, h) => {
    const g2 = x.createRadialGradient(w / 2, h / 2, 4, w / 2, h / 2, w / 2);
    g2.addColorStop(0, 'rgba(90,60,40,0.4)'); g2.addColorStop(1, 'rgba(90,60,40,0)');
    x.fillStyle = g2; x.fillRect(0, 0, w, h);
  });
  mm.blob = new THREE.Mesh(
    new THREE.CircleGeometry(0.62, 24),
    new THREE.MeshBasicMaterial({ map: blobTex, transparent: true, depthWrite: false })
  );
  mm.blob.rotation.x = -Math.PI / 2;
  scene.add(mm.blob);

  /* emote bubble (world space) */
  const emoteCv = document.createElement('canvas'); emoteCv.width = emoteCv.height = 128;
  mm.emoteCtx = emoteCv.getContext('2d');
  mm.emoteTex = new THREE.CanvasTexture(emoteCv); mm.emoteTex.colorSpace = THREE.SRGBColorSpace;
  mm.emote = new THREE.Sprite(new THREE.SpriteMaterial({ map: mm.emoteTex, transparent: true, depthTest: false }));
  mm.emote.scale.setScalar(0.001);
  mm.emote.renderOrder = 10;
  scene.add(mm.emote);
}

/* minimi animation state + actions */
const ma = {
  yaw: Math.PI / 4, yawT: Math.PI / 4,      /* 3D fallback */
  faceDir: 1, faceDirT: 1,                  /* 2D sprite: ±1 horizontal flip */
  hopT: 9, hopAmp: 0, waveT: 9, spinT: 9,
  blinkAt: 2.4, blinkT: 9,
  emoteT: 9,
  idleHopAt: 11,
  faceBack: null,           /* seconds until minimi turns back to the camera */
  bowing: false, bowTimer: 0,
  poseEntry: null,          /* current pose texture entry (null = standing) */
};
/* per-section pose frames + the deep bow — all share one swap mechanism */
const poseCache = {};
function poseTex(name) {
  if (!poseCache[name]) poseCache[name] = pixelTexEntry(name);
  return poseCache[name];
}
function setPose(assetName) {          /* null → standing frame */
  if (!MINIMI_2D) return;
  if (assetName && !GEN[assetName]) assetName = null;
  const entry = assetName ? poseTex(assetName) : null;
  const target = entry ? entry.tex : mm.standTex;
  if (mm.sprite.material.map !== target) {
    mm.sprite.material.map = target;
    mm.sprite.material.needsUpdate = true;
  }
  ma.poseEntry = entry;
}
function setBow(on) {
  if (!MINIMI_2D || !GEN['minimi-bow']) return;
  ma.bowing = on;
  setPose(on ? 'minimi-bow' : null);
}
function hop(amp) { ma.hopT = 0; ma.hopAmp = amp; }
function wave() { ma.waveT = 0; }
function spinOnce() { ma.spinT = 0; }
function faceToward(wp) {
  if (MINIMI_2D) {
    /* flip toward the item in screen space */
    const az = AZ_BASE + azOffset;
    const dot = (wp.x - minimi.position.x) * Math.cos(az) - (wp.z - minimi.position.z) * Math.sin(az);
    ma.faceDirT = dot < 0 ? -1 : 1;
  } else {
    ma.yawT = Math.atan2(wp.x - minimi.position.x, wp.z - minimi.position.z);
  }
}
function faceCamera() { ma.yawT = Math.PI / 4; ma.faceDirT = 1; }
const emoteTexCache = {};
function showEmoteFor(id) {
  const asset = EMOTE_ASSET[id];
  if (asset && GEN[asset]) {
    if (!emoteTexCache[asset]) emoteTexCache[asset] = pixelTexEntry(asset);
    const e = emoteTexCache[asset];
    mm.emote.material.map = e.tex;
    mm.emote.material.needsUpdate = true;
    mm.emoteIsIcon = true;
    mm.emoteEntry = e;
    ma.emoteT = 0;
    return;
  }
  showEmote(EMOTES[id] || '!');
}
function showEmote(ch) {
  mm.emote.material.map = mm.emoteTex;
  mm.emote.material.needsUpdate = true;
  mm.emoteIsIcon = false;
  mm.emoteEntry = null;
  const x = mm.emoteCtx, w = 128;
  x.clearRect(0, 0, w, w);
  x.fillStyle = '#FFFFFF';
  x.strokeStyle = '#F06A75'; x.lineWidth = 5;
  x.beginPath(); x.arc(w / 2, w / 2 - 8, 42, 0, 7); x.fill(); x.stroke();
  x.beginPath();
  x.moveTo(w / 2 - 14, w - 40); x.lineTo(w / 2 - 2, w - 12); x.lineTo(w / 2 + 12, w - 42);
  x.closePath(); x.fill();
  x.fillStyle = '#E8474F';
  x.font = 'bold 54px "Hiragino Maru Gothic ProN", sans-serif';
  x.textAlign = 'center'; x.textBaseline = 'middle';
  x.fillText(ch, w / 2, w / 2 - 8);
  mm.emoteTex.needsUpdate = true;
  ma.emoteT = 0;
}

/* ================================================================
   FURNITURE (interactable)
   ================================================================ */

/* ── desk: 3 monitors + REALFORCE ─────────────────── */
if (!spriteItem('desk', 'fx-desk', 2.7, [-1.4, 0.02, -3.3])) {
  const g = new THREE.Group();
  const topB = box(3.5, 0.14, 1.4, mat(0xF7EEDD)); topB.position.y = 1.45; g.add(topB);
  [[-1.6, -0.55], [1.6, -0.55], [-1.6, 0.55], [1.6, 0.55]].forEach(([x, z]) => {
    const leg = cyl(0.06, 0.06, 1.38, mat(COL.wood)); leg.position.set(x, 0.69, z); g.add(leg);
  });
  const codeTex = () => ctex(256, 160, (x, w, h) => {
    x.fillStyle = '#232838'; x.fillRect(0, 0, w, h);
    const cols = ['#F6A8C0', '#9BD8C0', '#FFD98A', '#A8CBEA', '#D8C8F0'];
    const wid = [0.55, 0.35, 0.7, 0.45, 0.6, 0.3, 0.65, 0.5, 0.4, 0.58];
    for (let i = 0; i < 10; i++) {
      x.fillStyle = cols[i % cols.length];
      x.globalAlpha = 0.85;
      x.fillRect(14 + (i % 3) * 10, 12 + i * 14, w * wid[i] * 0.7, 6);
    }
    x.globalAlpha = 1;
  });
  const mkMonitor = (w, h, tex) => {
    const m = new THREE.Group();
    const bodyM = box(w, h, 0.07, mat(COL.navy)); m.add(bodyM);
    const scr = plane(w - 0.08, h - 0.08, mat(0xffffff, { map: tex, rough: 0.5, emissive: 0x9FAAD8, ei: 0.5 }));
    scr.position.z = 0.045; m.add(scr);
    return m;
  };
  const m1 = mkMonitor(1.2, 0.7, codeTex());
  m1.position.set(0, 2.12, -0.35);
  const neck = box(0.07, 0.34, 0.07, mat(COL.navy)); neck.position.set(0, 1.68, -0.35); g.add(neck);
  const foot = box(0.4, 0.05, 0.24, mat(COL.navy)); foot.position.set(0, 1.55, -0.35); g.add(foot);
  g.add(m1);
  const m2 = mkMonitor(0.78, 0.52, codeTex());
  m2.position.set(-1.15, 2.0, -0.28); m2.rotation.y = 0.42;
  const neck2 = box(0.06, 0.26, 0.06, mat(COL.navy)); neck2.position.set(-1.15, 1.62, -0.28); g.add(neck2);
  g.add(m2);
  const m3 = mkMonitor(0.62, 0.44, codeTex());
  m3.position.set(1.05, 1.78, -0.25); m3.rotation.y = -0.4; m3.rotation.x = -0.12;
  g.add(m3);
  const kb = box(0.82, 0.07, 0.3, mat(0xEFE8D8)); kb.position.set(-0.1, 1.56, 0.3); kb.rotation.y = 0.04; g.add(kb);
  const keys = box(0.74, 0.03, 0.22, mat(0xCFC8B8)); keys.position.set(-0.1, 1.6, 0.3); keys.rotation.y = 0.04; g.add(keys);
  const mouse = capsule(0.07, 0.06, mat(0xEFE8D8)); mouse.scale.set(1, 0.5, 1.4); mouse.rotation.x = Math.PI / 2;
  mouse.position.set(0.62, 1.56, 0.32); g.add(mouse);
  const mug = cyl(0.09, 0.08, 0.18, mat(0x3DBE87)); mug.position.set(1.35, 1.61, 0.25); g.add(mug);
  const handle = torus(0.06, 0.015, mat(0x3DBE87), Math.PI); handle.position.set(1.45, 1.61, 0.25); handle.rotation.z = -Math.PI / 2; g.add(handle);

  g.position.set(-1.4, 0, -4.15);
  scene.add(g);
  register(g, 'desk');
}

/* ── server rack (LED blink) ──────────────────────── */
const leds = [];
if (!spriteItem('server', 'fx-server', 2.6, [-4.2, 0.02, -2.3], { lift: new THREE.Vector3(0.22, 0.1, 0) })) {
  const g = new THREE.Group();
  const shell = box(1.05, 2.35, 0.85, mat(0x47517A)); shell.position.y = 1.28; g.add(shell);
  const foot = box(1.12, 0.12, 0.92, mat(0x394060)); foot.position.y = 0.06; g.add(foot);
  for (let i = 0; i < 5; i++) {
    const y = 0.5 + i * 0.42;
    const unit = box(0.9, 0.3, 0.08, mat(0x5D6A9E)); unit.position.set(0, y, 0.44); g.add(unit);
    const slit = box(0.5, 0.06, 0.02, mat(0x394060)); slit.position.set(-0.12, y, 0.49); g.add(slit);
    for (let l = 0; l < 2; l++) {
      const ledM = mat(l ? 0x7CFC9A : 0xFFD27C, { emissive: l ? 0x3AE87A : 0xFFB347, ei: 1.2, rough: 0.4 });
      const led = box(0.05, 0.05, 0.03, ledM);
      led.position.set(0.3 + l * 0.09, y + 0.06, 0.49); g.add(led);
      leds.push({ m: ledM, phase: i * 1.7 + l * 2.3, speed: 1.5 + (i % 3) * 0.8 });
    }
  }
  g.position.set(-4.45, 0, -2.3);
  g.rotation.y = Math.PI / 2;
  scene.add(g);
  register(g, 'server', new THREE.Vector3(0.22, 0.1, 0));
}

/* ── bookshelf ────────────────────────────────────── */
if (!spriteItem('books', 'fx-books', 2.8, [2.45, 0.02, -3.95])) {
  const g = new THREE.Group();
  const side1 = box(0.08, 2.5, 0.5, mat(COL.wood)); side1.position.set(-0.8, 1.25, 0); g.add(side1);
  const side2 = box(0.08, 2.5, 0.5, mat(COL.wood)); side2.position.set(0.8, 1.25, 0); g.add(side2);
  const back = box(1.68, 2.5, 0.05, mat(COL.cream)); back.position.set(0, 1.25, -0.22); g.add(back);
  [0.12, 0.85, 1.58, 2.31].forEach(y => {
    const sh = box(1.6, 0.07, 0.48, mat(COL.wood)); sh.position.set(0, y, 0); g.add(sh);
  });
  const bookRow = (y, colors, hs) => {
    let x = -0.72;
    colors.forEach((c, i) => {
      const bw = 0.09 + (i % 3) * 0.015, bh = hs[i % hs.length];
      const b = box(bw, bh, 0.34, mat(c));
      b.position.set(x + bw / 2, y + bh / 2, 0.02); g.add(b);
      x += bw + 0.012;
    });
  };
  bookRow(2.345, [0x4E8E8A, 0x527E76, 0x5A8E86, 0x4E8E8A, 0x6B4A33, 0x4E8E8A, 0x527E76, 0x5A8E86, 0x4E8E8A, 0x6B4A33, 0x4E8E8A, 0x527E76], [0.4, 0.42, 0.41]);
  bookRow(1.615, [0xD94F4F, 0xF2F2EE, 0xD94F4F, 0x4E6E9E, 0xF2C14E, 0xF2F2EE, 0x88B8D8], [0.46, 0.44, 0.48]);
  bookRow(0.885, [0xF6A8C0, 0x9BD8C0, 0xA8CBEA, 0xFFD98A, 0xD8C8F0], [0.42, 0.4, 0.44]);
  const flat1 = box(0.5, 0.07, 0.36, mat(0xE8E0D0)); flat1.position.set(0.42, 0.925, 0.02); g.add(flat1);
  const flat2 = box(0.44, 0.07, 0.32, mat(0xC8D8E8)); flat2.position.set(0.44, 0.995, 0.02); g.add(flat2);

  g.position.set(2.45, 0, -4.4);
  scene.add(g);
  register(g, 'books');
}

/* ── wall calendar ────────────────────────────────── */
if (!spriteItem('calendar', 'fx-calendar', 1.75, [-0.65, 3.7, -4.85], { wall: 'back', lift: new THREE.Vector3(0, 0.08, 0.16) })) {
  const g = new THREE.Group();
  const calTex = ctex(270, 320, (x, w, h) => {
    x.fillStyle = '#FFFFFF'; x.fillRect(0, 0, w, h);
    x.fillStyle = COL.ttGreen; x.fillRect(0, 0, w, 64);
    x.fillStyle = '#FFFFFF';
    x.font = 'bold 34px "Hiragino Maru Gothic ProN", sans-serif';
    x.textAlign = 'center'; x.fillText('2026.3', w / 2, 44);
    x.strokeStyle = '#E0D8CC'; x.lineWidth = 2;
    const gx = 18, gy = 84, cw = (w - 36) / 7, chh = (h - gy - 18) / 5;
    for (let r = 0; r <= 5; r++) { x.beginPath(); x.moveTo(gx, gy + r * chh); x.lineTo(w - gx, gy + r * chh); x.stroke(); }
    for (let c = 0; c <= 7; c++) { x.beginPath(); x.moveTo(gx + c * cw, gy); x.lineTo(gx + c * cw, h - 18); x.stroke(); }
    x.fillStyle = COL.ttGreen;
    [[1, 1], [3, 0], [4, 2], [2, 3], [6, 1], [5, 3], [0, 4]].forEach(([c, r]) => {
      x.beginPath(); x.arc(gx + c * cw + cw / 2, gy + r * chh + chh * 0.7, 5, 0, 7); x.fill();
    });
    x.strokeStyle = '#E0607E'; x.lineWidth = 5;
    x.beginPath(); x.ellipse(gx + 2 * cw + cw / 2, gy + 1 * chh + chh / 2, cw * 0.42, chh * 0.42, 0, 0, 7); x.stroke();
  });
  const board = box(1.35, 1.6, 0.05, mat(0xffffff));
  g.add(board);
  const face = plane(1.27, 1.52, mat(0xffffff, { map: calTex }));
  face.position.z = 0.03; g.add(face);
  const ring = torus(0.05, 0.012, mat(0xB0B0B0, { metal: 0.6, rough: 0.4 }), Math.PI);
  ring.position.set(0, 0.82, 0); g.add(ring);
  g.position.set(0.15, 3.6, -4.9);
  scene.add(g);
  register(g, 'calendar', new THREE.Vector3(0, 0.08, 0.16));
}

/* ── photo frame (polaroid, left wall) ────────────── */
if (!spriteItem('frame', 'fx-frame', 1.3, [-4.85, 3.35, -0.9], { wall: 'left', lift: new THREE.Vector3(0.16, 0.08, 0) })) {
  const g = new THREE.Group();
  /* polaroid chrome + purikura doodles stay; the photo itself is the
     AI-generated Incheon shot when baked, procedural sunset otherwise */
  const polaroidTex = () => {
    const c = document.createElement('canvas'); c.width = 240; c.height = 260;
    const x = c.getContext('2d');
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
    const w = 240, h = 260, px = 16, py = 16, pw = w - 32, ph2 = h - 76;
    const draw = (img) => {
      x.fillStyle = '#FFFFFF'; x.fillRect(0, 0, w, h);
      if (img) {
        /* cover-crop into the photo area */
        const destA = pw / ph2;
        let sw = img.width, sh = sw / destA;
        if (sh > img.height) { sh = img.height; sw = sh * destA; }
        x.drawImage(img, (img.width - sw) / 2, (img.height - sh) / 2, sw, sh, px, py, pw, ph2);
      } else {
        const sky = x.createLinearGradient(0, py, 0, py + ph2 * 0.6);
        sky.addColorStop(0, '#FFC98A'); sky.addColorStop(1, '#FFE9C8');
        x.fillStyle = sky; x.fillRect(px, py, pw, ph2 * 0.6);
        x.fillStyle = '#FFB25E';
        x.beginPath(); x.arc(w / 2, py + ph2 * 0.58, 30, Math.PI, 0); x.fill();
        x.fillStyle = '#8FB8D8'; x.fillRect(px, py + ph2 * 0.6, pw, ph2 * 0.4);
        x.strokeStyle = 'rgba(255,255,255,0.7)'; x.lineWidth = 3;
        for (let i = 0; i < 3; i++) {
          const gy = py + ph2 * 0.66 + i * 14;
          x.beginPath(); x.moveTo(w / 2 - 26 + i * 6, gy); x.lineTo(w / 2 + 26 - i * 6, gy); x.stroke();
        }
      }
      /* purikura-style white-pen doodles */
      x.strokeStyle = '#FFFFFF'; x.lineWidth = 3; x.lineCap = 'round';
      const sparkle = (sx, sy, r) => {
        x.beginPath();
        x.moveTo(sx - r, sy); x.lineTo(sx + r, sy);
        x.moveTo(sx, sy - r); x.lineTo(sx, sy + r);
        x.moveTo(sx - r * 0.55, sy - r * 0.55); x.lineTo(sx + r * 0.55, sy + r * 0.55);
        x.moveTo(sx + r * 0.55, sy - r * 0.55); x.lineTo(sx - r * 0.55, sy + r * 0.55);
        x.stroke();
      };
      sparkle(px + 22, py + 24, 9); sparkle(w - px - 20, py + 40, 7); sparkle(px + 34, py + ph2 - 26, 6);
      x.fillStyle = '#FFFFFF';
      x.save(); x.translate(w - px - 44, py + 22); x.rotate(0.12);
      x.font = 'bold 20px "Hiragino Maru Gothic ProN", sans-serif';
      x.textAlign = 'center'; x.fillText('☆ミン☆', 0, 0);
      x.restore();
      x.fillStyle = '#7A5C49';
      x.font = 'bold 30px "Hiragino Maru Gothic ProN", sans-serif';
      x.textAlign = 'center'; x.fillText('2000 仁川', w / 2, h - 22);
      t.needsUpdate = true;
    };
    draw(null);
    if (GEN['frame-photo']) {
      const img = new Image();
      img.onload = () => draw(img);
      img.src = GEN['frame-photo'];
    }
    return t;
  };
  const fr = box(1.05, 1.15, 0.07, mat(COL.wood));
  g.add(fr);
  const ph = plane(0.92, 1.0, mat(0xffffff, { map: polaroidTex() }));
  ph.position.z = 0.045; g.add(ph);
  g.position.set(-4.9, 3.35, -0.9);
  g.rotation.y = Math.PI / 2;
  scene.add(g);
  register(g, 'frame', new THREE.Vector3(0.16, 0.08, 0));
}

/* ── tennis racket + ball ─────────────────────────── */
if (!spriteItem('tennis', 'fx-tennis', 1.9, [-4.85, 2.9, 1.7], { wall: 'left', lift: new THREE.Vector3(0.16, 0.06, 0) })) {
  const g = new THREE.Group();
  const head = torus(0.42, 0.05, mat(0x6FA8DC));
  g.add(head);
  const stringTex = ctex(256, 256, (x, w, h) => {
    x.clearRect(0, 0, w, h);
    x.strokeStyle = 'rgba(255,255,255,0.95)'; x.lineWidth = 5;
    for (let i = 1; i < 7; i++) {
      const p = i * w / 7;
      x.beginPath(); x.moveTo(p, 0); x.lineTo(p, h); x.stroke();
      x.beginPath(); x.moveTo(0, p); x.lineTo(w, p); x.stroke();
    }
  });
  const strings = new THREE.Mesh(
    new THREE.CircleGeometry(0.4, 32),
    mat(0xffffff, { map: stringTex, transparent: true, side: THREE.DoubleSide })
  );
  g.add(strings);
  const throat = box(0.08, 0.3, 0.05, mat(0x6FA8DC)); throat.position.y = -0.55; g.add(throat);
  const grip = cyl(0.05, 0.05, 0.45, mat(0x8A5A33)); grip.position.y = -0.88; g.add(grip);
  const ball = sph(0.15, mat(0xD6E85A));
  ball.position.set(-1.5, -2.85, 2.3);   /* local → floor at world (-2.6, 0.15, 3.2) */
  ball.userData.id = 'tennis';
  g.add(ball);
  g.position.set(-4.9, 3.0, 1.7);
  g.rotation.y = Math.PI / 2;
  scene.add(g);
  register(g, 'tennis', new THREE.Vector3(0.16, 0.06, 0));
}

/* ── game corner: CRT + console + trophy ──────────── */
if (!spriteItem('game', 'fx-game', 1.55, [3.85, 0.02, -2.1])) {
  const g = new THREE.Group();
  const table = box(1.5, 0.5, 1.0, mat(COL.wood)); table.position.y = 0.25; g.add(table);
  const tv = box(0.95, 0.78, 0.72, mat(COL.lavender)); tv.position.set(-0.14, 0.89, 0); g.add(tv);
  const gameTex = ctex(200, 150, (x, w, h) => {
    x.fillStyle = '#1B2140'; x.fillRect(0, 0, w, h);
    x.fillStyle = '#FFD84D';
    x.font = 'bold 52px Menlo, monospace'; x.textAlign = 'center';
    x.fillText('500', w / 2, 78);
    x.fillStyle = '#9BD8C0';
    x.font = 'bold 20px Menlo, monospace';
    x.fillText('RANK', w / 2, 26);
    x.fillStyle = '#4E6E9E';
    x.fillRect(20, 106, 44, 10); x.fillRect(78, 106, 70, 10); x.fillRect(20, 124, 100, 10);
  });
  const scr = plane(0.62, 0.5, mat(0xffffff, { map: gameTex, emissive: 0x8899CC, ei: 0.5 }));
  scr.position.set(-0.14, 0.92, 0.365); g.add(scr);
  const ant1 = cyl(0.012, 0.012, 0.5, mat(0x555555)); ant1.position.set(-0.3, 1.5, 0); ant1.rotation.z = 0.45; g.add(ant1);
  const ant2 = cyl(0.012, 0.012, 0.5, mat(0x555555)); ant2.position.set(0.04, 1.5, 0); ant2.rotation.z = -0.45; g.add(ant2);
  const con = box(0.44, 0.11, 0.3, mat(0xF2F2EE)); con.position.set(0.5, 0.56, 0.22); g.add(con);
  const slot = box(0.3, 0.02, 0.04, mat(COL.navy)); slot.position.set(0.5, 0.62, 0.22); g.add(slot);
  const tg = new THREE.Group();
  const tBase = box(0.24, 0.07, 0.24, mat(0x6B4A33)); tBase.position.y = 0.035; tg.add(tBase);
  const tStem = cyl(0.035, 0.05, 0.12, mat(COL.gold, { metal: 0.7, rough: 0.3 })); tStem.position.y = 0.13; tg.add(tStem);
  const tCup = cyl(0.16, 0.09, 0.2, mat(COL.gold, { metal: 0.7, rough: 0.3 })); tCup.position.y = 0.29; tg.add(tCup);
  const th1 = torus(0.09, 0.018, mat(COL.gold, { metal: 0.7, rough: 0.3 }), Math.PI);
  th1.position.set(-0.17, 0.3, 0); th1.rotation.z = Math.PI / 2; tg.add(th1);
  const th2 = torus(0.09, 0.018, mat(COL.gold, { metal: 0.7, rough: 0.3 }), Math.PI);
  th2.position.set(0.17, 0.3, 0); th2.rotation.z = -Math.PI / 2; tg.add(th2);
  tg.position.set(-0.58, 0.5, 0.3);
  g.add(tg);
  g.position.set(3.7, 0, -2.7);
  g.rotation.y = 0.55;
  scene.add(g);
  register(g, 'game');
}

/* ── sofa + 2 controllers ─────────────────────────── */
if (!spriteItem('sofa', 'fx-sofa', 1.7, [-3.15, 0.02, 1.75])) {
  const g = new THREE.Group();
  const base = box(2.3, 0.42, 1.05, mat(COL.coral)); base.position.y = 0.34; g.add(base);
  const backB = box(2.3, 0.8, 0.3, mat(COL.coral)); backB.position.set(0, 0.9, -0.38); g.add(backB);
  const armL = capsule(0.17, 0.32, mat(COL.coral)); armL.position.set(-1.12, 0.62, 0); armL.rotation.x = Math.PI / 2; g.add(armL);
  const armR = capsule(0.17, 0.32, mat(COL.coral)); armR.position.set(1.12, 0.62, 0); armR.rotation.x = Math.PI / 2; g.add(armR);
  const cushL = box(1.0, 0.18, 0.88, mat(COL.coralLight)); cushL.position.set(-0.53, 0.6, 0.04); g.add(cushL);
  const cushR = box(1.0, 0.18, 0.88, mat(COL.coralLight)); cushR.position.set(0.53, 0.6, 0.04); g.add(cushR);
  const backCushL = box(1.0, 0.55, 0.16, mat(COL.coralLight)); backCushL.position.set(-0.53, 1.0, -0.28); g.add(backCushL);
  const backCushR = box(1.0, 0.55, 0.16, mat(COL.coralLight)); backCushR.position.set(0.53, 1.0, -0.28); g.add(backCushR);
  const mkPad = (color) => {
    const pg = new THREE.Group();
    const bodyP = capsule(0.075, 0.16, mat(color)); bodyP.rotation.z = Math.PI / 2; pg.add(bodyP);
    const s1 = sph(0.035, mat(COL.navy)); s1.position.set(-0.06, 0.06, 0.02); pg.add(s1);
    const s2 = sph(0.035, mat(COL.navy)); s2.position.set(0.06, 0.06, 0.02); pg.add(s2);
    return pg;
  };
  const p1 = mkPad(0xFDFDFB); p1.position.set(-0.5, 0.73, 0.1); p1.rotation.y = 0.4; g.add(p1);
  const p2 = mkPad(0x9BD8C0); p2.position.set(0.5, 0.73, 0.06); p2.rotation.y = -0.5; g.add(p2);
  g.position.set(-3.15, 0, 1.75);
  g.rotation.y = Math.PI / 2;
  scene.add(g);
  register(g, 'sofa');
}

/* ── UNIQLO bag ───────────────────────────────────── */
if (!spriteItem('uniqlo', 'fx-uniqlo', 1.05, [2.95, 0.02, 2.55])) {
  const g = new THREE.Group();
  const bag = box(0.72, 0.82, 0.44, mat(0xF6F1E7)); bag.position.y = 0.41; g.add(bag);
  const logoTex = ctex(128, 128, (x, w, h) => {
    x.fillStyle = COL.uniqloRed; x.fillRect(0, 0, w, h);
    x.fillStyle = '#FFFFFF';
    x.font = 'bold 34px "Helvetica Neue", Arial, sans-serif';
    x.textAlign = 'center';
    x.fillText('UNI', w / 2, 52);
    x.fillText('QLO', w / 2, 92);
  });
  const logo = plane(0.34, 0.34, mat(0xffffff, { map: logoTex }));
  logo.position.set(0, 0.46, 0.225); g.add(logo);
  const h1 = torus(0.17, 0.02, mat(0xC9B18A), Math.PI);
  h1.position.set(0, 0.82, 0.12); g.add(h1);
  const h2 = torus(0.17, 0.02, mat(0xC9B18A), Math.PI);
  h2.position.set(0, 0.82, -0.12); g.add(h2);
  g.position.set(2.95, 0, 2.55);
  g.rotation.y = 0.45;
  scene.add(g);
  register(g, 'uniqlo');
}

/* ── graduation cap + C book (the path to developer) ─ */
if (!spriteItem('study', 'fx-gradcap', 0.75, [0.0, 0.02, -2.6])) {
  const g = new THREE.Group();
  const book = box(0.5, 0.12, 0.38, mat(0x3E5E9E)); book.position.y = 0.06; g.add(book);
  const capBoard = box(0.46, 0.04, 0.46, mat(0x22202A)); capBoard.position.y = 0.24; capBoard.rotation.y = 0.5; g.add(capBoard);
  const capBase = cyl(0.15, 0.17, 0.12, mat(0x22202A)); capBase.position.y = 0.17; g.add(capBase);
  const knob = sph(0.03, mat(COL.gold)); knob.position.y = 0.27; g.add(knob);
  g.position.set(-3.05, 0, -3.0);
  scene.add(g);
  register(g, 'study');
}

/* ── nameplate (MIN = ¬MAX) ───────────────────────── */
if (!spriteItem('nameplate', 'fx-nameplate', 0.7, [1.45, 0.02, -2.1])) {
  const g = new THREE.Group();
  const foot = box(0.5, 0.06, 0.3, mat(COL.wood)); foot.position.y = 0.03; g.add(foot);
  const plateTex = ctex(128, 48, (x, w, h) => {
    x.fillStyle = '#2A2530'; x.fillRect(0, 0, w, h);
    x.fillStyle = '#F2E8DC';
    x.font = 'bold 30px Menlo, monospace'; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.fillText('MIN', w / 2, h / 2 + 2);
  });
  const plate = box(0.52, 0.2, 0.05, mat(0x2A2530)); plate.position.y = 0.17; plate.rotation.x = -0.18; g.add(plate);
  const face = plane(0.48, 0.16, mat(0xffffff, { map: plateTex }));
  face.position.set(0, 0.17, 0.03); face.rotation.x = -0.18; g.add(face);
  g.position.set(0.95, 0, -2.25); g.rotation.y = Math.PI / 4;
  scene.add(g);
  register(g, 'nameplate');
}

/* ── army beret (left wall) ───────────────────────── */
if (!spriteItem('beret', 'fx-beret', 0.85, [-4.85, 3.15, 3.95], { wall: 'left', lift: new THREE.Vector3(0.16, 0.06, 0) })) {
  const g = new THREE.Group();
  const mount = cyl(0.3, 0.3, 0.04, mat(COL.wood)); mount.rotation.z = Math.PI / 2; g.add(mount);
  const beret = sph(0.24, mat(0x3E5A3E)); beret.scale.set(1, 0.55, 1); beret.position.x = 0.08; g.add(beret);
  const pin = sph(0.05, mat(COL.gold, { metal: 0.6, rough: 0.3 })); pin.position.set(0.2, 0.08, 0.08); g.add(pin);
  g.position.set(-4.85, 3.15, 3.95);
  scene.add(g);
  register(g, 'beret', new THREE.Vector3(0.16, 0.06, 0));
}

/* ── gadget corner: REALFORCE + headphones ────────── */
if (!spriteItem('gadget', 'fx-gadget', 0.95, [-1.5, 0.02, 3.0])) {
  const g = new THREE.Group();
  const tbl = box(0.9, 0.4, 0.55, mat(COL.wood)); tbl.position.y = 0.2; g.add(tbl);
  const kb = box(0.6, 0.05, 0.22, mat(0xEFE8D8)); kb.position.set(-0.05, 0.43, 0.06); kb.rotation.y = 0.15; g.add(kb);
  const keys = box(0.54, 0.02, 0.16, mat(0xCFC8B8)); keys.position.set(-0.05, 0.46, 0.06); keys.rotation.y = 0.15; g.add(keys);
  const stand = cyl(0.02, 0.02, 0.3, mat(0x555555)); stand.position.set(0.28, 0.55, -0.12); g.add(stand);
  const band = torus(0.09, 0.02, mat(0x394060), Math.PI); band.position.set(0.28, 0.66, -0.12); g.add(band);
  g.position.set(-1.5, 0, 3.0);
  scene.add(g);
  register(g, 'gadget');
}

/* ── anime figure (Survey Corps vibes) ────────────── */
if (!spriteItem('figure', 'fx-figure', 0.95, [3.55, 0.02, -3.8])) {
  const g = new THREE.Group();
  const base = cyl(0.24, 0.28, 0.06, mat(COL.wood)); base.position.y = 0.03; g.add(base);
  const body = cyl(0.09, 0.13, 0.34, mat(0xC8B490)); body.position.y = 0.26; g.add(body);
  const cape = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.36, 12), mat(0x4E7E57));
  cape.castShadow = true; cape.position.set(-0.05, 0.3, -0.04); g.add(cape);
  const head = sph(0.09, mat(COL.skin)); head.position.y = 0.52; g.add(head);
  g.position.set(3.55, 0, -3.8);
  scene.add(g);
  register(g, 'figure');
}

/* ── step marker (bouncing cone above current item) ─ */
const marker = new THREE.Mesh(
  new THREE.ConeGeometry(0.2, 0.34, 20),
  mat(0xF06A75, { emissive: 0xF06A75, ei: 0.6, rough: 0.6 })
);
marker.rotation.x = Math.PI;
marker.visible = false;
marker.castShadow = false;
scene.add(marker);
const markerPos = {};   /* id → Vector3, computed after build */
{
  const bb = new THREE.Box3();
  for (const it of interactables) {
    bb.setFromObject(it.group);
    const c = new THREE.Vector3();
    bb.getCenter(c);
    /* nudge toward the camera (+x/+z) so the cone separates from what's behind it */
    markerPos[it.id] = new THREE.Vector3(
      THREE.MathUtils.clamp(c.x + 0.35, -4.55, 4.55),
      bb.max.y + 0.8,
      THREE.MathUtils.clamp(c.z + 0.35, -4.55, 4.55)
    );
  }
  /* hand-fix the tennis group (its bbox is skewed by the far-away ball) */
  markerPos.tennis = new THREE.Vector3(-4.55, 3.95, 1.7);
  markerPos.minimi = new THREE.Vector3(0.3, MINIMI_2D ? 3.4 : 4.1, 0.5);   /* above the emote bubble */
}
/* per-item ground-ring radius from the same boxes */
const ringR = {};
{
  const bb = new THREE.Box3(), sz = new THREE.Vector3();
  for (const it of interactables) {
    bb.setFromObject(it.group);
    bb.getSize(sz);
    ringR[it.id] = Math.max(sz.x, sz.z) * 0.5 + 0.3;
  }
}
const WALL_ITEMS = new Set(['frame', 'calendar', 'tennis', 'beret']);

/* pulsing selection ring under the focused floor item */
const selRing = new THREE.Mesh(
  new THREE.RingGeometry(0.8, 0.94, 40),
  new THREE.MeshBasicMaterial({ color: 0xF06A75, transparent: true, opacity: 0.5, depthWrite: false, side: THREE.DoubleSide })
);
selRing.rotation.x = -Math.PI / 2;
selRing.visible = false;
scene.add(selRing);
const sel = { t: 9, id: null };   /* select-bounce animation state */

/* ── floating hearts (finale — beside the bow, not over his head) ── */
let hearts = null;
function heartBurst() {
  if (!GEN['emote-heart'] || REDUCED) return;
  if (!emoteTexCache['emote-heart']) emoteTexCache['emote-heart'] = pixelTexEntry('emote-heart');
  const entry = emoteTexCache['emote-heart'];
  if (hearts) scene.remove(hearts.group);
  const group = new THREE.Group();
  const items = [];
  for (let i = 0; i < 6; i++) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: entry.tex, transparent: true, depthTest: false }));
    s.renderOrder = 9;
    const side = i % 2 ? 1 : -1;
    s.position.set(
      minimi.position.x + side * (0.75 + 0.22 * Math.floor(i / 2)),
      minimi.position.y + 0.4 + 0.25 * (i % 3),
      minimi.position.z + 0.4
    );
    s.scale.setScalar(0.001);
    items.push({ s, ph: i * 0.35, side });
    group.add(s);
  }
  scene.add(group);
  hearts = { group, items, t: 0, entry };
}
let confetti = null;
const confettiGeo = new THREE.PlaneGeometry(0.13, 0.09);
const confettiMats = [0xF6A8C0, 0x9BD8C0, 0xFFD98A, 0xA8CBEA, 0xE8474F, 0xC7B8E8]
  .map(c => new THREE.MeshBasicMaterial({ color: c, side: THREE.DoubleSide }));
function burstConfetti() {
  if (REDUCED) return;
  if (confetti) scene.remove(confetti.group);
  const group = new THREE.Group(); const items = [];
  for (let i = 0; i < 90; i++) {
    const m = new THREE.Mesh(confettiGeo, confettiMats[i % confettiMats.length]);
    m.position.set((Math.random() - 0.5) * 8.5, 6.8 + Math.random() * 2, (Math.random() - 0.5) * 8.5);
    m.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
    items.push({
      m, vy: -(1.5 + Math.random() * 1.3),
      rx: (Math.random() - 0.5) * 6, rz: (Math.random() - 0.5) * 6,
      wx: 1 + Math.random() * 2, ph: Math.random() * 6,
    });
    group.add(m);
  }
  scene.add(group);
  confetti = { group, items, t: 0 };
}

/* ================================================================
   UI + PRESENTATION STATE
   ================================================================ */
const dlg = document.getElementById('dlg');
const dlgTag = document.getElementById('dlg-tag');
const dlgTitle = document.getElementById('dlg-title');
const dlgStory = document.getElementById('dlg-story');
const dlgEn = document.getElementById('dlg-en');
const dlgList = document.getElementById('dlg-list');
const dlgLogo = document.getElementById('dlg-logo');
const dlgX = document.getElementById('dlg-x');
const tip = document.getElementById('tip');
const dotoriEl = document.getElementById('dotori');
const dotoriBox = document.getElementById('dotoribox');
const railDots = document.getElementById('rail-dots');
const railLabel = document.getElementById('rail-label');
const railPrev = document.getElementById('rail-prev');
const railNext = document.getElementById('rail-next');

/* AI-generated sprite as a sticker on the story card */
const dlgAvatar = document.getElementById('dlg-avatar');
if (GEN['minimi-sprite']) {
  dlgAvatar.src = GEN['minimi-sprite'];
  dlgAvatar.classList.add('show');
}

const visited = new Set();
let dotori = 0;
let step = -1;                       /* -1 intro · 0..9 items · 10 thanks */
const LAST = ORDER.length;           /* thanks step index */

/* build rail dots: one per item + a diamond for the finale */
for (let i = 0; i <= LAST; i++) {
  const d = document.createElement('i');
  if (i === LAST) d.className = 'fin';
  railDots.appendChild(d);
}
const dots = [...railDots.children];

function renderRail() {
  dots.forEach((d, i) => {
    d.classList.toggle('cur', i === step);
    d.classList.toggle('done', i < LAST && visited.has(ORDER[i]) && i !== step);
  });
  railLabel.textContent =
    step === -1 ? 'START' :
    step === LAST ? 'まとめ' :
    ITEMS[ORDER[step]].name;
  railPrev.disabled = step <= -1;
  railNext.disabled = step >= LAST;
}

/* anchor the story card beside the focused item (speech-bubble pattern);
   intro / thanks float bottom-center; mobile keeps its fixed CSS layout */
const projV = new THREE.Vector3();
function placeDialog() {
  if (!dlg.classList.contains('on')) return;
  if (stage.clientWidth < 640) return;             /* mobile: CSS handles it */
  dlg.classList.remove('tail-left', 'tail-right');
  const W = dlg.offsetWidth || 430, H = dlg.offsetHeight || 220;
  const sw = stage.clientWidth, sh = stage.clientHeight;
  const id = (step >= 0 && step < LAST) ? ORDER[step] : null;
  if (!id) {
    dlg.style.left = (sw - W) / 2 + 'px';
    dlg.style.top = (sh - H - 76) + 'px';
    return;
  }
  const mp = markerPos[id];
  projV.set(mp.x, mp.y - 1.0, mp.z).project(camera);
  const sx = (projV.x + 1) / 2 * sw;
  const sy = (1 - projV.y) / 2 * sh;
  let left = sx + 110, tail = 'tail-left';         /* card right of the item */
  if (left + W > sw - 16) { left = sx - 110 - W; tail = 'tail-right'; }
  left = Math.max(12, Math.min(left, sw - W - 12));
  const top = Math.max(74, Math.min(sy - H * 0.5, sh - H - 72));
  dlg.style.left = left + 'px';
  dlg.style.top = top + 'px';
  dlg.classList.add(tail);
}

/* RPG-dialog typewriter: full text laid out invisibly first (no reflow),
   characters revealed one by one with a blinking cursor */
let typeTimer = null;
function typeStory(text) {
  clearInterval(typeTimer);
  dlgStory.textContent = '';
  if (REDUCED) { dlgStory.textContent = text; return; }
  const spans = [];
  for (const ch of text) {
    const s = document.createElement('span');
    s.textContent = ch;
    s.style.visibility = 'hidden';
    dlgStory.appendChild(s);
    spans.push(s);
  }
  const cur = document.createElement('span');
  cur.className = 'type-cursor';
  cur.textContent = '▍';
  if (spans.length) spans[0].before(cur);
  let i = 0;
  typeTimer = setInterval(() => {
    /* two characters per tick — snappy but still reads as typing */
    for (let k = 0; k < 2 && i < spans.length; k++) {
      spans[i].style.visibility = 'visible';
      spans[i].after(cur);
      i++;
    }
    if (i >= spans.length) {
      clearInterval(typeTimer);
      cur.remove();
    }
  }, 13);
}

/* pretext-style title fitting: binary-search the largest font size whose
   single line lands exactly inside the card width */
function fitTitle() {
  let lo = 14, hi = 30;
  while (hi - lo > 0.5) {
    const mid = (lo + hi) / 2;
    dlgTitle.style.fontSize = mid + 'px';
    if (dlgTitle.scrollWidth <= dlgTitle.clientWidth + 1) lo = mid; else hi = mid;
  }
  dlgTitle.style.fontSize = lo + 'px';
}

function showCard(c) {
  dlgTag.textContent = c.tag;
  dlgTitle.textContent = c.title;
  dlgEn.textContent = c.en || '';
  dlgEn.style.display = c.en ? '' : 'none';
  dlgList.replaceChildren();
  if (c.list) {
    c.list.forEach((line, i) => {
      const li = document.createElement('li');
      li.textContent = line;
      li.style.animationDelay = (0.2 + i * 0.13) + 's';
      dlgList.appendChild(li);
    });
  }
  dlgList.style.display = c.list ? '' : 'none';
  const showLogo = !!c.logo && !!GEN['tt-logo'];
  if (showLogo) dlgLogo.src = GEN['tt-logo'];
  dlgLogo.classList.toggle('show', showLogo);
  typeStory(c.story);
  dlg.classList.remove('on');
  void dlg.offsetWidth;
  dlg.classList.add('on');
  fitTitle();
  placeDialog();
}

function award(id) {
  if (visited.has(id)) return;
  visited.add(id);
  dotori++;
  dotoriEl.textContent = dotori;
  dotoriBox.classList.remove('bump');
  void dotoriBox.offsetWidth;
  dotoriBox.classList.add('bump');
  if (visited.size === Object.keys(ITEMS).length) {
    const kb = document.getElementById('kiriban');
    kb.classList.add('on');
    setTimeout(() => kb.classList.remove('on'), 8000);
    burstConfetti();
  }
}

function goStep(n) {
  step = THREE.MathUtils.clamp(n, -1, LAST);
  setBow(false);
  if (step === -1) {
    showCard(INTRO);
    resetFocus(); faceCamera();
    setPose(null);
    marker.visible = false;
    selRing.visible = false;
    sel.id = null;
  } else if (step === LAST) {
    showCard(THANKS);
    resetFocus(); faceCamera();
    hop(0.35);
    ma.bowTimer = 0;
    setBow(true);                    /* deep bow cycle runs while on this step */
    heartBurst();                    /* hearts float beside him — not over his head */
    burstConfetti();
    marker.visible = false;
    selRing.visible = false;
    sel.id = null;
  } else {
    const id = ORDER[step];
    showCard(ITEMS[id]);
    award(id);
    const entry = interactables.find(i => i.id === id);
    const wp = new THREE.Vector3();
    entry.group.getWorldPosition(wp);
    if (id === 'minimi') { faceCamera(); wave(); hop(0.5); ma.faceBack = null; }
    else { faceToward(markerPos[id]); hop(0.25); ma.faceBack = 1.7; }
    setPose('pose-' + id);           /* per-section acting frame (no-op if absent) */
    focusOn(id === 'minimi' ? minimi.position : markerPos[id]);
    showEmoteFor(id);
    marker.visible = true;
    /* selection emphasis: pop-bounce + pulsing ground ring */
    sel.t = 0; sel.id = id;
    if (WALL_ITEMS.has(id)) {
      selRing.visible = false;
    } else {
      const p = entry.baseP;
      selRing.position.set(p.x, 0.04, id === 'minimi' ? p.z : p.z);
      selRing.userData.base = (ringR[id] || 1) / 0.87;
      selRing.visible = true;
    }
  }
  renderRail();
}
const next = () => { if (step < LAST) goStep(step + 1); };
const prev = () => { if (step > -1) goStep(step - 1); };

railNext.addEventListener('click', next);
railPrev.addEventListener('click', prev);
dlgX.addEventListener('click', () => { dlg.classList.remove('on'); resetFocus(); marker.visible = false; selRing.visible = false; });
addEventListener('keydown', (e) => {
  if (e.key === 'Escape') { dlg.classList.remove('on'); resetFocus(); marker.visible = false; selRing.visible = false; }
  if (e.key === ' ' || e.key === 'ArrowRight') { e.preventDefault(); next(); }
  if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); }
  if (/^[1-9]$/.test(e.key)) goStep(+e.key - 1);
  if (e.key === '0') goStep(9);
});
renderRail();
dlg.classList.add('on');   /* intro card on load */

/* ================================================================
   INTERACTION — drag rotate / hover / click
   ================================================================ */
const raycaster = new THREE.Raycaster();
const ndc = new THREE.Vector2();
let hoveredId = null;
let dragging = false, moved = false, downX = 0, downY = 0, lastX = 0;

function pick(e) {
  const r = stage.getBoundingClientRect();
  ndc.x = ((e.clientX - r.left) / r.width) * 2 - 1;
  ndc.y = -((e.clientY - r.top) / r.height) * 2 + 1;
  raycaster.setFromCamera(ndc, camera);
  const hits = raycaster.intersectObjects(scene.children, true);
  for (const h of hits) {
    let o = h.object;
    while (o) {
      if (o.userData.id) return o.userData.id;
      o = o.parent;
    }
  }
  return null;
}

stage.addEventListener('pointerdown', (e) => {
  if (e.target.closest('#dlg') || e.target.closest('#bgm') || e.target.closest('#rail')) return;
  dragging = true; moved = false;
  downX = e.clientX; downY = e.clientY; lastX = e.clientX;
  stage.classList.add('grabbing');
  try { stage.setPointerCapture(e.pointerId); } catch { /* synthetic events */ }
});
stage.addEventListener('pointermove', (e) => {
  if (dragging) {
    const dx = e.clientX - lastX; lastX = e.clientX;
    azTarget = THREE.MathUtils.clamp(azTarget - dx * 0.0042, -AZ_MAX, AZ_MAX);
    if (Math.abs(e.clientX - downX) + Math.abs(e.clientY - downY) > 7) moved = true;
    return;
  }
  const id = pick(e);
  if (id !== hoveredId) {
    hoveredId = id;
    interactables.forEach(it => it.liftT = (it.id === id ? 1 : 0));
    stage.classList.toggle('pick', !!id);
    tip.style.display = id ? 'block' : 'none';
    if (id) tip.textContent = ITEMS[id].name;
  }
  if (id) {
    const r = stage.getBoundingClientRect();
    tip.style.left = (e.clientX - r.left) + 'px';
    tip.style.top = (e.clientY - r.top) + 'px';
  }
});
stage.addEventListener('pointerup', (e) => {
  stage.classList.remove('grabbing');
  if (!dragging) return;
  dragging = false;
  if (!moved && !e.target.closest('#dlg') && !e.target.closest('#bgm') && !e.target.closest('#rail')) {
    const id = pick(e);
    if (id) goStep(ORDER.indexOf(id));   /* direct click syncs the rail */
  }
});
stage.addEventListener('pointerleave', () => {
  tip.style.display = 'none';
  interactables.forEach(it => it.liftT = 0);
  hoveredId = null;
});

/* ================================================================
   LOOP
   ================================================================ */
const clock = new THREE.Clock();
const MINIMI_BASE_Y = minimi.position.y;
const bobAmp = REDUCED ? 0 : 0.13;
const easeOut = (p) => 1 - Math.pow(1 - p, 3);

let lastFrame = 0;
function animate(now = 0) {
  requestAnimationFrame(animate);
  if (now - lastFrame < 30) return;   /* ~33fps cap — keeps laptops cool */
  lastFrame = now;
  const dt = Math.min(clock.getDelta(), 0.06);
  const t = clock.getElapsedTime();

  /* camera: drag rotation + focus pan + zoom */
  azOffset += (azTarget - azOffset) * 0.08;
  const want = focusPoint ? BASE_TARGET.clone().lerp(focusPoint, 0.5) : BASE_TARGET;
  curTarget.lerp(want, 0.06);
  camera.zoom += (zoomTarget - camera.zoom) * 0.06;
  camera.updateProjectionMatrix();
  placeCamera();

  /* minimi: hop (+ float bob for the 3D fallback only — the sprite stands) */
  const mi = interactables.find(i => i.id === 'minimi');
  const bob = MINIMI_2D ? 0 : Math.sin(t * 1.6) * bobAmp;
  let hopY = 0;
  if (ma.hopT < 1) { ma.hopT = Math.min(1, ma.hopT + dt / 0.55); hopY = Math.sin(ma.hopT * Math.PI) * ma.hopAmp; }
  minimi.position.y = MINIMI_BASE_Y + bob + hopY + mi.lift * mi.vec.y;

  if (MINIMI_2D) {
    /* 2D game grammar: breath squash, hop stretch, flip turn, card-flip spin,
       feet-pivot wobble for greeting */
    ma.faceDir += (ma.faceDirT - ma.faceDir) * Math.min(1, dt * 9);
    let flip = 1;
    if (ma.spinT < 1) {
      ma.spinT = Math.min(1, ma.spinT + dt / 0.8);
      flip = Math.cos(easeOut(ma.spinT) * Math.PI * 2);
    }
    /* bow cycle on the thanks step: bow 2.4s, straighten 1.8s, repeat */
    if (step === LAST && GEN['minimi-bow']) {
      ma.bowTimer += dt;
      setBow((ma.bowTimer % 4.2) < 2.4);
    }
    const pe = ma.poseEntry;
    const hScale = ma.bowing ? 0.93 : 1;
    const wNow = pe ? SPRITE_H * hScale * pe.aspect : mm.spriteW;
    const hNow = SPRITE_H * hScale;
    const breath = REDUCED ? 0 : Math.sin(t * 2.2);
    const stretch = ma.hopT < 1 ? Math.sin(ma.hopT * Math.PI) : 0;
    mm.sprite.scale.set(
      wNow * ma.faceDir * flip * (1 - 0.012 * breath - 0.06 * stretch),
      hNow * (1 + 0.015 * breath + 0.1 * stretch),
      1
    );
    if (ma.waveT < 1) {
      ma.waveT = Math.min(1, ma.waveT + dt / 1.1);
      mm.sprite.material.rotation = Math.sin(ma.waveT * 16) * 0.1 * (1 - ma.waveT);
    } else {
      mm.sprite.material.rotation *= 0.9;
    }
  } else {
    /* 3D fallback: yaw turn + spin */
    let spinA = 0;
    if (ma.spinT < 1) { ma.spinT = Math.min(1, ma.spinT + dt / 0.7); spinA = easeOut(ma.spinT) * Math.PI * 2; }
    let dy = ma.yawT - ma.yaw;
    dy = Math.atan2(Math.sin(dy), Math.cos(dy));
    ma.yaw += dy * Math.min(1, dt * 7);
    minimi.rotation.y = ma.yaw + spinA;

    if (!REDUCED) minimiHead.rotation.y = Math.sin(t * 0.45) * 0.3;

    if (ma.blinkT >= 1 && t > ma.blinkAt) { ma.blinkT = 0; ma.blinkAt = t + 2 + Math.random() * 3; }
    if (ma.blinkT < 1) {
      ma.blinkT = Math.min(1, ma.blinkT + dt / 0.16);
      const s = Math.max(0.08, Math.abs(Math.cos(ma.blinkT * Math.PI)));
      mm.eyes.forEach(eye => eye.scale.y = s);
    }

    if (ma.waveT < 1) {
      ma.waveT = Math.min(1, ma.waveT + dt / 1.3);
      const raise = Math.sin(Math.min(ma.waveT * 3, 1) * Math.PI / 2);
      const wig = Math.sin(ma.waveT * 22) * 0.3 * (1 - ma.waveT);
      mm.armR.rotation.z = -0.5 - raise * 1.9 + wig;
      mm.armL.rotation.z = 0.5 + raise * 0.3;
    } else {
      mm.armR.rotation.z += (-0.5 - mm.armR.rotation.z) * 0.1;
      mm.armL.rotation.z += (0.5 - mm.armL.rotation.z) * 0.1;
    }
  }

  /* occasional idle hop */
  if (t > ma.idleHopAt) {
    ma.idleHopAt = t + 10 + Math.random() * 6;
    if (!REDUCED && ma.hopT >= 1) hop(0.18);
  }

  /* shadow blob follows */
  const height = bob + hopY + mi.lift * mi.vec.y + (MINIMI_2D ? 0.03 : 0.15);
  mm.blob.position.set(minimi.position.x, 0.045, minimi.position.z);
  mm.blob.scale.setScalar(Math.max(0.55, 1 - height * 0.35));
  mm.blob.material.opacity = Math.max(0.25, 0.85 - height * 0.5);

  /* look back at the camera after pointing at an item */
  if (ma.faceBack !== null) {
    ma.faceBack -= dt;
    if (ma.faceBack <= 0) { faceCamera(); ma.faceBack = null; }
  }

  /* emote bubble */
  if (ma.emoteT < 2.6) {
    ma.emoteT += dt;
    const p = Math.min(1, ma.emoteT / 0.22);
    const pop = 0.95 + 0.2 * Math.sin(p * Math.PI);
    const fade = ma.emoteT > 2.2 ? Math.max(0, (2.6 - ma.emoteT) / 0.4) : 1;
    const sBase = pop * p * (mm.emoteIsIcon ? 0.72 : 0.95);
    const asp = mm.emoteEntry ? mm.emoteEntry.aspect : 1;
    mm.emote.scale.set(sBase * asp, sBase, 1);
    mm.emote.material.opacity = fade;
    mm.emote.position.set(
      minimi.position.x + 0.55,
      minimi.position.y + (MINIMI_2D ? 2.6 : 2.45),
      minimi.position.z + 0.3
    );
  } else {
    mm.emote.scale.setScalar(0.001);
  }

  /* step marker bounce */
  if (marker.visible && step >= 0 && step < LAST) {
    const mp = markerPos[ORDER[step]];
    marker.position.set(mp.x, mp.y + (REDUCED ? 0 : Math.sin(t * 3.2) * 0.09), mp.z);
  }

  /* LEDs + fairy lights */
  if (!REDUCED) {
    for (const l of leds) l.m.emissiveIntensity = Math.sin(t * l.speed + l.phase) > 0 ? 1.4 : 0.15;
    for (const f of fairy) f.mat.emissiveIntensity = 1.1 + 0.7 * Math.sin(t * 2.1 + f.i * 1.35);
  }

  /* dust motes drift */
  if (!REDUCED && motes) {
    const arr = motes.geometry.attributes.position.array;
    for (let i = 1; i < arr.length; i += 3) {
      arr[i] += dt * 0.12;
      if (arr[i] > 5.6) arr[i] = 0.3;
    }
    motes.geometry.attributes.position.needsUpdate = true;
  }

  /* floating hearts (re-burst with each bow) */
  if (step === LAST && !hearts && !REDUCED && (ma.bowTimer % 4.2) < dt * 2) heartBurst();
  if (hearts) {
    hearts.t += dt;
    for (const hb of hearts.items) {
      const lt = hearts.t - hb.ph;
      if (lt < 0) continue;
      hb.s.position.y += dt * 0.5;
      hb.s.position.x += Math.sin((hearts.t + hb.ph) * 2.6) * dt * 0.18 * hb.side;
      const sc = 0.32 * Math.min(1, lt * 4);
      hb.s.scale.set(sc * (hearts.entry.aspect || 1), sc, 1);
      hb.s.material.opacity = Math.max(0, 1 - lt / 2.2);
    }
    if (hearts.t > 3.2) { scene.remove(hearts.group); hearts = null; }
  }

  /* confetti */
  if (confetti) {
    confetti.t += dt;
    for (const c of confetti.items) {
      c.m.position.y += c.vy * dt;
      c.m.position.x += Math.sin(confetti.t * c.wx + c.ph) * dt * 0.6;
      c.m.rotation.x += c.rx * dt;
      c.m.rotation.z += c.rz * dt;
    }
    if (confetti.t > 4.5) { scene.remove(confetti.group); confetti = null; }
  }

  /* selection ring pulse */
  if (selRing.visible) {
    const pu = REDUCED ? 1 : 1 + 0.05 * Math.sin(t * 3.4);
    selRing.scale.setScalar((selRing.userData.base || 1) * pu);
    selRing.material.opacity = REDUCED ? 0.5 : 0.4 + 0.18 * Math.sin(t * 3.4);
  }

  /* hover lift + squash-pop + select-bounce */
  if (sel.t < 1) sel.t = Math.min(1, sel.t + dt / 0.5);
  for (const it of interactables) {
    it.lift += (it.liftT - it.lift) * 0.15;
    const bounce = (!REDUCED && sel.id === it.id && sel.t < 1)
      ? 1 + 0.13 * Math.sin(sel.t * Math.PI * 2) * (1 - sel.t)
      : 1;
    it.group.scale.setScalar(it.baseS * (1 + 0.045 * it.lift) * bounce);
    if (it.id === 'minimi') continue;
    it.group.position.set(
      it.baseP.x + it.vec.x * it.lift,
      it.baseP.y + it.vec.y * it.lift,
      it.baseP.z + it.vec.z * it.lift
    );
  }

  placeDialog();
  renderer.render(scene, camera);
}

resize();
placeCamera();
animate();
