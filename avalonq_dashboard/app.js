(function(){
  let btcPrice = 14000000;
  const data = MINING_DATA;
  const activeDays = data.filter(d => d.total > 1e-7);
  const totalBTC = data.reduce((s,d) => s + d.total, 0);
  const avgReward = totalBTC / activeDays.length;
  const avgHash = activeDays.reduce((s,d) => s + d.h, 0) / activeDays.length;

  function fmt(n,dec){return n.toLocaleString('ja-JP',{minimumFractionDigits:dec,maximumFractionDigits:dec})}
  function fmtBTC(n){return n.toFixed(8)}
  function shortDate(d){const p=d.split('-');return parseInt(p[1])+'/'+parseInt(p[2])}

  // KPIs
  function updateKPIs(){
    document.getElementById('kpi-days').textContent = activeDays.length;
    document.getElementById('kpi-total-btc').textContent = fmtBTC(totalBTC) + ' BTC';
    document.getElementById('kpi-total-jpy').textContent = '≈ ¥' + fmt(totalBTC * btcPrice, 0);
    document.getElementById('kpi-avg-reward').textContent = fmtBTC(avgReward);
    document.getElementById('kpi-avg-hash').textContent = avgHash.toFixed(1);
    const monthly2 = avgReward * 30 * 2;
    document.getElementById('kpi-monthly').textContent = '¥' + fmt(monthly2 * btcPrice, 0);
    document.getElementById('kpi-monthly-btc').textContent = fmtBTC(monthly2) + ' BTC';
  }

  // Chart helpers
  function getCtx(id){
    const c = document.getElementById(id);
    if(!c) return null;
    const ctx = c.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const r = c.getBoundingClientRect();
    c.width = r.width * dpr;
    c.height = r.height * dpr;
    ctx.scale(dpr, dpr);
    return {ctx, W:r.width, H:r.height};
  }

  function drawChart(id, vals, labels, color, yLabel, isBTC){
    const g = getCtx(id); if(!g) return;
    const {ctx,W,H} = g;
    const pad = {top:16,right:16,bottom:44,left:60};
    const cW = W-pad.left-pad.right, cH = H-pad.top-pad.bottom;
    const mx = Math.max(...vals)*1.12 || 1;

    ctx.clearRect(0,0,W,H);

    // Grid
    ctx.strokeStyle = '#1e293b'; ctx.lineWidth = 0.5;
    ctx.fillStyle = '#64748b'; ctx.font = '10px Inter,sans-serif'; ctx.textAlign = 'right';
    for(let i=0;i<=5;i++){
      const y=pad.top+(cH/5)*i, v=mx-(mx/5)*i;
      ctx.beginPath();ctx.moveTo(pad.left,y);ctx.lineTo(W-pad.right,y);ctx.stroke();
      ctx.fillText(isBTC ? (v*1e5).toFixed(1) : v.toFixed(0), pad.left-6, y+3);
    }

    // Y label
    ctx.save();ctx.translate(10,pad.top+cH/2);ctx.rotate(-Math.PI/2);
    ctx.fillStyle='#64748b';ctx.font='10px Noto Sans JP';ctx.textAlign='center';
    ctx.fillText(yLabel,0,0);ctx.restore();

    // Bars
    const bw = cW/vals.length*0.65, gap = cW/vals.length*0.35;
    vals.forEach((v,i)=>{
      const x=pad.left+i*(bw+gap)+gap/2;
      const h=(v/mx)*cH, y=pad.top+cH-h;
      const gr=ctx.createLinearGradient(x,y,x,pad.top+cH);
      gr.addColorStop(0,color);gr.addColorStop(1,color+'20');
      ctx.fillStyle=gr;
      ctx.beginPath();ctx.roundRect(x,y,bw,h,[3,3,0,0]);ctx.fill();

      if(i%4===0){
        ctx.save();ctx.fillStyle='#64748b';ctx.font='9px Inter';
        ctx.translate(x+bw/2,pad.top+cH+10);ctx.rotate(-0.4);ctx.textAlign='right';
        ctx.fillText(labels[i],0,0);ctx.restore();
      }
    });

    // Avg line
    const avgV=vals.reduce((a,b)=>a+b,0)/vals.length;
    const avgY=pad.top+cH-(avgV/mx)*cH;
    ctx.strokeStyle='#ef4444';ctx.lineWidth=1.5;ctx.setLineDash([5,4]);
    ctx.beginPath();ctx.moveTo(pad.left,avgY);ctx.lineTo(W-pad.right,avgY);ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle='#ef4444';ctx.font='bold 10px Inter';ctx.textAlign='left';
    ctx.fillText('AVG: '+(isBTC?(avgV*1e5).toFixed(1):avgV.toFixed(1)),W-pad.right-72,avgY-5);
  }

  function drawLineChart(id, vals, labels, color, yLabel){
    const g = getCtx(id); if(!g) return;
    const {ctx,W,H} = g;
    const pad={top:16,right:16,bottom:44,left:60};
    const cW=W-pad.left-pad.right, cH=H-pad.top-pad.bottom;
    const mx=Math.max(...vals)*1.12||1;

    ctx.clearRect(0,0,W,H);
    ctx.strokeStyle='#1e293b';ctx.lineWidth=0.5;
    ctx.fillStyle='#64748b';ctx.font='10px Inter';ctx.textAlign='right';
    for(let i=0;i<=5;i++){
      const y=pad.top+(cH/5)*i, v=mx-(mx/5)*i;
      ctx.beginPath();ctx.moveTo(pad.left,y);ctx.lineTo(W-pad.right,y);ctx.stroke();
      ctx.fillText(v.toFixed(v>100?0:v>1?1:6),pad.left-6,y+3);
    }

    // Area + Line
    ctx.beginPath();
    vals.forEach((v,i)=>{
      const x=pad.left+(i/(vals.length-1))*cW;
      const y=pad.top+cH-(v/mx)*cH;
      i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
    });
    ctx.strokeStyle=color;ctx.lineWidth=2;ctx.stroke();

    // Fill area
    const last=vals.length-1;
    ctx.lineTo(pad.left+(last/(vals.length-1))*cW,pad.top+cH);
    ctx.lineTo(pad.left,pad.top+cH);ctx.closePath();
    const gr=ctx.createLinearGradient(0,pad.top,0,pad.top+cH);
    gr.addColorStop(0,color+'40');gr.addColorStop(1,color+'05');
    ctx.fillStyle=gr;ctx.fill();

    // X labels
    vals.forEach((v,i)=>{
      if(i%5===0){
        const x=pad.left+(i/(vals.length-1))*cW;
        ctx.fillStyle='#64748b';ctx.font='9px Inter';ctx.textAlign='center';
        ctx.fillText(labels[i],x,pad.top+cH+14);
      }
    });
  }

  function drawEfficiency(id){
    const g=getCtx(id);if(!g)return;
    const {ctx,W,H}=g;
    const pad={top:16,right:16,bottom:44,left:60};
    const cW=W-pad.left-pad.right,cH=H-pad.top-pad.bottom;

    // Efficiency = reward / hashrate ratio
    const eff=activeDays.map(d=>d.total/d.h*1e9);
    const mx=Math.max(...eff)*1.15;

    ctx.clearRect(0,0,W,H);
    ctx.strokeStyle='#1e293b';ctx.lineWidth=0.5;
    ctx.fillStyle='#64748b';ctx.font='10px Inter';ctx.textAlign='right';
    for(let i=0;i<=5;i++){
      const y=pad.top+(cH/5)*i,v=mx-(mx/5)*i;
      ctx.beginPath();ctx.moveTo(pad.left,y);ctx.lineTo(W-pad.right,y);ctx.stroke();
      ctx.fillText(v.toFixed(2),pad.left-6,y+3);
    }
    ctx.save();ctx.translate(10,pad.top+cH/2);ctx.rotate(-Math.PI/2);
    ctx.fillStyle='#64748b';ctx.font='10px Noto Sans JP';ctx.textAlign='center';
    ctx.fillText('効率 (nBTC/TH)',0,0);ctx.restore();

    // Scatter
    const labels=activeDays.map(d=>shortDate(d.d));
    eff.forEach((v,i)=>{
      const x=pad.left+(i/(eff.length-1))*cW;
      const y=pad.top+cH-(v/mx)*cH;
      ctx.beginPath();ctx.arc(x,y,4,0,Math.PI*2);
      ctx.fillStyle=v>0.4?'#10b981':'#f59e0b';ctx.fill();
      ctx.strokeStyle='#fff';ctx.lineWidth=1;ctx.stroke();
      if(i%5===0){ctx.fillStyle='#64748b';ctx.font='9px Inter';ctx.textAlign='center';ctx.fillText(labels[i],x,pad.top+cH+14)}
    });

    // Trend line
    const avgE=eff.reduce((a,b)=>a+b,0)/eff.length;
    const avgY=pad.top+cH-(avgE/mx)*cH;
    ctx.strokeStyle='#8b5cf6';ctx.lineWidth=1.5;ctx.setLineDash([5,4]);
    ctx.beginPath();ctx.moveTo(pad.left,avgY);ctx.lineTo(W-pad.right,avgY);ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle='#8b5cf6';ctx.font='bold 10px Inter';ctx.textAlign='left';
    ctx.fillText('AVG: '+avgE.toFixed(2),W-pad.right-80,avgY-5);
  }

  // Table
  function buildTable(){
    const tb=document.getElementById('tableBody');
    let cum=0;
    tb.innerHTML=data.map(d=>{
      cum+=d.total;
      const jpy=d.total*btcPrice;
      return `<tr><td>${shortDate(d.d)}</td><td>${d.h>0?d.h.toFixed(2)+' TH/s':'—'}</td><td>${d.pps.toFixed(8)}</td><td>${d.total.toFixed(8)}</td><td style="color:${jpy>300?'#10b981':'#64748b'}">¥${fmt(jpy,0)}</td><td>${cum.toFixed(8)}</td></tr>`;
    }).join('');
  }

  // Projections
  function buildProjections(){
    const grid=document.getElementById('projGrid');
    const scenarios=[
      {cls:'worst',label:'最悪',factor:0.5},
      {cls:'pessimistic',label:'悲観',factor:0.75},
      {cls:'standard',label:'標準',factor:1.0},
      {cls:'optimistic',label:'楽観',factor:1.25}
    ];
    grid.innerHTML=scenarios.map(s=>{
      const daily=avgReward*s.factor*2;
      const monthly=daily*30;
      const jpy=monthly*btcPrice;
      return `<div class="proj-card ${s.cls}">
        <div class="proj-label">${s.label}シナリオ</div>
        <div class="proj-btc">${fmtBTC(monthly)} BTC</div>
        <div class="proj-jpy">¥${fmt(jpy,0)}</div>
        <div class="proj-note">日次 ${fmtBTC(daily)} × 30日</div>
      </div>`;
    }).join('');
  }

  // Render all
  function renderAll(){
    updateKPIs();
    const labels=data.map(d=>shortDate(d.d));
    const rewards=data.map(d=>d.total);
    const hashes=data.map(d=>d.h);
    const jpys=data.map(d=>d.total*btcPrice);

    drawChart('chartReward',rewards,labels,'#3b82f6','BTC (×10⁻⁵)',true);
    drawChart('chartHash',hashes,labels,'#10b981','TH/s',false);
    drawChart('chartJPY',jpys,labels,'#f59e0b','JPY',false);

    // Cumulative
    let cum=0;
    const cums=data.map(d=>{cum+=d.total;return cum});
    drawLineChart('chartCumulative',cums,labels,'#8b5cf6','累積 BTC');
    drawEfficiency('chartEfficiency');
    buildTable();
    buildProjections();
  }

  // Price slider
  const slider=document.getElementById('btcPriceSlider');
  const priceDisp=document.getElementById('btcPriceDisplay');
  slider.addEventListener('input',()=>{
    btcPrice=parseInt(slider.value);
    priceDisp.textContent='¥'+parseInt(slider.value).toLocaleString('ja-JP');
    renderAll();
  });

  renderAll();
  window.addEventListener('resize',renderAll);
})();
