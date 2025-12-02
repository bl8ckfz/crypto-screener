# Alert Persistence Implementation Roadmap

## Overview
Transform the current client-side alert system into a persistent, server-backed solution that maintains user configurations across sessions and processes alerts independently of user login status.

**Start Date**: December 2, 2025  
**Target Completion**: Phase 4 (Backend Alert Processing)  
**Estimated Duration**: 2-3 weeks

---

## Phase 1: Database Schema & Migrations ⏱️ 2-3 days

### Goals
- Design and implement Supabase tables for alert persistence
- Set up Row Level Security (RLS) policies
- Create database indexes for optimal query performance

### Tasks

#### 1.1 Create Migration File
- [ ] Create `supabase/migrations/002_alert_persistence.sql`
- [ ] Define `alert_configs` table schema
  - User ID foreign key
  - Alert name, description, enabled status
  - JSONB conditions field (flexible structure)
  - Notification channels array (email, discord, telegram)
  - Webhook URLs (discord_webhook, telegram_chat_id)
  - Cooldown settings (minutes + last_triggered_at)
  - Timestamps (created_at, updated_at)
- [ ] Define `alert_history` table schema
  - Alert config foreign key
  - User ID foreign key
  - Trigger timestamp and value
  - JSONB trigger condition
  - Market snapshot (price, volume, VCP at trigger time)
  - Notification delivery status (per channel)
  - Acknowledgment tracking (boolean + timestamp)

#### 1.2 Implement RLS Policies
- [ ] `alert_configs` policies
  - Users can SELECT own alerts
  - Users can INSERT own alerts
  - Users can UPDATE own alerts
  - Users can DELETE own alerts
- [ ] `alert_history` policies
  - Users can SELECT own history
  - Service role can INSERT history (for background processing)
  - Users can UPDATE own history (for acknowledgment)

#### 1.3 Add Database Indexes
- [ ] Index on `alert_configs.user_id`
- [ ] Index on `alert_configs.enabled` (filtered: WHERE enabled = true)
- [ ] Index on `alert_history.user_id`
- [ ] Index on `alert_history.triggered_at` (DESC)
- [ ] Index on `alert_history.acknowledged` (filtered: WHERE acknowledged = false)

#### 1.4 Create Triggers
- [ ] Auto-update `updated_at` trigger for `alert_configs`
- [ ] Validate JSONB structure trigger (optional)

#### 1.5 Testing
- [ ] Apply migration to development Supabase project
- [ ] Verify RLS policies work correctly
- [ ] Test queries with indexes (EXPLAIN ANALYZE)
- [ ] Seed test data for development

**Deliverables**: Migration file, RLS policies tested, indexes verified

---

## Phase 2: Alert Persistence Service ⏱️ 3-4 days

### Goals
- Build TypeScript service layer for database operations
- Implement CRUD operations for alert configs
- Add alert history recording and retrieval
- Handle error cases and edge conditions

### Tasks

#### 2.1 Type Definitions
- [ ] Create `src/types/alertPersistence.ts`
- [ ] Define `PersistedAlert` interface (matches DB schema)
- [ ] Define `PersistedAlertHistory` interface (matches DB schema)
- [ ] Define `NotificationResult` type (sent status per channel)
- [ ] Define `MarketSnapshot` type (price, volume, VCP)

#### 2.2 Alert Config Service
- [ ] Create `src/services/alertPersistence.ts`
- [ ] Implement `saveAlert()` - Create new alert config
- [ ] Implement `updateAlert()` - Update existing alert
- [ ] Implement `deleteAlert()` - Delete alert config
- [ ] Implement `getUserAlerts()` - Fetch all user alerts
- [ ] Implement `toggleAlert()` - Enable/disable alert
- [ ] Implement `getAlertById()` - Fetch single alert
- [ ] Add error handling with typed exceptions

#### 2.3 Alert History Service
- [ ] Implement `recordAlertTrigger()` - Save trigger event
  - Accept: alert ID, trigger value, condition, market snapshot
  - Store: notification delivery results per channel
  - Update: `last_triggered_at` in alert config
- [ ] Implement `getAlertHistory()` - Fetch user's history (paginated)
- [ ] Implement `getUnacknowledgedAlerts()` - Fetch unread alerts
- [ ] Implement `acknowledgeAlert()` - Mark single alert as read
- [ ] Implement `acknowledgeAllAlerts()` - Mark all alerts as read
- [ ] Implement `getAlertStats()` - Count triggers, success rate

#### 2.4 Sync Utilities
- [ ] Implement `syncAlertsToLocal()` - Upload local alerts to server
- [ ] Implement `syncAlertsFromServer()` - Download alerts from server
- [ ] Add conflict resolution logic (server = source of truth)
- [ ] Handle offline/online transitions

#### 2.5 Testing
- [ ] Unit tests for all CRUD operations
- [ ] Test RLS policy enforcement
- [ ] Test error handling (network failures, auth errors)
- [ ] Test pagination and filtering
- [ ] Integration tests with mock Supabase client

**Deliverables**: Alert persistence service with full test coverage

---

## Phase 3: Frontend Integration ⏱️ 4-5 days

### Goals
- Update alert store to use Supabase backend
- Sync alerts on user login/logout
- Update UI components to handle persistent alerts
- Show alert history with unread badges

### Tasks

#### 3.1 Update Alert Store (Zustand)
- [ ] Modify `src/stores/alertStore.ts` (or create new)
- [ ] Remove localStorage persistence for alert data
- [ ] Add `syncWithServer()` action
  - Load alerts from Supabase on login
  - Merge local drafts with server data
- [ ] Update `addAlert()` to save to Supabase
- [ ] Update `updateAlert()` to persist changes
- [ ] Update `deleteAlert()` to remove from Supabase
- [ ] Add `loadAlertHistory()` action
- [ ] Add `unacknowledgedCount` computed property
- [ ] Keep only UI state in localStorage (expanded panels, filters)

#### 3.2 Auth Integration
- [ ] Update `src/components/layout/Layout.tsx`
- [ ] Add `useEffect` hook to sync on login
- [ ] Clear local alert state on logout
- [ ] Show loading state during sync

#### 3.3 Update Alert Components
- [ ] Update `AlertConfig.tsx`
  - Show sync status (synced, syncing, error)
  - Handle save errors gracefully
  - Add optimistic updates with rollback
- [ ] Update `AlertHistory.tsx`
  - Load history from Supabase
  - Show unacknowledged badge count
  - Add "Mark as Read" buttons
  - Add "Mark All as Read" button
  - Paginate history (infinite scroll or load more)
- [ ] Update `CustomAlertBuilder.tsx`
  - Save drafts to localStorage only
  - Persist to Supabase on "Save" button
  - Show validation errors from server

#### 3.4 Alert History UI Enhancements
- [ ] Add filter by date range
- [ ] Add filter by alert name
- [ ] Add filter by acknowledgment status
- [ ] Show notification delivery status per channel
- [ ] Display market snapshot at trigger time
- [ ] Add "View Coin Details" link from history

#### 3.5 Error Handling
- [ ] Show toast notifications for sync errors
- [ ] Implement retry logic for failed operations
- [ ] Cache failed operations for offline support
- [ ] Show conflict resolution UI if needed

#### 3.6 Testing
- [ ] Test sync on login flow
- [ ] Test offline → online sync
- [ ] Test concurrent edits (multiple tabs)
- [ ] Test alert CRUD operations
- [ ] Test history loading and pagination
- [ ] Visual regression tests for new UI

**Deliverables**: Fully integrated frontend with persistent alerts

---

## Phase 4: Background Alert Processing ⏱️ 5-7 days

### Goals
- Enable alerts to fire when user is offline
- Implement webhook notifications (Discord, Telegram)
- Set up background job processing
- Ensure reliable notification delivery

### Tasks

#### 4.1 Webhook Implementation
- [ ] Create `src/services/webhookNotifications.ts`
- [ ] Implement `sendDiscordAlert(webhook, alert, coin)`
  - Format message with embed (price, volume, chart)
  - Handle rate limits (Discord: 5 req/sec)
  - Retry on transient failures (3 attempts)
  - Log errors to Supabase
- [ ] Implement `sendTelegramAlert(chatId, alert, coin)`
  - Format message with Markdown
  - Handle rate limits (Telegram: 30 req/sec)
  - Retry on transient failures
  - Log errors to Supabase
- [ ] Add webhook validation endpoints
  - Verify Discord webhook URL
  - Verify Telegram chat ID

#### 4.2 Update Alert Engine
- [ ] Modify `src/services/alertEngine.ts`
- [ ] Load alerts from Supabase (not just Zustand store)
- [ ] Check alerts against live market data
- [ ] Fire notifications to configured channels
- [ ] Record trigger in `alert_history` table
- [ ] Update `last_triggered_at` timestamp
- [ ] Respect cooldown periods
- [ ] Handle webhook failures gracefully

#### 4.3 Background Job Options (Choose One)

**Option A: Supabase Edge Functions** (Recommended)
- [ ] Create `supabase/functions/alert-processor/index.ts`
- [ ] Set up cron trigger (every 1 minute via pg_cron)
- [ ] Fetch enabled alerts for all users
- [ ] Fetch latest market data from Binance
- [ ] Evaluate alert conditions
- [ ] Send notifications via webhooks
- [ ] Record results in `alert_history`
- [ ] Deploy edge function to Supabase

**Option B: Vercel Cron Jobs**
- [ ] Create `/api/cron/process-alerts.ts` endpoint
- [ ] Add cron schedule to `vercel.json` (every 1 minute)
- [ ] Protect endpoint with CRON_SECRET
- [ ] Implement same alert processing logic
- [ ] Use Supabase service role key for DB access

**Option C: Self-Hosted Worker**
- [ ] Create standalone Node.js worker script
- [ ] Deploy to VPS/cloud VM
- [ ] Use systemd/PM2 for process management
- [ ] Set up monitoring and logging

#### 4.4 Notification Queue (Optional but Recommended)
- [ ] Create `notification_queue` table in Supabase
- [ ] Add pending notifications to queue
- [ ] Process queue in batches (avoid rate limits)
- [ ] Mark notifications as sent/failed
- [ ] Retry failed notifications (exponential backoff)

#### 4.5 Monitoring & Logging
- [ ] Log alert evaluation results
- [ ] Log webhook delivery success/failure
- [ ] Create dashboard for alert stats
  - Total alerts processed
  - Success/failure rate per channel
  - Average processing time
  - Alerts in cooldown
- [ ] Set up error alerts (notify admin if system fails)

#### 4.6 Testing
- [ ] Unit tests for webhook functions
- [ ] Integration tests for alert engine
- [ ] End-to-end tests (trigger alert → receive webhook)
- [ ] Load testing (simulate 100+ alerts firing)
- [ ] Test rate limit handling
- [ ] Test webhook retry logic
- [ ] Test cooldown enforcement

**Deliverables**: Background alert processing system with monitoring

---

## Phase 5: Performance & Optimization ⏱️ 2-3 days

### Goals
- Optimize database queries
- Reduce API calls
- Improve alert evaluation performance
- Monitor system resources

### Tasks

#### 5.1 Query Optimization
- [ ] Add database query explain plans
- [ ] Optimize alert fetching (reduce N+1 queries)
- [ ] Add query result caching (React Query)
- [ ] Batch insert alert history records

#### 5.2 Alert Evaluation Optimization
- [ ] Cache market data between alert checks
- [ ] Batch evaluate alerts per symbol
- [ ] Skip inactive alerts early
- [ ] Parallelize webhook sends

#### 5.3 Notification Batching
- [ ] Group alerts by user and channel
- [ ] Send digest notifications (multiple alerts → 1 message)
- [ ] Respect user notification preferences

#### 5.4 Resource Monitoring
- [ ] Track Supabase database connections
- [ ] Monitor edge function execution time
- [ ] Track webhook API quota usage
- [ ] Set up alerts for quota limits

#### 5.5 Cost Analysis
- [ ] Estimate Supabase costs (storage, API calls)
- [ ] Estimate webhook API costs
- [ ] Estimate edge function costs
- [ ] Document cost per 1000 alerts

**Deliverables**: Optimized system with cost estimates

---

## Phase 6: Documentation & Deployment ⏱️ 2-3 days

### Goals
- Document new architecture
- Update setup guides
- Deploy to production
- Monitor for issues

### Tasks

#### 6.1 Technical Documentation
- [ ] Update `docs/ALERT_SYSTEM.md` with persistence architecture
- [ ] Document database schema and relationships
- [ ] Add sequence diagrams for alert flow
- [ ] Document webhook setup (Discord, Telegram)
- [ ] Add troubleshooting guide

#### 6.2 User Documentation
- [ ] Write user guide for alert configuration
- [ ] Explain alert history and acknowledgment
- [ ] Document webhook setup steps (with screenshots)
- [ ] Create FAQ section

#### 6.3 Environment Setup
- [ ] Update `.env.example` with new variables
  - `VITE_SUPABASE_SERVICE_ROLE_KEY` (for backend)
  - `DISCORD_BOT_TOKEN` (if using bot instead of webhooks)
  - `TELEGRAM_BOT_TOKEN`
- [ ] Document Vercel environment variables setup
- [ ] Document Supabase secrets setup

#### 6.4 Migration Guide
- [ ] Write migration script for existing users
- [ ] Convert localStorage alerts → Supabase
- [ ] Preserve alert history if exists
- [ ] Add migration status UI

#### 6.5 Deployment
- [ ] Apply database migration to production
- [ ] Deploy updated frontend to Vercel
- [ ] Deploy edge functions (or cron jobs)
- [ ] Update Supabase Site URL and Redirect URLs
- [ ] Verify RLS policies active
- [ ] Test end-to-end in production

#### 6.6 Monitoring
- [ ] Set up Sentry error tracking
- [ ] Configure uptime monitoring (Uptime Robot)
- [ ] Add analytics for alert usage
- [ ] Create admin dashboard for system health

#### 6.7 Update Project Files
- [ ] Update `docs/ROADMAP.md` with Phase 8 completion
- [ ] Update `docs/STATE.md` with alert persistence status
- [ ] Update `README.md` with new features
- [ ] Add changelog entry to `CHANGELOG.md`

**Deliverables**: Production-ready system with full documentation

---

## Success Criteria

### Functional Requirements
- ✅ Users can create, edit, delete alerts (persisted to Supabase)
- ✅ Alerts survive logout/login
- ✅ Alert history shows all triggered alerts (even when user offline)
- ✅ Unacknowledged alerts have badge count
- ✅ Discord webhooks work independently of user login
- ✅ Telegram webhooks work independently of user login
- ✅ Cooldown periods respected
- ✅ Market snapshot captured at trigger time

### Performance Requirements
- Alert evaluation completes in <5 seconds for 100 alerts
- Webhook delivery within 10 seconds of trigger
- UI sync completes in <2 seconds on login
- Database queries optimized (all <100ms)

### Reliability Requirements
- 99.5% uptime for alert processing
- 95% webhook delivery success rate
- Automatic retry on transient failures
- Graceful degradation if Binance API fails

### Security Requirements
- RLS policies prevent unauthorized access
- Webhook URLs encrypted at rest
- Service role key never exposed to client
- Rate limiting on alert creation (prevent abuse)

---

## Risk Assessment

### High Risk
1. **Background Job Reliability**: Edge functions may fail silently
   - **Mitigation**: Add dead letter queue, monitoring, admin alerts
   
2. **Webhook Rate Limits**: Discord/Telegram may block excessive requests
   - **Mitigation**: Implement batching, respect rate limits, add backoff

3. **Database Performance**: Many users = many alerts = slow queries
   - **Mitigation**: Proper indexing, query optimization, caching

### Medium Risk
1. **Migration Complexity**: Converting localStorage → Supabase
   - **Mitigation**: Thorough testing, rollback plan, gradual rollout

2. **Cost Overruns**: Supabase/webhook API costs scale with usage
   - **Mitigation**: Set quotas, monitor costs, optimize queries

### Low Risk
1. **UI Complexity**: New components for history/sync
   - **Mitigation**: Incremental development, user testing

---

## Post-Launch Tasks

### Week 1
- [ ] Monitor error rates in production
- [ ] Collect user feedback on alert UX
- [ ] Fix critical bugs
- [ ] Optimize slow queries

### Week 2-4
- [ ] Add advanced filtering in alert history
- [ ] Implement alert templates (common patterns)
- [ ] Add email notifications (via Supabase Auth)
- [ ] Add mobile push notifications (future consideration)

### Month 2+
- [ ] Add alert analytics dashboard
- [ ] Implement alert sharing (export/import configs)
- [ ] Add alert marketplace (community presets)
- [ ] Support more notification channels (Slack, SMS)

---

## Resources Required

### Development
- 1 Full-stack developer (2-3 weeks full-time)
- Access to Supabase project (paid tier recommended for production)
- Discord/Telegram bot tokens for testing

### Infrastructure
- Supabase Pro plan ($25/month) - for better performance
- Vercel Pro plan (optional) - for cron jobs
- Sentry account (free tier OK) - for error tracking

### Third-Party Services
- Discord Developer account (free)
- Telegram Bot API (free, 30 req/sec limit)
- Optional: Twilio (SMS), SendGrid (email)

---

## Appendix: Alternative Approaches

### A. Supabase Realtime Instead of Polling
**Pros**: Instant updates, less API calls  
**Cons**: Complex setup, higher cost at scale  
**Verdict**: Consider for Phase 7+

### B. WebSockets for Live Alerts
**Pros**: True real-time, bidirectional  
**Cons**: Requires separate server, harder to scale  
**Verdict**: Overkill for this use case

### C. Server-Sent Events (SSE)
**Pros**: Simpler than WebSockets, good browser support  
**Cons**: One-way only, Vercel has timeouts  
**Verdict**: Possible alternative to polling

---

## Timeline Gantt Chart

```
Week 1: [========= Phase 1 =========][==== Phase 2 ====]
Week 2:                              [======= Phase 2 =======][== Phase 3 ==]
Week 3:                                                       [======== Phase 3 ========]
Week 4: [============ Phase 4 ============]
Week 5: [==== Phase 4 ====][= Phase 5 =][== Phase 6 ==]
```

**Total Duration**: 4-5 weeks (part-time) or 2-3 weeks (full-time)

---

## Next Steps

1. **Review this roadmap** with team/stakeholders
2. **Set up project tracking** (GitHub Projects, Jira, etc.)
3. **Create Supabase project** (if not exists)
4. **Start Phase 1** - Database schema design
5. **Schedule daily standups** to track progress

---

*Last Updated: December 2, 2025*  
*Document Owner: Development Team*  
*Status: Planning Phase*
