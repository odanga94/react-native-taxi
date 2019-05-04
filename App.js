import React, { Component } from 'react';
import { View, StyleSheet, Text, TouchableWithoutFeedback, Button} from 'react-native';
import { AppLoading, Font } from 'expo';
import Driver from './screens/Driver'
import Passenger from './screens/Passenger';
import { YellowBox } from 'react-native';
import genericContainer from './components/GenericContainer';

const DriverWithGenericContainer = genericContainer(Driver);
const PassengerWithGenericContainer = genericContainer(Passenger);

console.ignoredYellowBox = ['Remote debugger'];
YellowBox.ignoreWarnings([
    'Unrecognized WebSocket connection option(s) `agent`, `perMessageDeflate`, `pfx`, `key`, `passphrase`, `cert`, `ca`, `ciphers`, `rejectUnauthorized`. Did you mean to put these under `headers`?'
]);

export default class App extends Component {
  constructor(props){
    super(props);
    this.state = {
      isReady: false,
      isDriver: false,
      isPassenger: false
    };
    
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

    if (this.state.isDriver){
      return <DriverWithGenericContainer/>
    } else if(this.state.isPassenger) {
      return <PassengerWithGenericContainer/>
    }

    return (
      <View style={styles.container}>
        <Button onPress={() => this.setState({isPassenger: true})} title="Passenger" />
        <Button onPress={() => this.setState({isDriver: true})} title="Driver" />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 50
  }
});

