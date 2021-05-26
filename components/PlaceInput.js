import React, { useState } from 'react';
import {
  StyleSheet,
  TextInput,
  View,
  Text,
  TouchableOpacity,
  Keyboard
} from 'react-native';
import axios from 'axios';
import _ from 'lodash';
import { GOOGLE_API_KEY } from '../env';

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24
  },
  textInput: {
    height: 50,
    backgroundColor: 'white',
    marginTop: 50,
    borderRadius: 10,
    padding: 10
  },
  suggestionContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderTopWidth: 0.2,
    borderColor: '#aaa'
  },
  secondaryTextSuggestion: {
    color: '#777'
  }
});

const PlaceInput = ({ showDirectionsOnMap, locationString }) => {
  const [selectedPlace, setSelectedPlace] = useState('');
  const [predictions, setPredictions] = useState([]);

  const getPlaces = input =>
    _.debounce(async () => {
      const placeResults = await axios.get(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?key=${GOOGLE_API_KEY}&input=${input}&location=${locationString}&radius=2000`
      );
      setPredictions(placeResults.data.predictions);
    }, 1000);

  const getPredictionsList = () => {
    return predictions?.map(prediction => (
      <TouchableOpacity
        key={prediction.place_id}
        onPress={() => {
          Keyboard.dismiss();
          setSelectedPlace(prediction.structured_formatting.main_text);
          showDirectionsOnMap(prediction.place_id);
          setPredictions([]);
        }}>
        <View style={styles.suggestionContainer}>
          <Text>{prediction.structured_formatting.main_text}</Text>
          <Text style={styles.secondaryTextSuggestion}>
            {prediction.structured_formatting.secondary_text}
          </Text>
        </View>
      </TouchableOpacity>
    ));
  };

  return (
    <View style={styles.container}>
      <TextInput
        autoCorrect={false}
        value={selectedPlace}
        autoCapitalize="none"
        onChangeText={input => {
          setSelectedPlace(input);
          getPlaces(input)();
        }}
        placeholder="Onde deseja ir?"
        style={styles.textInput}
      />
      {getPredictionsList()}
    </View>
  );
};

export default PlaceInput;
