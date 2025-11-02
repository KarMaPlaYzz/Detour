# Testing the New POI Selection Flow

## Quick Start

### Prerequisites
- App running: `npx expo start`
- Simulator/device ready
- Location permission granted

---

## Test Scenario

### Test Case 1: Basic Flow
**Objective**: Verify POI selection sheet appears and works

**Steps**:
1. Open app → allows location permission
2. Enter start: `"Downtown Los Angeles"`
3. Enter end: `"Santa Monica Pier"`
4. Tap "Find Detour" button
   - Should see direct route on map
   - Interest buttons should appear (Cafés, Street Art, etc.)

5. **Tap "Cafés" button**
   - **Expected**: POI Selection Sheet slides up from bottom
   - Should show list of cafes with rank numbers (1, 2, 3...)
   - Each card shows:
     - Rank badge (colored circle with number)
     - Cafe name
     - Rating (stars + number) 
     - Review count
     - Distance from route (e.g., "500m from route")
     - Address
     - Open/Closed status (green/red dot)

6. **Tap first ranked cafe**
   - **Expected**: 
     - Sheet closes
     - Map animates to show new route
     - Route should now go THROUGH the cafe
     - Markers should be: Start → Cafe → End
     - Header might show route updated

**Pass/Fail**: ✅ Pass if all above happen, ❌ Fail if sheet doesn't open or selection doesn't update route

---

### Test Case 2: Ranking Verification
**Objective**: Verify POIs are ranked by our algorithm

**What to check**:
1. Open POI sheet
2. Take note of top 3 cafes:
   - Rank #1: Should have high rating (4.5+) AND be close to route (< 500m)
   - Rank #2 & #3: Should be next best combinations of rating + proximity
3. Note: If a cafe is very far away (1.5+ km), it should rank lower

**Why this matters**: Ranking algorithm considers:
- Rating (50% weight)
- Proximity to route (30% weight)
- Review count (20% weight)

---

### Test Case 3: Multiple Interest Changes
**Objective**: Verify can switch between interests

**Steps**:
1. After selecting a cafe, collapse the form or navigate back
2. Tap "Street Art" button
   - **Expected**: POI sheet appears again with street art locations
   - Different POIs than before
   - Still ranked appropriately

3. Tap a street art location
   - **Expected**: Route updates to go through this street art POI
   - Map changes from cafe route to street art route

**Pass/Fail**: ✅ Route switches between interests

---

### Test Case 4: Route Comparison
**Objective**: See the difference between direct route and detoured route

**Steps**:
1. Before selecting POI: Note the route appearance
2. After selecting POI: Compare
   - **Expected**: 
     - Original route appears more faded/subtle
     - New route (through POI) appears highlighted
     - Route is longer and takes more time
     - Visual distinction should be clear

**Pro Tip**: Enable map debug tools to see route distance

---

### Test Case 5: Multiple Transport Modes
**Objective**: Verify route updates when changing transport mode

**Steps**:
1. Find a route with a POI selected
2. Change transport mode: car → walk → bike → transit
3. Each time:
   - **Expected**: Route recalculates
   - Route changes shape/length appropriately
   - POI remains on the route (still a waypoint)

**Pass/Fail**: ✅ Route adjusts for each mode

---

### Test Case 6: Saving Detour with POI
**Objective**: Verify saved detour includes POI

**Steps**:
1. Complete a full flow:
   - Enter start/end
   - Select interest
   - Select POI from sheet
   - Route shows detour through POI

2. Tap "Save Detour" (floating button or action)
3. Enter name: "Coffee Run to Santa Monica"
4. Tap "Save"
   - **Expected**: 
     - Success message appears
     - Detour is saved with POI included
     - Can view in "My Detours" tab

5. Go to "My Detours" tab
   - **Expected**: Detour appears in list
   - Shows correct name, start, end, and POI

**Pass/Fail**: ✅ Detour saved and visible in My Detours

---

## Debugging Checklist

If something doesn't work:

### POI Sheet Doesn't Open
- [ ] Interest button tapped successfully? (should disable while loading)
- [ ] Check console logs: `onSearchPOIs` called?
- [ ] Are POIs found? Check: `detourRoute?.pois.length > 0`
- [ ] Sheet component mounted? Look for `<POISelectionSheet visible={true} />`

### POIs Not Ranking Correctly
- [ ] Are ratings loading? Check callout on map markers
- [ ] Distance calculation working? Each POI should have `distanceToRoute` value
- [ ] Check scoring function in `POISelectionSheet.tsx` - `calculatePOIScore()`

### Route Not Updating After POI Selection
- [ ] `handleSelectPOI()` being called? Add console.log
- [ ] `generateDetourWithPOI()` succeeding? Check for API errors
- [ ] Map updating? Should call `setDetourRoute()` with new coordinates
- [ ] Check Google Maps API key is valid

### Performance Issues
- [ ] POI sheet takes >1 second to appear?
  - May be fetching place details - check network tab
- [ ] Route generation slow?
  - Each waypoint route requires 1 API call - normal

---

## Console Logs to Look For

**Good signs** (if you see these, things are working):

```javascript
// When interest selected
[onSearchPOIs] Called with interest: cafe

// When POIs found
🗺️ Original X waypoints → Enhanced Y points (+Z corner points)

// When POI selected
[handleSelectPOI] Called with poi name: "The Coffee Spot"

// When route updates
[Route Detection] Route detected
```

**Bad signs** (if you see these, something's wrong):

```javascript
POI search error: Error...
Error generating detour with POI: Error...
API status not OK
Could not update route with this POI
```

---

## Visual Troubleshooting

### POI Sheet Appearance Issues
- Sheet partially off screen? → Check `SafeAreaInsets`
- Text cut off? → Increase card padding
- List items too close? → Increase gap in `listContent`

### Rank Badge Not Visible
- Check `rankBadge` style in `POISelectionSheet.tsx`
- Make sure `zIndex` is set
- Verify background color contrasts with card

### Route Not Showing Through POI
- Check map has `coordinates` from `generateDetourWithPOI`
- Verify markers array has 3 items: start, POI, end
- Check polyline color is visible (should be bright blue)

---

## Performance Benchmarks

Expected timings:

| Action | Expected Time | Acceptable |
|--------|----------------|-----------|
| POI search (5-8 POIs) | 1-2 seconds | < 3 sec |
| POI sheet open | Instant | < 200ms |
| Route generation | 1-2 seconds | < 3 sec |
| Map update | 300-500ms | < 1 sec |
| **Total flow** | 3-5 seconds | < 8 sec |

If significantly slower, check:
- Network conditions
- API quota usage
- Device performance (older phones slower)
- POI count (8 POIs each need detail fetch)

---

## Common Issues & Fixes

### Issue: "No cafes found along route"
**Cause**: Route too short or in area with few cafes
**Fix**: Try different interests or longer routes
**Example**: Downtown LA → Santa Monica (good), Downtown LA → 5 blocks away (bad)

### Issue: POI sheet shows but POIs are blank
**Cause**: Place details not fetched yet
**Fix**: Wait 1-2 seconds, details load in background
**Check**: Network tab for pending `place/details` requests

### Issue: Route doesn't go through selected POI
**Cause**: Waypoint too far from direct route
**Fix**: Select a POI closer to the route (< 500m)
**Check**: Distance value shown in sheet

### Issue: Extra time is 0 minutes
**Cause**: POI is right on the route (coincidence)
**Fix**: Rare and correct! Route truly goes through it

---

## Success Criteria

✅ Flow is complete when:
1. POI sheet opens after interest selection
2. POIs are ranked 1-8 with visible rank badges  
3. User can tap any POI to select it
4. Map updates to show detour through POI
5. Route has start → POI → end markers
6. Can save detour with POI included
7. Saved detour appears in "My Detours"

---

## Next Testing Phase

Once this works, test:
- [ ] Switching between different interests multiple times
- [ ] Changing transport mode after POI selection
- [ ] Selecting different POI from same category
- [ ] Very short routes (may have different behavior)
- [ ] Very long routes (scaling test)
- [ ] Low network connection (slow API)
- [ ] Offline then online (network recovery)

---

**Testing Guide v1.0**  
**Last Updated**: October 31, 2025
