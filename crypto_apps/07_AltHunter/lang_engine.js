const TRANSLATIONS = {
    ja: {
        title: "ALT HUNTER",
        total_monitoring: "監視対象",
        gainers_24h: "24h 上昇銘柄",
        market_sentiment: "市場センチメント",
        eruption_now: "💥 爆発中",
        tactical_filters: "🏛️ タクティカル・フィルター",
        grade_s: "Grade S（超早期検知）",
        grade_a: "Grade A（標準検知）",
        grade_b: "Grade B（モメンタム）",
        grade_x: "Grade X（爆発中）",
        golden_only: "⚡ ゴールデンボトムのみ",
        radar_title: "Galaxy Radar 1000",
        radar_sub: "爆発前夜（Ignition）の検知に特化",
        status_initializing: "Live Feed: 初期化中...",
        status_connecting: "Feed: NEXUS BRIDGEに接続中...",
        status_live: "Feed: LIVE_BRIDGE (Phase 3 Active)",
        status_offline: "Feed: 接続失敗（要確認）",
        ignition_top_10: "🔥 IGNITION_STAGE_TOP_10",
        no_eruption: "爆発は検知されていません",
        no_ignition: "アクティブな点火は検知されていません...",
        back_nexus: "← Nexus Portalに戻る",
        enter_code: "COMMAND_REQUIRED: パスコードを入力してください",
        access_granted: "ACCESS GRANTED",
        passcode_hint: "HINT: Avalon Qと同じ。あかねのパスワードと同じ",
        bullish: "🟢 強気",
        neutral: "🟡 中立",
        bearish: "🔴 弱気",
        click_details: "クリックで詳細表示",
        // AI Reasons (Patterns)
        reason_s1: "⚡ 週足$1%の下落中に1h+$2%反発。ゴールデン・ボトム検知。",
        action_s1: "→ 最優先で確認。エントリーポイントを精査。",
        reason_s2: "24h$1%の急落から1h+$2%で反転。大底シグナル。",
        action_s2: "→ 出来高を確認し、買い集めの兆候を探れ。",
        reason_s3: "前日比$1%からの1h+$2%反発。初動の可能性。",
        action_s3: "→ 監視リストに追加。継続性を確認。",
        reason_s4: "ランク#$1の低時価総額で1h+$2%。大衆未到達の領域。",
        action_s4: "→ 流動性を確認。スプレッドに注意。",
        reason_s5: "24h+$1%の静寂から1h+$2%で突破。新規資金流入の兆候。",
        action_s5: "→ SNS/ニュースを確認。ファンダ変化を探れ。",
        reason_a1: "1h+$1%の急騰。ランク#$2では異常な加速度。",
        action_a1: "→ 勢いが続くか5分足で確認。",
        reason_a2: "24h$1%下落からの1h+$2%反転。トレンド転換の兆候。",
        action_a2: "→ 反発が本物か、出来高推移を確認。",
        reason_a3: "週足$1%下落中だが1h+$2%で反応。底打ちの兆し。",
        action_a3: "→ 中期トレンドを確認。まだ早い可能性あり。",
        reason_a4: "ランク#$1で1h+$2%。時価総額に対して不釣り合いな上昇。",
        action_a4: "→ 注目リストに追加。Grade Sへの昇格を監視。",
        reason_b1: "24h+$1%の強力トレンド継続。1h+$2%で勢い衰えず。",
        action_b1: "→ 利確タイミングに注意。急反転リスクあり。",
        reason_b2: "24h+$1%が1hで加速中(+$2%)。第2波の可能性。",
        action_b2: "→ 出来高が伴えばまだ伸びる可能性。",
        reason_b3: "24h+$1%の上昇が1h+$2%で維持。安定上昇基調。",
        action_b3: "→ 静観。急変動があればGrade A/Sに注目。",
        reason_x1: "⚠️ 24h+$1%の異常事態。パンプ&ダンプの危険性。",
        action_x1: "→ 絶対にFOMOエントリーするな。冷静に観察。",
        reason_x2: "⚠️ 24h+$1%だが1h$2%に減速。冷却フェーズ。",
        action_x2: "→ 利確売り後の第2波に注意。急落リスクも。",
        reason_x3: "⚠️ 24h+$1%で爆発中。ランク#$2、震源地候補。",
        action_x3: "→ 同セクターのGrade A/S銘柄をチェック。"
    },
    en: {
        title: "ALT HUNTER",
        total_monitoring: "Total Monitoring",
        gainers_24h: "24h Gainers",
        market_sentiment: "Market Sentiment",
        eruption_now: "💥 ERUPTION NOW",
        tactical_filters: "🏛️ Tactical Filters",
        grade_s: "Grade S (Early Detection)",
        grade_a: "Grade A (Standard Detection)",
        grade_b: "Grade B (Momentum)",
        grade_x: "Grade X (Erupting)",
        golden_only: "⚡ Golden Bottom Only",
        radar_title: "Galaxy Radar 1000",
        radar_sub: "Specialized in Pre-Explosion detection.",
        status_initializing: "Live Feed: Initializing...",
        status_connecting: "Feed: Connecting Nexus Bridge...",
        status_live: "Feed: LIVE_BRIDGE (Phase 3 Active)",
        status_offline: "Feed: Offline (Check Connection)",
        ignition_top_10: "🔥 IGNITION_STAGE_TOP_10",
        no_eruption: "No eruption detected",
        no_ignition: "No active ignition detected...",
        back_nexus: "← Back to Nexus Portal",
        enter_code: "COMMAND_REQUIRED: Enter Passcode",
        access_granted: "ACCESS GRANTED",
        passcode_hint: "HINT: Same as Avalon Q. Same as Akane's password.",
        bullish: "🟢 Bullish",
        neutral: "🟡 Neutral",
        bearish: "🔴 Bearish",
        click_details: "Click to View Details",
        // AI Reasons (Patterns)
        reason_s1: "⚡ Rebound of 1h+$2% during $1% weekly decline. Golden Bottom detected.",
        action_s1: "→ High Priority. Examine entry points immediately.",
        reason_s2: "Reversal of 1h+$2% after $1% 24h drop. Bottom signal.",
        action_s2: "→ Verify volume. Look for accumulation signs.",
        reason_s3: "1h+$2% rebound from 24h $1%. Potential first move.",
        action_s3: "→ Add to watchlist. Monitor continuity.",
        reason_s4: "Rank #$1 low cap spike (1h+$2%). Uncharted territory.",
        action_s4: "→ Check liquidity. Beware of spreads.",
        reason_s5: "Breakout (1h+$2%) after quiet 24h (+$1%). New inflow signs.",
        action_s5: "→ Check SNS/News for fundamental changes.",
        reason_a1: "1h+$1% spike. Abnormal acceleration for Rank #$2.",
        action_a1: "→ Check 5m charts for continued momentum.",
        reason_a2: "Trend reversal (1h+$2%) from 24h $1% drop.",
        action_a2: "→ Verify volume to confirm if rebound is real.",
        reason_a3: "Responding with 1h+$2% despite $1% weekly drop. Bottom sign.",
        action_a3: "→ Monitor mid-term trend. Might be too early.",
        reason_a4: "1h+$2% at Rank #$1. Disproportionate for this cap.",
        action_a4: "→ Monitor for promotion to Grade S.",
        reason_b1: "Strong 24h+$1% trend continues with 1h+$2%.",
        action_b1: "→ Manage take-profits. Risk of reversal.",
        reason_b2: "24h+$1% accelerating in 1h (+$2%). Wave 2 potential.",
        action_b2: "→ Still room to grow if volume supports it.",
        reason_b3: "24h+$1% gains held by 1h+$2%. Stable trend.",
        action_b3: "→ Observe. Watch for escalation to Grade A/S.",
        reason_x1: "⚠️ Abnormal surge (24h+$1%). Pump & Dump risk.",
        action_x1: "→ Do NOT FOMO. Observe calmly.",
        reason_x2: "⚠️ 24h+$1% but slowing (1h $2%). Cooling phase.",
        action_x2: "→ Watch for Wave 2 after profit-taking.",
        reason_x3: "⚠️ Erupting at 24h+$1%. Rank #$2, ground zero.",
        action_x3: "→ Check Grade A/S assets in same sector."
    },
    fr: {
        title: "CHASSEUR D'ALTS",
        total_monitoring: "Surveillance Totale",
        gainers_24h: "Hausse 24h",
        market_sentiment: "Sentiment du Marché",
        eruption_now: "💥 ERUPTION ACTUELLE",
        tactical_filters: "🏛️ Filtres Tactiques",
        grade_s: "Grade S (Détection Précoce)",
        grade_a: "Grade A (Détection Standard)",
        grade_b: "Grade B (Momentum)",
        grade_x: "Grade X (Explosion)",
        golden_only: "⚡ Bas d'Or Uniquement",
        radar_title: "Radar Galaxie 1000",
        radar_sub: "Spécialisé dans la détection pré-explosion.",
        status_initializing: "Flux: Initialisation...",
        status_connecting: "Flux: Connexion au Nexus...",
        status_live: "Flux: LIVE_BRIDGE (Phase 3 Active)",
        status_offline: "Flux: Déconnecté",
        ignition_top_10: "🔥 TOP 10 ALLUMAGE",
        no_eruption: "Aucune éruption détectée",
        no_ignition: "Aucun allumage actif détecté...",
        back_nexus: "← Retour au Portail Nexus",
        enter_code: "COMMANDE_REQUISE: Entrez le Code",
        access_granted: "ACCÈS AUTORISÉ",
        passcode_hint: "HINT: Même que Avalon Q. Même que le mot de passe d'Akane.",
        bullish: "🟢 Haussier",
        neutral: "🟡 Neutre",
        bearish: "🔴 Baissier",
        click_details: "Cliquez pour les détails",
        // AI Reasons (Patterns)
        reason_s1: "⚡ Rebond de 1h+$2% durant une baisse hebdo de $1%. Bas d'Or détecté.",
        action_s1: "→ Priorité Haute. Examinez les points d'entrée.",
        reason_s2: "Retournement de 1h+$2% après une chute de $1% (24h).",
        action_s2: "→ Vérifiez le volume. Cherchez l'accumulation.",
        reason_s3: "Rebond de 1h+$2% depuis 24h $1%. Premier mouvement potentiel.",
        action_s3: "→ Ajoutez à la liste de surveillance.",
        reason_s4: "Pic à Rank #$1 (1h+$2%). Territoire inexploré.",
        action_s4: "→ Vérifiez la liquidité. Attention aux spreads.",
        reason_s5: "Cassure (1h+$2%) après 24h calme (+$1%). Signes de flux entrants.",
        action_s5: "→ Vérifiez les réseaux/infos pour les changements.",
        reason_a1: "Pic 1h+$1%. Accélération anormale pour Rank #$2.",
        action_a1: "→ Vérifiez les graphiques 5m pour le momentum.",
        reason_a2: "Retournement de tendance (1h+$2%) après chute 24h $1%.",
        action_a2: "→ Vérifiez le volume pour confirmer le rebond.",
        reason_a3: "Réagit à 1h+$2% malgré baisse hebdo de $1%. Signe de bas.",
        action_a3: "→ Surveillez la tendance moyen terme. Trop tôt?",
        reason_a4: "1h+$2% au Rank #$1. Disproportionné pour cette capitalisation.",
        action_a4: "→ Surveillez pour une promotion au Grade S.",
        reason_b1: "Tendance forte 24h+$1% continue avec 1h+$2%.",
        action_b1: "→ Gérez les profits. Risque de retournement.",
        reason_b2: "24h+$1% accélère en 1h (+$2%). Potentiel de Vague 2.",
        action_b2: "→ Encore de la place pour croître si le volume suit.",
        reason_b3: "Gains de 24h+$1% maintenus à 1h+$2%. Tendance stable.",
        action_b3: "→ Observez. Surveillez l'escalade vers Grade A/S.",
        reason_x1: "⚠️ Hausse anormale (24h+$1%). Risque de Pump & Dump.",
        action_x1: "→ Ne faites pas de FOMO. Observez calmement.",
        reason_x2: "⚠️ 24h+$1% mais ralentissement (1h $2%). Phase de refroidissement.",
        action_x2: "→ Surveillez la Vague 2 après prise de profits.",
        reason_x3: "⚠️ Explosion à 24h+$1%. Rank #$2, épicentre.",
        action_x3: "→ Vérifiez les actifs Grade A/S du même secteur."
    }
};

let currentLang = localStorage.getItem('altHunter_lang') || 'ja';

function t(key, val1 = '', val2 = '') {
    let str = TRANSLATIONS[currentLang][key] || key;
    if (val1 !== '') str = str.replace('$1', val1);
    if (val2 !== '') str = str.replace('$2', val2);
    return str;
}

function setLanguage(lang) {
    if (!TRANSLATIONS[lang]) return;
    currentLang = lang;
    localStorage.setItem('altHunter_lang', lang);
    applyLanguage();
    // Re-apply UI updates
    if (typeof updateIgnitionList === 'function') updateIgnitionList();
    if (typeof applyFilters === 'function') applyFilters();
}

function applyLanguage() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        el.textContent = t(key);
    });
    
    // Special handling for placeholders or attributes if needed
    const statusEl = document.getElementById('data-status');
    if (statusEl) {
        // Just refresh the text if it was hardcoded
        if (statusEl.textContent.includes('LIVE_BRIDGE')) statusEl.textContent = t('status_live');
    }
}
