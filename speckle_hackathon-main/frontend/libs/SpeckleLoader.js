import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { Group, Loader, Mesh, MeshPhongMaterial, SmoothShading } from 'three';
import ViewerObjectLoader from "./ViewerObjectLoader.js";

class SpeckleLoader extends Loader {
  load(options, onLoad, onProgress, onError) {
    const { token, objectUrl } = JSON.parse(options);
    this.viewerObjectLoader = new ViewerObjectLoader(objectUrl, token);
    const container = new Group();
    const material = new MeshPhongMaterial({ color: 0xf0f8ff });
    
    const addObject = (o) => {
      const mesh = new Mesh(o.bufferGeometry, material);
      mesh.material.flatShading = SmoothShading;
      if (mesh.geometry.boundingSphere.center) {
        container.add(mesh);
      }
    };

    const onProgressInfo = (progress) => {
      console.log("onProgress", progress);
    };

    const onErrorInfo = (error) => {
      console.error("onError", error);
    };

    this.viewerObjectLoader
      .load(addObject, onProgressInfo, onErrorInfo)
      .then(() => {
        const exporter = new GLTFExporter();

        exporter.parse(container, function (result) {
          const blob = new Blob([result], {type: 'application/octet-stream'});
          const blobURL = URL.createObjectURL(blob);
          onLoad(blobURL); 
        }, { binary: true });
      });
  }
}

// Initialize the loader
const speckleLoader = new SpeckleLoader();

// Set your Speckle options
const options = {
  objectUrl: "https://speckle.xyz/streams/0e7f5d4c86/commits/a95dec921b",
  token: "52566d1047b881764e16ad238356abeb2fc35d8b42"
};

// Load your Speckle objects
speckleLoader.load(JSON.stringify(options), function(glbURL) {
  // This will be called when your Speckle objects have been loaded and converted to a .glb
  // glbURL is a blob URL pointing to the .glb file

  // Get your model-viewer element
  const modelViewer = document.querySelector('model-viewer');

  // Set the src to the .glb URL
  modelViewer.src = glbURL;
});
