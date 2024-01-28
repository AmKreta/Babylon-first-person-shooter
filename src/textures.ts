import './app.css';
import { Engine, Scene, HemisphericLight, Vector3, FreeCamera, MeshBuilder, StandardMaterial, Color4, Texture, Color3, SceneLoader } from '@babylonjs/core';

// importing ground textures
import GroundDiffuseTexture from './assets/ground/diffuse.jpeg';
import GroundDisplacementTexture from './assets/ground/displacement.jpeg';
import GroundAoTexture from './assets/ground/ao.jpeg';
import GroundNormalTexture from './assets/ground/normal.jpeg';

// importing ball textures
import BallDiffuseTexture from './assets/ball/diffuse.jpeg';
import BallAoTexture from './assets/ball/ao.jpeg';
//import BallBumpTexture from './assets/ball/bump.jpeg';
import BallSpecularTexture from './assets/ball/specular.jpeg';
import BallDisplacementTexture from './assets/ball/displacement.jpeg';
import BallNormalTexture from './assets/ball/normal.jpeg';

// importing cube textures
import CubeDiffuseTexture from './assets/cube/diffuse.jpeg';
import CubeAoTexture from './assets/cube/ao.jpeg';
import CubeNormalTexture from './assets/cube/normal.jpeg';
import CubeDisplacementTexture from './assets/cube/displacement.jpeg';

function canvasFactory() {
    const canvas = document.createElement('canvas');
    canvas.height = window.innerHeight;
    canvas.width = window.innerWidth;
    return canvas;
}

function createBox(scene: Scene) {
    const boxMesh = MeshBuilder.CreateBox('box', {
        size: 8
    });
    boxMesh.position = new Vector3(-8, 0, 0);

    const aoMap = new Texture(CubeAoTexture, scene);
    const diffusionMap = new Texture(CubeDiffuseTexture, scene);
    const normalMap = new Texture(CubeNormalTexture, scene);

    const material = new StandardMaterial('boxMaterial', scene);
    material.ambientTexture = aoMap;
    material.diffuseTexture = diffusionMap;
    material.bumpTexture = normalMap;
    material.emissiveColor = new Color3(1, 1, 0);

    [aoMap, diffusionMap, normalMap].forEach(map => {
        map.vScale = 1;
        map.uScale = 1;
    })

    boxMesh.applyDisplacementMap(CubeDisplacementTexture, 0, .5);
    boxMesh.material = material;
    boxMesh.increaseVertices(10);
    return boxMesh;
}

function createSphere(scene: Scene) {
    const sphereMesh = MeshBuilder.CreateSphere('sphere', {
        segments: 12,
        diameter: 12,
    });
    sphereMesh.position = new Vector3(8, 0, 0);

    var material = new StandardMaterial("redMaterial", scene);

    const disffuseMap = new Texture(BallDiffuseTexture, scene);
    const bumpMap = new Texture(BallNormalTexture, scene);
    const aoMap = new Texture(BallAoTexture, scene);
    const specularMap = new Texture(BallSpecularTexture, scene);

    //const textures:Texture[] = [disffuseMap, bumpMap, aoMap, specularMap];

    material.diffuseTexture = disffuseMap;
    material.bumpTexture = bumpMap;
    material.ambientTexture = aoMap;
    material.specularTexture = specularMap;
    material.specularPower = 2;

    sphereMesh.applyDisplacementMap(BallDisplacementTexture, 0, .5);

    sphereMesh.material = material;

    return sphereMesh;
}

function createPlane(scene: Scene) {
    const plane = MeshBuilder.CreatePlane('plane', {
        height: 100,
        width: 200,
    });
    plane.rotate(new Vector3(1, 0, 0), Math.PI / 2, 0);
    plane.position = new Vector3(0, -6, 0);

    const textures: Texture[] = [];

    const diffuseMap = new Texture(GroundDiffuseTexture, scene);
    //const displacementMap = new Texture(GroundDisplacementTexture, scene);
    const aoMap = new Texture(GroundAoTexture, scene);
    const normalMap = new Texture(GroundNormalTexture, scene);

    textures.push(diffuseMap);
    //textures.push(displacementMap);
    textures.push(aoMap);
    textures.push(normalMap);

    textures.forEach(t => {
        t.vScale = 4;
        t.uScale = 4;
    });

    const material = new StandardMaterial('groundMaterial', scene);
    material.diffuseTexture = diffuseMap;
    material.bumpTexture = normalMap;
    material.ambientTexture = aoMap;

    plane.applyDisplacementMap(GroundDisplacementTexture, 0, .5);

    plane.material = material;
    plane.increaseVertices(10);

    return plane;
}

function createScene(engine: Engine) {
    const scene = new Scene(engine);
    const light = new HemisphericLight('hemisphericalLight', new Vector3(0, 8, -1));
    //light.intensity /= 2;
    //light.setDirectionToTarget(new Vector3(0,0,0));
    scene.addLight(light);
    const camera = new FreeCamera('freeCam', new Vector3(0, 30, -40));
    camera.target = new Vector3(0, 0, 0);
    camera.speed = .5;
    camera.attachControl(canvas, true);
    scene.addCamera(camera);
    return scene;
}

const canvas = canvasFactory();
document.body.appendChild(canvas);

const engine = new Engine(canvas, true, {});
const scene = createScene(engine);

const box = createBox(scene);
scene.addMesh(box);

const sphere = createSphere(scene);
scene.addMesh(sphere);

const plane = createPlane(scene);
scene.addMesh(plane);


// scene.onPointerDown = function (ev, pickedInfo) {
//     const mesh = pickedInfo.pickedMesh!;
//     if (!mesh) return;
//     const myMaterial = new StandardMaterial('material', scene);
//     myMaterial.diffuseColor = new Color3(1, 0, 0);
//     myMaterial.specularColor = new Color3(1, 0.6, 0.9);
//     myMaterial.emissiveColor = new Color3(0, 0, 0);
//     myMaterial.ambientColor = new Color3(0.23, 0.98, 0.53);
//     mesh.material = myMaterial;
// }
let dx = 0.01;
engine.runRenderLoop(function () {
    box.rotation.y += dx;
    box.rotation.z += dx;
    sphere.rotation.y += dx;
    scene.render();
    if (box.rotation.y >= 10)
        dx *= -1;
});




