const $ = (s) => document.querySelector(s),
  rp = (n) => "Rp" + n.toLocaleString("id-ID"),
  css = (v) =>
    getComputedStyle(document.documentElement).getPropertyValue(v).trim();
const rm = matchMedia("(prefers-reduced-motion:reduce)").matches;
/* liquid headline: SVG displacement ripples on hover */
const h1 = $("#h1"),
  disp = $("#disp"),
  turb = $("#turb");
let dT = 0,
  dC = 0;
h1.onpointerenter = () => (dT = rm ? 0 : 14);
h1.onpointerleave = () => (dT = 0);
(function f(t) {
  dC += (dT - dC) * 0.08;
  disp.setAttribute("scale", dC.toFixed(2));
  turb.setAttribute(
    "baseFrequency",
    0.012 +
      Math.sin(t / 900) * 0.004 +
      " " +
      (0.03 + Math.cos(t / 700) * 0.008),
  );
  requestAnimationFrame(f);
})(0);
/* salt mist: hold to spray */
const stage = $("#stage"),
  cv = $("#mist"),
  cx = cv.getContext("2d");
let W,
  H,
  D = Math.min(devicePixelRatio || 1, 2),
  P = [],
  press = false;
function size() {
  const r = stage.getBoundingClientRect();
  W = r.width;
  H = r.height;
  cv.width = W * D;
  cv.height = H * D;
}
size();
addEventListener("resize", size);
function emit() {
  const s = stage.getBoundingClientRect(),
    n = $("#tip").getBoundingClientRect(),
    x = n.left - s.left,
    y = n.top - s.top;
  for (let i = 0; i < 7; i++) {
    const a = Math.PI + (Math.random() - 0.5) * 0.8,
      v = 3 + Math.random() * 7;
    P.push({
      x,
      y,
      vx: Math.cos(a) * v,
      vy: Math.sin(a) * v - 0.3,
      r: 0.8 + Math.random() * 2.4,
      l: 1,
      d: 0.012 + Math.random() * 0.02,
      s: Math.random() < 0.35,
    });
  }
}
(function loop() {
  if (press) emit();
  cx.setTransform(D, 0, 0, D, 0, 0);
  cx.clearRect(0, 0, W, H);
  const wh = css("--bg") || "#fff",
    lt = css("--latte");
  P = P.filter((p) => p.l > 0);
  for (const p of P) {
    p.x += p.vx;
    p.y += p.vy;
    p.vx *= 0.96;
    p.vy = p.vy * 0.96 + 0.07;
    p.l -= p.d;
    cx.globalAlpha = Math.max(p.l, 0);
    cx.fillStyle = p.s ? lt : wh;
    cx.strokeStyle = lt;
    if (p.s) {
      cx.fillRect(p.x, p.y, p.r * 1.4, p.r * 1.4);
    } else {
      cx.beginPath();
      cx.arc(p.x, p.y, p.r, 0, 7);
      cx.fill();
      cx.lineWidth = 0.5;
      cx.stroke();
    }
  }
  requestAnimationFrame(loop);
})();
const on = () => {
    press = true;
    stage.classList.add("on");
  },
  off = () => {
    press = false;
    stage.classList.remove("on");
  };
stage.addEventListener("pointerdown", (e) => {
  if (e.target.id !== "spray") on();
});
["pointerup", "pointerleave", "pointercancel"].forEach((e) =>
  stage.addEventListener(e, off),
);
$("#spray").onclick = () => {
  on();
  setTimeout(off, 900);
};
/* morphing strands */
const amp = $("#amp"),
  sv = $("#strands");
let cur = 55;
sv.innerHTML = Array.from(
  { length: 7 },
  (_, i) => `<path stroke-width="${3 + (i % 3)}" opacity="${0.35 + i * 0.1}"/>`,
).join("");
const ps = [...sv.querySelectorAll("path")];
function draw(a, t) {
  ps.forEach((p, i) => {
    let d = "";
    for (let x = 0; x <= 600; x += 10) {
      const k = a / 100,
        y =
          30 +
          i * 30 +
          Math.sin(x / (70 - k * 28) + i * 0.6 + t) * k * 34 * (1 + i * 0.04);
      d += (x ? "L" : "M") + x + " " + y.toFixed(1);
    }
    p.setAttribute("d", d);
  });
}
function mood() {
  const v = +amp.value;
  $("#mood").textContent =
    v < 20
      ? "Lurus rapi"
      : v < 50
        ? "Wave lembut"
        : v < 80
          ? "Wave santai"
          : "Beach waves penuh";
  $("#dose").textContent =
    v < 20
      ? "2 semprotan di rambut lembap."
      : v < 50
        ? "4 semprotan, remas dari ujung."
        : v < 80
          ? "6 semprotan, remas dan biarkan kering."
          : "8 semprotan, remas, lalu diffuse sebentar.";
}
amp.oninput = mood;
mood();
(function w(t) {
  cur += (+amp.value - cur) * 0.1;
  draw(cur, rm ? 0 : t / 2200);
  requestAnimationFrame(w);
})(0);
/* buy + cart */
let price = 149000,
  name = "150 ml",
  q = 1,
  cart = [];
const total = () => price * q * ($("#subs").checked ? 0.9 : 1);
function upd() {
  $("#q").textContent = q;
  $("#total").textContent = rp(Math.round(total()));
}
$("#sizes").onclick = (e) => {
  const b = e.target.closest(".opt");
  if (!b) return;
  document
    .querySelectorAll(".opt")
    .forEach((o) => o.setAttribute("aria-pressed", o === b));
  price = +b.dataset.p;
  name = b.dataset.n;
  upd();
};
$("#minus").onclick = () => {
  q = Math.max(1, q - 1);
  upd();
};
$("#plus").onclick = () => {
  q = Math.min(9, q + 1);
  upd();
};
$("#subs").onchange = upd;
upd();
function toast(m) {
  const t = $("#toast");
  t.textContent = m;
  t.classList.add("show");
  clearTimeout(toast.k);
  toast.k = setTimeout(() => t.classList.remove("show"), 2200);
}
function render() {
  const n = cart.reduce((a, c) => a + c.q, 0);
  $("#count").textContent = n;
  $("#lines").innerHTML = cart.length
    ? cart
        .map(
          (c, i) =>
            `<div class="line"><span>SURAI Sea Salt Spray ${c.n}${c.s ? " (langganan)" : ""}<br><small>${c.q} x ${rp(c.p)}</small></span><span style="text-align:right"><strong>${rp(c.p * c.q)}</strong><br><button class="rm" data-i="${i}" aria-label="Hapus ${c.n} dari keranjang">Hapus</button></span></div>`,
        )
        .join("")
    : '<p style="opacity:.6">Keranjang masih kosong.</p>';
  $("#sum").textContent = rp(cart.reduce((a, c) => a + c.p * c.q, 0));
}
$("#add").onclick = () => {
  const s = $("#subs").checked,
    p = Math.round(price * (s ? 0.9 : 1)),
    f = cart.find((c) => c.n === name && c.s === s);
  f ? (f.q += q) : cart.push({ n: name, s, p, q });
  render();
  toast("Ditambahkan ke keranjang");
};
const dr = $("#drawer");
const op = (v) => {
  dr.classList.toggle("open", v);
  dr.setAttribute("aria-hidden", !v);
};
$("#openCart").onclick = () => op(true);
$("#closeCart").onclick = () => op(false);
addEventListener("keydown", (e) => e.key === "Escape" && op(false));
$("#lines").onclick = (e) => {
  const b = e.target.closest(".rm");
  if (!b) return;
  cart.splice(+b.dataset.i, 1);
  render();
  toast("Dihapus dari keranjang");
};
$("#checkout").onclick = () =>
  toast(
    cart.length ? "Ini demo, pembayaran belum aktif" : "Keranjang masih kosong",
  );
render();
