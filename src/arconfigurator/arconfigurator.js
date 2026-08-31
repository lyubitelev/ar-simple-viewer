
import * as THREE from 'three';
import Stats from 'three/addons/libs/stats.module.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import modelUtils from "../common/utils/modelUtils.js"
import modelIdentity from "../common/utils/modelIdentity.js"

const urlParams = new URLSearchParams(window.location.search);
let message = null;
let armessage = null;
let android = urlParams.get('android');
const id = urlParams?.get('id');
const mainDataId = urlParams?.get('mainDataId');
let ios = urlParams.get('ios');
const name = urlParams.get('alias');
let attributes = {};
let sceneParamerters = {};

// Ссылка на конфигуратор несёт id + mainDataId и должна открываться без локальной сессии создателя.
const resolved = await modelIdentity.resolveModel(id, mainDataId);
const folderId = resolved.folderId;
armessage = resolved.armessage;
message = resolved.message;

android = armessage?.src ?? android;
ios = armessage?.['ios-src'] ?? ios;

if (!android) {
    modelIdentity.showModelLoadError();
    throw new Error(`Модель не найдена: id=${id}, mainDataId=${mainDataId}`);
}

document.title = urlParams.get('name');

let mv = document.getElementById("model-viewer");

let scene, renderer, camera, stats;
let model, skeleton, mixer, clock, container, containerWrapper, hemiLight;
let floor;
let dirLight
let modelSize;
let controls;
let numAnimations;

const backgroundColor = "#d1e9ff",
    floorColor = "#d3cfcf",
    fogColor = "#d1e9ff",
    fogNear = 2,
    fogFar = 4,
    floorSize = { width: 7, height: 7 };

const PosX = 0, PosY = 0.5, PosZ = 1.5, TarX = 0, TarY = 0.05, TarZ = 0.1

window.loaderShow();

init();

function getControlsZoom(e) {

    document.getElementById("cam-zoom").innerHTML = 'Масштаб = ' + controls.getDistance();
}

var originalDistance = null;

function SetUpCamera(setPosition, setTarget) {
    camera = new THREE.PerspectiveCamera(45, containerWrapper.offsetWidth / containerWrapper.offsetHeight, 0.01, 100);

    if (setPosition)
        camera.position.set(setPosition.x, setPosition.y, setPosition.z);
    else
        camera.position.set(PosX, PosY, PosZ);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = true;
    controls.enableZoom = true;

    let zoomMax = document.getElementById("cam-zoom-max").value;
    let zoomMin = document.getElementById("cam-zoom-min").value;

    controls.minDistance = zoomMin;
    controls.maxDistance = zoomMax;

    if (setTarget)
        controls.target.set(setTarget.x, setTarget.y, setTarget.z);
    else
        controls.target.set(TarX, TarY, TarZ);


    controls.update();

    sceneParamerters["cameraPosition"] = camera.position;
    sceneParamerters["cameraTarget"] = controls.target;
    sceneParamerters["cameraZooming"] = {
        min: zoomMin,
        max: zoomMax
    };

}

var addAttribute = (name, value) => {
    attributes[name] = value
    mv.setAttribute(name, value)
}

addAttribute("src", android);
addAttribute("ios-src", ios);
addAttribute("name", name);

window.defaultCamera = () => {
    SetUpCamera();
    positionValueSetUp();
}

const showBack = document.getElementById('showBack')

showBack.addEventListener('change', (event) => {
    if (event.currentTarget.checked) {
        sceneParamerters.showBackButton = true;
    } else {
        sceneParamerters.showBackButton = false;
    }
})

const cacheModels = document.getElementById('cacheModels')

cacheModels.addEventListener('change', (event) => {
    if (event.currentTarget.checked) {
        sceneParamerters.cacheModels = true;
    } else {
        sceneParamerters.cacheModels = false;
    }
})

const zoomActivate = document.getElementById('zoomActivate');
sceneParamerters.zoomActivate = true;
zoomActivate.addEventListener('change', (event) => {
    if (event.currentTarget.checked) {
        sceneParamerters.zoomActivate = true;
    } else {
        sceneParamerters.zoomActivate = false;
    }
})

window.applyCamera = () => {
    let setPosition =
    {
        x: document.getElementById("cam-x").value,
        y: document.getElementById("cam-y").value,
        z: document.getElementById("cam-z").value,

    };
    let setTarget =
    {
        x: document.getElementById("tar-x").value,
        y: document.getElementById("tar-y").value,
        z: document.getElementById("tar-z").value,

    };

    SetUpCamera(setPosition, setTarget);
}

window.applySkybox = () => {
    scene.background = new THREE.Color(document.getElementById("back-color").value);
    floor.material.color = new THREE.Color(document.getElementById("floor-color").value);

    var fog = document.getElementById("fog");

    if (fog.checked == true) {
        console.log("fog", fog.checked);
        scene.fog = new THREE.Fog(document.getElementById("fog-color").value, document.getElementById("fog-near").value, document.getElementById("fog-far").value);
    }
    else
        scene.fog = null;


    let geom = new THREE.BoxGeometry(document.getElementById("floor-width").value, document.getElementById("floor-height").value, 100);
    floor.geometry = geom;

    sceneParamerters.sceneDecoration = {
        sceneBackground: scene.background,
        floorMaterialColor: floor.material.color,
        fog: scene.fog,
        fogEnable: fog.checked,
        width: document.getElementById("floor-width").value,
        height: document.getElementById("floor-height").value
    }

}

window.applyAR = () => {
    var arPlacementValue = document.getElementById("ar-attachment").value;
    var arScaleValue = document.getElementById("ar-scale").value;

    sceneParamerters.ar =
    {
        arPlacement: arPlacementValue,
        arScale: arScaleValue
    }

}

window.defaultSkybox = () => {
    document.getElementById("back-color").value = backgroundColor;
    document.getElementById("floor-color").value = floorColor;
    document.getElementById("fog").checked = true;
    document.getElementById("fog-near").value = fogNear;
    document.getElementById("fog-far").value = fogFar;
    document.getElementById("fog-color").value = fogColor;

    window.applySkybox();
}

window.rangeValueChange = (element, prop) => {
    document.getElementById(element.name + "-value").innerText = element.value;

    if (element.name.indexOf("-x") > 0) {
        dirLight.position.set(element.value, dirLight.position.y, dirLight.position.z)
    }

    if (element.name.indexOf("-y") > 0) {
        dirLight.position.set(dirLight.position.x, element.value, dirLight.position.z)
    }

    if (element.name.indexOf("-z") > 0) {
        dirLight.position.set(dirLight.position.x, dirLight.position.y, element.value)
    }


    if (element.name == "intensity") {
        dirLight.intensity = element.value;
    }

    if (element.name == "hemis-intensity") {
        hemiLight.intensity = element.value;
    }

    if (element.name.indexOf("-hx") > 0) {
        hemiLight.position.set(element.value, hemiLight.position.y, hemiLight.position.z)
    }

    if (element.name.indexOf("-hy") > 0) {
        hemiLight.position.set(hemiLight.position.x, element.value, hemiLight.position.z)
    }

    if (element.name.indexOf("-hz") > 0) {
        hemiLight.position.set(hemiLight.position.x, hemiLight.position.y, element.value)
    }
    if (element.name == "hemis-ground-color") {
        hemiLight.groundColor = new THREE.Color(element.value);
    }
    if (element.name == "hemis-sky-color") {
        hemiLight.color = new THREE.Color(element.value);
    }

    if (element.name == "direct-color") {
        dirLight.color = new THREE.Color(element.value);
    }

    if (element.name.indexOf("shadow") >= 0 && prop != null) {
        dirLight.shadow[prop] = parseFloat(element.value);

    }
    sceneParamerters["lightning"] = {
        position: dirLight.position,
        intensity: dirLight.intensity,
        color: dirLight.color,
        bias: dirLight.shadow.bias
    }

    sceneParamerters["hemiLight"] = {
        intensity: hemiLight.intensity,
        groundColor: hemiLight.groundColor,
        color: hemiLight.color
    }
}

function jsonToBase64(object) {
    const json = JSON.stringify(object);
    return btoa(json);
}

var generateNewLink = async () => {

    let attstring = "";
    for (var prop in attributes) {
        attstring += `${prop}=${attributes[prop]}&`
    }

    sceneParamerters.modelTitle = document.getElementById("modelTitle").checked

    if (sceneParamerters.modelTitle == true) {
        sceneParamerters.modelTitleText = document.getElementById("iframe-title").value;

        sceneParamerters.modelTitleStyle = `font-family: ${document.getElementById("titleFont").value};` +
            `font-weight: ${document.getElementById("titleFontWeight").value};` +
            `color: ${document.getElementById("titleFontColor").value};` +
            `font-size: ${document.getElementById("titleFontSize").value}px`;
    }

    if (sceneParamerters.showBackButton == true) {
        sceneParamerters.backButtonStyle = `font-family: ${document.getElementById("buttonFont").value};` +
            `font-weight: ${document.getElementById("buttonFontWeight").value}; ` +
            `color: ${document.getElementById("buttonFontColor").value};` +
            `font-size: ${document.getElementById("buttonFontSize").value}px;`;

        sceneParamerters.buttonUrl = document.getElementById("buttonUrl").value;
    }

    var armessage = jsonToBase64(attributes);
    var message = jsonToBase64(sceneParamerters);
    await modelUtils.updateModel(folderId, id, armessage, message);

    var baseUrl = window.location.origin;

    if (baseUrl.indexOf('127.0.0.1') >= 0 || baseUrl.indexOf('localhost') >= 0) {
        baseUrl = "https://192.168.100.27:5502"
    }

    let newLink = baseUrl + `/viewer.html?id=${id}&mainDataId=${folderId}`;

    return newLink;
}

window.generateLink = async () => {
    window.open(await generateNewLink());
}

window.openInTheSameWindow = async () => {
    location.href = await generateNewLink();
}

window.generateQR = async () => {
    let link = await generateNewLink();

    document.getElementById("qrcode").innerHTML = "";
    new QRCode(document.getElementById("qrcode"),
        {
            text: link,
            width: 400,
            height: 400,
        });
}

window.generateIFrame = async () => {
    let link = await generateNewLink();
    var iframe = document.createElement("iframe");
    iframe.src = link;
    iframe.frameBorder = 0;
    iframe.width = document.getElementById("iframe-with").value;
    iframe.height = document.getElementById("iframe-height").value;

    iframe.title = document.getElementById("iframe-title").value;
    iframe.setAttribute("alt", document.getElementById("iframe-alt").value);


    document.getElementById("iframeText").innerText = iframe.outerHTML;
}


window.uploadIcon = () => {

    let icon = document.getElementById("iconfile").files[0];
    let formData = new FormData();

    let status = document.getElementById("uploadStatus");
    status.innerText = "uploading"
    status.className = "icon-upload-margin";
    status.classList.add("icon-upload-process");

    formData.append("file", icon);

    //TODO: add server code to save icon
    /*
    fetch('https://api-gw.dev.homeoutside.com/armodels/logo', { method: "POST", body: formData })
        .then((response) => response.json()).then((json) => {
            sceneParamerters.titleIcon = json.uri;
            status.className="icon-upload-margin";
            status.classList.add("icon-upload-success");
            status.innerText ="uploaded"
        })
        .catch(()=>
        {
            status.className="icon-upload-margin";
            status.classList.add("icon-upload-error");
            status.text="error"
        });*/

}

window.clearIcon = () => {
    document.getElementById("iconfile").value = null;
}


window.defaultLighting = () => {

    document.getElementById("light-x").value = -10;
    window.rangeValueChange(document.getElementById("light-x"));

    document.getElementById("light-y").value = 10;
    window.rangeValueChange(document.getElementById("light-y"));

    document.getElementById("light-z").value = -10;
    window.rangeValueChange(document.getElementById("light-z"));

    document.getElementById("intensity").value = 3;
    window.rangeValueChange(document.getElementById("intensity"));

    document.getElementById("hemis-intensity").value = 2;
    window.rangeValueChange(document.getElementById("hemis-intensity"));

}

function positionValueSetUp(state) {


    if (state == "default") {
        document.getElementById("cam-x").value = PosX;
        document.getElementById("cam-y").value = PosY;
        document.getElementById("cam-z").value = PosZ;

        document.getElementById("tar-x").value = TarX;
        document.getElementById("tar-y").value = TarY;
        document.getElementById("tar-z").value = TarZ;


    } else {

        document.getElementById("cam-x").value = camera.position.x;
        document.getElementById("cam-y").value = camera.position.y;
        document.getElementById("cam-z").value = camera.position.z;

        document.getElementById("tar-x").value = controls.target.x;
        document.getElementById("tar-y").value = controls.target.y;
        document.getElementById("tar-z").value = controls.target.z;
    }

    sceneParamerters["cameraPosition"] = camera.position;
    sceneParamerters["cameraTarget"] = controls.target;
}

function init() {

    container = document.getElementById('container');
    containerWrapper = document.getElementById('container-wrapper');

    clock = new THREE.Clock();

    scene = new THREE.Scene();
    scene.background = new THREE.Color(backgroundColor);
    scene.fog = new THREE.Fog(fogColor, fogNear, fogFar);

    hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 2);
    hemiLight.position.set(0, 50, 0);
    scene.add(hemiLight);

    dirLight = new THREE.DirectionalLight(0xffffff, 3);
    dirLight.position.set(-10, 10, -10);
    dirLight.castShadow = true;
    dirLight.shadow.camera.top = 2;
    dirLight.shadow.camera.bottom = - 2;
    dirLight.shadow.camera.left = - 2;
    dirLight.shadow.camera.right = 2;
    dirLight.shadow.camera.near = 0.1;
    dirLight.shadow.camera.far = 40;
    scene.add(dirLight);

    // ground
    floor = new THREE.Mesh(new THREE.BoxGeometry(floorSize.width, floorSize.height, 100), new THREE.MeshPhongMaterial({ color: floorColor, depthWrite: false }));

    floor.position.set(0, -50, 0)

    floor.rotation.x = - Math.PI / 2;
    floor.receiveShadow = true;

    floor.name = "floor";
    scene.add(floor);


    const gltfLoader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("decoder/");

    gltfLoader.setDRACOLoader(dracoLoader)
    .setMeshoptDecoder(MeshoptDecoder);


    gltfLoader.load(android, async (gltf) => {
        scene.add(gltf.scene);
        model = gltf.scene;

        const box = new THREE.Box3().setFromObject(gltf.scene);
        modelSize = box.getSize(new THREE.Vector3());

        positionValueSetUp();
        window.applySkybox();

        SetUpCamera({
            x: camera.position.x,
            y: modelSize.y,
            z: camera.position.z,
        },
            {
                x: controls.target.x,
                y: modelSize.y / 2,
                z: controls.target.z
            });

        controls.addEventListener('start', getControlsZoom);

        controls.update();
        model.traverse(function (object) {
            if (object.isMesh) {
                object.castShadow = true;
                object.receiveShadow = true;
            }
        });
        setUpAnimation(model);
        window.loaderHide();
    })

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(containerWrapper.offsetWidth, containerWrapper.offsetHeight);
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);


    // camera
    SetUpCamera();

    controls.addEventListener('change', (e) => {
        positionValueSetUp();
    });

    // positionValueSetUp("default");
    stats = new Stats();

    window.addEventListener('resize', onWindowResize);
}

function setUpAnimation(model) {
    skeleton = new THREE.SkeletonHelper(model);
    skeleton.visible = false;
    scene.add(skeleton);

    const animations = model.animations;
    mixer = new THREE.AnimationMixer(model);

    numAnimations = animations.length;

    for (let i = 0; i !== numAnimations; ++i) {

        let clip = animations[i];
        const name = clip.name;

        if (baseActions[name]) {

            const action = mixer.clipAction(clip);
            activateAction(action);
            baseActions[name].action = action;
            allActions.push(action);

        } else if (additiveActions[name]) {

            // Make the clip additive and remove the reference frame
            THREE.AnimationUtils.makeClipAdditive(clip);
            if (clip.name.endsWith('_pose')) {
                clip = THREE.AnimationUtils.subclip(clip, clip.name, 2, 3, 30);
            }

            const action = mixer.clipAction(clip);
            activateAction(action);
            additiveActions[name].action = action;
            allActions.push(action);
        }

    }

    animate();
}

function activateAction(action) {
    const clip = action.getClip();
    const settings = baseActions[clip.name] || additiveActions[clip.name];
    setWeight(action, settings.weight);
    action.play();

}

// This function is needed, since animationAction.crossFadeTo() disables its start action and sets
// the start action's timeScale to ((start animation's duration) / (end animation's duration))

function setWeight(action, weight) {
    action.enabled = true;
    action.setEffectiveTimeScale(1);
    action.setEffectiveWeight(weight);

}

function onWindowResize() {
    camera.aspect = containerWrapper.offsetWidth / containerWrapper.offsetHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(containerWrapper.offsetWidth, containerWrapper.offsetHeight);
}

function animate() {
    // Render loop
    requestAnimationFrame(animate);
    for (let i = 0; i !== numAnimations; ++i) {
        const action = allActions[i];
        const clip = action.getClip();
        const settings = baseActions[clip.name] || additiveActions[clip.name];
        settings.weight = action.getEffectiveWeight();
    }

    const mixerUpdateDelta = clock.getDelta();
    mixer.update(mixerUpdateDelta);
    stats.update();
    renderer.render(scene, camera);

}
