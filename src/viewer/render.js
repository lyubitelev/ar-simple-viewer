
import * as THREE from 'three';
import Stats from 'three/addons/libs/stats.module.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import osDetector from "../common/osDetector"
import * as TWEEN from "three/addons/libs/tween.module.js";
import modelUtils from "../common/utils/modelUtils.js"
import modelIdentity from "../common/utils/modelIdentity.js"

const container = document.getElementById('container');
let mv = document.getElementById("model-viewer");

let message = null;
let scene, renderer, camera, stats;
let model, skeleton, mixer, clock;
let controls;
let numAnimations;
let armessage = null;
let newCache;
let arButton = document.getElementById("ar-button-repiter");
let os = osDetector.getMobileOperatingSystem();

window.loaderShow();

const urlParams = new URLSearchParams(window.location.search);
const id = urlParams?.get('id');
const mainDataId = urlParams?.get('mainDataId');

// Публичная ссылка/QR несут id + mainDataId и должны открываться без локальной сессии создателя.
const resolved = await modelIdentity.resolveModel(id, mainDataId);
const folderId = resolved.folderId;
armessage = resolved.armessage;
message = resolved.message;

console.log(armessage, message);

let signedUrl = null;

var addAttribute = (name, value) => {
    mv.setAttribute(name, value)
}

function ApplyARSettings() {
    if (armessage == null)
        urlParams.forEach((value, key) => {
            addAttribute(key, value);
        });
    else
        for (let prop in armessage) {
            addAttribute(prop, armessage[prop]);
        }
}

let android = armessage?.src ?? urlParams.get('src');
let name = armessage?.name ?? urlParams.get('name');

if (!android) {
    modelIdentity.showModelLoadError();
    throw new Error(`Модель не найдена: id=${id}, mainDataId=${mainDataId}`);
}

document.title = name;

if (message?.titleIcon) {
    var titleIcon = document.getElementById("titleIcon");
    titleIcon.classList.remove("hidden");
    titleIcon.src = message?.titleIcon;
}

if (message?.showBackButton == true) {
    document.getElementById("back").classList.remove('hidden');

    if (message?.backButtonStyle) {
        document.getElementById("back").setAttribute("style", message?.backButtonStyle);
    }
}

if (message?.zoomActivate == false) {
    document.getElementById("zoomButtons").classList.add('hidden');
}

if (message?.modelTitle == true) {
    var modelTitle = document.getElementById("modelTitle");

    modelTitle.setAttribute("style", message?.modelTitleStyle);

    modelTitle.innerText = message.modelTitleText
}

/* TODO: For Ar logs
fetch("https://api-gw.dev.homeoutside.com/armodels/uploadurl?name=" + name)
    .then(response => response.json())
    .then((urlObj) => {
        signedUrl = urlObj.url;
    });*/
let arWorks = false;
const onProgress = (event) => {
    if (event.detail.totalProgress === 1) {
        if (mv.canActivateAR) {
            arWorks = true;
        }
        event.target.removeEventListener('progress', onProgress);
        mv.classList.add("hidden");
        mv.setAttribute("reveal", "manual");

        if (message?.ar) {
            mv.setAttribute("ar-placement", message.ar.arPlacement);
            mv.setAttribute("ar-scale", message.ar.arScale);
        }

        ApplyARSettings();
    }
};

mv.addEventListener('progress', onProgress);
mv.setAttribute("src", android);

// Единый lifecycle индикатора загрузки: и прямая загрузка через GLTFLoader,
// и путь с кэшем (fetch -> cache -> blob URL) показывают один и тот же бокс.
let progressBox = null;

function showProgress() {
    if (progressBox)
        return progressBox;

    progressBox = document.createElement('div');
    progressBox.className = 'viewer-progress';
    progressBox.innerText = 'Загрузка модели…';
    document.body.appendChild(progressBox);

    return progressBox;
}

function updateProgress(loaded, total) {
    // Размер известен не всегда, поэтому без Content-Length показываем честные мегабайты.
    showProgress().innerText = total
        ? `Загрузка модели: ${Math.round(loaded / total * 100)}%`
        : `Загрузка модели: ${(loaded / (1024 * 1024)).toFixed(1)} МБ`;
}

function hideProgress() {
    progressBox?.remove();
    progressBox = null;
}

/**
 * Единственная точка обработки сбоя загрузки модели: гасит прогресс и показывает
 * честную ошибку, которая через showModelLoadError гасит и старый спиннер страницы.
 */
function failModelLoad(err) {
    console.error('Не удалось загрузить модель.', err);
    hideProgress();
    modelIdentity.showModelLoadError();
}

let cachedModels = [];
if ('caches' in window && message?.cacheModels == true) {
    newCache = await caches.open('models-cache');
    const requests = await newCache.keys();
    cachedModels = requests.map(request => request.url);

    console.log(cachedModels);
}

if ('caches' in window && message?.cacheModels == true) {
    cacheModel();
} else {
    init();
}

var generateQR = async (link) => {

    var qrcodeElement = document.getElementById("qr-code");
    var qrcodeWrapper = document.getElementById("qrcode-wrapper");
    var qrcodeBorder = document.getElementsByClassName("qr-code-border")[0];

    let width = 400;
    let height = 400;
    if (document.body.clientWidth < 550 || document.body.clientHeight < 550) {
        width = 190;
        height = 190;

        qrcodeElement.classList.add("qr-code__min");
        qrcodeBorder.classList.add("qr-code-border__min");
    }

    qrcodeElement.innerHTML = "";
    qrcodeWrapper.classList.remove("hidden");

    new QRCode(document.getElementById("qr-code"),
        {
            text: link,
            width: width,
            height: height,
        });

}

function jsonToBase64(object) {
    const json = JSON.stringify(object);
    return btoa(json);
}

async function openArViewer() {
    var baseUrl = window.location.origin;
    let link = baseUrl + `/viewer.html?id=${id}&mainDataId=${folderId}`;

    if (folderId)
        await modelUtils.updateModel(folderId, id, jsonToBase64(armessage), jsonToBase64(message));
    if (arWorks) {
        document.getElementById("ar-button").click();
    } else {
        generateQR(link);
    }
}

window.aRShow = async () => {
    await openArViewer();
}

window.backOnClick = () => {
    if (message?.buttonUrl)
        document.location = message?.buttonUrl;
    else
        history.back();

}

/**
 * Читает тело ответа потоком: сетевое скачивание — самая долгая часть загрузки,
 * и пользователь должен видеть её прогресс, а не пустой спиннер.
 */
async function readModelBlob(response) {
    const total = Number(response.headers.get('Content-Length')) || 0;
    const reader = response.body.getReader();
    const chunks = [];
    let loaded = 0;

    updateProgress(loaded, total);

    while (true) {
        const { done, value } = await reader.read();

        if (done)
            break;

        chunks.push(value);
        loaded += value.length;
        updateProgress(loaded, total);
    }

    return new Blob(chunks, { type: 'model/glb-binary' });
}

/**
 * Загрузка с кэшем: fetch -> cache -> blob URL -> init(). Сбой сети и не-2xx ответ
 * не должны выглядеть как успешная загрузка и не должны оставлять вечный лоадер.
 */
async function cacheModel() {
    showProgress();

    let glbBlob;

    try {
        let response = cachedModels.indexOf(android) >= 0 ? await newCache.match(android) : null;

        if (!response) {
            response = await fetch(android);

            // fetch резолвится и на 403/404/500 — это не успешная загрузка.
            if (!response.ok)
                throw new Error(`Модель недоступна: HTTP ${response.status}`);

            if (!response.body)
                throw new Error('Модель недоступна: пустой ответ.');

            newCache.put(android, response.clone())
                .catch((err) => console.warn('Не удалось сохранить модель в кэше.', err));
        }

        glbBlob = await readModelBlob(response);
    }
    catch (err) {
        // Дальше по цепочке ошибку обрабатывать некому: сеть/кэш — это её граница.
        failModelLoad(err);
        return;
    }

    // Ошибки самой сцены остаются на GLTFLoader.onError, чтобы cleanup был в одном месте.
    android = window.URL.createObjectURL(glbBlob);
    init();
}

function tween(inout) { // in - true, out - false
    let desiredDistance = inout ? parseFloat(controls.getDistance()) + 0.4 : parseFloat(controls.getDistance()) - 0.4;

    if (desiredDistance > controls.maxDistance)
        desiredDistance = maxDistance;

    if (desiredDistance < controls.minDistance)
        desiredDistance = minDistance;

    let dir = new THREE.Vector3();
    camera.getWorldDirection(dir);
    dir.negate();
    let dist = controls.getDistance();
    new TWEEN.Tween({ val: dist })
        .to({ val: desiredDistance }, 300)
        .onUpdate(val => {
            camera.position.copy(controls.target).addScaledVector(dir, val.val);
        })
        .start();
}

window.zoomIn = () => {
    tween(false);
}

window.zoomOut = () => {
    tween(true);
}

function init() {
    clock = new THREE.Clock();
    scene = new THREE.Scene();

    if (message?.sceneDecoration?.sceneBackground)
        scene.background = new THREE.Color(message?.sceneDecoration?.sceneBackground);
    else
        scene.background = new THREE.Color(13756927);

    if (message?.sceneDecoration?.fog)
        scene.fog = new THREE.Fog(message?.sceneDecoration?.fog?.color, message?.sceneDecoration?.fog?.near, message?.sceneDecoration?.fog?.far);
    else
        scene.fog = new THREE.Fog(13756927, 5, 6);

    if (message?.sceneDecoration?.fogEnable == false)
        scene.fog = null

    let hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 2);

    if (message?.hemiLight)
        hemiLight = new THREE.HemisphereLight(message?.hemiLight?.color, message?.hemiLight?.groundColor, message?.hemiLight.intensity);

    hemiLight.position.set(0, 50, 0);
    scene.add(hemiLight);
    let dirLight = new THREE.DirectionalLight(0xffffff, 3);
    if (message?.lightning) {
        dirLight = new THREE.DirectionalLight(message?.lightning.color, message?.lightning?.intensity);
        dirLight.position.set(message?.lightning.position.x, message?.lightning.position.y, message?.lightning.position.z);
    }
    else {
        dirLight = new THREE.DirectionalLight(0xffffff, 3);
        dirLight.position.set(-10, 10, -10);
    }

    dirLight.castShadow = true;
    dirLight.shadow.camera.top = 2;
    dirLight.shadow.camera.bottom = - 2;
    dirLight.shadow.camera.left = - 2;
    dirLight.shadow.camera.right = 2;
    dirLight.shadow.camera.near = 0.1;
    dirLight.shadow.camera.far = 40;

    if (message?.lightning?.bias)
        dirLight.shadow.bias = message?.lightning?.bias;

    scene.add(dirLight);
    // ground

    let floorColor = 13881295;
    if (message?.sceneDecoration?.floorMaterialColor)
        floorColor = message?.sceneDecoration?.floorMaterialColor

    let mesh = new THREE.Mesh(new THREE.BoxGeometry(100, 100, 100), new THREE.MeshPhongMaterial({ color: "#A0A0A0", depthWrite: false }));

    if (message?.sceneDecoration)
        mesh = new THREE.Mesh(new THREE.BoxGeometry(message?.sceneDecoration.width, message?.sceneDecoration.height, 100), new THREE.MeshPhongMaterial({ color: floorColor, depthWrite: false }));

    mesh.position.set(0, -50, 0)
    mesh.rotation.x = - Math.PI / 2;
    mesh.receiveShadow = true;
    scene.add(mesh);

    const gltfLoader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("decoder/");
    gltfLoader.setDRACOLoader(dracoLoader)
        .setMeshoptDecoder(MeshoptDecoder);

    // Модель едет по сети десятки секунд, поэтому нужен видимый прогресс.
    // Без onError сбой загрузки не гасил лоадер: спиннер крутился бы вечно.
    showProgress();

    gltfLoader.load(android, async (gltf) => {
        hideProgress();
        scene.add(gltf.scene);
        console.log(gltf.scene);
        model = gltf.scene;
        setUpAnimation(model);
        window.loaderHide();
    }, (event) => {
        updateProgress(event.loaded, event.total);
    }, failModelLoad)

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // camera
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 100);

    if (message?.cameraPosition) {
        camera.position.set(message.cameraPosition.x, message.cameraPosition.y, message.cameraPosition.z);
    } else {
        camera.position.set(- 1, 1.5, 3);
    }

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = false;
    controls.enableZoom = true;

    if (message?.cameraZooming) {
        controls.minDistance = message?.cameraZooming.min;
        controls.maxDistance = message?.cameraZooming.max;
    }

    if (message?.cameraTarget)
        controls.target.set(message.cameraTarget.x, message.cameraTarget.y, message.cameraTarget.z);
    else
        controls.target.set(0, 1, 0);

    controls.update();

    stats = new Stats();
    window.addEventListener('resize', onWindowResize);
}

function setUpAnimation(model) {
    model.traverse(function (object) {
        if (object.isMesh) {
            object.castShadow = true;
            object.receiveShadow = true;
        }
    });

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
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
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

    // Get the time elapsed since the last frame, used for mixer update

    const mixerUpdateDelta = clock.getDelta();

    // Update the animation mixer, the stats panel, and render this frame

    TWEEN.update();
    mixer.update(mixerUpdateDelta);

    stats.update();

    renderer.render(scene, camera);
}

window.closeQR = () => {
    var qrcodeWrapper = document.getElementById("qrcode-wrapper");
    qrcodeWrapper.classList.add("hidden");
};
