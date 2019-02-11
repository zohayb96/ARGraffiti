import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  Image,
  PanResponder,
  Animated,
  Alert,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import axios from 'axios';
import Expo, { AR, takeSnapshotAsync } from 'expo';
import * as THREE from 'three';
import ExpoTHREE from 'expo-three';
import { Button } from 'react-native-elements';
import { ColorWheel } from 'react-native-color-wheel';
var hsl = require('hsl-to-hex');
import Menu, { MenuItem, MenuDivider } from 'react-native-material-menu';

console.disableYellowBox = true;

export default class CameraView extends Component {
  constructor() {
    super();
    this.state = {
      color: { h: 0, s: 0, v: 200 },
      hexColor: '#ff00000',
      shape: 'cube',
      size: 'small',
      hideButtons: true,
    };
    this.graffitiObjects = [];
    this.timer = null;
    this.findColor = this.findColor.bind(this);
    this.findShape = this.findShape.bind(this);
    this.generateLighting.bind(this);
    this.findSize = this.findSize.bind(this);
    this.addShapeWithSize = this.addShapeWithSize.bind(this);
    this.hideAllButtons = this.hideAllButtons.bind(this);
    this.undo = this.undo.bind(this);
    this.stopTimer = this.stopTimer.bind(this);
  }

  stopTimer() {
    clearTimeout(this.timer);
  }

  _menu = {};
  setMenuRef = (ref, type) => {
    this._menu[type] = ref;
  };
  hideMenu = type => {
    this._menu[type].hide();
  };
  showMenu = type => {
    this._menu[type].show();
  };

  async componentWillUnmount() {
    cancelAnimationFrame(this.gameRequest);
    try {
      this.arSession = await this._glView.stopARSessionAsync();
    } catch (err) {
      console.log(err);
    }
  }

  undo() {
    console.log(this.scene.children.length);
    if (this.scene.children.length > 3) {
      this.scene.remove(this.scene.children[this.scene.children.length - 1]);
      this.timer = setTimeout(this.undo, 50);
    }
  }

  findColor() {
    const colorHex = hsl(
      Math.round(this.state.color.h),
      Math.round(this.state.color.s),
      Math.round(this.state.color.v / 2)
    );
    this.setState({ colorHex: colorHex });
    return colorHex;
  }

  findSize() {
    if (this.state.size === 'medium') {
      return 0.04;
    } else if (this.state.size === 'large') {
      return 0.06;
    } else if (this.state.size === 'xlarge') {
      return 0.1;
    } else {
      return 0.02;
    }
  }

  findShape(sizeToUse) {
    if (this.state.shape === 'sphere') {
      return new THREE.SphereGeometry(sizeToUse, 32, 32);
    } else if (this.state.shape === 'pyramid') {
      return new THREE.TetrahedronBufferGeometry(sizeToUse, 0);
    } else if (this.state.shape === 'icosahedron') {
      return new THREE.IcosahedronGeometry(sizeToUse, 0);
    } else if (this.state.shape === 'octahedron') {
      return new THREE.OctahedronGeometry(sizeToUse, 0);
    } else if (this.state.shape === 'ring') {
      return new THREE.TorusGeometry(
        sizeToUse,
        sizeToUse / 4,
        sizeToUse / 2,
        100
      );
    } else if (this.state.shape === 'knot') {
      return new THREE.TorusKnotBufferGeometry(
        sizeToUse,
        sizeToUse / 3,
        100,
        sizeToUse * 8
      );
    } else {
      return new THREE.BoxGeometry(sizeToUse, sizeToUse, sizeToUse);
    }
  }

  hideAllButtons() {
    this.setState({ hideButtons: !this.state.hideButtons });
  }

  generateLighting(scene) {
    const leftLight = new THREE.DirectionalLight(0xffffff);
    const rightLight = new THREE.DirectionalLight(0xffffff);
    const frontLight = new THREE.DirectionalLight(0xffffff);
    const light = new THREE.HemisphereLight(0xffffbb, 0x080820, 1);
    const plight = new THREE.PointLight(0x000000, 1, 100);
    const ambLight = new THREE.AmbientLight(0x404040);
    leftLight.position.set(-3, 5, 0).normalize();
    rightLight.position.set(3, 5, 0).normalize();
    frontLight.position.set(0, 0, 0).normalize();
    plight.position.set(50, 50, 50);
    this.scene.add(leftLight);
    this.scene.add(rightLight);
    this.scene.add(frontLight);
    this.scene.add(ambLight);
    this.scene.add(plight);
    this.scene.add(light);
  }

  async addShapeWithSize() {
    const sizeToUse = this.findSize();
    const objectToRender = this.findShape(sizeToUse);
    const colorToUse = this.findColor();
    let material = new THREE.MeshPhongMaterial({
      color: colorToUse,
      transparent: true,
      specular: 0x555555,
      opacity: 1.0,
      shininess: 100,
    });
    const mesh = new THREE.Mesh(objectToRender, material);
    const drawPoint = new THREE.Vector3(0, 0, -0.35);
    const targetPosition = drawPoint.applyMatrix4(this.camera.matrixWorld);
    mesh.position.copy(targetPosition);
    mesh.rotator = 0.025;
    mesh.lookAt(this.camera.position);
    this.scene.add(mesh);
    this.graffitiObjects.push(mesh);
    this.timer = setTimeout(this.addShapeWithSize, 50);
  }

  render() {
    const { navigation } = this.props;
    return (
      <View style={{ flex: 1 }}>
        <StatusBar hidden={true} />
        <Expo.GLView
          ref={ref => (this._glView = ref)}
          style={{ flex: 1 }}
          onContextCreate={this._onGLContextCreate}
        />
        {this.state.hideButtons === true ? null : (
          <View style={styles.colorPicker}>
            <ColorWheel
              onColorChange={color => this.setState({ color })}
              style={{
                height: 100,
                width: 100,
                position: 'absolute',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            />
          </View>
        )}
        {this.state.hideButtons === true ? null : (
          <View style={styles.drop}>
            <Menu
              ref={ref => this.setMenuRef(ref, 'shape')}
              button={
                <Button
                  raised
                  rounded
                  title="Shape"
                  onPress={() => this.showMenu('shape')}
                  buttonStyle={{
                    backgroundColor: 'red',
                    opacity: 0.3,
                    width: 100,
                    height: 50,
                  }}
                />
              }
            >
              <MenuItem onPress={() => this.setState({ shape: 'cube' })}>
                Cube
              </MenuItem>
              <MenuItem onPress={() => this.setState({ shape: 'sphere' })}>
                Sphere
              </MenuItem>
              <MenuItem onPress={() => this.setState({ shape: 'pyramid' })}>
                Pyramid
              </MenuItem>
              <MenuItem onPress={() => this.setState({ shape: 'icosahedron' })}>
                Icosahedron
              </MenuItem>
              <MenuItem onPress={() => this.setState({ shape: 'octahedron' })}>
                Octahedron
              </MenuItem>
              <MenuItem onPress={() => this.setState({ shape: 'ring' })}>
                Ring
              </MenuItem>
              {/* <MenuItem onPress={() => this.setState({ shape: 'knot' })}>
                knot
              </MenuItem> */}
            </Menu>
          </View>
        )}
        {this.state.hideButtons === true ? null : (
          <View style={styles.size}>
            <Menu
              ref={ref => this.setMenuRef(ref, 'size')}
              button={
                <Button
                  raised
                  rounded
                  title="Size"
                  onPress={() => this.showMenu('size')}
                  buttonStyle={{
                    backgroundColor: 'purple',
                    opacity: 0.3,
                    width: 100,
                    height: 50,
                  }}
                />
              }
            >
              <MenuItem onPress={() => this.setState({ size: 'small' })}>
                Small
              </MenuItem>
              <MenuItem onPress={() => this.setState({ size: 'medium' })}>
                Medium
              </MenuItem>
              <MenuItem onPress={() => this.setState({ size: 'large' })}>
                Large
              </MenuItem>
              <MenuItem onPress={() => this.setState({ size: 'xlarge' })}>
                X-Large
              </MenuItem>
            </Menu>
            <TouchableOpacity
              onPressIn={this.undo}
              onPressOut={this.stopTimer}
              style={styles.undoButton}
            >
              <Image
                style={{ width: 40, height: 40 }}
                source={{
                  uri:
                    'https://flaticons.net/icons/Mobile%20Application/Command-Undo.png',
                }}
              />
            </TouchableOpacity>
          </View>
        )}
        <View style={styles.takePhoto}>
          <TouchableOpacity onPress={this.hideAllButtons}>
            <Image
              style={styles.optionButton}
              source={require('./../public/menu.png')}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.draw}>
          <TouchableOpacity
            onPressIn={this.addShapeWithSize}
            onPressOut={this.stopTimer}
          >
            <Image
              style={styles.optionButton}
              source={require('./../public/add.png')}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  _onGLContextCreate = async gl => {
    const width = gl.drawingBufferWidth;
    const height = gl.drawingBufferHeight;

    this.arSession = await this._glView.startARSessionAsync();

    this.scene = new THREE.Scene();
    this.camera = ExpoTHREE.createARCamera(
      this.arSession,
      width,
      height,
      0.01,
      1000
    );

    // Rotation
    // this.vector = new THREE.Vector3(0, 0, 0);
    // this.vector.applyQuaternion(this.camera.quaternion);

    const renderer = ExpoTHREE.createRenderer({ gl });
    renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);

    this.scene.background = ExpoTHREE.createARBackgroundTexture(
      this.arSession,
      renderer
    );

    // Camera helper
    const helper = new THREE.CameraHelper(this.camera);
    this.scene.add(helper);

    this.generateLighting(this.scene);

    const animate = () => {
      this.gameRequest = requestAnimationFrame(animate);
      this.camera.position.setFromMatrixPosition(this.camera.matrixWorld);
      this.graffitiObjects.forEach(art => {
        art.castShadow = true;
        art.rotation.x += art.rotator;
        art.rotation.y += art.rotator;
        // Fire objects like a gun lol ==>
        // art.position.z -= 0.01;
        // Animates items for live movement
      });
      // const cameraPos = new THREE.Vector3(
      //   this.camera.position.x,
      //   this.camera.position.y,
      //   this.camera.position.z
      // );
      // const fourthDimensionCamera = cameraPos.applyMatrix4(
      //   this.camera.matrixWorld
      // );

      // this.cameraWorldDirection = this.camera.getWorldDirection(this.vector);
      // this.xAngle = THREE.Math.radToDeg(
      //   Math.atan2(this.cameraWorldDirection.x, this.cameraWorldDirection.z)
      // );
      // this.yAngle = THREE.Math.radToDeg(
      //   Math.atan2(this.cameraWorldDirection.y, this.cameraWorldDirection.z)
      // );
      // console.log('x:', this.xAngle, 'y:', this.yAngle);

      renderer.render(this.scene, this.camera);
      gl.endFrameEXP();
    };

    animate();
  };
}

const { height, width } = Dimensions.get('window');

const styles = StyleSheet.create({
  drop: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: height - 700,
    left: width / 2 + 100,
    // zIndex: 999,
  },
  size: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: height - 650,
    left: width / 2 + 100,
  },
  takePhoto: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: height - 100,
    left: width / 2 + 135,
  },
  draw: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: height - 100,
    left: width / 2 - 25,
  },
  colorPicker: {
    position: 'absolute',
    top: height - 80,
    left: width / 2 - 130,
    justifyContent: 'center',
    alignItems: 'center',
  },
  undoButton: {
    opacity: 0.6,
    width: 100,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  optionButton: {
    opacity: 0.6,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
});

// function setModelPos(model, dropPos) {
//   const item = model.clone();
//   item.position.x = dropPos.x;
//   item.position.y = dropPos.y;
//   item.position.z = dropPos.z;
//   item.rotator = 0.025;
//   return item;
// }
