# POI Selection Flow - UX Architecture

## Overview

The new POI selection flow transforms the Detour app from "show POIs on a map" to "let users select and preview POIs before committing to a route."

---

## The New User Journey

### Step 1: Basic Route (Already exists ✓)
```
User: "Find route from Downtown LA to Santa Monica"
       ↓
App: Shows direct route on map with polyline
     Discovers available POI types (Cafes, Art, etc.)
```

### Step 2: Interest Selection (Already exists ✓)
```
User: Taps "Cafes" button
      ↓
App: Searches for all cafes along the route
     Displays them as green markers on map
```

### Step 3: NEW - POI Selection Sheet
```
User: Currently... route is shown but can't select POIs
      
NEW: Taps "Cafes" button → POI Selection Sheet slides up
      ├─ Shows ranked list of 5-8 cafes
      ├─ Rank 1: "The Coffee Spot" (4.8★ • 500m from route)
      ├─ Rank 2: "Brew Brothers" (4.6★ • 800m from route)
      └─ User taps one → continues to Step 4
```

### Step 4: NEW - Route Update with Detour
```
User: Selects "The Coffee Spot"
      ↓
App: Generates detour route that goes THROUGH the cafe
     Maps shows:
     ├─ Original route (faded)
     ├─ New detour route (highlighted)
     ├─ Cafe marked as stop #2 (between start and end)
     └─ Badge shows: "+8 min / +0.3 km"
```

### Step 5: Save (Already exists ✓)
```
User: Happy with the route → Taps "Save Detour"
      ↓
App: Saves the route with POI selection
```

---

## Components & Files

### 1. POISelectionSheet.tsx (NEW)
**Purpose**: Display ranked list of POIs for user to choose from

**Key Features**:
- Ranking algorithm (rating × 0.5 + proximity × 0.3 + reviews × 0.2)
- Visual indicators:
  - Rank badge (1, 2, 3...)
  - Rating & review count
  - Distance from route
  - Address & hours
  - Open/closed status
- Selection indicator (checkmark when selected)

**Props**:
```typescript
interface POISelectionSheetProps {
  visible: boolean;
  pois: POI[];
  selectedPOIName?: string;
  interest: string;
  onSelectPOI: (poi: POI) => void;
  onClose: () => void;
  isLoading?: boolean;
}
```

### 2. DetourService.ts - generateDetourWithPOI()
**Purpose**: Calculate a new route that includes a POI as a waypoint

**What it does**:
1. Takes start, end, POI location, and transport mode
2. Calls Google Directions API with waypoint
3. Returns:
   - New coordinates (path through POI)
   - Extra time needed (delta from direct route)
   - Extra distance needed (delta from direct route)
   - Updated markers (start → POI → end)

**Returns**:
```typescript
{
  coordinates: Location[];        // The new route path
  encodedPolyline: string;       // Encoded path for storage
  markers: Marker[];             // Start, POI, End markers
  extraDistance: number;         // meters added
  extraTime: number;             // seconds added
  directDistance: number;        // original distance
  directTime: number;            // original time
}
```

### 3. index.tsx (Updated)
**New State Variables**:
- `poiSheetVisible`: Show/hide the POI selection sheet
- `selectedInterestForSheet`: Track which interest category is shown
- `selectedPOI`: Store currently selected POI

**New Handlers**:
- `handleSearchPOIs()`: Modified to open POI sheet (was just searching)
- `handleSelectPOI()`: NEW - Updates route when user selects a POI

---

## How It Works: Step-by-Step

### When User Selects Interest
```typescript
// User taps "Cafes" button
handleSearchPOIs('cafe')
  ├─ Searches for POIs along route
  ├─ Updates detourRoute with pois: []
  ├─ Sets selectedInterestForSheet = 'cafe'
  └─ Shows POI Selection Sheet with ranked list
```

### When User Selects a POI from Sheet
```typescript
// User taps "The Coffee Spot" card
handleSelectPOI(poiObject)
  ├─ Closes the POI sheet
  ├─ Calls generateDetourWithPOI({
  │    start: "Downtown LA",
  │    end: "Santa Monica",
  │    poi: {location: {...}, name: "The Coffee Spot"}
  │  })
  ├─ Gets NEW route: Downtown → Coffee Spot → Santa Monica
  ├─ Updates mapView:
  │  ├─ coordinates = new route path
  │  ├─ markers = [start, coffee shop, end]
  │  └─ pois still shows all cafes (for reference)
  └─ Sets selectedPOI = coffee shop object
```

---

## POI Ranking Algorithm

Each POI gets a score: 0-100

```typescript
const score = 
  (rating / 5 * 50) * 0.5 +           // Rating weight: 50%
  ((1 - distance/2000) * 30) * 0.3 +  // Proximity weight: 30%
  (log10(reviews) * 5) * 0.2          // Popularity weight: 20%
```

**Example**:
- **Cafe A**: 4.8★, 300m away, 800 reviews
  - Rating: 4.8/5 * 50 * 0.5 = 24
  - Distance: (1 - 300/2000) * 30 * 0.3 = 7.35
  - Reviews: log10(801) * 5 * 0.2 = 1.4
  - **Total: 32.75 → Rank #1** ✅

- **Cafe B**: 4.2★, 1500m away, 50 reviews
  - Rating: 4.2/5 * 50 * 0.5 = 21
  - Distance: (1 - 1500/2000) * 30 * 0.3 = 1.5
  - Reviews: log10(51) * 5 * 0.2 = 0.8
  - **Total: 23.3 → Rank #2** ✅

---

## Visual Flow

```
┌─────────────────────────────┐
│   User taps "Cafes"         │
│   (Interest button)         │
└──────────────┬──────────────┘
               │
               ↓
┌─────────────────────────────────┐
│  POI Selection Sheet appears    │
│  ┌─────────────────────────────┐│
│  │ Cafés                       ││
│  │ 8 options nearby            ││
│  ├─────────────────────────────┤│
│  │ [1] The Coffee Spot    ✓   ││
│  │     4.8★ (800 reviews)      ││
│  │     300m from route         ││
│  │     Open now                ││
│  │                             ││
│  │ [2] Brew Brothers          ││
│  │     4.6★ (500 reviews)      ││
│  │     500m from route         ││
│  │     Open now                ││
│  │                             ││
│  │ [3] Blue Bottle Coffee     ││
│  │     4.5★ (1200 reviews)    ││
│  │     800m from route         ││
│  │     Closed                  ││
│  └─────────────────────────────┘│
└──────────────┬──────────────────┘
               │
               ↓ (user taps Rank #1)
┌─────────────────────────────┐
│   Map Updates:              │
│   ├─ Route goes through     │
│   │  coffee shop now        │
│   ├─ Marker #2: Coffee Spot │
│   ├─ Shows: "+8 min"        │
│   │           "+0.3 km"     │
│   └─ Selects POI ✓          │
└─────────────────────────────┘
```

---

## API Calls Made

### 1. When searching for POIs (unchanged)
```
GET /maps/api/place/nearbysearch
    ?location=34.05,-118.24
    &radius=800
    &keyword=cafe
    &key=API_KEY
```

### 2. When user selects POI (NEW)
```
GET /maps/api/directions/json
    ?origin=Downtown LA
    &destination=Santa Monica
    &waypoints=The Coffee Spot location
    &mode=driving
    &key=API_KEY
```

This second call is the magic - it forces Google Maps to generate a route that goes **through** the POI.

---

## Error Handling

### No POIs Found
```
User: Selects "Street Art"
      ↓
App: "No Street Art found along this route. Try another interest."
     POI Sheet doesn't open
```

### Route Generation Failed
```
User: Selects POI
      ↓
App: Cannot generate waypoint route
     Shows: "Could not update route with this POI"
     Falls back to original route
```

---

## Future Enhancements

### Phase 2: Multiple POIs
```
Allow user to select multiple POIs before generating route
Order optimization: app finds best order to visit them
```

### Phase 3: Route Variants
```
Show 3 different routes ranked by:
1. Fastest detour
2. Most interesting (highest-rated POIs)
3. Longest detour (if user has time)
```

### Phase 4: Save Multiple Routes
```
Save detour with multiple stops
Share route with friends
```

---

## Testing Checklist

- [ ] POI sheet opens when interest selected
- [ ] POIs are ranked correctly
- [ ] Selecting a POI updates the map route
- [ ] Route shows extra time/distance
- [ ] Markers update (start → POI → end)
- [ ] Can change transportation mode after POI selection
- [ ] Can select different POI and route updates
- [ ] Detour saves correctly with selected POI
- [ ] Error handling works for no POIs found
- [ ] Performance: Sheet opens in <1 second

---

**Version**: 1.0  
**Last Updated**: October 31, 2025
