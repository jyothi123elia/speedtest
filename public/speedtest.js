async function startTest() {
  const btn = document.getElementById('start-btn');
  btn.disabled = true;
  btn.textContent = 'Testing...';

  document.getElementById('download-result').textContent = '—';
  document.getElementById('upload-result').textContent = '—';
  document.getElementById('ping-result').textContent = '—';

  // ── PING ──────────────────────────────────────
  setStatus('Measuring Ping...');
  const pingMs = await measurePing();
  document.getElementById('ping-result').textContent = pingMs;

  // ── DOWNLOAD ──────────────────────────────────
  setStatus('Measuring Download Speed...');
  const dlSpeed = await measureDownload();
  document.getElementById('download-result').textContent = dlSpeed;

  // ── UPLOAD ────────────────────────────────────
  setStatus('Measuring Upload Speed...');
  const ulSpeed = await measureUpload();
  document.getElementById('upload-result').textContent = ulSpeed;

  setStatus('✅ Test Complete!');
  document.getElementById('speed-value').textContent = dlSpeed;
  btn.disabled = false;
  btn.textContent = 'RUN AGAIN';
}

async function measurePing() {
  const times = [];
  for (let i = 0; i < 5; i++) {
    const t0 = performance.now();
    await fetch('/ping?r=' + Math.random());
    times.push(performance.now() - t0);
  }
  return Math.round(Math.min(...times));
}

async function measureDownload() {
  const SIZE = 10 * 1024 * 1024; // 10 MB
  const t0 = performance.now();
  const res = await fetch('/download?r=' + Math.random());
  await res.arrayBuffer(); // wait for full download
  const elapsed = (performance.now() - t0) / 1000; // seconds
  const speedMbps = ((SIZE * 8) / elapsed / 1_000_000).toFixed(2);
  animateGauge(speedMbps);
  return speedMbps;
}

async function measureUpload() {
  const SIZE = 5 * 1024 * 1024; // 5 MB
  const data = new Uint8Array(SIZE);
  const t0 = performance.now();
  await fetch('/upload', {
    method: 'POST',
    body: data,
    headers: { 'Content-Type': 'application/octet-stream' }
  });
  const elapsed = (performance.now() - t0) / 1000;
  return ((SIZE * 8) / elapsed / 1_000_000).toFixed(2);
}

function animateGauge(value) {
  const el = document.getElementById('speed-value');
  let current = 0;
  const target = parseFloat(value);
  const step = target / 40;
  const interval = setInterval(() => {
    current = Math.min(current + step, target);
    el.textContent = current.toFixed(1);
    if (current >= target) clearInterval(interval);
  }, 30);
}

function setStatus(text) {
  document.getElementById('status-text').textContent = text;
}