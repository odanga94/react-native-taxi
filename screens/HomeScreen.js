import React, { Component } from 'react';
import { View, StyleSheet, Button, YellowBox} from 'react-native';
import Driver from './Driver'
import Passenger from './Passenger';
import genericContainer from '../components/GenericContainer';

const DriverWithGenericContainer = genericContainer(Driver);
const PassengerWithGenericContainer = genericContainer(Passenger);

export default class HomeScreen extends Component{
  constructor(props){
    super(props);
    this.state = {
      isDriver: false,
      isPassenger: false
    };
    
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