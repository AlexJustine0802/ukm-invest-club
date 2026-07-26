/**
 * Horizontal-overflow audit. Drives headless Chrome over the DevTools protocol
 * (Node's built-in WebSocket — no dependencies) and, for each page at each
 * width, reports any element wider than the viewport.
 *
 *   node scripts/check-responsive.mjs [--base http://localhost:3000]
 *
 * Pages behind a login need SESSION_COOKIE set to the raw cookie header.
 */
import { spawn } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";

const CHROME =
  process.env.CHROME_PATH ||
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe";
const BASE =
  process.argv[process.argv.indexOf("--base") + 1]?.startsWith("http")
    ? process.argv[process.argv.indexOf("--base") + 1]
    : "http://localhost:3000";
const PORT = 9333;

const WIDTHS = [320, 360, 375, 390, 414, 430, 768, 1024];

const PAGES = process.env.PAGES
  ? process.env.PAGES.split(",")
  : [
      "/",
      "/about",
      "/publications",
      "/publications/all",
      "/events",
      "/events/all",
      "/community",
      "/contact",
      "/register",
      "/login",
      "/signup",
    ];

/**
 * Runs in the page: find anything sticking out past the viewport.
 *
 * Only rightward overflow counts — carousels legitimately park slides off to
 * the left. Anything inside an element that clips or scrolls horizontally is
 * skipped too: a filter rail with `overflow-x-auto` is doing its job, not
 * widening the page.
 */
const PROBE = `(() => {
  const vw = document.documentElement.clientWidth;
  const clipped = (el) => {
    for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
      const ox = getComputedStyle(p).overflowX;
      if (ox !== 'visible') return true;
    }
    return false;
  };
  const out = [];
  for (const el of document.querySelectorAll('body *')) {
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) continue;
    if (clipped(el)) continue;
    const over = Math.round(r.right - vw);
    if (over > 1) {
      const cls = (el.getAttribute('class') || '').slice(0, 90);
      out.push({
        tag: el.tagName.toLowerCase(),
        cls,
        over,
        w: Math.round(r.width),
      });
    }
  }
  // Keep the outermost offenders; children just repeat the parent's problem.
  const seen = new Set();
  const top = out.filter((o) => {
    const key = o.tag + o.cls;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  // A vertical scrollbar legitimately makes innerWidth exceed clientWidth by
  // ~15px; only a much larger gap means emulation is scaling the page, which
  // would make every measurement meaningless.
  if (window.innerWidth - vw > 25) {
    return JSON.stringify({ scrollW: vw, clientW: vw, offenders: [],
      warn: 'PAGE SCALED: innerWidth ' + window.innerWidth + ' vs clientWidth ' + vw });
  }
  return JSON.stringify({
    scrollW: document.documentElement.scrollWidth,
    clientW: vw,
    offenders: top.sort((a, b) => b.over - a.over).slice(0, 6),
  });
})()`;

async function cdpTarget() {
  for (let i = 0; i < 40; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/list`);
      const targets = await res.json();
      const page = targets.find((t) => t.type === "page");
      if (page?.webSocketDebuggerUrl) return page.webSocketDebuggerUrl;
    } catch {
      /* not up yet */
    }
    await sleep(250);
  }
  throw new Error("Chrome DevTools endpoint never came up");
}

function connect(url) {
  const ws = new WebSocket(url);
  let id = 0;
  const pending = new Map();
  const ready = new Promise((res) => (ws.onopen = res));

  ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      msg.error ? reject(new Error(JSON.stringify(msg.error))) : resolve(msg.result);
    }
  };

  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const mid = ++id;
      pending.set(mid, { resolve, reject });
      ws.send(JSON.stringify({ id: mid, method, params }));
    });

  return { ready, send, close: () => ws.close() };
}

const chrome = spawn(CHROME, [
  "--headless=new",
  `--remote-debugging-port=${PORT}`,
  "--no-first-run",
  "--no-default-browser-check",
  "--disable-gpu",
  "--user-data-dir=" + process.env.TEMP + "\\resp-audit-profile",
  "about:blank",
]);
chrome.on("error", (e) => {
  console.error("could not launch Chrome:", e.message);
  process.exit(1);
});

try {
  const { ready, send, close } = connect(await cdpTarget());
  await ready;
  await send("Page.enable");
  await send("Runtime.enable");
  if (process.env.SESSION_COOKIE) {
    await send("Network.enable");
    await send("Network.setExtraHTTPHeaders", {
      headers: { Cookie: process.env.SESSION_COOKIE },
    });
  }

  let problems = 0;

  for (const path of PAGES) {
    const bad = [];
    for (const width of WIDTHS) {
      // mobile:false on purpose. Chrome's mobile emulation applies a page
      // scale, which makes getBoundingClientRect and clientWidth disagree and
      // reports phantom overflow. We want a plain CSS-pixel viewport.
      await send("Emulation.setDeviceMetricsOverride", {
        width,
        height: 900,
        deviceScaleFactor: 1,
        mobile: false,
      });
      await send("Page.navigate", { url: BASE + path });
      await sleep(1200); // let the route render

      const { result } = await send("Runtime.evaluate", {
        expression: PROBE,
        returnByValue: true,
        awaitPromise: false,
      });
      if (typeof result.value !== "string") {
        console.log(`SKIP ${path} @${width}px — page did not render a result`);
        continue;
      }
      const data = JSON.parse(result.value);
      // Element-level detection, not just scrollWidth: `overflow-x: clip` on
      // the body stops the page scrolling but still clips whatever sticks out,
      // and clipped content is a bug too.
      if (data.scrollW > data.clientW + 1 || data.offenders.length > 0) {
        bad.push({ width, ...data });
      }
    }

    if (bad.length === 0) {
      console.log(`OK   ${path}`);
    } else {
      problems++;
      console.log(`FAIL ${path}`);
      for (const b of bad) {
        console.log(`  ${b.width}px  scrollWidth ${b.scrollW} > ${b.clientW}`);
        for (const o of b.offenders) {
          console.log(`     +${o.over}px  <${o.tag}> w=${o.w}  ${o.cls}`);
        }
      }
    }
  }

  close();
  console.log(problems === 0 ? "\nno horizontal overflow" : `\n${problems} page(s) overflow`);
} finally {
  chrome.kill();
}
