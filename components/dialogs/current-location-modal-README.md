# Current Location Modal - Dragging Functionality

## Overview
The Current Location Modal now supports dragging the location marker to allow users to manually adjust their location on the map.

## Features Added

### 1. Draggable Marker
- The map marker is now draggable by default
- Users can tap and drag the marker to adjust their location
- The marker changes color to indicate it's interactive (blue when draggable, red when not)

### 2. Real-time Location Updates
- Location coordinates update in real-time as the user drags the marker
- The selected location is stored separately from the GPS location
- Visual feedback shows when the location has been manually adjusted

### 3. Visual Indicators
- **Drag Instruction**: Text instructing users to drag the marker
- **Location Adjusted Indicator**: Shows when the location differs from GPS coordinates
- **Animated Feedback**: The location info section pulses when location is adjusted
- **Color-coded Marker**: Blue marker indicates draggable state

### 4. Reset Functionality
- "Reset to GPS" button appears when location has been manually adjusted
- Allows users to quickly return to their original GPS coordinates
- Only visible when the location differs from GPS coordinates

### 5. Enhanced UI
- Header with close button for better UX
- Improved button layout with flex-wrap for multiple buttons
- Better spacing and visual hierarchy

## Technical Implementation

### MapViewCurrentLocation Component Changes
- Added `onLocationChange` callback prop
- Added `draggable` prop (defaults to true)
- Added `handleMarkerDragEnd` event handler
- Added state management for dragged location
- Removed `pointerEvents="none"` to enable interaction

### CurrentLocationModal Component Changes
- Added `selectedLocation` state to track manually adjusted location
- Added `handleLocationChange` callback
- Added `handleResetToGPS` function
- Added `isLocationAdjusted` logic to detect manual adjustments
- Enhanced UI with visual indicators and animations

## Usage

1. **Open the modal**: The modal opens when the `OPEN_CURRENT_LOCATION_MODAL` event is emitted
2. **Drag the marker**: Users can tap and drag the blue marker to adjust their location
3. **View coordinates**: Real-time coordinate updates are displayed
4. **Reset if needed**: Use "Reset to GPS" button to return to original location
5. **Confirm location**: Use "Confirm Location" to save the selected coordinates

## Event Handling

The modal emits a `OPEN_CURRENT_LOCATION_MODAL_LOCATION_SELECTED` event with the selected location data when the user confirms their choice.

## Translation Keys

The following translation keys are used (with English fallbacks):
- `drag-marker-to-adjust-location` → "Drag the marker to adjust your location"
- `location-adjusted` → "Location manually adjusted"
- `reset-to-gps` → "Reset to GPS"

## Dependencies

- `react-native-maps` for map functionality
- `react-native-animatable` for animations
- `react-i18next` for translations 