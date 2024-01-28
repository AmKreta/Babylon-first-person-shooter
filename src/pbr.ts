import './app.css';
import { Color3, CubeTexture, Engine, FreeCamera, GlowLayer, HemisphericLight, MeshBuilder, PBRMaterial, Scene, Texture, Vector3 } from '@babylonjs/core';
import envMap from './assets/pbr/env/environment.env';

// importing plane texture
import PlaneMetallicMap from './assets/pbr/plane/ao_metal_rough.jpg';
import PlaneNormalMap from './assets/pbr/plane/normal.jpeg';
import PlaneAlbedoMap from './assets/pbr/plane/diffusion.jpeg';
import PlaneDisplacementMap from './assets/pbr/plane/displacement.jpeg';

// importing sphere textures
import SphereMetalAoRoughnessmap from './assets/pbr/ball/ao_rough_metal.jpeg';
import SphereDiffusionMap from './assets/pbr/ball/diffusion.jpeg';
import SphereNormamMap from './assets/pbr/ball/normal.jpeg';
import SphereDisplacementMap from './assets/pbr/ball/displacement.jpeg';
import SphereEmissiveTexture from './assets/pbr/ball/emissive.jpg';


function createPlaneMaterial(scene: Scene) {
    const planeMaterial = new PBRMaterial('planeMaterial', scene);
    planeMaterial.albedoTexture = new Texture(PlaneAlbedoMap, scene);
    planeMaterial.metallicTexture = new Texture(PlaneMetallicMap, scene);
    planeMaterial.useAmbientOcclusionFromMetallicTextureRed = true;
    planeMaterial.useRoughnessFromMetallicTextureGreen = true;
    planeMaterial.useMetallnessFromMetallicTextureBlue = true;
    planeMaterial.bumpTexture = new Texture(PlaneNormalMap, scene);
    planeMaterial.invertNormalMapX = true;
    planeMaterial.invertNormalMapY = true;
    planeMaterial.roughness = 1;
    return planeMaterial;
}

function createSphereMaterial(scene:Scene){
    const sphereMaterial = new PBRMaterial('sphereMaterial', scene);
    sphereMaterial.albedoTexture = new Texture(SphereDiffusionMap, scene);
    sphereMaterial.bumpTexture = new Texture(SphereNormamMap, scene);
    sphereMaterial.emissiveTexture  = new Texture(SphereEmissiveTexture, scene);
    sphereMaterial.emissiveIntensity = 4;
    sphereMaterial.metallicTexture = new Texture(SphereMetalAoRoughnessmap, scene);
    sphereMaterial.useAmbientOcclusionFromMetallicTextureRed = true;
    sphereMaterial.useRoughnessFromMetallicTextureGreen = true;
    sphereMaterial.useMetallnessFromMetallicTextureBlue = true;
    sphereMaterial.invertNormalMapX = true;
    sphereMaterial.invertNormalMapY = true;
    sphereMaterial.roughness = 1;
    return sphereMaterial;
}


const canvas = document.createElement('canvas')
canvas.height = window.innerHeight;
canvas.width = window.innerWidth;
document.body.appendChild(canvas);

const engine = new Engine(canvas, true);
const scene = new Scene(engine);
const camera = new FreeCamera('free-camera', new Vector3(0, 20, -20));
camera.target = new Vector3(0, 0, 0);
camera.speed = .25;
camera.attachControl(canvas, true);
scene.addCamera(camera);

//adding env map
const cubeTexture = CubeTexture.CreateFromPrefilteredData(envMap, scene);
scene.environmentTexture = cubeTexture;
scene.createDefaultSkybox(cubeTexture, true);
scene.environmentIntensity = 0.5;

// creating sphere
const sphere = MeshBuilder.CreateSphere('sphere', {
    diameter: 5,
    segments: 12
});
sphere.material = createSphereMaterial(scene);
sphere.position.y += 3;
sphere.applyDisplacementMap(SphereDisplacementMap, -3, 3);
scene.addMesh(sphere);

// creating plane
const plane = MeshBuilder.CreateGround('plane', {
    height: 20,
    width: 20,
});
plane.material = createPlaneMaterial(scene);
plane.applyDisplacementMap(PlaneDisplacementMap, -3, 3);
scene.addMesh(plane)

// creating light
const light = new HemisphericLight('hemisphereLight', new Vector3(0, 0, 1));
light.diffuse = new Color3(1, 1, 1);
light.intensity /= 2;
scene.addLight(light);

//adding glow layer
const gl = new GlowLayer("glow", scene);
gl.addIncludedOnlyMesh(sphere);
gl.intensity = 3;

engine.runRenderLoop(function () {
    scene.render();
});