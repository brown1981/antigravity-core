const DICT = {
    ja: {
        back: "[ NEXUSポータルへ戻る ]",
        title: "INTELLIGENCE_HUB",
        subtitle: "知識アーカイブ & ハーベスター制御センター",
        archiveTitle: "知識アーカイブ",
        statusTitle: "システム状態",
        statusLive: "稼働中 (LIVE)",
        sourceTitle: "データソース",
        harvestTitle: "収穫負荷 (HARVEST_LOAD)",
        btnSync: "手動同期実行",
        reports: [
            { meta: "2024.05.01 | マクロ分析", title: "ビットコイン半減期後の供給衝撃", excerpt: "ETFの流入と供給の減少が重なり、歴史的な供給不足が発生しています..." },
            { meta: "2024.04.28 | セキュリティ", title: "スマートコントラクトの脆弱性検知", excerpt: "GoPlus APIを通じて、複数のハニーポットコントラクトを無効化しました..." }
        ]
    },
    en: {
        back: "[ RETURN_TO_NEXUS ]",
        title: "INTELLIGENCE_HUB",
        subtitle: "CENTRALIZED KNOWLEDGE ARCHIVE & HARVESTER CONTROL",
        archiveTitle: "KNOWLEDGE_ARCHIVE",
        statusTitle: "SYSTEM_STATUS",
        statusLive: "SYSTEM_LIVE",
        sourceTitle: "DATA_SOURCES",
        harvestTitle: "HARVEST_LOAD",
        btnSync: "MANUAL_HARVEST_SYNC",
        reports: [
            { meta: "2024.05.01 | MACRO", title: "Bitcoin Post-Halving Supply Shock", excerpt: "ETF inflows coupled with reduced supply are creating a historic liquidity crunch..." },
            { meta: "2024.04.28 | SECURITY", title: "Smart Contract Vulnerability Report", excerpt: "Successfully neutralized multiple honeypot contracts via GoPlus API integration..." }
        ]
    }
};

let currentLang = 'ja';

function setLang(lang) {
    currentLang = lang;
    const d = DICT[lang];
    document.querySelector('.back-btn').innerText = d.back;
    document.querySelector('h1').innerText = d.title;
    document.querySelector('header p').innerText = d.subtitle;
    document.querySelector('.archive-panel h2').innerText = d.archiveTitle;
    
    const h3s = document.querySelectorAll('h3');
    h3s[0].innerText = d.statusTitle;
    h3s[1].innerText = d.sourceTitle;
    h3s[2].innerText = d.harvestTitle;
    
    document.getElementById('status-text').innerText = d.statusLive;
    document.getElementById('sync-btn').innerText = d.btnSync;
    
    // Render localized reports
    const list = document.getElementById('archive-list');
    list.innerHTML = d.reports.map(r => `
        <div class="report-item">
            <div class="report-meta">${r.meta}</div>
            <div class="report-title">${r.title}</div>
            <div class="report-excerpt">${r.excerpt}</div>
        </div>
    `).join('');
}
