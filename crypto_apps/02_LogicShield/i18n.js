const DICT = {
    ja: {
        back: "[ NEXUSポータルへ戻る ]",
        loading: "[ ヒューリスティック・アルゴリズム実行中... ]",
        overallTitle: "グローバル戦術評価",
        factors: {
            rsi: "RSI指標",
            macd: "MACD状態",
            sma: "SMAクロス",
            bb: "ボリンジャー位置",
            vol: "資金流出入"
        },
        signals: {
            sb: "強力な買い",
            buy: "買い",
            hold: "待機",
            sell: "売り",
            ss: "強力な売り"
        },
        states: {
            bull: "上昇",
            bear: "下落",
            up: "上向き",
            down: "下向き",
            in: "流入",
            out: "流出"
        },
        summaries: {
            max_bull: "【極限強気】5大指標が完全に一致。歴史的な買い場、または強力な上昇トレンドの維持を検知。",
            bull: "【強気】全体的に買い圧力が優勢。各指標が健全な上昇を示唆しています。",
            neutral: "【中立】指標が拮抗。明確な方向性が出るまで、ボリンジャーの下限待機が論理的です。",
            bear: "【弱気】トレンドは下落。デッドクロスと資金流出を検知。資金の安全を優先すべき。",
            max_bear: "【極限弱気】総崩れ。論理的にナイフを掴むべきではありません。"
        }
    },
    en: {
        back: "[ RETURN_TO_NEXUS ]",
        loading: "[ RUNNING_HEURISTIC_ALGORITHMS... ]",
        overallTitle: "GLOBAL TACTICAL ASSESSMENT",
        factors: {
            rsi: "RSI_INDEX",
            macd: "MACD_STATE",
            sma: "SMA_CROSS",
            bb: "BB_POSITION",
            vol: "VOL_FLOW"
        },
        signals: {
            sb: "STRONG BUY",
            buy: "BUY",
            hold: "HOLD",
            sell: "SELL",
            ss: "STRONG SELL"
        },
        states: {
            bull: "BULLISH",
            bear: "BEARISH",
            up: "UP",
            down: "DOWN",
            in: "IN",
            out: "OUT"
        },
        summaries: {
            max_bull: "【MAXIMUM BULLISH】 All 5 indicators align perfectly. Detecting historical entry points or strong trend maintenance.",
            bull: "【BULLISH】 Buy pressure is dominant. Indicators suggest a healthy upward trajectory.",
            neutral: "【NEUTRAL】 Indicators are conflicting. Logically prudent to wait at Bollinger lower bounds.",
            bear: "【BEARISH】 Trend is down. Detected death crosses and capital outflow. Prioritize safety.",
            max_bear: "【MAXIMUM BEARISH】 Total collapse. Logical analysis suggests avoiding the 'falling knife'."
        }
    }
};

let currentLang = 'ja';

function setLang(lang) {
    currentLang = lang;
    const d = DICT[lang];
    document.querySelector('.back-btn').innerText = d.back;
    document.getElementById('loading').innerText = d.loading;
    document.querySelector('.overall-title').innerText = d.overallTitle;
}
