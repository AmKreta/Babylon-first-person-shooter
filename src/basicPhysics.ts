import HavokPhysics, { HavokPhysicsWithBindings } from "@babylonjs/havok";
import { Color3, DirectionalLight, Engine, FreeCamera, HavokPlugin, HemisphericLight, MeshBuilder, PhysicsAggregate, PhysicsBody, PhysicsShapeType, Scene, ShadowGenerator, StandardMaterial, Vector3 } from '@babylonjs/core';
import './app.css';

function createRandomNoBw(a: number, b: number) {
    return a + Math.floor(Math.random() * (b - a + 1));
}

function createRandomColor() {
    return new Color3(
        createRandomNoBw(0, 255),
        createRandomNoBw(0, 255),
        createRandomNoBw(0, 255)
    )
}

function createGround(length: number, width: number, height: number, scene: Scene, position: Vector3) {
    const ground = MeshBuilder.CreateGround('ground-base', { height: length, width });
    const groundAggregate = new PhysicsAggregate(ground, PhysicsShapeType.BOX, { mass: 0 }, scene);
    const material = new StandardMaterial('standard-material', scene);
    material.diffuseColor = createRandomColor();
    ground.material = material;


    // left wall
    const leftWall = MeshBuilder.CreateBox('left-wall', {
        height,
        width,
        depth: .1
    }, scene);
    leftWall.material = material;
    leftWall.parent = ground;
    leftWall.rotation.y = -Math.PI / 2;
    leftWall.position.x = ground.position.x - length / 2;
    leftWall.position.y = ground.position.y + height / 2;
    const leftWallAggregate = new PhysicsAggregate(leftWall, PhysicsShapeType.BOX, { mass: 0 }, scene);

    // right wall
    const rightWall = MeshBuilder.CreateBox('right-wall', {
        height,
        width,
        depth: .1
    }, scene);
    rightWall.material = material;
    rightWall.parent = ground;
    rightWall.rotation.y = Math.PI / 2;
    rightWall.position.x = ground.position.x + length / 2;
    rightWall.position.y = ground.position.y + height / 2;
    const rightWallAggregate = new PhysicsAggregate(rightWall, PhysicsShapeType.BOX, { mass: 0 }, scene);

    // front wall
    const frontWall = MeshBuilder.CreateBox('front-wall', {
        height: width,
        width: height,
        depth: .1
    }, scene);
    frontWall.material = material;
    frontWall.parent = ground;
    frontWall.rotation.z = Math.PI / 2;
    frontWall.position.z = ground.position.z - width / 2;
    frontWall.position.y = ground.position.y + height / 2;
    const frontWallAggregate = new PhysicsAggregate(frontWall, PhysicsShapeType.BOX, { mass: 0 }, scene);


    // back wall
    const backWall = MeshBuilder.CreateBox('back-wall', {
        height: width,
        width: height,
        depth: .1
    }, scene);
    backWall.material = material;
    backWall.parent = ground;
    backWall.rotation.z = -Math.PI / 2;
    backWall.position.z = ground.position.z + width / 2;
    backWall.position.y = ground.position.y + height / 2;
    const backWallAggregate = new PhysicsAggregate(backWall, PhysicsShapeType.BOX, { mass: 0 }, scene);
}

function createBall(scene: Scene, index: number, x: number, y: number, z: number) {
    const size = [2, 2.5, 3, 3.5, 4][createRandomNoBw(0, 5)];
    const sphere = MeshBuilder.CreateSphere(`sphere-${index}`, { diameter: size });
    sphere.position = new Vector3(createRandomNoBw(-x, x), createRandomNoBw(5, y), createRandomNoBw(-z, z));
    scene.addMesh(sphere);
    const material = new StandardMaterial('standard-material', scene);
    material.diffuseColor = createRandomColor();
    sphere.material = material;
    const mass = createRandomNoBw(1, 10);
    const restitution = Math.floor(Math.random() * 100) / 100;
    const sphereAggregate = new PhysicsAggregate(sphere, PhysicsShapeType.SPHERE, { mass, restitution }, scene);
}

function createBox(scene: Scene, index: number, x: number, y: number, z: number) {
    const size = [2, 2.5, 3, 3.5, 4][createRandomNoBw(0, 5)];
    const box = MeshBuilder.CreateBox(`box-${index}`, { size });
    box.position = new Vector3(createRandomNoBw(-x, x), createRandomNoBw(5, y), createRandomNoBw(-z, z));
    scene.addMesh(box);
    const material = new StandardMaterial('standard-material', scene);
    material.diffuseColor = createRandomColor();
    box.material = material;
    const mass = createRandomNoBw(1, 10);
    const restitution = Math.floor(Math.random() * 100) / 100;
    const boxAggregate = new PhysicsAggregate(box, PhysicsShapeType.BOX, { mass, restitution }, scene);
}

function main(havok: HavokPhysicsWithBindings) {
    const canvas = document.createElement('canvas') as HTMLCanvasElement;
    canvas.height = window.innerHeight;
    canvas.width = window.innerWidth;
    document.body.appendChild(canvas);

    const engine = new Engine(canvas, true);
    const gravityVector = new Vector3(0, -9.81, 0);
    const scene = new Scene(engine);

    const physicsPlugin = new HavokPlugin(true, havok);
    scene.enablePhysics(gravityVector, physicsPlugin);

    const camera = new FreeCamera('camera', new Vector3(0, 80, -80));
    camera.setTarget(new Vector3(0, 0, 0));
    camera.attachControl(canvas, true);
    camera.speed /= 4;
    scene.addCamera(camera);

    const hemisphericLight = new HemisphericLight('hemisphericLight', new Vector3(0, 1, 1));
    hemisphericLight.intensity = 0.0005;
    scene.addLight(hemisphericLight);

    const directionalLight = new DirectionalLight('directional-light', new Vector3(0, -1, 0), scene);
    directionalLight.position = new Vector3(0, 100, 0);
    directionalLight.intensity = 0.005;

    createGround(80, 80, 4, scene, new Vector3(0, 0, 0));

    let numSphere = 1500;
    const interval = setInterval(() => {
        if(numSphere%2===0)
            createBall(scene, numSphere--, 20, 60, 20);
        else
            createBox(scene, numSphere--, 20, 60, 20);
        if (numSphere === 0)
            clearInterval(interval);
    }, 200);


    engine.runRenderLoop(function () {
        scene.render();
    })
}

HavokPhysics().then((havok: HavokPhysicsWithBindings) => {
    main(havok);
})