import React from 'react';
import {Alert, View} from 'react-native';	
import {MapView, PROVIDER_GOOGLE, Permissions, Location} from 'expo';

export default class Map extends React.Component {
  constructor(props){
    super(props)
    this.state = {region: {}}
    this.getLocationAsync = this.getLocationAsync.bind(this);
  }

  async getLocationAsync() {
    // permissions returns only for location permissions on iOS and under certain conditions, see Permissions.LOCATION
    const { status, permissions } = await Permissions.askAsync(Permissions.LOCATION);
    if (status === 'granted') {
      this.setState({region: Location.getCurrentPositionAsync({enableHighAccuracy: true})});
    } else {
      throw new Error('Location permission not granted');
    }
  }

  componentWillMount(){
    this.getLocationAsync();
  }

  render() {
    return (
        <MapView
          style={{ flex: 1 }}
          initialRegion={this.state.region}
        /> 
    );
  }
}

