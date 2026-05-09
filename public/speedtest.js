function setArc(percent) {
  const arc = document.getElementById('gauge-arc');
  const circumference = 534;
  const offset = circumference - (percent / 100) * circumference;
  arc.style.strokeDashoffset = offset;
}

async function startTest() {
  const btn = document.getElementById('start-btn');
  const arc = document.getElementById('gauge-arc');
  btn.disabled = true;
  btn.textContent = '...';
  arc.classList.add('testing');
  setArc(0);

  document.getElementById('download-result').textContent = '—';
  document.getElementById('upload-result').textContent = '—';
  document.getElementById('ping-result').textContent = '—';
  document.getElementById('speed-value').textContent = '0';

  try {
    setStatus('📡 Measuring Ping...');
    const pingMs = await measurePing();
    document.getElementById('ping-result').textContent = pingMs;

    setStatus('⬇ Measuring Download...');
    const dlSpeed = await measureDownload();
    document.getElementById('download-result').textContent = dlSpeed;

    setStatus('⬆ Measuring Upload...');
    const ulSpeed = await measureUpload();
    document.getElementById('upload-result').textContent = ulSpeed;

    setStatus('✅ Test Complete!');
    arc.classList.remove('testing');

  } catch (err) {
    setStatus('❌ Error: ' + err.message);
    arc.classList.remove('testing');
  }

  btn.disabled = false;
  btn.textContent = 'AGAIN';
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
  const SIZE = 10 * 1024 * 1024;
  const t0 = performance.now();
  const res = await fetch('/download?r=' + Math.random());
  await res.arrayBuffer();
  const elapsed = (performance.now() - t0) / 1000;
  const speedMbps = ((SIZE * 8) / elapsed / 1_000_000).toFixed(2);
  animateGauge(speedMbps);
  setArc(Math.min((parseFloat(speedMbps) / 100) * 100, 100));
  return speedMbps;
}

async function measureUpload() {
  const SIZE = 5 * 1024 * 1024;
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
    setArc(Math.min((current / 100) * 100, 100));
    if (current >= target) clearInterval(interval);
  }, 30);
}

function setStatus(text) {
  document.getElementById('status-text').textContent = text;
}
// Buddha rotating quotes
const buddhaQuotes = [
  '"Good things take time. Your success is loading..."',
  '"Be patient. Everything comes to you at the right time."',
  '"Peace comes from within. Do not seek it without."',
  '"The secret of health is not to mourn the past."',
  '"Three things cannot hide: the sun, the moon, and the truth."',
  '"Happiness never decreases by being shared."'
];

let quoteIndex = 0;
setInterval(() => {
  quoteIndex = (quoteIndex + 1) % buddhaQuotes.length;
  document.getElementById('buddha-quote').textContent = buddhaQuotes[quoteIndex];
}, 6000);