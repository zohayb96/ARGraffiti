const width = gl.drawingBufferWidth;
    const height = gl.drawingBufferHeight;
    // AR.setPlaneDetection(AR.PlaneDetectionTypes.Horizontal);

    this.arSession = await this._glView.startARSessionAsync();

    this.scene = new THREE.Scene();
    this.camera = ExpoTHREE.createARCamera(
      this.arSession,
      width,
      height,
      0.01,
      1000
    );
    const renderer = ExpoTHREE.createRenderer({ gl });
    renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);

    const customMaterial = new THREE.MeshBasicMaterial({
      map: await ExpoTHREE.createTextureAsync({
        asset: Expo.Asset.fromModule(require('./uv.jpg')),
      }),
      transparent: true,
    });

    const glassMaterial = new THREE.MeshBasicMaterial({
      map: await ExpoTHREE.createTextureAsync({
        asset: Expo.Asset.fromModule(require('./Glass.jpg')),
      }),
      transparent: true,
      opacity: 0.75,
    });

    this.scene.background = ExpoTHREE.createARBackgroundTexture(
      this.arSession,
      renderer
    );
    var SphereGeometry = new THREE.SphereGeometry(0.8, 0.07, 0.07);

    // Edit the box dimensions here and see changes immediately!
    var geometry = new THREE.BoxGeometry(0.25, 0.25, 0.25);
    var material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    var cube = new THREE.Mesh(geometry, customMaterial);
    var cube1 = new THREE.Mesh(geometry, customMaterial);
    cube.position.z = -0.8;
    cube1.position.z = -1.0;
    this.model = await loadModel(this.state.color);
    var sphere = new THREE.Mesh(geometry, glassMaterial);
    sphere.position.z = 0.8;

    var light = new THREE.AmbientLight(0x404040); // soft white light
    this.scene.add(light);

    // this.arPointLight = new ThreeAR.Light();
    // this.arPointLight.position.y = 2;

    const animate = () => {
      requestAnimationFrame(animate);
      this.camera.position.setFromMatrixPosition(this.camera.matrixWorld);
      const cameraPos = new THREE.Vector3(0, 0, 0);
      cameraPos.applyMatrix4(this.camera.matrixWorld);

      this.graffitiObjects.forEach(art => {
        // Animates items for live movement
        // art.rotation.x += art.rotator;
        // art.rotation.y += art.rotator;
      });

      // cube.rotation.x += 0.02;
      // cube.rotation.y += 0.02;

      renderer.render(this.scene, this.camera);
      gl.endFrameEXP();
    };
    animate();
  };
