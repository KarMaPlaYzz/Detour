# DETOUR UX/UI BLUEPRINT
## Part 6: UX Metrics & Implementation Notes

---

UX METRICS

Key Performance Indicators (KPIs) and User Experience Metrics:

ACQUISITION & ADOPTION

1. Time to First Detour (TTFD)
   Definition: Time from app open to user tapping "Begin Detour" on first route preview.
   Target: < 3 minutes (measured from app cold start).
   Why it matters: Low friction is critical; users should feel immediate value without lengthy setup.
   How to measure: Track timestamp from app initialization to "Begin Detour" button tap event; segment by new vs. returning users.
   Success threshold: 60% of new users complete first detour within 5 minutes.

2. Onboarding Skip Rate
   Definition: Percentage of users who skip or dismiss onboarding / tutorial overlay.
   Target: > 70% (indicating users feel confident without guidance).
   Why it matters: High skip rate suggests clear, intuitive UX; low skip rate may indicate UX confusion.
   How to measure: Count onboarding dismissals / total onboarding triggers.
   Note: Voluntary skip is good; forced completion is frustrating.

3. Install-to-First-Use Rate
   Definition: Percentage of installed users who open the app within 24 hours.
   Target: > 45%.
   Why it matters: Indicates early motivation; users who don't open within 24h are at high churn risk.

ENGAGEMENT & COMPLETION

4. Detour Completion Rate
   Definition: Percentage of users who begin navigation and reach the final destination.
   Target: > 70% (walking/cycling); > 85% (driving, shorter routes).
   Why it matters: High completion indicates strong product-market fit and satisfaction.
   Segment by: Transport mode, vibe selected, route length, time of day.
   How to measure: Track "Begin Detour" events vs. "Arrival" events; calculate completion %.

5. Drop-Off Rate Before Route Generation
   Definition: Percentage of users who start the flow but abandon before confirming route preview.
   Target: < 15%.
   Why it matters: Identifies friction points in destination input, vibe selection, or route preview.
   How to measure: Funnel analysis: Users selecting vibe → Users viewing preview → Users tapping "Begin."
   Investigation: If high, test vibe clarity, route diversity, and preview readability.

6. Route Adjustment Rate
   Definition: Percentage of users who tap "Adjust Route" (regenerate) before beginning.
   Target: 10–20% (indicates healthy choice; too low = lack of agency; too high = confusion).
   Why it matters: Balanced rate shows users feel empowered to refine, not paralyzed or unsatisfied.
   How to measure: Count "Adjust Route" button taps; divide by total route previews.

7. POI Engagement Depth
   Definition: Average number of POIs where user expanded details or tapped "Learn More."
   Target: > 40% of POIs presented along the route (e.g., if 7 POIs presented, user engages with 3+ deeply).
   Why it matters: Indicates storytelling resonates; users are curious, not just transiting.
   How to measure: Track "POI expanded" events during navigation; divide by total POIs for route.
   Segment by: Vibe, transport mode, POI category.

8. Average Navigation Session Length
   Definition: Time elapsed from "Begin Detour" to arrival confirmation.
   Target: Should align with estimated time + 20–30% (accounting for POI stops, photos).
   Why it matters: Validates time estimates; identifies if users rush vs. linger.
   Example: If estimated time is 23 minutes, target average actual time is 27–30 minutes.

SATISFACTION & EMOTION

9. Emotional Satisfaction Score (ESS)
   Definition: User's emoji/mood reaction on reflection screen aggregated into a sentiment score.
   Scale: Emoji reactions (😊=1, 😍=2, 🤔=1.5, 😌=1.5, 🎉=2) → Average per session.
   Target: > 1.7 out of 2.0 (indicating positive sentiment in most cases).
   Why it matters: Direct measure of emotional impact; Detour's core mission.
   How to measure: Collect emoji taps on reflection screen; calculate average per user/session.
   Segment by: Vibe, first-time vs. repeat users, time of day.

10. Net Promoter Score (NPS) Variant
    Definition: "Would you recommend Detour to a friend?" (1–10 scale) or simpler (Yes/No/Maybe).
    Target: > 7 out of 10 average; 40%+ "Yes" on binary version.
    Why it matters: Indicates overall satisfaction and word-of-mouth potential.
    How to measure: Periodic in-app survey (post-detour or in-app settings); sample 10–20% of sessions.
    Cadence: Once per week per user (to avoid fatigue).

11. Reflection Participation Rate
    Definition: Percentage of users who complete reflection step (emoji or text) vs. skipping.
    Target: > 60%.
    Why it matters: High engagement indicates users are reflecting (good UX signal); low rate suggests reflection feels optional/burdensome.
    How to measure: Count reflection completions vs. dismissals or "Next" taps without input.

RETENTION & LOYALTY

12. Repeat Detour Rate (Day 7 / Day 30)
    Definition: Percentage of users who start a second detour within 7 days and 30 days of first use.
    Target: > 35% (Day 7); > 55% (Day 30).
    Why it matters: Core indicator of retention and habit formation.
    How to measure: Cohort analysis; track users with 2+ detours within time windows.
    Segment by: Vibe diversity (did they try different vibes?), time gaps between detours.

13. Saved Detours-to-Started Ratio
    Definition: Average number of saved detours per user who starts a detour.
    Target: > 0.5 (e.g., users save half as many routes as they start).
    Why it matters: Indicates planning behavior and intent to revisit; validates social/curation features.
    How to measure: Count "Save for Later" button taps; divide by "Begin Detour" button taps per user.

14. Weekly Active Users (WAU) / Monthly Active Users (MAU)
    Definition: Users who open app and start at least one detour per week / month.
    Target: > 25% retention (WAU/MAU ratio) within 30 days.
    Why it matters: Standard retention metric; identifies churn and engagement trends.

SOCIAL & SHARING

15. Share Rate
    Definition: Percentage of users who tap "Share This Detour" on reflection screen.
    Target: > 30%.
    Why it matters: Indicates detours are shareable and users want to amplify experiences.
    How to measure: Count "Share" button taps; divide by total arrivals.

16. POIs Shared Per User (Average)
    Definition: Average number of individual POIs/photos shared by users (per session or aggregated).
    Target: > 0.5 POIs shared per completed detour.
    Why it matters: Indicates specific moments resonate enough to share; validates POI quality.
    How to measure: Track sharing events at POI-level (long-press photo, "Share POI" action); aggregate per user.

17. Shared Route Click-Through Rate (External)
    Definition: When a shared detour link is clicked by a non-user, what % eventually install/start the app?
    Target: > 15% install rate; > 5% first-detour completion.
    Why it matters: Validates viral potential and messaging; informs marketing strategy.
    How to measure: Track link shares (URL parameters); correlate with app install events and first detour events.

18. Share Medium Distribution
    Definition: Breakdown of where users share (Messages, Twitter, Instagram, Copy Link, etc.).
    Use case: Informs which platforms to optimize for; identifies preferred sharing channels.
    How to measure: Log share destination for each "Share" action.

TECHNICAL & PERFORMANCE

19. Route Generation Time (Backend)
    Definition: Time from user tapping "Begin Detour" to receiving POI data and rendered route.
    Target: < 2 seconds (p90); < 5 seconds (p99).
    Why it matters: Directly impacts perceived performance; long waits increase abandonment.
    How to measure: Log timestamp at request initiation and response completion; track latency distribution.

20. Map Rendering Performance
    Definition: Frames per second (FPS) during map interactions (pan, zoom, scroll sheet).
    Target: 60 FPS (iOS/Android standard); acceptable minimum 50 FPS.
    Why it matters: Jank or lag degrades perceived app quality.
    How to measure: Use performance profiling tools (Xcode, Android Profiler).

21. App Crash Rate
    Definition: Percentage of sessions that result in a crash.
    Target: < 0.1% (< 1 crash per 1,000 sessions).
    Why it matters: Crashes destroy trust; critical for retention.
    How to measure: Error tracking service (Sentry, Firebase Crashlytics).

22. API Error Rate
    Definition: Percentage of backend requests that fail (non-200 responses).
    Target: < 0.5%.
    Why it matters: Directly impacts UX reliability; high rates indicate backend issues.
    How to measure: Server-side logging; correlate with user-facing error messages.

---

REPORTING & DASHBOARDS

Data Collection:
  All metrics collected via event-based analytics (Firebase, Amplitude, Mixpanel, or custom backend logging).
  Events logged: App open, screen view, button tap, navigation start/end, reflection submit, share, save, error.
  User properties: Vibe preference (if trackable), transport mode preference, session count, user cohort.

Dashboard Cadence:
  Daily: Crash rate, API error rate, active users.
  Weekly: TTFD, completion rate, drop-off rate, repeat rate, share rate.
  Monthly: Retention (Day 7, Day 30), ESS trends, NPS survey results, cohort analysis.

---

IMPLEMENTATION NOTES

BACKEND & LLM ARCHITECTURE

Route Generation Pipeline:

  User Input: { destination, origin (GPS), transport_mode, vibe }
  
  Step 1: Route Calculation (Deterministic)
    Use MapKit (iOS), Google Maps API (Android/web), or Open Route Service for baseline route.
    Calculate route polyline based on transport mode and distance.
    Return: Polyline (array of coordinates), estimated time, distance.
    Considerations:
      Walking: Prioritize pedestrian-friendly paths; avoid highways.
      Cycling: Avoid steep hills if possible; prioritize bike lanes.
      Driving: Standard car routing; consider traffic if real-time data available.

  Step 2: POI Discovery (Hybrid Deterministic + Generative)
    Identify POIs along the route using:
      a) Map API POI database (Google Maps, Apple Maps) filtered by category/rating.
      b) Local knowledge database (if maintained; e.g., crowdsourced local spots).
      c) Vibe-based filtering: For each vibe, apply category weightings.
    Return: List of candidate POIs with: name, category, location (lat/lng), address, photos (if available), ratings.
    
  Step 3: POI Ranking & Storytelling (Generative via LLM)
    Input to LLM:
      {
        "route": { "start": {...}, "end": {...}, "distance_km": X, "estimated_time_min": Y },
        "candidate_pois": [ { "name": "...", "category": "...", "description": "...", "rating": X.X }, ... ],
        "vibe": "Creative",
        "transport_mode": "Walking"
      }
    
    LLM Prompt Template:
      "A user is taking a walking detour in a creative mood. They're traveling from [start] to [end], about [distance] km and [time] minutes.
       Here are candidate POIs along the route: [list]. Select 5–7 most compelling POIs for this vibe. For each, write a 1–2 sentence storytelling
       snippet (max 80 characters) that connects the place to the vibe and creates curiosity. Prioritize variety in POI type (don't cluster art galleries).
       Return JSON: { 'pois': [ { 'name': '...', 'snippet': '...' }, ... ] }"
    
    LLM Task:
      a) Filter POIs: Select subset that matches vibe and creates a balanced, diverse route.
      b) Rank by: Distance along route (maintain sequence), relevance to vibe, variety (don't duplicate categories).
      c) Generate storytelling: Create engaging, contextual descriptions (see examples below).
      d) Return: Ordered list of 5–7 POIs with snippets.
    
    LLM Model Recommendation:
      Use GPT-4 (or similar capable model) for initial launch; cheaper models (GPT-3.5, Claude Haiku) for scaled deployment.
      Response time: Optimize via caching (identical requests return cached results) and prompt refinement.
      Cost consideration: ~$0.01–$0.05 per request; cache reduces this to ~$0.001 per repeat request.

  Step 4: Route Assembly
    Combine route polyline, ranked POIs, and storytelling snippets.
    Render on client: Polyline on map, POI pins with numbers, POI list with snippets.

  Example LLM Response:
    Input: Creative vibe, Walking mode, 5 candidate POIs (gallery, coffee shop, street art, vintage bookstore, design studio).
    Output:
      [
        { "name": "Riverside Gallery", "snippet": "An intimate space showcasing emerging abstract painters. Arrive during golden hour for the best light." },
        { "name": "The Daily Grind", "snippet": "Third-wave coffee roastery with a design-forward interior. The owner is a barista champion." },
        { "name": "East Wall Street Art", "snippet": "Massive murals by international street artists. New piece installed monthly—check what's up today." },
        { "name": "Bindery & Co Bookstore", "snippet": "Curated zine and artist book collection. Hidden upstairs reading nook with vintage typewriters." },
        { "name": "Studio Make", "snippet": "Shared creative workspace with ongoing public installations. Catch ceramics demos on Wednesday afternoons." }
      ]

CONTEXTUAL STORYTELLING DURING NAVIGATION

As user approaches each POI, contextual prompts are triggered (within 50m radius).

Prompt Generation:
  Input: POI name, category, current user distance/bearing, time of day, vibe.
  
  Prompt Template (Pre-written or LLM-generated):
    "Look for the [distinctive feature] on your [direction]. It's [one interesting fact]."
    Examples:
      "Look for the blue door on your left. It's been painted that color since 1987."
      "You're approaching a mural. This one took three weeks to complete."
      "This building used to be a speakeasy. The original bar is still inside."
  
  Strategy (Recommended):
    a) Pre-write 3–5 context prompts per POI (stored in database).
    b) Rotate prompts if user revisits same POI.
    c) Optionally supplement with LLM for unique or dynamic POIs (real-time events, etc.).

POST-DETOUR REFLECTION DATA

On completion, capture:
  - Emoji reaction (happy, amazed, thoughtful, peaceful, energized).
  - Optional text reflection (max 140 characters; optional).
  - Photos captured (if permission granted; save with location tag).
  - POIs visited (subset of total; based on "Learn More" taps or time spent).
  - Route deviation (distance off path; calculated from GPS trace).

Use for:
  - Personalization (users who react positively to Nature vibe get Nature suggestions more often).
  - Analytics (identify which vibes/POIs have highest satisfaction).
  - Sharing / summary (highlight user's favorite moments).

---

API DATA STRUCTURES

Example: Route Generation Request

  POST /api/v1/routes/generate
  
  {
    "user_id": "user_123",
    "origin": { "lat": 40.7580, "lng": -73.9855 },
    "destination": { "lat": 40.7488, "lng": -73.9680 },
    "transport_mode": "walking",
    "vibe": "Foodie",
    "preferences": {
      "max_distance_km": 2,
      "max_time_min": 45,
      "poi_count": 7,
      "avoid_categories": ["highway", "industrial"]
    }
  }

Example: Route Generation Response

  {
    "route_id": "route_abc123",
    "polyline": "encoded_polyline_string_here",
    "summary": {
      "distance_km": 1.2,
      "estimated_time_min": 23,
      "transport_mode": "walking"
    },
    "pois": [
      {
        "id": "poi_001",
        "name": "Chelsea Market",
        "category": "food_market",
        "location": { "lat": 40.7520, "lng": -74.0020 },
        "snippet": "Historic food market with 100+ vendors. Try the lobster roll.",
        "image_url": "https://api.detour.com/images/poi_001.jpg",
        "order": 1,
        "distance_from_start_km": 0.3
      },
      ... (6 more POIs)
    ],
    "contextual_prompts": {
      "poi_001": [
        "Look for the red brick building on your right. You'll see the entrance on 9th Avenue.",
        "This market has been here since 1930. It's a NYC institution."
      ]
    }
  }

Example: Reflection Submission

  POST /api/v1/detours/complete
  
  {
    "route_id": "route_abc123",
    "user_id": "user_123",
    "reflection": {
      "emotion": "amazed",
      "text": "Found the best pasta place! Will definitely come back.",
      "photos_count": 3
    },
    "engagement": {
      "pois_expanded": 5,
      "time_spent_min": 28,
      "distance_traveled_km": 1.25
    }
  }

---

DETERMINISTIC VS. GENERATIVE BREAKDOWN

Deterministic (Algorithmic, Cached):
  - Route polyline calculation (start to end via map API).
  - POI discovery from map database (category, location, rating).
  - Distance and time estimation.
  - User preferences and state (vibe selection, transport mode, GPS location).
  
  Rationale: Consistent, fast, predictable. Can be cached and reused for identical queries.

Generative (LLM-powered, Per-session):
  - POI ranking and selection (which POIs best match the vibe?).
  - Storytelling snippets (1–2 sentence narratives for each POI).
  - Contextual prompts (what to look for when approaching a POI).
  - Optional: Real-time event integration (if concert/special event at POI, mention it).
  
  Rationale: Creates freshness and personalization; users don't see identical routes twice. Requires LLM latency trade-off (managed via caching and request queuing).

Hybrid Example:
  Deterministic: "Route from A to B, walking mode, 1.2 km, 23 min."
  Deterministic + Cached: "Top 7 restaurants within 100m of route, average rating > 4.0."
  Generative: "Of those restaurants, select 5 that match 'Foodie' vibe; write 1–2 sentence description for each."

---

LATENCY OPTIMIZATION

Challenge: LLM calls add ~2–5 seconds to route generation. Users expect sub-2-second response.

Solutions:

  1. Caching: Store (origin, destination, vibe, transport_mode) → cached response.
    Benefit: Repeat requests (same start/end, same vibe) return instantly.
    Caveat: Different users in same city will share cache hits; is that acceptable? (Mostly yes, minor variations possible.)

  2. Prompt Queue: Submit LLM request asynchronously; return basic route immediately, update with storytelling in background.
    User sees: Map + POI pins immediately; snippets populate 1–2 seconds later (smooth animation).
    Benefit: Reduces perceived latency; user sees progress.

  3. Prompt Optimization: Refine prompts to reduce token count and response time.
    Strategy: Use few-shot examples; constrain output format (JSON); avoid open-ended prompts.

  4. Model Selection: Use smaller, faster models (GPT-3.5, Claude Haiku) for production; reserve GPT-4 for complex edge cases.

  5. Pre-computation: For popular routes/destinations, pre-generate POI rankings and store.
    Benefit: Instant responses for 80% of queries.
    Caveat: Requires monitoring of popular destinations; manual or periodic regeneration.

---

OFFLINE FUNCTIONALITY

Cached Detours:
  - Previous 5–10 completed detours stored locally (route polyline, POI list, snippets, photos).
  - Accessible via "Browse My Detours" even offline.
  - Map tiles cached for previously visited areas (requires pre-download or background fetch).

Limitations Offline:
  - Cannot generate new routes (requires real-time map API and LLM).
  - GPS still works; can show user's real-time location on cached map.
  - No network-dependent features (share, save to cloud, sync across devices).

Graceful Degradation:
  - Offline mode indicated visually (small icon, banner, or offline label).
  - CTAs disabled with tooltip: "Unavailable offline."
  - Alternative: "Generate route when connected" option (queue for later).

---

NOTIFICATION STRATEGY

Push Notifications (Optional; use sparingly):
  - Not recommended for routine updates (avoid fatigue).
  - Appropriate use cases:
    • Reminder: "Your favorite route is nearby" (location-triggered, opt-in).
    • Social: "Your friend shared a detour in your city" (if social features added).
    • Milestone: "You've completed 10 detours! Share your achievement." (opt-in).
  
  Guidelines:
    - Daily cap: Max 1 notification per user per day (unless explicitly opted in for frequent updates).
    - Time sensitivity: Respect quiet hours (e.g., no notifications 10 PM–8 AM unless urgent).
    - Personalization: Segment by usage pattern (frequent users get weekly tips; casual users get monthly features).

In-App Notifications (Preferred):
  - Use contextual toasts or banners (not interrupting).
  - "You've earned a new achievement" (celebratory, non-intrusive).
  - "A new vibe is available" (feature announcement, can be dismissed).

---

ANALYTICS EVENTS TAXONOMY

Core Events to Log:

  app_opened
    params: { user_id, session_id, platform (iOS/Android), app_version, os_version }
  
  screen_viewed
    params: { screen_name, source_screen, timestamp }
  
  transport_mode_selected
    params: { mode (walk/cycle/drive) }
  
  vibe_selected
    params: { vibe_name, is_custom, skip_used }
  
  route_generation_started
    params: { destination_type (search/map_tap/saved), origin_type }
  
  route_generated
    params: { route_id, duration_ms, poi_count, error (if any) }
  
  route_preview_viewed
    params: { route_id, poi_expanded_count, adjustment_triggered }
  
  detour_started
    params: { route_id, session_start_timestamp }
  
  poi_expanded
    params: { poi_id, poi_name, engagement_type (learn_more/photo/skip) }
  
  navigation_ended (arrival)
    params: { route_id, actual_duration_min, actual_distance_km, deviation_m, pois_visited, photos_taken }
  
  reflection_submitted
    params: { emotion, text_present, photos_shared }
  
  route_shared
    params: { share_medium (messages/twitter/instagram/link), route_id }
  
  route_saved
    params: { route_id }
  
  error_occurred
    params: { error_type, error_message, screen, timestamp }

---

TESTING & VALIDATION

User Testing Script (Qualitative):

  Scenario: First-time user discovering a detour.
  Duration: 20–30 minutes per session.
  Participants: 5–8 per round (minimal viable sample).
  
  Tasks:
    1. "Open the app. What do you think this app does?" (assess clarity)
    2. "Without guidance, start a detour to [destination]." (assess UX clarity)
    3. "Tell me about the vibe you selected and why." (assess resonance)
    4. "Begin navigation. Describe what you see as you approach the first POI." (assess context)
    5. "Complete the journey and share your thoughts." (assess satisfaction)
  
  Success Criteria:
    - User understands app purpose within 30 seconds.
    - User completes route preview without assistance.
    - User can articulate why their vibe was selected.
    - User engages with 3+ POIs during navigation.
    - User rates emotional satisfaction > 7/10.

  A/B Testing Recommendations:
    - Test CTA button copy ("Begin Detour" vs. "Let's Go" vs. "Start Exploring").
    - Test vibe card designs (emoji vs. icon; description length).
    - Test bottom sheet snap heights (compact vs. expanded initial state).
    - Test contextual prompt frequency (always vs. first POI only vs. every other POI).

---

PERFORMANCE BUDGETS

Target Metrics (to be enforced during development):

  Cold App Start: < 2 seconds to home screen.
  Route Generation: < 2 seconds (p90) to preview screen.
  Navigation Transition: < 400ms from preview to navigation screen.
  Scroll/Pan Performance: 60 FPS minimum; acceptable drop to 50 FPS on low-end devices.
  POI Expansion: < 300ms to show details modal.
  API Response Time: < 1 second (p95) for all endpoints (excluding LLM calls, which are optimized separately).

Monitoring Tools:
  - Xcode Instruments (iOS performance profiling).
  - Android Profiler (Android).
  - Firebase Performance Monitoring (cross-platform RUM).
  - Sentry or DataDog (error tracking and APM).

