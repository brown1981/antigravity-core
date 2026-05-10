const LANG_DICT = {
    ja: {
        title: "SCAM SENTINEL", 
        subtitle: "SMART CONTRACT RISK DIAGNOSTICS v25.0",
        benefit: "SAVE YOUR CAPITAL FROM DEX TRAPS",
        btnScan: "セキュリティスキャン実行", 
        honey: "ハニーポット", 
        tax: "販売手数料",
        own: "所有権状況", 
        source: "ソースコード", 
        scanning: "診断中...",
        riskHigh: "⚠️ DANGER: 極めて高いリスク", 
        riskLow: "✅ CLEAR: リスク低",
        inputWarning: "⚠️ DEXトークン専用スキャナー",
        inputHint: "※個人で作られた「未検証トークン」の危険性を暴きます。",
        disclaimerT: "🛡️ 重要：セキュリティに関するお知らせ",
        disclaimerB: "本ツールはGoPlus LabsのAPIを使用しており、一般的な詐欺の9割以上を検知可能です。最終的な判断はDYOR（ご自身で調査）を行ってください。"
    },
    en: {
        title: "SCAM SENTINEL", 
        subtitle: "SMART CONTRACT RISK DIAGNOSTICS v25.0",
        benefit: "PROTECT CAPITAL: FINAL DEFENSE AGAINST DEX TRAPS",
        btnScan: "RUN SECURITY SCAN", 
        honey: "HONEYPOT", 
        tax: "SELL TAX",
        own: "OWNERSHIP", 
        source: "SOURCE CODE", 
        scanning: "DIAGNOSING...",
        riskHigh: "⚠️ DANGER: EXTREME RISK", 
        riskLow: "✅ CLEAR: LOW RISK",
        inputWarning: "⚠️ DEX TOKENS ONLY",
        inputHint: "Detects hidden risks in unverified tokens.",
        disclaimerT: "🛡️ IMPORTANT SECURITY NOTICE",
        disclaimerB: "Powered by GoPlus Labs (90%+ detection). Treat results as evidence, not absolute truth. DYOR."
    }
};

let currentLang = 'ja';

function setLang(lang) {
    currentLang = lang;
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`btn-${lang}`).classList.add('active');
    
    const d = LANG_DICT[lang];
    document.getElementById('lbl-title').innerText = d.title;
    document.getElementById('lbl-subtitle').innerText = d.subtitle;
    document.getElementById('lbl-benefit').innerText = d.benefit;
    document.getElementById('lbl-input-warning').innerText = d.inputWarning;
    document.getElementById('lbl-input-hint').innerText = d.inputHint;
    document.getElementById('lbl-disclaimer-title').innerText = d.disclaimerT;
    document.getElementById('lbl-disclaimer-body').innerText = d.disclaimerB;
    document.getElementById('btn-scan').innerText = d.btnScan;
    document.getElementById('lbl-honey').innerText = d.honey;
    document.getElementById('lbl-tax').innerText = d.tax;
    document.getElementById('lbl-own').innerText = d.own;
    document.getElementById('lbl-source').innerText = d.source;
    
    const btnLabel = lang === 'ja' ? '🎓 セキュリティガイド' : '🎓 SECURITY GUIDE';
    document.getElementById('btn-training').innerText = btnLabel;
}
