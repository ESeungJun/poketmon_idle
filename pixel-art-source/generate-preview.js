// pixel-art-source/generate-preview.js
// 실행: node generate-preview.js
// → http://localhost:3131 열고 anims.js 수정 후 브라우저 새로고침하면 바로 반영
const fs   = require('fs')
const path = require('path')
const vm   = require('vm')
const http = require('http')

const SRC_DIR = path.resolve(__dirname, '../src/components/Pet')
const PORT    = 3131

const POKEMON = [
  { file: '1-anims.js',          name: '이상해씨 (1)' },
  { file: '2-anims.js',          name: '이상해풀 (2)' },
  { file: '3-anims.js',          name: '이상해꽃 (3)' },
  { file: '4-anims.js',          name: '파이리 (4)' },
  { file: '5-anims.js',          name: '리자드 (5)' },
  { file: '6-anims.js',          name: '리자몽 (6)' },
  { file: '7-anims.js',          name: '꼬부기 (7)' },
  { file: '8-anims.js',          name: '어니부기 (8)' },
  { file: '9-anims.js',          name: '거북왕 (9)' },
  { file: '16-anims.js',         name: '구구 (16)' },
  { file: '17-anims.js',         name: '피죤 (17)' },
  { file: '18-anims.js',         name: '피죤투 (18)' },
  { file: '25-anims.js',         name: '피카츄 (25)' },
  { file: '26-anims.js',         name: '라이츄 (26)' },
  { file: '92-anims.js',         name: '고오스 (92)' },
  { file: '93-anims.js',         name: '고우스트 (93)' },
  { file: '94-anims.js',         name: '팬텀 (94)' },
  { file: '133-anims.js',        name: '이브이 (133)' },
  { file: '143-anims.js',        name: '잠만보 (143)' },
]

function loadData(filePath) {
  const raw = fs.readFileSync(filePath, 'utf-8')
  let code = raw
    .replace(/export const /g, 'const ')
    .replace(/const _ = null\s*\n/, '')
  const wrapped = `
    const _ = null;
    ${code}
    __out.COLORS       = typeof COLORS       !== 'undefined' ? COLORS       : undefined;
    __out.BASE_BODY    = typeof BASE_BODY    !== 'undefined' ? BASE_BODY    : undefined;
    __out.SLEEP_COLORS = typeof SLEEP_COLORS !== 'undefined' ? SLEEP_COLORS : undefined;
    __out.SLEEP_BODY   = typeof SLEEP_BODY   !== 'undefined' ? SLEEP_BODY   : undefined;
  `
  const __out = {}
  try { vm.runInNewContext(wrapped, { __out }) } catch (e) {
    console.error(`Error loading ${path.basename(filePath)}:`, e.message)
    return null
  }
  return __out
}

function buildAllData() {
  const allData = {}
  for (const p of POKEMON) {
    const fp = path.join(SRC_DIR, p.file)
    if (!fs.existsSync(fp)) continue
    const d = loadData(fp)
    if (d) allData[p.name] = d
  }
  return allData
}

function buildHtml(allData) {
  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <title>Pixel Art Viewer</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #111827; color: #e5e7eb; font-family: monospace; padding: 20px; }
    h1 { margin-bottom: 14px; font-size: 15px; color: #9ca3af; }
    .controls { display: flex; gap: 10px; align-items: center; margin-bottom: 14px; flex-wrap: wrap; }
    select, button {
      background: #1f2937; color: #e5e7eb; border: 1px solid #374151;
      padding: 5px 10px; border-radius: 4px; font-family: monospace; font-size: 13px; cursor: pointer;
    }
    button:hover { background: #374151; }
    button.active { background: #1d4ed8; border-color: #3b82f6; }
    button:disabled { opacity: 0.35; cursor: default; }
    label { font-size: 12px; color: #9ca3af; display: flex; align-items: center; gap: 5px; }
    #info {
      background: #1f2937; border: 1px solid #374151; padding: 9px 14px;
      border-radius: 4px; margin-bottom: 14px; font-size: 13px; min-height: 38px; line-height: 1.7;
    }
    #palette {
      background: #1f2937; border: 1px solid #374151; padding: 10px 14px;
      border-radius: 4px; margin-bottom: 14px; display: flex; flex-wrap: wrap; gap: 8px;
    }
    .pal-item { display: flex; align-items: center; gap: 4px; font-size: 12px; }
    .pal-swatch { width: 14px; height: 14px; border: 1px solid #555; border-radius: 2px; flex-shrink: 0; }
    .pal-name { color: #d1d5db; }
    .pal-hex { color: #6b7280; }
    #viewer-area { display: flex; gap: 20px; align-items: flex-start; }
    #canvas-wrap { position: relative; display: inline-block; cursor: crosshair; flex-shrink: 0; }
    #main-canvas { display: block; }
    #overlay-canvas { position: absolute; top: 0; left: 0; pointer-events: none; }
    #ref-wrap {
      flex-shrink: 0; display: flex; flex-direction: column; align-items: center; gap: 8px;
    }
    #ref-wrap label { font-size: 12px; color: #6b7280; }
    #ref-img { image-rendering: pixelated; border: 1px solid #374151; border-radius: 4px; background: #1e293b; }
  </style>
</head>
<body>
  <h1>Pixel Art Viewer — anims.js 수정 후 새로고침(F5)하면 바로 반영</h1>
  <div class="controls">
    <select id="pokemon-select"></select>
    <button id="btn-normal" class="active">Normal</button>
    <button id="btn-sleep" disabled>Sleep</button>
    <label>Grid <input type="checkbox" id="show-grid" checked></label>
    <label>Numbers <input type="checkbox" id="show-numbers" checked></label>
    <label>
      Scale
      <input type="range" id="scale-slider" min="8" max="48" value="24" style="width:80px">
      <span id="scale-val">24px</span>
    </label>
  </div>
  <div id="info">포켓몬을 선택하고 픽셀 위에 마우스를 올리세요 — 클릭하면 좌표 복사</div>
  <div id="palette"></div>
  <div id="viewer-area">
    <div id="canvas-wrap">
      <canvas id="main-canvas"></canvas>
      <canvas id="overlay-canvas"></canvas>
    </div>
    <div id="ref-wrap">
      <img id="ref-img" alt="원본 PNG">
    </div>
  </div>

  <script>
    const DATA = ${JSON.stringify(allData)};
    const refImg = document.getElementById('ref-img');

    const sel   = document.getElementById('pokemon-select');
    const btnN  = document.getElementById('btn-normal');
    const btnS  = document.getElementById('btn-sleep');
    const infoEl = document.getElementById('info');
    const palEl  = document.getElementById('palette');
    const mainC  = document.getElementById('main-canvas');
    const ovC    = document.getElementById('overlay-canvas');
    const gridCb = document.getElementById('show-grid');
    const numCb  = document.getElementById('show-numbers');
    const scaleSlider = document.getElementById('scale-slider');
    const scaleValEl  = document.getElementById('scale-val');

    let mode = 'normal';
    let CELL = 24;
    let hovRow = -1, hovCol = -1;

    Object.keys(DATA).forEach(name => {
      const o = document.createElement('option');
      o.value = o.textContent = name;
      sel.appendChild(o);
    });

    // restore last selected pokemon & mode
    const saved = sessionStorage.getItem('poke');
    if (saved && DATA[saved]) sel.value = saved;
    const savedMode = sessionStorage.getItem('pokeMode');
    if (savedMode === 'sleep' && DATA[sel.value]?.SLEEP_BODY) {
      mode = 'sleep';
      btnS.classList.add('active'); btnN.classList.remove('active');
    }

    function getCurrent() {
      const d = DATA[sel.value];
      if (!d) return null;
      if (mode === 'sleep' && d.SLEEP_BODY && d.SLEEP_COLORS)
        return { body: d.SLEEP_BODY, colors: d.SLEEP_COLORS };
      return { body: d.BASE_BODY, colors: d.COLORS };
    }

    function renderPalette(colors) {
      palEl.innerHTML = '';
      Object.entries(colors).forEach(([key, hex]) => {
        const el = document.createElement('div');
        el.className = 'pal-item';
        el.innerHTML =
          '<div class="pal-swatch" style="background:' + hex + '"></div>' +
          '<span class="pal-name">' + key + '</span>&nbsp;' +
          '<span class="pal-hex">' + hex + '</span>';
        palEl.appendChild(el);
      });
    }

    function render() {
      sessionStorage.setItem('poke', sel.value);
      sessionStorage.setItem('pokeMode', mode);
      const data = getCurrent();
      if (!data) return;
      const { body, colors } = data;
      const rows = body.length;
      const cols = Math.max(...body.map(r => r.length));

      mainC.width  = cols * CELL;
      mainC.height = rows * CELL;
      ovC.width    = cols * CELL;
      ovC.height   = rows * CELL;

      const ctx = mainC.getContext('2d');
      ctx.clearRect(0, 0, mainC.width, mainC.height);

      for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++) {
          ctx.fillStyle = (r + c) % 2 === 0 ? '#1e293b' : '#172033';
          ctx.fillRect(c * CELL, r * CELL, CELL, CELL);
        }

      for (let r = 0; r < rows; r++)
        for (let c = 0; c < (body[r]?.length || 0); c++) {
          const key = body[r][c];
          if (key && colors[key]) {
            ctx.fillStyle = colors[key];
            ctx.fillRect(c * CELL, r * CELL, CELL, CELL);
          }
        }

      renderPalette(colors);
      renderOverlay(rows, cols);

      // 원본 PNG 표시 — 캔버스와 같은 높이
      const dexMatch = sel.value.match(/\\((\\d+)\\)/);
      if (dexMatch) {
        const dexNum = dexMatch[1];
        const folder = mode === 'sleep' ? 'sleep' : 'normal';
        refImg.src = '/img/' + folder + '/' + dexNum + '.png';
        refImg.style.width = mainC.width + 'px';
        refImg.style.height = mainC.height + 'px';
        refImg.style.display = 'block';
      } else {
        refImg.style.display = 'none';
      }
    }

    function renderOverlay(rows, cols) {
      const ctx = ovC.getContext('2d');
      ctx.clearRect(0, 0, ovC.width, ovC.height);

      if (gridCb.checked) {
        ctx.strokeStyle = 'rgba(255,255,255,0.12)';
        ctx.lineWidth = 0.5;
        for (let r = 0; r <= rows; r++) {
          ctx.beginPath(); ctx.moveTo(0, r*CELL); ctx.lineTo(cols*CELL, r*CELL); ctx.stroke();
        }
        for (let c = 0; c <= cols; c++) {
          ctx.beginPath(); ctx.moveTo(c*CELL, 0); ctx.lineTo(c*CELL, rows*CELL); ctx.stroke();
        }
      }

      if (numCb.checked && CELL >= 14) {
        const fs = Math.max(8, Math.min(CELL * 0.38, 12));
        ctx.font = fs + 'px monospace';
        ctx.fillStyle = 'rgba(253,224,71,0.6)';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        for (let c = 0; c < cols; c++)
          ctx.fillText(c, c * CELL + CELL / 2, CELL / 2);
        ctx.textAlign = 'left';
        for (let r = 1; r < rows; r++)
          ctx.fillText(r, 2, r * CELL + CELL / 2);
      }

      if (hovRow >= 0 && hovCol >= 0) {
        ctx.strokeStyle = 'rgba(251,191,36,0.95)';
        ctx.lineWidth = 2;
        ctx.strokeRect(hovCol * CELL + 1, hovRow * CELL + 1, CELL - 2, CELL - 2);
      }
    }

    ovC.addEventListener('mousemove', e => {
      const rect = ovC.getBoundingClientRect();
      const col = Math.floor((e.clientX - rect.left) / CELL);
      const row = Math.floor((e.clientY - rect.top) / CELL);
      const data = getCurrent();
      if (!data) return;
      const { body, colors } = data;
      const rows = body.length, cols = Math.max(...body.map(r => r.length));
      if (row < 0 || row >= rows || col < 0 || col >= (body[row]?.length || 0)) {
        hovRow = hovCol = -1; renderOverlay(rows, cols); return;
      }
      hovRow = row; hovCol = col;
      const key = body[row][col];
      const hex = key && colors[key] ? colors[key] : null;
      const swatch = hex
        ? '<span style="display:inline-block;width:13px;height:13px;background:' + hex + ';border:1px solid #888;vertical-align:middle;margin:0 4px;border-radius:2px"></span>'
        : '';
      infoEl.innerHTML =
        '<b>[row ' + row + ', col ' + col + ']</b>  →  ' +
        (key ? "'" + key + "'" : '<i style="color:#6b7280">null (투명)</i>') +
        swatch +
        (hex ? '<code style="color:#93c5fd">' + hex + '</code>' : '') +
        '  <span style="color:#4b5563;font-size:11px">클릭 = 복사</span>';
      renderOverlay(rows, cols);
    });

    ovC.addEventListener('mouseleave', () => {
      hovRow = hovCol = -1;
      const data = getCurrent();
      if (!data) return;
      renderOverlay(data.body.length, Math.max(...data.body.map(r => r.length)));
    });

    ovC.addEventListener('click', e => {
      const rect = ovC.getBoundingClientRect();
      const col = Math.floor((e.clientX - rect.left) / CELL);
      const row = Math.floor((e.clientY - rect.top) / CELL);
      const data = getCurrent();
      if (!data) return;
      const key = data.body[row]?.[col] ?? null;
      const text = '[' + row + ', ' + col + ']: ' + (key ? "'" + key + "'" : 'null');
      // clipboard 복사 (fallback 포함)
      function copyText(str) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(str).catch(() => fallback(str));
        } else { fallback(str); }
      }
      function fallback(str) {
        const ta = document.createElement('textarea');
        ta.value = str;
        ta.style.cssText = 'position:fixed;opacity:0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      copyText(text);
      infoEl.innerHTML += '  <span style="color:#4ade80">copied!</span>';
    });

    sel.addEventListener('change', () => {
      const d = DATA[sel.value];
      btnS.disabled = !(d?.SLEEP_BODY);
      mode = 'normal'; btnN.classList.add('active'); btnS.classList.remove('active');
      render();
    });
    btnN.addEventListener('click', () => { mode='normal'; btnN.classList.add('active'); btnS.classList.remove('active'); render(); });
    btnS.addEventListener('click', () => {
      if (!DATA[sel.value]?.SLEEP_BODY) return;
      mode='sleep'; btnS.classList.add('active'); btnN.classList.remove('active'); render();
    });
    gridCb.addEventListener('change', render);
    numCb.addEventListener('change', render);
    scaleSlider.addEventListener('input', () => {
      CELL = parseInt(scaleSlider.value);
      scaleValEl.textContent = CELL + 'px';
      render();
    });

    { const d = DATA[sel.value]; if (d) btnS.disabled = !d.SLEEP_BODY; }
    render();
  </script>
</body>
</html>`
}

const server = http.createServer((req, res) => {
  // /img/normal/1.png or /img/sleep/1.png
  const imgMatch = req.url.match(/^\/img\/(normal|sleep)\/(\d+)\.png$/)
  if (imgMatch) {
    const imgPath = path.join(__dirname, imgMatch[1], imgMatch[2] + '.png')
    if (fs.existsSync(imgPath)) {
      res.writeHead(200, { 'Content-Type': 'image/png' })
      res.end(fs.readFileSync(imgPath))
    } else {
      res.writeHead(404)
      res.end()
    }
    return
  }
  const allData = buildAllData()
  const html = buildHtml(allData)
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
  res.end(html)
})

server.listen(PORT, () => {
  const url = `http://localhost:${PORT}`
  console.log(`Pixel Art Viewer: ${url}`)
  console.log('anims.js 수정 후 브라우저에서 F5 누르면 바로 반영됩니다.')
  // 브라우저 자동 열기
  const { exec } = require('child_process')
  exec(`start ${url}`)
})
