# Store Types Selector Implementation

## Overview
Instead of using predefined "vibes" (Creative, Foodie, Nature Escape, etc.), the app now displays the actual types of stores/places found along the route using real data from Google Places API.

## How It Works

### 1. Route Discovery Phase
When a user enters a destination, the app:
- Generates a basic route from start to end
- Calls `discoverPOITypes()` which samples 6 points along the route
- Makes Google Places API calls at each sample point
- Collects all unique POI types found (tourist_attraction, cafe, museum, etc.)
- Filters to top 10 most relevant types by priority
- Formats them to user-friendly names (e.g., "tourist_attraction" → "Tourist Attractions")

### 2. Selection UI - StoreTypesSelector
A new bottom sheet component (`StoreTypesSelector.tsx`) displays:
- **Store type cards** showing real data from the route
- **Icon** - Emoji representation (☕ for cafes, 🏛️ for museums, etc.)
- **Name** - User-friendly store type name
- **Description** - What makes this POI type interesting
- **Counter** - Shows how many types were found along the route

### 3. User Selection Flow
```
Route Generated
    ↓
Discover POI Types (API call)
    ↓
Show StoreTypesSelector (if types found)
    ↓
User selects a store type
    ↓
Search for POIs of that type
    ↓
Show Route Preview
```

### 4. Fallback Behavior
If no POI types are discovered, the app falls back to the original VibeSelector with predefined vibes.

## Files Modified/Created

### New Files
- **src/components/StoreTypesSelector.tsx** - New component displaying actual store types

### Modified Files
- **app/(tabs)/index.tsx**
  - Imported `StoreTypesSelector`
  - Added `handleStoreTypeSelect()` function
  - Updated selection UI to show StoreTypesSelector when POI types available
  - Modified `searchPOIsForVibe()` to accept store types as strings

- **src/types/detour.ts**
  - Changed `Interest` type from restricted union to `string` to support any POI type

## API Integration

The implementation leverages existing Google Places API data:

```typescript
// discoverPOITypes() in DetourService.ts:
1. Sample 6 points along route
2. Call Places API at each point
3. Collect all POI types from results
4. Filter to whitelisted tourist-friendly types
5. Sort by interest priority + frequency
6. Take top 10 types
7. Format to friendly names
```

## Store Type Mapping

The StoreTypesSelector includes:
- **Emoji Icons** for 40+ store types
- **Descriptive text** for each type
- **Priority ordering** - Most interesting first

Examples:
- 🏛️ Museums → "Historical and cultural collections"
- ☕ Cafés → "Coffee shops and casual dining"
- 🎨 Art Galleries → "Curated art exhibitions and displays"
- 🌳 Parks → "Green spaces and recreation areas"

## User Experience Improvements

✅ **Transparency** - Users see real data about what's along their route
✅ **Relevance** - Only shows types that actually exist on the route
✅ **No Guessing** - Eliminates predefined vibe categories
✅ **Discovery** - Users might explore types they hadn't considered
✅ **Dynamic** - Different routes show different type options

## Example Flow

```
User: "Take me from Coffee Shop A to Restaurant B"
     ↓
App: Finds route, discovers these types:
     - 🏛️ Tourist Attractions (5 found)
     - 🍽️ Restaurants (8 found)
     - ☕ Cafés (6 found)
     - 🎨 Art Galleries (3 found)
     - 🌳 Parks (2 found)
     ↓
User: Clicks "🎨 Art Galleries"
     ↓
App: Shows all 3 art galleries along the route with details
     ↓
Result: Detoured through art galleries!
```
