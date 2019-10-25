import React, { Component } from 'react';
import './App.css';
import ROSLIB from 'roslib';
import ReactMapGL, {LinearInterpolator} from 'react-map-gl';
// import {Editor, EditorModes} from 'react-map-gl-draw';
// import d3 from 'd3-ease';

const MAPBOX_TOKEN = 'pk.eyJ1IjoiYWJlc2FuY2hleiIsImEiOiJjazF2a2ZmN3MwZmxyM2hsb29nZjY0czZ4In0.bNnJJ0-qSIBO_Cu8pfluEQ';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      ranges: [0,0,0,0,0],
      throttle: 0,
      steeringAngle: 0,
      selectedMode: 'User Mode',
      viewport: {
        width: '100%',
        height: '100%',
        latitude: 28.603882,
        longitude: -81.199260,
        zoom: 17
      }
    }

    this.twistSub = this.twistSub.bind(this);
    this.modeSub = this.modeSub.bind(this);
    this.rangesSub = this.rangesSub.bind(this);
    this.gpsSub = this.gpsSub.bind(this);

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

    const listenerRanges = new ROSLIB.Topic({
      ros: ros,
      name: 'arduino/ultrasonic_ranges',
      messageType: 'std_msgs/Int32MultiArray'
    });

    listenerRanges.subscribe(this.rangesSub);

    const listenerGPS = new ROSLIB.Topic({
      ros: ros,
      name: 'gps',
      messageType: 'sensor_msgs/NavSatFix'
    });

    listenerGPS.subscribe(this.gpsSub);
  }

  twistSub(message) {
    this.setState({
      ...this.state,
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
      ...this.state,
      selectedMode: mode
    });
  }

  rangesSub(message) {
    this.setState({
      ...this.state,
      ranges: message.data
    });
  }

  gpsSub(message) {
    console.log(message)
    this.setState({
      ...this.state,
      viewport: {
        ...this.state.viewport,
        latitude: message.latitude,
        longitude: message.longitude,
        transitionInterpolator: new LinearInterpolator()
      }
    });
  }

  render() {
    return (
      <div className="App">
        <div className="row">
          <div className="col p-0">
            <div className="App-header">
              <div>
                <h2>{this.state.selectedMode}</h2>
              </div>
              <div>
                <h2>{this.state.ranges[0]}</h2>
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
          <div className="col p-0">
            <ReactMapGL
            {...this.state.viewport}
            onViewportChange={(viewport) => this.setState({viewport})}
            mapboxApiAccessToken={MAPBOX_TOKEN}>
              {/* <Editor
                ref={_ => (this._editorRef = _)}
                style={{width: '100%', height: '100%'}}
                clickRadius={12}
                mode={mode}
                onSelect={this._onSelect}
                onUpdate={this._onUpdate}
                editHandleShape={'circle'}
                featureStyle={getFeatureStyle}
                editHandleStyle={getEditHandleStyle}
              /> */}
            </ReactMapGL>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
