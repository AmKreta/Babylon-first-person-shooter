import './app.css';
import HavokPhysics, { HavokPhysicsWithBindings } from "@babylonjs/havok";
import { HavokPlugin, HemisphericLight, MeshBuilder, SceneLoader, UniversalCamera, TransformNode, AssetContainer, PBRMaterial, Texture, Matrix, Camera, PointerEventTypes, StandardMaterial, Material, Color3, ISceneLoaderAsyncResult, Animation, Sound, Mesh, AbstractMesh } from '@babylonjs/core';
import { Engine, Scene, Vector3 } from '@babylonjs/core';
import '@babylonjs/loaders/OBJ';
import { Inspector } from '@babylonjs/inspector';

function createJerkAnimation(gun:AbstractMesh, scene:Scene){
  // jerk animation
  const jerkAnimFrameRate = 20;
  const jerkIntensity =.5;
  const jerkAnimationSpeed = 20;
  const jerkZAnimation = new Animation('jerkZ', 'position.z', jerkAnimFrameRate, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_YOYO);
  const jerkYAnimation = new Animation('jerkY','position.y',jerkAnimFrameRate, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_YOYO);
  jerkYAnimation.setKeys([
    {frame:0, value:gun.position.y},
    {frame:jerkAnimFrameRate, value:gun.position.y+jerkIntensity },
    {frame:2*jerkAnimFrameRate, value:gun.position.y},
  ]);
  jerkZAnimation.setKeys([
    {frame:0, value:gun.position.z},
    {frame:jerkAnimFrameRate, value:gun.position.z-jerkIntensity*2 },
    {frame:2*jerkAnimFrameRate, value:gun.position.z},
  ]);
  scene.beginDirectAnimation(gun, [jerkYAnimation, jerkZAnimation],0, 2*jerkAnimFrameRate,false, jerkAnimationSpeed);
}

function loadWorld(scene: Scene) {
  SceneLoader.LoadAssetContainer('./models/city/', 'Lowpoly_City_Free_Pack.obj', scene, function (container: AssetContainer) {
    const transformNode = new TransformNode('world');
    const staticMesh = ['car', 'road', 'house', 'bed', 'bush', 'tree', 'bench', 'cube', 'shop', 'trash'];
    const staticMeshRegex = /(?:car|floor|house|bed|bush|tree|bench|cube|shop|trash)/;
    container.meshes.forEach(mesh => {
      if (staticMeshRegex.test(mesh.name.toLowerCase())) {
        mesh.checkCollisions = true;
      }
      mesh.parent = transformNode;
    });
    scene.addTransformNode(transformNode);
    transformNode.position.y += 85;
    container.addAllToScene();
  });
}

function loadModel(scene:Scene){
  const transformNode = new TransformNode('model', scene);
  const frameRate = 10;
  const rotate = new Animation('rotate','rotation.y', frameRate,Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CYCLE);
  const frames = [
    {frame:0, value:0},
    {frame:frameRate, value:Math.PI},
    {frame:frameRate*2, value:2*Math.PI}
  ];
  rotate.setKeys(frames);
  SceneLoader
    .ImportMeshAsync('','./models/human/','DinklageLikenessSculpt.glb', scene)
    .then((res:ISceneLoaderAsyncResult)=>{
      res.meshes.forEach(mesh=>{
        if(mesh.name.includes('Eyes') || mesh.name.includes('Head')){
          mesh.checkCollisions=true;
        }
          mesh.parent = transformNode;
      });
      scene.addTransformNode(transformNode);
      transformNode.position.set(-480, 5, 450);
      transformNode.scaling = new Vector3(300,300,300);
      scene.beginDirectAnimation(transformNode,[rotate], 0, 2*frameRate, true, .5);
    })
    .catch(err=>{
      console.log('unable to load face model', err);
    })
}

function createCrosshair(camera:Camera, scene:Scene, size=1){
  const plane = MeshBuilder.CreatePlane('crosshair',{size});
  // plane.position.x= -size/2;
  // plane.position.y= -size/2;
  const material = new StandardMaterial('crossHairMaterial',scene);
  plane.material = material;
  const texture = new Texture('./textures/crossHair/pngwing.com.png', scene);
  material.diffuseTexture=texture;
  material.diffuseColor=Color3.White();
  material.opacityTexture = material.diffuseTexture
  material.transparencyMode = Material.MATERIAL_ALPHABLEND;
  material.alpha = 1
  texture.hasAlpha = true;
  plane.parent = camera;
  plane.position.z = 5;
  return plane;
}

function loadGun(camera: UniversalCamera) {
  SceneLoader
    .ImportMeshAsync('', './models/gun/', 'p90.obj')
    .then(mesh => {
      const transformNode = new TransformNode('p90');
      mesh.meshes.forEach(mesh => mesh.parent = transformNode);
      transformNode.parent = camera;
      transformNode.position.y -= 2;
      transformNode.position.z += 5;
      transformNode.position.x += 2;
      transformNode.rotation.set(Math.PI/16, (7 * Math.PI / 8),0);
      transformNode.scaling.set(.5,.5,.5);
    })
}

function loadPaintBallSplatters(scene: Scene) {
  const splatters = [
    new PBRMaterial('blue-splatter', scene),
    new PBRMaterial('green-splatter', scene),
    new PBRMaterial('orange-splatter', scene),
  ];
  splatters.forEach(item => {
    item.roughness = 1;
    item.albedoTexture = new Texture(`./textures/paintball-splatters/${item.name.split('-')[0]}.png`);
    item.albedoTexture.hasAlpha = true;
    item.zOffset = -.25;
  });
  return splatters;
}

function main(havokInstance: HavokPhysicsWithBindings) {
  const canvas = document.createElement('canvas') as HTMLCanvasElement;
  canvas.height = window.innerHeight;
  canvas.width = window.innerWidth;
  document.body.appendChild(canvas);

  const engine = new Engine(canvas, true);
  const gravityVector = new Vector3(0, -9.81, 0);
  const scene = new Scene(engine);
  scene.collisionsEnabled = true;

  //const physicsPlugin = new HavokPlugin(true, havokInstance);
  //scene.enablePhysics(gravityVector, physicsPlugin);
  scene.gravity = gravityVector;

  const camera = new UniversalCamera('camera', new Vector3(450, 0, 450));
  camera.attachControl(canvas, true);
  camera.checkCollisions = true;
  camera.ellipsoid = new Vector3(1, 30, 1);
  camera.applyGravity = true;
  camera.minZ = .45;
  camera.speed *= 2.5;
  camera.angularSensibility = 3000;
  camera.keysUp.push(87);
  camera.keysLeft.push(65);
  camera.keysDown.push(83);
  camera.keysRight.push(68);

  scene.addCamera(camera);

  const hemisphericalLight = new HemisphericLight('hemispherical-light', new Vector3(0, 1, 0));
  scene.addLight(hemisphericalLight);
  hemisphericalLight.intensity = 0.8;

  const ground = MeshBuilder.CreateGround('ground', {
    height: 20,
    width: 20
  });

  scene.addMesh(ground);

  loadWorld(scene);
  loadModel(scene);
  loadGun(camera);
  const crossHairSize= .15;
  const crosshair= createCrosshair(camera,scene, crossHairSize);
  crosshair.isPickable = false;
  crosshair.isNearPickable=false;
  const splatters = loadPaintBallSplatters(scene);

  // paintball sounds
  const paintballShotSound1 = new Sound('paintball1', './sounds/paintball/paintball_shoot1-91934.mp3',scene);
  const paintballShotSound2 = new Sound('paintball1', './sounds/paintball/paintball_shoot2-107651.mp3',scene);
  const paintballShotSounds = [paintballShotSound1, paintballShotSound2];




  scene.onPointerDown = (event, pickInfo, type) => {
    if (!engine.isPointerLock && event.button === 0) {
      engine.enterPointerlock();
      
    }
    else {
      const ray = scene.createPickingRay(canvas.width/2, canvas.height/2, Matrix.Identity(), camera);
      const raycastHit = scene.pickWithRay(ray)!;
      if (raycastHit.hit) {
        const decalSize = 4;
        const decal = MeshBuilder.CreateDecal('decal', raycastHit.pickedMesh!, {
          position: raycastHit.pickedPoint!,
          normal:raycastHit.getNormal(true)!,
          size:new Vector3(decalSize,decalSize,decalSize)
        });
        const gun = camera.getChildren()[1];
        createJerkAnimation(gun as any, scene);
        paintballShotSounds[Math.floor(Math.random()*1)].play();
        decal.material = splatters[Math.floor(Math.random()*splatters.length)];
        const timeout = setTimeout(() => {
          decal.dispose();
          clearTimeout(timeout);
        },3000);
      }
    }
  }

  engine.runRenderLoop(() => {
    scene.render();
  })

  // Inspector.Show(scene, {});
  // scene.debugLayer.show();
}

HavokPhysics().then(havok => {
  main(havok);
})