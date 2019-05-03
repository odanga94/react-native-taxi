import React, { Component } from 'react';
import { View, StyleSheet, Text, ActivityIndicator, Image, Linking, Platform, Alert } from 'react-native';
import { MapView, Location, Permissions} from 'expo';
import PolyLine from '@mapbox/polyline';
import apiKey from '../googleapikey';
import socketIO from 'socket.io-client';
import BottomButton from '../components/BottomButton';
import BackgroundGeolocation from '@mauron85/react-native-background-geolocation';


export default class Driver extends Component {
  constructor(props){
    super(props);
    this.state = {
      locationResult: null,
      location: {coords: { latitude: -1.28333, longitude: 36.8219}},
      isReady: false,
      pointCoords: [],
      lookingForPassenger: false,
      passengerFound : false,
      routeResponse: null
    };
    this._getLocationAsync = this._getLocationAsync.bind(this);
    this.getRouteDirections = this.getRouteDirections.bind(this);
    this.lookForPassenger = this.lookForPassenger.bind(this);
    this.acceptPassengerRequest = this.acceptPassengerRequest.bind(this);
    this.socket = null;
  }

  componentDidMount() {
    this._getLocationAsync();
    BackgroundGeolocation.configure({
      desiredAccuracy: BackgroundGeolocation.HIGH_ACCURACY,
      stationaryRadius: 50,
      distanceFilter: 50,
      debug: false,
      startOnBoot: false,
      stopOnTerminate: true,
      locationProvider: BackgroundGeolocation.ACTIVITY_PROVIDER,
      interval: 10000,
      fastestInterval: 5000,
      activitiesInterval: 10000,
      stopOnStillActivity: false,
    });

    BackgroundGeolocation.on('authorization', (status) => {
      console.log('[INFO] BackgroundGeolocation authorization status: ' + status);
      if (status !== BackgroundGeolocation.AUTHORIZED) {
        // we need to set delay or otherwise alert may not be shown
        setTimeout(() =>
          Alert.alert('App requires location tracking permission', 'Would you like to open app settings?', [
            { text: 'Yes', onPress: () => BackgroundGeolocation.showAppSettings() },
            { text: 'No', onPress: () => console.log('No Pressed'), style: 'cancel' }
          ]), 1000);
      }
    });

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

  async getRouteDirections(destinationPlaceId){
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
      this.setState({pointCoords});
      this.map.fitToCoordinates(pointCoords, {edgePadding: {top: 10, bottom: 10, left: 10, right: 10}})

    } catch(error){
      console.error(error)
    }
  }

  async lookForPassenger(){
    if(!this.state.lookingForPassenger){
      this.setState({lookingForPassenger: true});
      this.socket = socketIO.connect('http://10.112.15.153:3000');

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
    console.log(this.state.location);
    //this.socket.emit('driverLocation', {latitude: this.state.location.coords.latitude, longitude: this.state.location.coords.longitude});

    const passengerLocation = this.state.pointCoords[this.state.pointCoords.length - 1];

    BackgroundGeolocation.checkStatus(status => {
         // you don't need to check status before start (this is just the example)
      if (!status.isRunning) {
        BackgroundGeolocation.start(); //triggers start on start event
      }
    });

    BackgroundGeolocation.on('location', (location) => {
      // Send driver location to passenger
      this.socket.emit('driverLocation', {latitude: location.latitude, longitude: location.longitude});
    });

    if (Platform.OS === 'ios'){
      Linking.openURL(`http://maps.apple.com/?daddr=${passengerLocation.latitude},${passengerLocation.longitude}`);
    } else{
      Linking.openURL(`https://www.google.com/maps/dir/api=1&destination=${passengerLocation.latitude},${passengerLocation.longitude}`);
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

