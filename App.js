import React, { Component } from 'react';
import {YellowBox} from 'react-native';
import { AppLoading, Font, Asset } from 'expo';
import { createAppContainer, createStackNavigator } from 'react-navigation';
import HomeScreen from './screens/HomeScreen';
import Login from './screens/Login';

console.ignoredYellowBox = ['Remote debugger'];
YellowBox.ignoreWarnings([
    'Unrecognized WebSocket connection option(s) `agent`, `perMessageDeflate`, `pfx`, `key`, `passphrase`, `cert`, `ca`, `ciphers`, `rejectUnauthorized`. Did you mean to put these under `headers`?'
]);

/* const RootStack = createStackNavigator(
  {
    Login: {
      screen: Login,
      navigationOptions: ({ navigation }) => ({
        header: null
      })
    },
    Home: {
      screen: HomeScreen,
      navigationOptions: ({ navigation }) => ({
        header: null
      })
    }
  },
  {
    initialRouteName: 'Login'
  }
); 

const AppContainer = createAppContainer(RootStack); */

export default class App extends Component {
  constructor(props){
    super(props);
    this.state = {
      isReady: false,
      token: ''
    }
    this.handleChangeToken = this.handleChangeToken.bind(this);
  }
  
  async cacheResourcesAsync(){
    await Font.loadAsync({Poppins: require('./assets/Poppins-Regular.ttf')});
    const images = [
      require('./assets/car.png'),
      require('./assets/person-marker.png'),
      require('./assets/taxi-icon.png'),
      require('./assets/passenger.png'),
      require('./assets/steeringwheel.png')
    ]

    const cacheImages = images.map((image) => {
      return Asset.fromModule(image).downloadAsync();
    });
    return Promise.all(cacheImages); 
  }
  
  handleChangeToken(token){
    this.setState({ token });
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
    if (this.state.token === ''){
      return <Login handleChangeToken={this.handleChangeToken}/>
    }
    return <HomeScreen token={this.state.token}/>
  }
}



