// AvalonQ Mining Performance Charts (Canvas-based, no dependencies)
(function() {
  const rawData = [
    {d:'2/13',h:28.76,r:1.382e-05},{d:'2/14',h:66.11,r:3.174e-05},{d:'2/15',h:60.37,r:2.897e-05},
    {d:'2/16',h:62.98,r:3.026e-05},{d:'2/17',h:54.34,r:2.609e-05},{d:'2/18',h:63.02,r:3.027e-05},
    {d:'2/19',h:75.49,r:3.55e-05},{d:'2/20',h:55.08,r:2.308e-05},{d:'2/21',h:59.14,r:2.482e-05},
    {d:'2/22',h:63.60,r:2.659e-05},{d:'2/23',h:54.78,r:2.295e-05},{d:'2/24',h:54.20,r:2.272e-05},
    {d:'2/25',h:53.66,r:2.249e-05},{d:'2/26',h:52.71,r:2.216e-05},{d:'2/28',h:54.65,r:2.292e-05},
    {d:'3/1',h:44.30,r:1.856e-05},{d:'3/3',h:47.20,r:1.98e-05},{d:'3/4',h:54.81,r:2.302e-05},
    {d:'3/5',h:54.44,r:2.28e-05},{d:'3/6',h:56.67,r:2.368e-05},{d:'3/7',h:54.01,r:2.254e-05},
    {d:'3/8',h:53.50,r:2.231e-05},{d:'3/9',h:54.20,r:2.263e-05},{d:'3/10',h:56.24,r:2.349e-05},
    {d:'3/11',h:54.65,r:2.281e-05},{d:'3/12',h:55.36,r:2.315e-05},{d:'3/13',h:56.48,r:2.366e-05},
    {d:'3/14',h:54.67,r:2.283e-05},{d:'3/15',h:43.78,r:1.827e-05}
  ];

  function drawBarChart(canvasId, data, key, color, unit, multiplier) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    const W = rect.width, H = rect.height;

    const pad = { top: 20, right: 20, bottom: 50, left: 65 };
    const chartW = W - pad.left - pad.right;
    const chartH = H - pad.top - pad.bottom;

    const values = data.map(d => d[key] * (multiplier || 1));
    const maxVal = Math.max(...values) * 1.15;
    const barW = chartW / data.length * 0.7;
    const gap = chartW / data.length * 0.3;

    // Background
    ctx.fillStyle = '#f7fafc';
    ctx.fillRect(0, 0, W, H);

    // Grid lines
    const gridLines = 5;
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 0.5;
    ctx.font = '10px Inter, sans-serif';
    ctx.fillStyle = '#718096';
    ctx.textAlign = 'right';
    for (let i = 0; i <= gridLines; i++) {
      const y = pad.top + (chartH / gridLines) * i;
      const val = maxVal - (maxVal / gridLines) * i;
      ctx.beginPath();
      ctx.moveTo(pad.left, y);
      ctx.lineTo(W - pad.right, y);
      ctx.stroke();
      let label;
      if (multiplier) {
        label = (val * 1e5).toFixed(1);
      } else {
        label = val.toFixed(0);
      }
      ctx.fillText(label, pad.left - 8, y + 3);
    }

    // Y-axis label
    ctx.save();
    ctx.translate(12, pad.top + chartH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = '#718096';
    ctx.font = '11px Noto Sans JP, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(unit, 0, 0);
    ctx.restore();

    // Bars
    const avgVal = values.reduce((a, b) => a + b, 0) / values.length;
    data.forEach((d, i) => {
      const x = pad.left + i * (barW + gap) + gap / 2;
      const h = (values[i] / maxVal) * chartH;
      const y = pad.top + chartH - h;

      // Gradient bar
      const grad = ctx.createLinearGradient(x, y, x, pad.top + chartH);
      grad.addColorStop(0, color);
      grad.addColorStop(1, color + '40');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(x, y, barW, h, [3, 3, 0, 0]);
      ctx.fill();

      // X label (show every 3rd to avoid overlap)
      if (i % 3 === 0) {
        ctx.save();
        ctx.fillStyle = '#718096';
        ctx.font = '9px Inter, sans-serif';
        ctx.translate(x + barW / 2, pad.top + chartH + 8);
        ctx.rotate(-Math.PI / 6);
        ctx.textAlign = 'right';
        ctx.fillText(d.d, 0, 0);
        ctx.restore();
      }
    });

    // Average line
    const avgY = pad.top + chartH - (avgVal / maxVal) * chartH;
    ctx.strokeStyle = '#e53e3e';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(pad.left, avgY);
    ctx.lineTo(W - pad.right, avgY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Average label
    ctx.fillStyle = '#e53e3e';
    ctx.font = 'bold 10px Inter, sans-serif';
    ctx.textAlign = 'left';
    let avgLabel = multiplier ? `AVG: ${(avgVal*1e5).toFixed(1)}` : `AVG: ${avgVal.toFixed(1)}`;
    ctx.fillText(avgLabel, W - pad.right - 70, avgY - 6);
  }

  function init() {
    drawBarChart('rewardChart', rawData, 'r', '#2b6cb0', 'BTC (×10⁻⁵)', 1);
    drawBarChart('hashrateChart', rawData, 'h', '#38a169', 'TH/s', 0);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  window.addEventListener('resize', init);
})();
