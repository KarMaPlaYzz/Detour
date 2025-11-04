# Tier 1 Features - User Guide

## 🎯 Where to Find Each Feature

---

## Feature 1: Enhanced POI Bottom Sheet
### "Discover more about places you find"

**Where**: Appears automatically when searching POIs  
**How to Access**:
1. Find a route (start → end location)
2. Once route appears, POI types show below search bar
3. Tap on any type (e.g., "Cafes", "Street Art", "Museums")
4. Bottom sheet slides up with POI list
5. Tap any POI card to see detail view

**What You See**:
- 📸 Photo gallery (swipe to explore)
- ⭐ Rating and review count
- 🕐 Open/Closed status
- 🗺️ Distance from route
- 💬 Top customer review snippet
- 📞 Call / 🌐 Website / 📍 Directions buttons
- ✅ "Continue Walking" button (to chain POIs)

**Example Flow**:
```
You enter: "Downtown LA" → "Griffith Observatory"
App shows: POI types like "Cafes", "Museums", "Scenic Spots"
You tap: "Cafes"
You see: Best-ranked coffee shops along your route
You tap: "Blue Bottle Coffee"
You see: Photos, reviews, rating, distance, hours
```

---

## Feature 2: Smart POI Filtering
### "Find exactly what you're looking for"

**Where**: "Filters" button in expanded search form  
**How to Access**:
1. Find a route
2. Form automatically expands (or tap the chevron icon to expand)
3. Below the route points, you'll see a "Filters" button with 🎚️ icon
4. Tap the "Filters" button
5. Filter sheet opens from bottom

**What You See**:
- **Quick Presets** (one-tap filters):
  - 🎨 Culture Walk (art, museums, historic sites)
  - 🍽️ Foodie Walk (restaurants, cafes, food markets)
  - 🌿 Nature Walk (parks, gardens, scenic spots)
  
- **POI Type Toggles** (11+ types):
  - Select/deselect types you want
  
- **Distance Radius** (choose one):
  - 100m (very close)
  - 300m (nearby)
  - 500m (wider search)
  
- **Open Now Toggle**:
  - Only show currently open places
  
- **Buttons**:
  - Reset (clear all selections)
  - Apply (search with these filters)

**What Happens**:
1. You adjust filters
2. Tap "Apply"
3. App searches for POIs matching your criteria
4. Results automatically re-ranked by:
   - Distance (40% weight)
   - Rating (25% weight)
   - Popularity (20% weight)
   - Open status (10% weight)
   - Type diversity (5% weight)
5. Best matches appear first

**Example Filter Usage**:
```
Scenario: "I want coffee shops within 200m, must be open now"

1. Tap "Filters" button
2. Check "Cafes" type
3. Select "300m" radius (closest to 200m)
4. Enable "Open Now" toggle
5. Tap "Apply"
6. See ranked list of coffee shops that are open nearby
```

---

## Feature 3: Route Elevation Profile
### "Know if it's an easy stroll or a challenging hike"

**Where**: "ℹ" (info) button in the top-right header  
**How to Access**:
1. Find a route (it appears on map)
2. Look at the top header with "Detour" title
3. On the right side, tap the "ℹ" (information circle) button
4. Route Details sheet opens from bottom

**What You See**:
- **Difficulty Badge**: 🟢 Easy / 🟡 Moderate / 🔴 Challenging
- **Elevation Graph**: 
  - Visual 60-bar chart showing elevation changes
  - Color-coded bars (blue→green→orange→red = low→high)
  - Y-axis labels showing elevation range
- **Stats**:
  - Total elevation gain (meters)
  - Total elevation loss (meters)
  - Total distance
  - Estimated walk time
  - POI count along route
- **Route Info**:
  - Start and end points
  - Route coordinates/summary

**Understanding Difficulty**:
- 🟢 **Easy** (< 100m gain): Flat or gentle slopes, casual walk
- 🟡 **Moderate** (100-300m gain): Some hills, steady climbing
- 🔴 **Challenging** (> 300m gain): Steep sections, cardiovascular workout

**Example Usage**:
```
You find a route and wonder: "How hard is this walk?"

1. Tap "ℹ" button in header
2. See: "🟡 Moderate Difficulty - 250m elevation gain"
3. See: Elevation graph showing climbs
4. You can now decide: "Good workout!" or "Too challenging"
5. Swipe down to close and go back to exploring POIs
```

---

## Feature 4: Continue Walking (POI Chaining)
### "Explore multiple POIs without replanning"

**Where**: "Continue Walking" button in POI detail view  
**How to Access**:
1. Find a route and search for POIs
2. Bottom sheet shows POI list
3. Tap any POI card to enter detail view
4. Scroll down to see "Continue Walking" button
5. Tap it to add POI and stay in POI discovery mode

**What Happens**:
1. POI is added to your route as a waypoint
2. POI is marked on the map
3. Bottom sheet stays open (still showing POI list)
4. You can select another POI
5. Repeat to chain multiple POIs
6. No need to recalculate the whole route each time

**Why It's Useful**:
- Fast POI chaining
- No loading delays
- Stay in discovery flow
- Build custom tour naturally

**Example Journey**:
```
You plan a coffee tour:

1. Search "Cafes"
   → See: Blue Bottle Coffee
   
2. Tap Blue Bottle to see details
   
3. Tap "Continue Walking"
   → Blue Bottle added to route ✓
   → Still in POI list
   
4. Scroll and find: Intelligentsia Coffee
   
5. Tap Intelligentsia to see details
   
6. Tap "Continue Walking"
   → Intelligentsia added to route ✓
   → Still in POI list
   
7. Repeat for more cafes...
   
8. Close sheet to see your custom coffee tour route on map
```

---

## 🗺️ Visual Map of Features

```
┌─────────────────────────────────────────┐
│ DETOUR APP SCREEN LAYOUT                │
├─────────────────────────────────────────┤
│  ← BACK  │  DETOUR TITLE  │  ℹ INFO ◄──┤ Feature 3: Tap for elevation
├─────────────────────────────────────────┤
│                                         │
│  🗺️ MAP WITH ROUTE                      │
│                                         │
├─────────────────────────────────────────┤
│  📍 START → 🚩 END                      │
│  ▼ EXPAND/COLLAPSE                      │
├─────────────────────────────────────────┤
│  [POI TYPES: Cafes | Museums | etc]     │
├─────────────────────────────────────────┤
│ ┌─────────────────────────────────────┐ │
│ │ [🎚️ Filters]  ◄─ Feature 2: Tap    │ │ When form
│ │               (when expanded)      │ │ is expanded
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ 🏢 BLUE BOTTLE COFFEE          ✓    │ │ Feature 1:
│ │ 📸 [Photos]  ⭐⭐⭐⭐⭐  1.2 km      │ │ POI sheet
│ │ 🕐 Open until 8 PM                  │ │ (bottom)
│ │ "Great atmosphere!" - Sarah         │ │
│ │ [📞] [🌐] [📍]                      │ │
│ │ [✅ Continue Walking] ◄─ Feature 4  │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

---

## 🎬 Complete User Story Example

### "Planning the Perfect Urban Coffee Tour"

**Step 1: Find Your Route**
```
Input: Start = "Downtown Coffee District"
       End = "Central Library"
Result: 2.5 km walking route appears on map
Auto: Elevation data loading...
```

**Step 2: Check Route Difficulty**
```
Action: Tap "ℹ" button in header
Result: Route details sheet opens
Info: "🟢 Easy Difficulty - 45m elevation gain"
Thought: "Perfect, nice flat walk!"
```

**Step 3: Apply Filters for Coffee**
```
Action: Form expands → Tap "Filters"
Result: Filter sheet opens
Adjustment:
  - Preset "Foodie Walk" (or manual select "Cafes")
  - Distance: 300m
  - "Open Now": enabled
Action: Tap "Apply"
Result: Coffee shops ranked by quality + proximity
```

**Step 4: Build Your Tour**
```
Step 4a: Search POIs
  Action: Tap "Cafes" type
  Result: Bottom sheet shows 8 coffee shops
  
Step 4b: First Stop
  Tap: "Blue Bottle Coffee" (#1 ranked)
  Detail View: Photos, reviews, rating
  Action: "Continue Walking"
  Result: Blue Bottle added, still in POI list
  
Step 4c: Second Stop
  Tap: "Intelligentsia Coffee" (#2 ranked)
  Detail View: Different photos, reviews
  Action: "Continue Walking"
  Result: Intelligentsia added, still in POI list
  
Step 4d: Third Stop
  Tap: "Stumptown Coffee" (#3 ranked)
  Detail View: Newest location, great reviews
  Action: "Continue Walking"
  Result: Stumptown added, still in POI list

Step 4e: Done Planning
  Action: Swipe down to close POI sheet
  Result: Map shows route with 3 coffee stops marked
```

**Step 5: Start Your Tour**
```
You now have:
- Planned route: Downtown → Central Library
- 3 coffee shop stops: Blue Bottle → Intelligentsia → Stumptown
- Elevation info: Easy walk, slight inclines
- Difficulty: Perfect for a casual afternoon

Result: Personalized, filtered, elevation-aware coffee tour! ☕
```

---

## ⚡ Quick Tips

### Filter Tips
- **Preset Buttons**: Use presets for one-tap themed walks
- **Custom Filters**: Mix types for unique combinations (art + food)
- **Distance**: Start with 300m, adjust based on how many stops you want
- **Open Now**: Great for spontaneous tours

### Elevation Tips
- **Planning**: Check difficulty before committing to a walk
- **Steep Sections**: Look at the graph shape, not just the gain
- **Comparison**: Check elevation for different route options

### Filtering & Ranking Tips
- **Top Results**: First POIs are best-quality + closest + most popular
- **Re-ranking**: Adjusting filters instantly re-sorts the list
- **Exclusions**: Unchecking a type removes all POIs of that type

### Chaining Tips
- **Multiple POIs**: Keep tapping "Continue Walking" to build your tour
- **No Replanning**: Each addition is instant (no route recalculation)
- **Flexibility**: You can reorder or change later

---

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| "Filters button not showing" | Make sure route exists, form needs to be expanded (tap chevron) |
| "Info button not visible" | Route needs to exist first. Check top-right header. |
| "Elevation not loading" | Make sure you have internet (Google API needed). Give it a moment. |
| "Continue Walking not working" | Must be in POI detail view (not list view). Tap POI first. |
| "Filters not applying" | Make sure to tap "Apply" button, not just selecting. |

---

## ✨ Pro Tips

1. **Start with presets** - Choose "Culture Walk" or "Foodie Walk" for instant themed tours
2. **Check elevation first** - Tap info button before searching POIs to know if you're up for it
3. **Use distance wisely** - 100m for concentrated area, 300m+ for longer tours
4. **Chain your favorites** - Once you find a good POI, continue walking to find similar nearby
5. **Combine filters** - Select multiple types for diverse, interesting tours

---

## 🎉 Summary

You now have 4 powerful features:

| Feature | Why Use It | When to Use |
|---------|-----------|------------|
| **Enhanced POI Details** | See what you're getting into | Before visiting a POI |
| **Smart Filtering** | Find exactly what you want | After deciding what interests you |
| **Elevation Profile** | Know the difficulty level | Before starting your walk |
| **Continue Walking** | Build tours efficiently | Discovering multiple POIs |

**All working together for the perfect walking experience!** 🚶‍♂️✨
