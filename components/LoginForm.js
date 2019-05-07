import React, { Component } from 'react'
import { Text, StyleSheet, View, TextInput, TouchableOpacity } from 'react-native'

export default class LoginForm extends Component {
  render() {
    return (
      <View>
        <Text style={styles.formLabel}>Email:</Text>
        <TextInput 
            style={styles.input} 
            placeholder='your@email.com'
            placeholderTextColor='#a9a9a9'
            keyboardType='email-address'
            autoCapitalize='none'
            autoCorrect={false}
            value={this.props.email}
            onChangeText={(email) => {this.props.handleChange('email', email)}}
        />
        <Text style={styles.formLabel}>Password:</Text>
        <TextInput 
            style={styles.input} 
            autoCapitalize='none' 
            autoCorrect={false} 
            secureTextEntry 
            placeholder='Password'
            placeholderTextColor='#a9a9a9'
            value={this.props.password}
            onChangeText={(password) => {this.props.handleChange('password', password)}}
        />
        <TouchableOpacity onPress={this.props.handleSignIn} style={styles.button}>
            <Text style={styles.buttonText}>Sign In</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={this.props.handleSignUp} style={styles.button}>
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
        marginVertical: 7
    },
    buttonText: {
        color: '#fff',
        textAlign: 'center',
        fontSize: 23,
        fontFamily: 'Poppins'
    },
    formLabel: {
      fontSize: 23,
      color: 'rgb(25, 31, 76)',
      marginHorizontal: 5,
      marginBottom: 5

    }
})
