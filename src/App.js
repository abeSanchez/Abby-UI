import React, { Component } from 'react';
import './App.css';
import ROSLIB from 'roslib';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      throttle: 0,
      steeringAngle: 0,
      selectedMode: 'User Mode'
    }

    this.twistSub = this.twistSub.bind(this);
    this.modeSub = this.modeSub.bind(this);

    const ros = new ROSLIB.Ros({
      url : 'ws://localhost:9090'
    });

    ros.on('connection', function() {
      console.log('Connected to websocket server.');
    });

    ros.on('error', function(error) {
      console.log('Error connecting to websocket server: ', error);
    });

    ros.on('close', function() {
      console.log('Connection to websocket server closed.');
    });

    const listener = new ROSLIB.Topic({
      ros: ros,
      name: 'turtle1/cmd_vel',
      messageType: 'geometry_msgs/Twist'
    });

    listener.subscribe(this.twistSub);

    const listenerMode = new ROSLIB.Topic({
      ros: ros,
      name: 'joystick/mode',
      messageType: 'std_msgs/Int32'
    });

    listenerMode.subscribe(this.modeSub);
  }

  twistSub(message) {
    this.setState({
      throttle: message.linear.x,
      steeringAngle: message.angular.z
    });
  }

  modeSub(message) {
    let mode: String;

    if (message.data === 1)
      mode = 'User Mode';
    if (message.data === 2)
      mode = 'Cruise Mode';
    if (message.data === 3)
      mode = 'Autopilot Mode';
    if (message.data === 4)
      mode = 'Data Collection Mode';

    this.setState({
      selectedMode: mode
    });
  }

  render() {
    return (
      <div className="App">
        <div className="App-header">
          <div>
            <h2>{this.state.selectedMode}</h2>
          </div>
          <div className="buggy-image-container">
            <img src="buggyAbove.png" className="buggy-image" alt="logo" />
          </div>
          <div>
            <h2>Throttle: {parseFloat(this.state.throttle).toFixed(2)}</h2>
            <h2>Steering Angle: {parseFloat(this.state.steeringAngle).toFixed(2)}</h2>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
