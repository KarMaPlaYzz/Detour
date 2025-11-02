# POI Selection UX Flow - Visual Diagrams

## The Problem → Solution Journey

```
PROBLEM STATE (Before)
═════════════════════════════════════════════
┌──────────────────────────────┐
│         MAP VIEW             │
│                              │
│  ❌ POIs visible             │
│     but not selectable       │
│                              │
│  ❌ No route preview         │
│     with POI included        │
│                              │
│  ❌ No ranking system        │
│     for comparison           │
└──────────────────────────────┘
     ↓
   User stuck here!


SOLUTION STATE (Now)
═════════════════════════════════════════════
┌──────────────────────────────┐
│         MAP VIEW             │
│                              │
│  ✅ POIs selectable          │
│     ranked & detailed        │
│                              │
│  ✅ Route updates live       │
│     through selected POI     │
│                              │
│  ✅ Clear cost display       │
│     +8 min, +0.3 km          │
│                              │
│  ✅ Save with POI            │
│     included                 │
└──────────────────────────────┘
     ↓
   User confident!
```

---

## Complete User Journey Map

```
START HERE
    │
    ↓
┌──────────────────────────────────┐
│  1. ORIGIN & DESTINATION         │
│  User: "LA to Santa Monica"      │
│  System: Route calculated        │
└───────────────┬──────────────────┘
                │
                ↓
         DISCOVERY PHASE
    ┌────────────────────────┐
    │  POI Types Discovered  │
    │  • Cafés               │
    │  • Street Art          │
    │  • Museums             │
    └────────────────┬───────┘
                     │
                     ↓
         ┌───────────────────────┐
         │ USER SELECTS INTEREST │
         │ (Taps "Cafés")        │
         └───────────────┬───────┘
                         │
                         ↓
           POI DISCOVERY PHASE
     ┌─────────────────────────────────┐
     │ System: searchPOIsAlongRoute()   │
     │                                 │
     │ Results:                        │
     │ ✓ Cafe 1 - 4.8★ 500m away      │
     │ ✓ Cafe 2 - 4.6★ 600m away      │
     │ ✓ Cafe 3 - 4.5★ 800m away      │
     │ ✓ Cafe 4 - 3.9★ 1.2km away     │
     │ ... (more below)                │
     └──────────────┬────────────────┘
                    │
                    ↓
      ┌────────────────────────────┐
      │ POI SELECTION SHEET OPENS  │
      │ (Bottom sheet animation)   │
      └──────────────┬─────────────┘
                     │
            ┌────────┴────────┐
            │ User can:       │
            │ • See rankings  │
            │ • Compare POIs  │
            │ • Read details  │
            └────────┬────────┘
                     │
                     ↓
      ┌─────────────────────────────┐
      │ USER SELECTS A POI          │
      │ (Taps rank #1: Coffee Spot) │
      └──────────────┬──────────────┘
                     │
                     ↓
        ROUTE GENERATION PHASE
     ┌────────────────────────────────┐
     │ System: generateDetourWithPOI() │
     │                                │
     │ • Calls Google Directions API  │
     │ • Adds POI as waypoint         │
     │ • Calculates: Start→POI→End    │
     │ • Computes extra time (+8 min) │
     │ • Computes extra distance      │
     └──────────────┬────────────────┘
                    │
                    ↓
      ┌─────────────────────────────┐
      │ MAP UPDATES (Instant)       │
      │ • Route visualized through  │
      │   coffee shop               │
      │ • Markers: 3 points        │
      │ • Cost badge visible        │
      │ • POI highlighted           │
      └──────────────┬──────────────┘
                     │
                     ↓
         ┌──────────────────────┐
         │ USER MAKES DECISION  │
         └───────┬──────────────┘
                 │
        ┌────────┴────────┐
        │                 │
        ↓                 ↓
    "Save"            "Try Different"
      │                   │
      ↓                   ↓
   SAVE FLOW     BACK TO POI SELECTION
      │          (Sheet still open)
      ↓                   │
   Success!         (repeat from there)
```

---

## Component Interaction Diagram

```
┌─────────────────────────────────────────────┐
│          MAIN SCREEN (index.tsx)            │
├─────────────────────────────────────────────┤
│                                             │
│  State:                                     │
│  • detourRoute: { coordinates, pois, ... }  │
│  • poiSheetVisible: boolean                 │
│  • selectedPOI: POI | null                  │
│  • selectedInterestForSheet: string         │
│                                             │
│  Handlers:                                  │
│  • handleSearchPOIs()  ─┐                   │
│  • handleSelectPOI()   ─┼─→ Triggers       │
│  • handleTransport()   ─┤  actions on:      │
│  • handleSaveDetour()  ─┘                   │
│                                             │
└──────────────────┬──────────────────────────┘
                   │
    ┌──────────────┼──────────────┐
    │              │              │
    ↓              ↓              ↓
┌─────────────┐ ┌──────────────┐ ┌─────────────┐
│ MapView     │ │ InputForm    │ │ POISheet    │
│ Component   │ │ Component    │ │ Component   │
├─────────────┤ ├──────────────┤ ├─────────────┤
│ Displays:   │ │ Shows:       │ │ Displays:   │
│ • Route     │ │ • Start/end  │ │ • Ranked    │
│ • Markers   │ │ • Transport  │ │   POI list  │
│ • POIs      │ │   buttons    │ │ • Details   │
│             │ │ • Interest   │ │ • Ratings   │
│ Updates on: │ │   buttons    │ │ • Selection │
│ • Route     │ │              │ │ • Status    │
│   change    │ │ Calls:       │ │             │
│ • Marker    │ │ • onFindDet. │ │ Calls:      │
│   addition  │ │ • onSearch   │ │ • onSelect  │
│             │ │   POIs       │ │   POI       │
│             │ │ • onTransport│ │ • onClose   │
│             │ │              │ │             │
└─────────────┘ └──────────────┘ └─────────────┘
    ↑                                    ↑
    │                                    │
    │ coordinates, markers from          │ visible = true
    │ generateDetourWithPOI()            │ when interest
    │                                    │ selected
    └────────────────────────────────────┘
```

---

## Data Flow During POI Selection

```
USER TAPS "CAFÉS" BUTTON
        │
        ↓
handleSearchPOIs("cafe")
        │
        ├─→ setSelectedInterestForSheet("cafe")
        ├─→ searchPOIsAlongRoute({ coordinates, interest: "cafe" })
        │
        ↓ (API calls to Google Places)
        │
    Returns: { poi, pois: [...8 POIs] }
        │
        ├─→ setDetourRoute({...prev, pois, interest})
        ├─→ setPoiSheetVisible(true)
        │
        ↓
POISelectionSheet renders with ranked list
        │
        │
USER TAPS POI #1
        │
        ↓
handleSelectPOI(poiObject)
        │
        ├─→ setPoiSheetVisible(false)
        ├─→ generateDetourWithPOI({
        │      start, end, poi, mode
        │   })
        │
        ↓ (Google Directions API with waypoint)
        │
    Returns: {
        coordinates: [...new route],
        markers: [start, poi, end],
        extraDistance: 300,
        extraTime: 480
    }
        │
        ├─→ setDetourRoute({...prev, coordinates, markers})
        ├─→ setSelectedPOI(poiObject)
        │
        ↓
Map animates to show new route
Map displays 3 markers on path through POI
```

---

## POI Ranking Algorithm Visualization

```
INPUT: 8 POIs along route
        │
        ├─ Cafe A: 4.8★, 500m away, 800 reviews
        ├─ Cafe B: 4.6★, 600m away, 500 reviews
        ├─ Cafe C: 4.2★, 300m away, 100 reviews
        ├─ Cafe D: 3.9★, 1200m away, 1500 reviews
        └─ ... (4 more)
        
        ↓
SCORING PHASE (calculatePOIScore)
        │
        ├─ Cafe A: (48 * 0.5) + (7.3 * 0.3) + (1.4 * 0.2) = 32.7 ✓✓
        ├─ Cafe B: (46 * 0.5) + (7.0 * 0.3) + (1.3 * 0.2) = 30.8
        ├─ Cafe C: (42 * 0.5) + (8.1 * 0.3) + (0.7 * 0.2) = 26.3
        ├─ Cafe D: (39 * 0.5) + (2.1 * 0.3) + (1.8 * 0.2) = 21.8
        └─ ... (4 more calculated)
        
        ↓
SORT BY SCORE (descending)
        │
        ├─ RANK 1: Cafe A (32.7) ← Best quality + close + popular
        ├─ RANK 2: Cafe B (30.8) ← Good quality + decent distance
        ├─ RANK 3: Cafe C (26.3) ← Very close but lower rated
        ├─ RANK 4: Cafe D (21.8) ← Good reviews but far away
        └─ ... (4 more ranked)
        
        ↓
OUTPUT: Ranked list shown in POI Sheet
```

**Key Insight**: Balancing 3 factors = no single "best", but clear "better"

---

## Route Comparison: Direct vs. Detour

```
DIRECT ROUTE (Before POI Selection)
═════════════════════════════════════

    START
      ●━━━━━━━━━━━━━━━━━━━━●
      ↓                     ↑
      ↓   Direct Route      ↑
      ↓   (15 min, 8 km)    ↑
      ↓                     ↑
    ●━━━━━━━━━━━━━━━━━━━━●
    END

Map View:
- Blue polyline: Direct path
- 2 markers: Start, End
- No POIs on route
- Clean, efficient


DETOUR ROUTE (After POI Selection)
═════════════════════════════════════

    START
      ●━━━━━━━━━━━━━━━━━━━━●
      ↓                 ╱   ↑
      ↓  Direct Route  ╱    ↑
      ↓ (faded,pale)  ╱     ↑
      ●━━━━ COFFEE ━━━      ↑
      ↓╱   SHOP   ╲━━●      ↑
      ↓           ↓  ↑      ↑
      ↓ Detour   ↓  ↑      ↑
      ↓ +8 min  ↓  ↑      ↑
      ↓ +0.3km  ↓  ↑      ↑
    ●━━━━━━━━━━━━━━━━━━━━●
    END

Map View:
- Blue polyline: Detour path (bold, highlighted)
- Gray polyline: Original route (faded for comparison)
- 3 markers: Start, Coffee Shop, End
- Coffee Shop marked specially (green star)
- Badge shows "+8 min / +0.3 km" cost

User sees:
✓ Route goes through coffee shop
✓ Extra time is small (only 8 min for 15 min trip = 53% longer)
✓ Can compare: worth it or not?
```

---

## Sheet Interaction States

```
CLOSED STATE
═════════════════════════════════════
┌──────────────────────────┐
│       MAP (Full)         │
│   Interest buttons visible
│   below (partially visible)
└──────────────────────────┘


OPENING (Animation)
═════════════════════════════════════
     Backdrop blur increases
     Sheet slides up from bottom
     Duration: ~300ms


OPEN STATE
═════════════════════════════════════
┌──────────────────────────┐
│       MAP                │
│   (50% visible, blurred) │
├──────────────────────────┤
│  Cafés         [X]       │ ← Header
│  8 options nearby        │
├──────────────────────────┤
│ [1] Coffee Spot    ✓     │ ← POI cards
│     4.8★ 500m away       │    (scrollable)
│                          │
│ [2] Brew Brothers        │
│     4.6★ 600m            │
│                          │
│ [3] Blue Bottle          │
│     4.5★ 800m            │
│                          │
│ [Select location...]     │ ← Footer info
└──────────────────────────┘


SELECTING STATE
═════════════════════════════════════
     Sheet dimmed (loading)
     API call in progress
     Button disabled


POST-SELECTION
═════════════════════════════════════
     Sheet closes
     Map animates to new route
     Markers update
     POI highlighted
```

---

## Error States

```
NO POIs FOUND
═════════════
┌──────────────────────────┐
│     Alert Popup          │
│ "No cafés found along    │
│  this route. Try another │
│  category."              │
│                          │
│  [OK]                    │
└──────────────────────────┘
Result: Sheet never opens


API ERROR
═════════════
┌──────────────────────────┐
│     Alert Popup          │
│ "Could not update route  │
│  with this POI"          │
│                          │
│  [OK]                    │
└──────────────────────────┘
Result: Route remains unchanged


NETWORK TIMEOUT
═════════════════════════════════════
┌──────────────────────────┐
│  Sheet still open        │
│  (slightly delayed)      │
│                          │
│  POI details load        │
│  progressively           │
│  (graceful degradation)  │
└──────────────────────────┘
Result: User can still select
        after data loads
```

---

## Performance Timeline

```
User taps "Cafés"
│
├─ 0ms    → handleSearchPOIs called
├─ 50ms   → setLoading(true)
├─ 100ms  → searchPOIsAlongRoute API call
│
├─ 500ms  → Places API returns 8 POIs
├─ 600ms  → Place Details API called (parallel for top 8)
│
├─ 1200ms → All details loaded
├─ 1210ms → Ranking algorithm runs
├─ 1220ms → Sheet becomes visible
│
└─ TOTAL: ~1.2 seconds

User taps POI
│
├─ 0ms    → handleSelectPOI called
├─ 50ms   → setLoading(true)
├─ 100ms  → generateDetourWithPOI API call
│
├─ 800ms  → Directions API returns detour route
├─ 820ms  → Route coordinates decoded
├─ 840ms  → Markers updated
├─ 860ms  → setDetourRoute called
│
├─ 900ms  → Map animates to new region
├─ 1200ms → Animation completes
│
└─ TOTAL: ~1.2 seconds
```

---

This completes the visual explanation of the POI Selection flow.

**Key Files to Reference**:
- `POISelectionSheet.tsx` - Component implementation
- `DetourService.ts` - `generateDetourWithPOI()` function
- `index.tsx` - Integration and state management
