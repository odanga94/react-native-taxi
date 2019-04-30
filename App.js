import React, { Component } from 'react';
import { View, StyleSheet, TextInput, Text, TouchableWithoutFeedback, Keyboard} from 'react-native';
import { MapView, Location, Permissions, Font, AppLoading } from 'expo';
import PolyLine from '@mapbox/polyline';

export default class App extends Component {
  constructor(props){
    super(props);
    this.state = {
      locationResult: null,
      location: {coords: { latitude: -1.28333, longitude: 36.8219}},
      destination: "",
      predictions: [],
      isReady: false,
      pointCoords: []
    };
    this._getLocationAsync = this._getLocationAsync.bind(this);
    this.onChangeDestination = this.onChangeDestination.bind(this);
    this.getRouteDirections = this.getRouteDirections.bind(this);
  }

  componentDidMount() {
    this._getLocationAsync();

  }

  _getLocationAsync = async () => {
   let { status } = await Permissions.askAsync(Permissions.LOCATION);
   if (status !== 'granted') {
     this.setState({
       locationResult: 'Permission to access location was denied',
       location,
     });
   }

   let location = await Location.getCurrentPositionAsync({});
   this.setState({ locationResult: JSON.stringify(location), location, });
 };

  async onChangeDestination(destination){
    this.setState({destination});
    const apiUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?key=AIzaSyDt7qwORX_pf-TMY7X8WaI5idZz1UV2Q94&input=${destination}&location=${this.state.location.coords.latitude},${this.state.location.coords.longitude}&radius=2000`;
    try{
      const result = await fetch(apiUrl);
      const json = await result.json();
      // console.log(json);
      this.setState({
        predictions: json.predictions
      })
    } catch(err){
      console.error(err);
    }
  }

  async getRouteDirections(destinationPlaceId, destinationName){
    try{
      // console.log(this.state.predictions);
      const apiUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${this.state.location.coords.latitude},${this.state.location.coords.longitude}&destination=place_id:${destinationPlaceId}&key=AIzaSyDt7qwORX_pf-TMY7X8WaI5idZz1UV2Q94`;
      const response = await fetch(apiUrl);
      const json = await response.json();
      console.log(json);
      const points = PolyLine.decode(json.routes[0].overview_polyline.points);
      const pointCoords = points.map((point) => {
        return {latitude: point[0], longitude: point[1]}
      });
      this.setState({pointCoords, predictions: [], destination: destinationName });
      Keyboard.dismiss();
      this.map.fitToCoordinates(pointCoords, {edgePadding: {top: 10, bottom: 10, left: 10, right: 10}})

    } catch(error){
      console.error(error)
    }
  }

  async cacheResourcesAsync(){
    Font.loadAsync({Poppins: require('./assets/Poppins-Regular.ttf')})
  }

  render() {
    if(!this.state.isReady){
      return(
        <AppLoading
        startAsync={this.cacheResourcesAsync}
        onFinish={() => this.setState({ isReady: true })}
        onError={console.warn}
        />
      );
    }
  

    return (
      <View style={styles.container}>
        <MapView
          ref={map => {this.map = map}}
          style={styles.map}
          initialRegion={{
            latitude: this.state.location.coords.latitude,
            longitude: this.state.location.coords.longitude,
            latitudeDelta: 0.5,
            longitudeDelta: 0.5
          }}      
          onUserLocationChange={this._getLocationAsync}
          showsUserLocation={true}
        >
          <MapView.Marker
            coordinate={this.state.location.coords}
            title="Current Location"
            description="Some description"
          />
          <MapView.Polyline
            coordinates={this.state.pointCoords}
            strokeWidth={2}
            strokeColor="red"
          />
          {
            this.state.pointCoords.length > 1 ? (
              <MapView.Marker coordinate={this.state.pointCoords[this.state.pointCoords.length -1]} title={this.state.destination}/>
            ) : null
          }
        </MapView>   
        <TextInput placeholder="Enter destination..." value={this.state.destination} onChangeText={(destination) => this.onChangeDestination(destination)} style={styles.destinationInput} />
        {this.state.predictions ? 
          this.state.predictions.map((prediction) =>  {
            return(
              <TouchableWithoutFeedback key={prediction.id} onPress={() => this.getRouteDirections(prediction.place_id, prediction.structured_formatting.main_text)}>
                <View>
                  <Text style={styles.suggestions}>{prediction.description}</Text>
                </View>
              </TouchableWithoutFeedback>
            )
          }): null
        }
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject
  },
  map: {
    ...StyleSheet.absoluteFillObject
  },

  destinationInput: {
    height: 40,
    borderWidth: 0.5,
    marginTop: 50,
    marginLeft: 5,
    marginRight: 5,
    backgroundColor: 'white',
    padding: 5,
    fontSize: 18
  },

  suggestions: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    padding: 5,
    fontSize: 18,
    borderWidth: 0.5,
    marginLeft: 5,
    marginRight: 5,
    fontFamily: 'Poppins'
  },
});

