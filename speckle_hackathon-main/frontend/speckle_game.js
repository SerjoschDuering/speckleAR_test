import { SpeckleLoader } from "./SpeckleLoader.js";
import { objectUrl } from "./utils/speckle_info.js";
import { shaderMaterial, uniforms } from "./utils/blueShader.js";

export default class Game {
  constructor() {
    if (WebGL.isWebGLAvailable() === false) {
      document.body.appendChild(WebGL.getWebGLErrorMessage());
    }

    this.modes = Object.freeze({
      NONE: Symbol("none"),
      PRELOAD: Symbol("preload"),
      ACTIVE: Symbol("active"),
    });
    this.mode = this.modes.NONE;
    this.shaderAnimate = false;
    this.chatMode = false;

    this.container;
    this.player;
    this.cameras;
    this.camera;
    this.scene;
    this.renderer;
    this.animations = {};
    this.assetsPath = "assets/";

    this.remotePlayers = [];
    this.remoteColliders = [];
    this.initialisingPlayers = [];
    this.remoteData = [];

    this.messages = {
      text: ["GOOD LUCK!"],
      index: 0,
    };

    this.container = document.createElement("div");
    this.container.style.height = "100%";
    document.body.appendChild(this.container);

    const game = this;
   

    this.clock = new THREE.Clock();

    this.init();

    window.onError = function (error) {
      console.error(JSON.stringify(error));
    };
  }

  init() {
    // model
    const game = this;

    // load speckle stream
    let speckle_loader = new SpeckleLoader();
    game.loadEnvironment(speckle_loader);

    this.mode = this.modes.PRELOAD;

    let nameTag = prompt("Welcome! What is your name?");
    this.player = new PlayerLocal(this, nameTag);

    this.speechBubble = new SpeechBubble(this, "", 150);
    this.speechBubble.mesh.position.set(0, 350, 0);

    this.joystick = new JoyStick({
      onMove: this.playerControl,
      game: this,
    });

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.container.appendChild(this.renderer.domElement);

    window.addEventListener("resize", () => game.onWindowResize(), false);
  }

  // load speckle stream
  loadEnvironment(loader) {
    const game = this;
    let options = JSON.stringify({
      objectUrl: objectUrl,
      // token: speckleToken,
    });
    loader.load(options, function (geometry) {
      //game.environment = geometry;
      game.colliders = [];
      console.log(geometry);

      // rotate, scale, translate the model to fit into the scence
      geometry.rotateX(4.712); //rotate 270 degrees
      geometry.scale.set(150, 150, 150);
      // geometry.translateX(-3500);
      // geometry.translateY(-3000);
      // geometry.translateZ(-100);
      geometry.translateX(-4200);
      geometry.translateY(-3000);
      geometry.translateZ(-500);

      //hacky helper, just need to retrive the uv attrivute to pass on to below
      const box = new THREE.BoxGeometry(200, 200, 200);
      const mesh = new THREE.Mesh(box, shaderMaterial);
      mesh.position.set(0, 0, 0);
      console.log(mesh.geometry.attributes.uv);

      geometry.traverse((child) => {
        if (child.isMesh) {
          game.colliders.push(child);
          child.castShadow = true;
          child.receiveShadow = true;
          //need add the attribute of uv, otherwise it is black...
          //assign shadermaterial
          child.geometry.setAttribute("uv", mesh.geometry.attributes.uv);
          //child.material = shaderMaterial;
        }
      });
      console.log(geometry);
      game.scene.add(geometry);

      //while done loading, remove the loading spinner

      const loadingScreen = document.getElementById("loading-screen");
      loadingScreen.remove();

      const FBXLoader = new THREE.FBXLoader();
      game.loadNextAnim(FBXLoader);
    });
  }
