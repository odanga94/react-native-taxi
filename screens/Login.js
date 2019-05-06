import React, { Component } from 'react';
import { Text, StyleSheet, View } from 'react-native';
import LoginForm from '../components/LoginForm';

export default class Login extends Component {
  constructor(props){
      super(props);
      this.state = {
          email: '',
          password: '',
          errorMessage: ''
      }
      this.handleChange = this.handleChange.bind(this);
  }

  handleChange(name, value){
      this.setState({
          [name]: value
      })
  }
  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.headerText}> TaxiApp </Text>
        <LoginForm email={this.state.email} password={this.state.password} handleChange={this.handleChange}/>
      </View>
    )
  }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerText: {
        fontSize: 44,
        color: 'rgb(25, 31, 76)',
        marginTop: 30,
        textAlign: 'center',
        fontWeight: "200",
        fontFamily: 'Poppins'
    }
})
