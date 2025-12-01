# Alert System Testing Checklist - December 1, 2025

**Status**: 🟢 Testing with REAL Binance Data  
**Dev Server**: http://localhost:3000  
**Mock Data**: DISABLED (using live API)

---

## Quick Start - 5 Minute Test

### ✅ Step 1: Verify Setup
- [x] Dev server running at http://localhost:3000
- [x] Mock data disabled (VITE_USE_MOCK_DATA=false)
- [ ] Browser opened and app loaded
- [ ] No console errors visible
- [ ] Market data showing real coin prices

### ✅ Step 2: Add Your First Alert
1. **Look at the RIGHT SIDEBAR** - you should see "Market Overview" section
2. **Scroll down** to find "Alert Configuration" section (below market summary)
3. **Click "Pioneer Bull" button** (📈 icon)
4. **Verify**: A new rule appears with a toggle switch (ON by default)
5. **Check console**: Should see alert evaluation logs every 5 seconds

### ✅ Step 3: Monitor for Alert Triggers
**What to watch for**:
- Console logs: `🔔 Alert triggered: BTCUSDT - Pioneer Bull`
- Toast notifications in TOP-RIGHT corner
- Look for coins with strong upward movement (>1% in 3 minutes)

**Likely triggers** (check these coins in the table):
- BTC/USDT - High volatility
- ETH/USDT - High volume
- SOL/USDT - Often moves fast
- BNB/USDT - Exchange token

### ✅ Step 4: Test Multiple Alert Types
Add these alerts one by one:
- [ ] Pioneer Bull (strong uptrend detection)
- [ ] Pioneer Bear (strong downtrend detection)  
- [ ] Bottom Hunter (reversal from oversold)
- [ ] 5m Big Bull (5-minute volume spike)

---

## What Should You See?

### ✅ Alert Configuration UI (Right Sidebar)
```
┌─────────────────────────────────┐
│ 🎯 Alert Configuration          │
├─────────────────────────────────┤
│ [+ Pioneer Bull] [+ Pioneer Bear]│
│ [+ 5m Big Bull]  [+ 5m Big Bear] │
│ [+ 15m Big Bull] [+ 15m Big Bear]│
│ [+ Bottom Hunter] [+ Top Hunter] │
│                                  │
│ Active Rules:                    │
│ ─────────────────────────────── │
│ 📈 Pioneer Bull     [ON] [🗑️]   │
│    High severity • All symbols   │
│    Price/3m > 1.01 + volume ↑   │
└─────────────────────────────────┘
```

### ✅ Toast Notifications (Top-Right)
When an alert triggers:
```
┌─────────────────────────────────┐
│ 🔔 BTCUSDT                    ✕ │
│ Pioneer Bull Alert               │
│ Price: $42,156 (+1.2% in 3m)    │
│ Volume increasing               │
│ [==============   ] 25s         │
└─────────────────────────────────┘
```

### ✅ Console Logs
Open DevTools (F12) and watch for:
```
🔔 Alert triggered: BTCUSDT - Pioneer Bull
🔔 Alert triggered: ETHUSDT - 5m Big Bull
✅ Alert evaluation complete: 0 alerts triggered
```

---

## Testing Each Alert Type

### 1. Pioneer Bull (Strong Uptrend)
**Conditions**:
- Price/3m ratio > 1.01 (1% gain in 3 minutes)
- Price/15m ratio > 1.01 (sustained trend)
- Volume increasing across timeframes

**How to trigger**:
- Wait for market pump (Bitcoin rally, news event)
- Check coins like BTC, ETH during volatile hours
- Look for green arrows (▲) in price columns

**Expected**: Alert fires when coin shows strong momentum

---

### 2. Pioneer Bear (Strong Downtrend)
**Conditions**:
- Price/3m ratio < 0.99 (1% loss in 3 minutes)
- Price/15m ratio < 0.99 (sustained decline)
- High volume on sell-off

**How to trigger**:
- Wait for market correction
- Watch for sudden red candles
- Look for red arrows (▼) in price columns

**Expected**: Alert fires on sharp sell-offs

---

### 3. Bottom Hunter (Reversal from Oversold)
**Conditions**:
- Price/15m < 0.994 (recent decline of 0.6%+)
- Price/1m > 1.004 (recovery starting, +0.4%)
- Reversal pattern forming

**How to trigger**:
- Watch coins that dumped recently
- Look for bounce patterns (V-shaped recovery)
- Best during "buy the dip" scenarios

**Expected**: Catches early reversals

---

### 4. 5m Big Bull (5-Minute Breakout)
**Conditions**:
- Price/3m > 1.006 (0.6% gain)
- 3m volume delta > 100,000
- 5m volume delta > 50,000
- Ascending volume pattern

**How to trigger**:
- Watch for sudden volume spikes
- Look at volume column for large numbers
- Best during high trading activity (UTC market hours)

**Expected**: Catches short-term breakouts

---

## Performance Check

### Monitor These Metrics:

**1. Browser Performance** (F12 → Performance tab)
- [ ] Page load: <2 seconds
- [ ] Alert evaluation: <100ms per cycle
- [ ] Memory stable (no leaks after 5 minutes)
- [ ] CPU usage acceptable (<30% avg)

**2. Network Requests** (F12 → Network tab)
- [ ] API calls every 5 seconds
- [ ] Successful responses (200 OK)
- [ ] Response time <1 second
- [ ] No CORS errors

**3. Console Messages**
- [ ] No error messages (red text)
- [ ] Evaluation logs every 5s
- [ ] Alert triggers logged with 🔔 emoji
- [ ] No infinite loops or spam

---

## Anti-Spam Testing

### Test 1: Cooldown System (60 seconds)
1. Trigger an alert (e.g., Pioneer Bull on BTCUSDT)
2. Wait for the SAME alert to fire again
3. **Expected**: Won't fire again for 60 seconds
4. **Check console**: Should see cooldown prevention logs

### Test 2: Max Alerts Per Symbol (5 alerts)
1. Let multiple alert types trigger on same coin
2. Count how many alerts appear for one symbol
3. **Expected**: Maximum 5 alerts per symbol
4. **Verify**: 6th alert should be blocked

### Test 3: Toast Queue (5 visible)
1. Trigger many alerts quickly (add all 8 types)
2. Wait for volatile market movement
3. **Expected**: Max 5 toasts visible at once
4. **Verify**: Older toasts dismissed as new ones arrive

---

## Common Issues & Solutions

### ❌ "No alerts triggering"
**Possible causes**:
- Market too stable (low volatility)
- Alert thresholds too strict
- Cooldown blocking duplicates
- Alerts disabled in settings

**Solutions**:
- Wait for volatile market hours (UTC 13:00-17:00)
- Check that toggle switch is ON
- Monitor high-volume coins (BTC, ETH)
- Verify alertSettings.enabled === true

---

### ❌ "Console shows CORS errors"
**Possible causes**:
- Direct Binance API blocked by CORS policy
- CORS proxy not working
- Proxy rate limited

**Solutions**:
- ✅ FIXED: CORS proxy now enabled (allorigins.win)
- Check .env: VITE_CORS_PROXY should be set
- If proxy fails, app will fallback to mock data
- Alternative: Set VITE_USE_MOCK_DATA=true temporarily

---

### ❌ "Too many alerts (spam)"
**Possible causes**:
- Cooldown too short
- Too many alert rules active
- Thresholds too loose

**Solutions**:
- Disable some alert rules (toggle OFF)
- Wait 60s for cooldown to clear
- Remove redundant alert types
- Check recentAlerts Map is working

---

### ❌ "Notifications not appearing"
**Possible causes**:
- alertSettings.notificationsEnabled === false
- AlertNotificationContainer not rendered
- React portal issue

**Solutions**:
- Check useStore alertSettings
- Verify App.tsx includes <AlertNotificationContainer />
- Check browser console for React errors
- Inspect DOM for portal div

---

## Browser Console Commands (for debugging)

Open DevTools Console (F12) and try these:

```javascript
// Check alert settings
JSON.parse(localStorage.getItem('alert-settings'))

// Check active rules
JSON.parse(localStorage.getItem('alert-rules'))

// Check store state
window.useStore?.getState?.()

// Clear all alerts manually
localStorage.removeItem('alert-rules')
localStorage.removeItem('alert-settings')
location.reload()
```

---

## Success Criteria

### ✅ Minimum Passing Tests
- [ ] At least 1 alert triggered successfully
- [ ] Toast notification displayed correctly
- [ ] Rule toggle (ON/OFF) works
- [ ] Delete rule works
- [ ] No console errors
- [ ] Performance acceptable (<100ms evaluation)

### ✅ Full Passing Tests
- [ ] All 8 legacy alert types tested
- [ ] Cooldown prevents duplicates (60s)
- [ ] Max alerts enforced (5 per symbol)
- [ ] Toast queue limited (5 visible)
- [ ] Alert history saved to IndexedDB
- [ ] Export CSV/JSON works
- [ ] Memory stable over 5 minutes
- [ ] Matches fast.html behavior

---

## Next Steps After Testing

### If Tests Pass ✅
1. Document any issues found
2. Fine-tune alert thresholds
3. Add AlertSettings UI component
4. Integrate AlertHistory viewer
5. Add desktop notifications
6. Proceed to Phase 7 (QA)

### If Tests Fail ❌
1. Document specific failures
2. Check console for error messages
3. Verify network requests succeed
4. Test with mock data (isolate API issues)
5. Review alertEngine.ts evaluator logic
6. Debug with console.log in evaluators

---

## Live Testing Notes

**Date**: December 1, 2025  
**Time Started**: _____________  
**Tester**: _____________

**Alerts Triggered**:
- [ ] Pioneer Bull - Symbol: _______ Time: _______
- [ ] Pioneer Bear - Symbol: _______ Time: _______
- [ ] 5m Big Bull - Symbol: _______ Time: _______
- [ ] Bottom Hunter - Symbol: _______ Time: _______

**Issues Found**:
```
(Add any bugs, performance issues, or unexpected behavior here)




```

**Performance Metrics**:
- Alert evaluation time: _______ ms
- Memory usage (5 min): _______ MB
- Alerts triggered (30 min): _______
- False positives: _______

**Conclusion**:
- [ ] ✅ PASSED - Ready for production
- [ ] ⚠️ PASSED WITH ISSUES - Needs tweaks
- [ ] ❌ FAILED - Requires fixes

---

**Happy Testing! 🚀**

For detailed testing procedures, see: `docs/ALERT_SYSTEM_TESTING.md`
