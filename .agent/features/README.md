# SentinelPH Features

## Core Features

### 1. Community Sentinel Registration
**User Story**: As a community member, I want to register as a sentinel so I can report health observations.

**Implementation**: [sentinel-registration.md](./sentinel-registration.md)

**Key Components**:
- Phone number OTP verification
- Proof of residency upload
- Role selection (sari-sari, tricycle, vendor, etc.)
- 15-minute training module
- Comprehension check (3 questions)
- Trial period (first 5 observations reviewed)

---

### 2. Observation Submission
**User Story**: As a sentinel, I want to submit health observations quickly and easily.

**Implementation**: [observation-submission.md](./observation-submission.md)

**Key Components**:
- Simple observation form
- Observation type dropdown
- Location tagging via landmarks
- Optional photo upload
- Rate limiting (5/day, 15-min cooldown)
- Offline queue with auto-sync

---

### 3. Trust Score System
**User Story**: As a BHW, I want to see which sentinels are reliable so I can prioritize their observations.

**Documentation**: [../ai-ml/trust-score.md](../ai-ml/trust-score.md)

**Key Components**:
- 0-100 reliability score
- Verification history (40%)
- Consistency bonus (25%)
- Tenure bonus (20%)
- Peer validation (15%)
- Real-time score updates

---

### 4. 3-Sentinel Rule
**User Story**: As a health officer, I want to receive alerts only when multiple sources confirm a pattern.

**Documentation**: [../ai-ml/3-sentinel-rule.md](../ai-ml/3-sentinel-rule.md)

**Key Components**:
- Multi-source validation (3+ sentinels)
- Independence verification
- 48-hour time window
- Aggregate trust score threshold (150+)
- Automatic alert generation

---

### 5. BHW Dashboard
**User Story**: As a BHW, I want to verify observations and manage sentinels in my barangay.

**Implementation**: [bhw-dashboard.md](./bhw-dashboard.md)

**Key Components**:
- Observation verification interface
- Trust score management
- Sentinel recruitment
- Alert monitoring
- Response tracking

---

### 6. Observation Heatmaps
**User Story**: As a health officer, I want to visualize observation patterns geographically.

**Documentation**: [../api/google-maps.md](../api/google-maps.md)

**Key Components**:
- Google Maps integration
- DBSCAN spatial clustering
- Trust score weighting
- Time-lapse playback
- Severity color coding

---

### 7. Spam Prevention
**User Story**: As a system admin, I want to prevent false reports and spam.

**Implementation**: [spam-prevention.md](./spam-prevention.md)

**Key Components**:
- Progressive onboarding
- Rate limiting
- AI spam detection (OpenAI)
- Behavior monitoring
- Device fingerprinting
- Progressive penalties

---

### 8. Two-Way Feedback Loop
**User Story**: As a sentinel, I want to know if my observations were helpful.

**Implementation**: [feedback-system.md](./feedback-system.md)

**Key Components**:
- SMS/push notifications
- Observation acknowledgments
- Verification results
- Health advisories
- Reward notifications

---

### 9. Incentive System
**User Story**: As a sentinel, I want to be recognized and rewarded for accurate observations.

**Implementation**: [incentive-system.md](./incentive-system.md)

**Key Components**:
- Load credit rewards
- Digital badges
- Community rankings
- Monthly top sentinels
- Trust score milestones

---

## Feature Priority

### Phase 1 (MVP - 4 weeks)
1. ✅ Sentinel Registration
2. ✅ Observation Submission
3. ✅ Trust Score System
4. ✅ BHW Dashboard (basic)

### Phase 2 (Beta - 6 weeks)
5. ✅ 3-Sentinel Rule
6. ✅ Observation Heatmaps
7. ✅ Spam Prevention

### Phase 3 (Launch - 8 weeks)
8. ✅ Two-Way Feedback Loop
9. ✅ Incentive System

---

## User Roles

### Community Sentinel
- Submit observations
- View own trust score
- Receive feedback
- Earn rewards

### Barangay Health Worker (BHW)
- Verify observations
- Manage sentinels
- View barangay dashboard
- Respond to alerts

### Municipal Health Officer
- View municipal dashboard
- Coordinate responses
- Analyze patterns
- Send advisories

### Provincial Health Officer
- View regional dashboard
- Cross-boundary coordination
- Advanced analytics
- API access

---

## Technical Requirements

### Performance
- Page load: <3 seconds
- Observation submission: <2 seconds
- Offline capability: Full functionality
- Map rendering: <5 seconds

### Security
- Phone verification required
- HTTPS only
- Rate limiting enforced
- Input validation
- XSS protection

### Accessibility
- Mobile-first design
- Low-literacy friendly
- Illustration-based UI
- Tagalog/English support
- Screen reader compatible

### Browser Support
- Chrome/Edge (latest 2 versions)
- Safari (latest 2 versions)
- Firefox (latest 2 versions)
- Mobile browsers (iOS Safari, Chrome Mobile)
