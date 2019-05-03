import React, { Component } from 'react';
import { View, StyleSheet, TextInput, Text, TouchableWithoutFeedback, Keyboard, ActivityIndicator} from 'react-native';
import { MapView, Location, Permissions} from 'expo';
import PolyLine from '@mapbox/polyline';
import apiKey from '../googleapikey';
import _ from 'lodash';
import socketIO from 'socket.io-client';
import BottomButton from '../components/BottomButton';

export default class Passenger extends Component {
  constructor(props){
    super(props);
    this.state = {
      locationResult: null,
      location: {coords: { latitude: -1.28333, longitude: 36.8219}},
      destination: "",
      predictions: [],
      isReady: false,
      pointCoords: [], 
      routeResponse: null,
      lookingForDriver: false
    };
    this._getLocationAsync = this._getLocationAsync.bind(this);
    this.onChangeDestinationDebounced = _.debounce(this.onChangeDestination.bind(this), 250);
    this.getRouteDirections = this.getRouteDirections.bind(this);
    this.requestDriver = this.requestDriver.bind(this);
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
    const apiUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?key=${apiKey}&input=${destination}&location=${this.state.location.coords.latitude},${this.state.location.coords.longitude}&radius=2000`;
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
      const apiUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${this.state.location.coords.latitude},${this.state.location.coords.longitude}&destination=place_id:${destinationPlaceId}&key=${apiKey}`;
      const response = await fetch(apiUrl);
      const json = await response.json();
      console.log(json);
      const points = PolyLine.decode(json.routes[0].overview_polyline.points);
      const pointCoords = points.map((point) => {
        return {latitude: point[0], longitude: point[1]}
      });
      this.setState({pointCoords, predictions: [], destination: destinationName, routeResponse: json });
      Keyboard.dismiss();
      this.map.fitToCoordinates(pointCoords, {edgePadding: {top: 10, bottom: 10, left: 10, right: 10}})

    } catch(error){
      console.error(error)
    }
  }

  async requestDriver(){
    this.setState({lookingForDriver: true});
    const socket = socketIO.connect('http://192.168.100.3:3000');
    socket.on('connect', () => {
      console.log('client connected');
      //Request a Taxi
      socket.emit('taxiRequest', this.state.routeResponse);
    })
  }

  render() {
    let marker = null;
    let getDriver = null;
    let findingDriverActIndicator = null;

    if(this.state.lookingForDriver){
      findingDriverActIndicator = (
        <ActivityIndicator size='large' animating={this.state.lookingForDriver} />
      )
    }

    if (this.state.pointCoords.length > 1){
      marker = (
        <MapView.Marker coordinate={this.state.pointCoords[this.state.pointCoords.length - 1]}/>
      );
      getDriver = (
        <BottomButton onPressFunction={() => this.requestDriver()} buttonText="REQUEST 🚗">
          {findingDriverActIndicator}
        </BottomButton>
      )
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
        <TextInput placeholder="Enter destination..." value={this.state.destination} onChangeText={(destination) => {
          this.setState({destination})
          this.onChangeDestinationDebounced(destination);
          }} 
          style={styles.destinationInput} 
        />
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
        {getDriver}
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
  }
});

