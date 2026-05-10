// === REASON ENGINE v2: 15-Pattern Analysis + Action Recommendations ===
function generateReason(c) {
    let reason = "";
    let action = "";

    if (c.grade === 'S') {
        if (c.change7d < -10 && c.change24h < 5) {
            reason = t('reason_s1', c.change7d.toFixed(0), c.change1h.toFixed(1));
            action = t('action_s1');
        } else if (c.change24h < -5) {
            reason = t('reason_s2', c.change24h.toFixed(1), c.change1h.toFixed(1));
            action = t('action_s2');
        } else if (c.change24h < 0) {
            reason = t('reason_s3', c.change24h.toFixed(1), c.change1h.toFixed(1));
            action = t('action_s3');
        } else if (c.rank > 500) {
            reason = t('reason_s4', c.rank, c.change1h.toFixed(1));
            action = t('action_s4');
        } else {
            reason = t('reason_s5', c.change24h.toFixed(1), c.change1h.toFixed(1));
            action = t('action_s5');
        }
    }

    else if (c.grade === 'A') {
        if (c.change1h > 5) {
            reason = t('reason_a1', c.change1h.toFixed(1), c.rank);
            action = t('action_a1');
        } else if (c.change24h < 0 && c.change1h > 2) {
            reason = t('reason_a2', c.change24h.toFixed(1), c.change1h.toFixed(1));
            action = t('action_a2');
        } else if (c.change7d < -5) {
            reason = t('reason_a3', c.change7d.toFixed(0), c.change1h.toFixed(1));
            action = t('action_a3');
        } else {
            reason = t('reason_a4', c.rank, c.change1h.toFixed(1));
            action = t('action_a4');
        }
    }

    else if (c.grade === 'B') {
        if (c.change24h > 25) {
            reason = t('reason_b1', c.change24h.toFixed(1), c.change1h.toFixed(1));
            action = t('action_b1');
        } else if (c.change1h > 3) {
            reason = t('reason_b2', c.change24h.toFixed(1), c.change1h.toFixed(1));
            action = t('action_b2');
        } else {
            reason = t('reason_b3', c.change24h.toFixed(1), c.change1h.toFixed(1));
            action = t('action_b3');
        }
    }

    else if (c.grade === 'X') {
        if (c.change24h > 80) {
            reason = t('reason_x1', c.change24h.toFixed(0));
            action = t('action_x1');
        } else if (c.change1h < 0) {
            reason = t('reason_x2', c.change24h.toFixed(1), c.change1h.toFixed(1));
            action = t('action_x2');
        } else {
            reason = t('reason_x3', c.change24h.toFixed(1), c.rank);
            action = t('action_x3');
        }
    }

    return { reason, action };
}
