import React, { Component } from 'react'
import { Text, StyleSheet, View, TextInput, TouchableOpacity } from 'react-native'

export default class LoginForm extends Component {
  render() {
    return (
      <View>
        <TextInput 
            style={styles.input} 
            placeholder='your@email.com'
            keyboardType='email-address'
            autoCapitalize='none'
            autoCorrect={false}
            value={this.props.email}
            onChangeText={(email) => {this.props.handleChange('email', email)}}
        />
        <TextInput 
            style={styles.input} 
            autoCapitalize='none' 
            autoCorrect={false} 
            secureTextEntry 
            placeholder='Password'
            value={this.props.password}
            onChangeText={(password) => {this.props.handleChange('password', password)}}
        />
        <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Sign In</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Create Account</Text>
        </TouchableOpacity>
      </View>
    )
  }
}

const styles = StyleSheet.create({
    input: {
        height: 50,
        borderWidth: 2,
        borderColor: '#4bc1bc',
        fontFamily: 'Poppins',
        padding: 10,
        marginBottom: 10,
        marginHorizontal: 5,
        borderRadius: 4,
        fontSize: 18
    },
    button: {
        backgroundColor: 'rgb(25, 31, 76)',
        paddingVertical: 20,
        marginHorizontal: 5,
        marginVertical: 10
    },
    buttonText: {
        color: '#fff',
        textAlign: 'center',
        fontSize: 23,
        fontFamily: 'Poppins'
    }

})
