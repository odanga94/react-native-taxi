import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet} from 'react-native'


export default class BottomButton extends React.Component{
  render(){
    return(
      <TouchableOpacity style={styles.bottomButton} onPress={this.props.onPressFunction}>
            <View>
              <Text style={styles.bottomButtonText}>{this.props.buttonText}</Text>
              {this.props.children}
            </View>
      </TouchableOpacity>
    )
  }
}

const styles = StyleSheet.create({
  bottomButton: {
    backgroundColor: "black",
    marginTop: "auto",
    margin: 20,
    padding: 15,
    paddingLeft: 30,
    paddingRight: 30,
    alignSelf: "center"
  },
  bottomButtonText: {
    fontSize: 20,
    color: "white",
    fontWeight: "600"
  }
})