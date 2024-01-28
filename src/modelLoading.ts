import './app.css';
import * as Babylon from '@babylonjs/core';
import '@babylonjs/loaders/glTF';

function loadCar(scene:Babylon.Scene){
    Babylon
        .SceneLoader
        .ImportMeshAsync("", './models/model_loading/mercedees/', 'scene.gltf', scene)
        .then(res=>{
            res.geometries[0]._boundingInfo!.boundingBox.center
           console.log(res)
        })
        .catch(err=>{
            console.log(err);
        });
}

// creating canvas
const canvas = document.createElement('canvas');
canvas.height = window.innerHeight;
canvas.width  = window.innerWidth;
document.body.appendChild(canvas);

// creating engine and scene
const engine = new Babylon.Engine(canvas, true);
const scene = new Babylon.Scene(engine);

// creating camera
const camera = new Babylon.FreeCamera('free-camera', new Babylon.Vector3(0,40,-40));
camera.attachControl(canvas, true);
camera.setTarget(new Babylon.Vector3(0,0,0));
scene.addCamera(camera);

// creating light
const hemisphericalLight = new Babylon.HemisphericLight('helispherical-light', new Babylon.Vector3(-1,1,1));
hemisphericalLight.setDirectionToTarget(new Babylon.Vector3(0,0,0));
scene.addLight(hemisphericalLight);

// creating ground
const ground = Babylon.MeshBuilder.CreateGround('ground', {
    height:200,
    width:400
});
scene.addMesh(ground);

// loading Car
loadCar(scene);


engine.runRenderLoop(function(){
    scene.render();
});