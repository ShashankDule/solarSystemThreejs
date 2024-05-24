import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
//import { GUI } from 'three/examples/jsm/libs/
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
//import * as dat from 'dat.gui';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';


let gui;

			let camera, scene, renderer, labelRenderer;

			const layers = {

				'Toggle Name': function () {

					camera.layers.toggle( 0 );

				},
				'Toggle Mass': function () {

					camera.layers.toggle( 1 );

				},
				'Enable All': function () {

					camera.layers.enableAll();

				},

				'Disable All': function () {

					camera.layers.disableAll();

				}

			};

			//const clock = new THREE.Clock();
			//const textureLoader = new THREE.TextureLoader();
 



const OBJECTS = {
    SUN: 'sun',
    MERCURY: 'mercury',
    VENUS: 'venus',
    EARTH: 'earth',
    MOON: 'moon',
    MARS: 'mars',
    JUPITER: 'jupiter',
    SATURN: 'saturn',
    SATURN_RINGS: 'saturn_rings',
    URANUS: 'uranus',
    NEPTUNE: 'neptune'
};

class ObjectGroup {
    constructor(index, title, radius, extra) {
        const objectGroup = new THREE.Group();

        if (extra) {
            switch (title) {
                case OBJECTS.EARTH:
                    extra.position.x += 8 * index + 2.5;//8

                    break;
                case OBJECTS.SATURN:
                    extra.position.x += 8 * index;
                    extra.rotation.x = 2;

                    break;
            }

            objectGroup.add(extra);
        }

        const planet = ObjectGroup.createObject(title, new THREE.SphereGeometry(radius, 64, 32));
        planet.position.x += 8 * index;

        
        objectGroup.add(planet);
        return objectGroup;
    }

    static createObject = (title, objectGeometry) => {
        const objectTexture = new THREE.TextureLoader().load(`./resources/images/${title}.jpg`);
        const objectMaterial = new THREE.MeshPhongMaterial({ map: objectTexture });
        const objectMesh = new THREE.Mesh(objectGeometry, objectMaterial);
        return objectMesh;
    };

}

const planets = [
    { title: OBJECTS.MERCURY, radius: 1 },
    { title: OBJECTS.VENUS, radius: 2 },
    {
        title: OBJECTS.EARTH,
        radius: 2,
        extra: ObjectGroup.createObject(OBJECTS.MOON, new THREE.SphereGeometry(0.5, 64, 32))
    },
    { title: OBJECTS.MARS, radius: 1 },
    { title: OBJECTS.JUPITER, radius: 5 },  
    {
        title: OBJECTS.SATURN,
        radius: 4,
        extra: ObjectGroup.createObject(OBJECTS.SATURN_RINGS, new THREE.TorusGeometry(6, 1, 2, 32))
    },
    { title: OBJECTS.URANUS, radius: 3 },
    { title: OBJECTS.NEPTUNE, radius: 3 }
];

scene = new THREE.Scene();
camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 0.1, 1000);

camera.position.set(-10,80,160);// = 180;
camera.layers.enableAll();
renderer = new THREE.WebGLRenderer();

//renderer.setSize(1920, 1080);  //renderer.setSize(); 
//renderer.setPixelRatio(window.devicePixelRatio);
document.getElementById("output").appendChild(renderer.domElement);
renderer.setSize(window.innerWidth, window.innerHeight);
//document.getElementById('root').appendChild(renderer.domElement);

const orbit = new OrbitControls(camera,renderer.domElement);
orbit.update(); //call every frame

const ambientLight = new THREE.AmbientLight(0xaaaaaa, 8);//6
const pointLight = new THREE.PointLight(0xffffff, 6);

pointLight.position.set(0, 0, 0);

scene.add(ambientLight, pointLight);

const starsCoords = [];

for (let i = 0; i < 10000; i++) {
    const x = THREE.MathUtils.randFloatSpread(1000);
    const y = THREE.MathUtils.randFloatSpread(1000);
    const z = THREE.MathUtils.randFloatSpread(1000);

    starsCoords.push(x, y, z);
}

const starsGeometry = new THREE.BufferGeometry();

starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsCoords, 3));

const starsMaterial = new THREE.PointsMaterial({ color: 0xaaaaaa });
const stars = new THREE.Points(starsGeometry, starsMaterial);
scene.add(stars);

const sun = ObjectGroup.createObject(OBJECTS.SUN, new THREE.SphereGeometry(11, 64, 32));
scene.add(sun);

const planetsMap = new Map();

for (let [index, { title, radius, extra }] of planets.entries()) {
    const planetGroup = new ObjectGroup(index + 2, title, radius, extra);

    //Label
    //document.getElementById("output").appendChild(labelRenderer.domElement);
    const earthDiv = document.createElement( 'div' );
    earthDiv.className = 'label planets';
    earthDiv.textContent = `${title}`;// name.title
    earthDiv.style.backgroundColor = 'transparent';//backgroundColor = 'transparent';


    const earthLabel = new CSS2DObject( earthDiv );
    earthLabel.position.x += 8 * (index+2);
    earthLabel.center.set(0,1);//0,1
    planetGroup.add(earthLabel );
    earthLabel.layers.set(0);
    
    labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize(window.innerWidth, window.innerHeight); //setSize(window.innerWidth, window.innerHeight);      
    labelRenderer.domElement.style.position = 'absolute'; 
    labelRenderer.domElement.style.top = '0px';

    planetsMap.set(title, planetGroup);
    sun.add(planetGroup);

}


// Define a method to create orbit meshes
const createOrbitMesh = (radius, tube, radialSegments, tubularSegments, color) => {
    const geometry = new THREE.TorusGeometry(radius, tube, radialSegments, tubularSegments);
    const material = new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: 0.3 });
    const mesh = new THREE.Mesh(geometry, material);
    return mesh;
};

// Create orbit meshes for each planet
for (let [index, { title, radius }] of planets.entries()) {
    console.log(index);
    if (title !== OBJECTS.SUN) {
        const orbitMesh = createOrbitMesh(8*index+16,0.1, 32, 64, 0xffffff);
        orbitMesh.rotation.x = -0.5  * Math.PI;// set plane location by turning it.
        

                sun.add(orbitMesh);

            }
        }
        document.getElementById("output").appendChild(labelRenderer.domElement);
        
        const controls = new OrbitControls( camera, labelRenderer.domElement );

const EARTH_YEAR = (2 * Math.PI) / 365;
let anim = true;
let rotationspeed=0.01;
//let clock=new THREE.Clock();


const animate = () => {

    if(anim){
    sun.rotation.y += rotationspeed;// 0.001

    planetsMap.get(OBJECTS.MERCURY).rotation.y +=  EARTH_YEAR * 4;//4
    planetsMap.get(OBJECTS.VENUS).rotation.y +=  EARTH_YEAR * 2;//2
    planetsMap.get(OBJECTS.EARTH).rotation.y += EARTH_YEAR;
    planetsMap.get(OBJECTS.MARS).rotation.y += EARTH_YEAR / 2;//2
    planetsMap.get(OBJECTS.JUPITER).rotation.y += EARTH_YEAR / 4;//4
    planetsMap.get(OBJECTS.SATURN).rotation.y += EARTH_YEAR / 8;//8
    planetsMap.get(OBJECTS.URANUS).rotation.y += EARTH_YEAR / 16;//16
    planetsMap.get(OBJECTS.NEPTUNE).rotation.y += EARTH_YEAR / 32;//32

    
    }

    renderer.render(scene, camera);

    labelRenderer.render( scene, camera );
    
    requestAnimationFrame(animate);
};

animate();

// Code For Play and Pause function
document.getElementById("hello").addEventListener("click", (e) =>  {
    // alert("hello");
    anim =!anim;
    if(anim){
        document.getElementById("hello").innerText = "pause";
    }
    else {
        document.getElementById("hello").innerText = "Play";
    }
});

// code for Solar System Speed Control 
document.getElementById("speed").addEventListener("click", (e) =>  {
   
    rotationspeed = document.getElementById("TimeInput").value/1000;   
    if(rotationspeed>10)  
    rotationspeed = 9;
});

// code for Solar System Speed Reset 
document.getElementById("reset").addEventListener("click", (e) =>  {
   
    rotationspeed = 0.01;   
    document.getElementById("TimeInput").value = " "; 
});
