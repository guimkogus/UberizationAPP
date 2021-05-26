import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import MapView, { Polyline, Marker } from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';
import PlaceInput from '../components/PlaceInput';
import axios from 'axios';
import PolyLine from '@mapbox/polyline';
import { GOOGLE_API_KEY } from '../env';

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    flex: 1
  },
  map: {
    ...StyleSheet.absoluteFillObject
  }
});

const MapScreen = () => {
  const [userLocation, setUserLocation] = useState({
    lat: 0,
    lng: 0
  });
  const [destinationCoords, setDestinationCoords] = useState([]);
  const mapRef = useRef(null);

  const hideKeboard = () => {
    Keyboard.dismiss();
  };

  const parseUserLocationToString = () => {
    return `${userLocation.lat},${userLocation.lng}`;
  };

  const requestAnimationFrame = (origin, destination) => {
    mapRef.current.fitToCoordinates([origin, destination]);
  };

  const showDirectionsOnMap = async placeId => {
    const directionResults = await axios.get(
      `https://maps.googleapis.com/maps/api/directions/json?key=${GOOGLE_API_KEY}&origin=${parseUserLocationToString()}&destination=place_id:${placeId}`
    );

    const points = PolyLine.decode(
      directionResults.data.routes[0].overview_polyline.points
    );

    const latLngList = points.map(point => ({
      latitude: point[0],
      longitude: point[1]
    }));

    setDestinationCoords(latLngList);
    requestAnimationFrame(latLngList[0], latLngList[latLngList.length - 1]);
  };

  useEffect(() => {
    const locationWhatchId = Geolocation.watchPosition(
      position => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      error => console.warn(error),
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000
      }
    );

    return () => {
      Geolocation.clearWatch(locationWhatchId);
    };
  }, [setUserLocation, userLocation]);

  return (
    <View style={styles.container}>
      <TouchableWithoutFeedback onPress={hideKeboard}>
        <MapView
          ref={mapRef}
          showsUserLocation
          followsUserLocation
          style={styles.map}
          region={{
            latitude: userLocation.lat,
            longitude: userLocation.lng,
            latitudeDelta: 0.015,
            longitudeDelta: 0.0121
          }}>
          {destinationCoords.length > 0 && (
            <>
              <Polyline
                coordinates={destinationCoords}
                strokeWidth={5}
                strokeColor="#000"
              />
              <Marker
                coordinate={destinationCoords[destinationCoords.length - 1]}
              />
            </>
          )}
        </MapView>
      </TouchableWithoutFeedback>
      <PlaceInput
        showDirectionsOnMap={showDirectionsOnMap}
        locationString={parseUserLocationToString()}
      />
    </View>
  );
};

export default MapScreen;
