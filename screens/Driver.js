import React, { Component } from 'react';
import { View, StyleSheet, Text, ActivityIndicator, Image, Linking, Platform } from 'react-native';
import { MapView, Location, TaskManager} from 'expo';
import PolyLine from '@mapbox/polyline';
import apiKey from '../googleapikey';
import socketIO from 'socket.io-client';
import BottomButton from '../components/BottomButton';

let locationsArray = [];
TaskManager.defineTask('locationUpdates', ({data: { locations }, error}) => {
  if (error){
    console.log(error);
    return;
  }
  locationsArray = locations;
})



export default class Driver extends Component {
  constructor(props){
    super(props);
    this.state = {
      isReady: false,
      pointCoords: [],
      lookingForPassenger: false,
      passengerFound : false,
      routeResponse: null
    };
    this.getRouteDirections = this.getRouteDirections.bind(this);
    this.lookForPassenger = this.lookForPassenger.bind(this);
    this.acceptPassengerRequest = this.acceptPassengerRequest.bind(this);
    this.socket = null;
  }

  
  componentWillUnmount(){
    Location.stopLocationUpdatesAsync('locationUpdates');
  }

  async getRouteDirections(destinationPlaceId){
    try{
      // console.log(this.state.predictions);
      const apiUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${this.props.location.coords.latitude},${this.props.location.coords.longitude}&destination=place_id:${destinationPlaceId}&key=${apiKey}`;
      const response = await fetch(apiUrl);
      const json = await response.json();
      console.log(json);
      const points = PolyLine.decode(json.routes[0].overview_polyline.points);
      const pointCoords = points.map((point) => {
        return {latitude: point[0], longitude: point[1]}
      });
      this.setState({pointCoords});
      this.map.fitToCoordinates(pointCoords, {edgePadding: {top: 20, bottom: 20, left: 20, right: 20}})

    } catch(error){
      console.log(error)
    }
  }

  async lookForPassenger(){
    if(!this.state.lookingForPassenger){
      this.setState({lookingForPassenger: true});
      this.socket = socketIO.connect('http://192.168.100.3:3000');

      this.socket.on('connect', () => {
        console.log('Driver connected');
        this.socket.emit('lookingForPassenger');
      });

      this.socket.on('taxiRequest', (routeResponse) => {
        console.log(routeResponse);
        this.setState({lookingForPassenger: false, passengerFound: true, routeResponse});
        this.getRouteDirections(routeResponse.geocoded_waypoints[0].place_id);
      });
    }
  }

  acceptPassengerRequest(){
    console.log(this.props.location);
    this.socket.emit('driverLocation', {latitude: this.props.location.coords.latitude, longitude: this.props.location.coords.longitude});

    const passengerLocation = this.state.pointCoords[this.state.pointCoords.length - 1];
    Location.startLocationUpdatesAsync('locationUpdates', {accuracy: 3, timeInterval: 5000});
    setInterval(() => {
      let latestLatitude = locationsArray[locationsArray.length - 1].coords.latitude;
      let latestLongitude = locationsArray[locationsArray.length -1].coords.longitude;
      this.socket.emit('driverLocation', {latitude: latestLatitude, longitude: latestLongitude});
    }, 10000);
    
    if (Platform.OS === 'ios'){
      Linking.openURL(`http://maps.apple.com/?daddr=${passengerLocation.latitude},${passengerLocation.longitude}`);
    } else{
      Linking.openURL(`geo:0,0?q=${passengerLocation.latitude},${passengerLocation.longitude}(Passenger)`);
      // `https://www.google.com/maps/dir/api=1&destination=${passengerLocation.latitude},${passengerLocation.longitude}`
    }
  }

  render() {
    let endMarker = null;
    let startMarker = null;
    let findPassengerActIndicator = null;
    let passengerSearchText = "FIND PASSENGER 👥";
    let bottomButtomFunction = this.lookForPassenger;


    if (this.state.lookingForPassenger){
      passengerSearchText = 'FINDING PASSENGER...';
      findPassengerActIndicator = (
        <ActivityIndicator size='large' animating={this.state.lookingForPassenger} />
      );
    }

    if (this.state.passengerFound){
      passengerSearchText = 'FOUND PASSENGER! ACCEPT RIDE?';
      bottomButtomFunction = this.acceptPassengerRequest;
    }

    if(this.state.pointCoords.length > 1){
      endMarker = (
        <MapView.Marker coordinate={this.state.pointCoords[this.state.pointCoords.length -1]}>
          <Image style={{width: 40, height: 40}} source={require('../assets/person-marker.png')} />
        </MapView.Marker>
      )
    }

    return (
      <View style={styles.container}>
        <MapView
          ref={map => {this.map = map}}
          style={styles.map}
          initialRegion={{
            latitude: this.props.location.coords.latitude,
            longitude: this.props.location.coords.longitude,
            latitudeDelta: 0.2,
            longitudeDelta: 0.2
          }}    
          onUserLocationChange={this._getLocationAsync}
          showsUserLocation={true}
        >
          <MapView.Polyline
            coordinates={this.state.pointCoords}
            strokeWidth={2}
            strokeColor="red"
          />
          {endMarker}
          {startMarker}
        </MapView>   
        <BottomButton onPressFunction={bottomButtomFunction} buttonText={passengerSearchText}>
          {findPassengerActIndicator}
        </BottomButton>

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

  bottomButton: {
    backgroundColor: 'black',
    marginTop: 'auto',
    marginBottom: 20,
    padding: 15,
    paddingLeft: 30,
    paddingRight: 30,
    alignSelf: 'center'
  },

  bottomButtonText: {
    color: 'white',
    fontSize: 18,
  }
});

