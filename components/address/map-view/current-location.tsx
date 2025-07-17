import { View, StyleSheet, Dimensions } from "react-native";
import { useRef } from "react";
import theme from "../../../styles/theme.style";
import MapView from "react-native-maps";
import Icon from "../../icon";
import themeStyle from "../../../styles/theme.style";

export type TProps = {
  region: any;
  onRegionChange?: (region: any) => void;
  onRegionChangeComplete?: (region: any) => void;
  draggable?: boolean;
};

export const MapViewCurrentLocation = ({
  region,
  onRegionChange,
  onRegionChangeComplete,
  draggable = false
}: TProps) => {
  const mapRef = useRef<MapView>(null);
  // console.log('region', region);
  return (
    <View style={{ alignItems: "center", paddingHorizontal: 1, width: "100%", flex: 1 }}>
      <View style={styles.mapViewContainer}>
        <MapView
          ref={mapRef}
          style={styles.mapContainer}
          region={region}
          onRegionChange={onRegionChange}
          onRegionChangeComplete={onRegionChangeComplete}
          zoomEnabled={true}
          showsUserLocation={true}
          
        />
        {/* Centered marker overlay */}
        <View pointerEvents="none" style={styles.centeredMarkerOverlay}>
          <View style={styles.customMarker}>
            <View style={styles.markerBackground}>
              <Icon
                icon="location-drag"
                size={40}
                color={themeStyle.SECONDARY_COLOR}
              />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mapContainer: {
    width: "100%",
    height: "100%",
    minHeight: "100%",
  },
  mapViewContainer: {
    width: "100%",
    height: "100%",
    minHeight: "100%",
    alignSelf: "center",
    flex: 1,
  },
  customMarker: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 60,
  },
  markerBackground: {
    padding: 8,
  },
  centeredMarkerOverlay: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    transform: [
        { translateX: 30 }, // Adjust based on the actual width
        { translateY:-30 }, // Adjust based on the actual height
      ],
    zIndex: 1000,
    pointerEvents: 'none',

  },
});
