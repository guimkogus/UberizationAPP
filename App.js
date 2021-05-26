import React, { useState, useEffect } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import MapScreen from './screens/MapScreen';

const App = () => {
  const [hasLocationPermition, setLocationPermition] = useState(false);

  const requestLocationPermition = async () => {
    if (Platform.OS === 'android') {
      const permitionResponse = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      const isPermitionGranted =
        permitionResponse === PermissionsAndroid.RESULTS.GRANTED;

      setLocationPermition(isPermitionGranted);
      return;
    }

    setLocationPermition(true);
  };

  useEffect(() => {
    requestLocationPermition();
  }, []);

  return <>{hasLocationPermition && <MapScreen />}</>;
};

export default App;
