import React, { Component } from 'react';
import { View, StyleSheet, TouchableOpacity, Image, Text } from 'react-native';
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
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(name, value){
    this.setState({
        [name]: value
    });
  } 

  render(){
    if (this.state.isDriver){
      return <DriverWithGenericContainer token={this.props.token}/> 
    } else if(this.state.isPassenger) {
      return <PassengerWithGenericContainer token={this.props.token}/>
    }

    return (
      <View style={styles.container}>
        <TouchableOpacity 
          style={[styles.choiceContainer, {borderBottomWidth: 1}]}
          onPress={() => this.handleChange('isDriver', true)}
        >
          <Text style={styles.choiceText}>I'm a Driver</Text>
          <Image source={require('../assets/steeringwheel.png')} style={styles.selectionImage} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.choiceContainer}
          onPress={() => this.handleChange('isPassenger', true)}
        >
          <Text style={styles.choiceText}>I'm a Passenger</Text>
          <Image source={require('../assets/passenger.png')} style={styles.selectionImage} />
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#e8e8e8'
    },

    choiceContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center'
    },

    selectionImage: {
      height: 200,
      width: 200
    },

    choiceText: {
      color: 'rgb(25, 31, 76)',
      fontFamily: 'Poppins',
      fontSize: 32
    }
  });