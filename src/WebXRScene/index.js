import { WebGLRenderer } from "three/src/renderers/WebGLRenderer";
import { ARButton } from "../common/utils/ARButton.js";
import { createScene } from "./scene.js";
import { browserHasImmersiveArCompatibility } from "../common/utils/domUtils.js";
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import osDetector from "../common/osDetector"
import modelUtils from "../common/utils/modelUtils.js"
import roomStorage from "./roomStorage.js"
import storagePaths from "../common/utils/storagePaths.js"


var mode = "work";
//var mode = "text";
//var mode = "artool";

var operation = null;
var rotate = "rotate";
var scale = "scale";
var move = "move";

var maxModels = 5;

let os = osDetector.getMobileOperatingSystem();

const urlParams = new URLSearchParams(window.location.search);

let renderer;
var arButton;

let session = null;
let scene = null;

let modelsList;
let typesList;

const gltfLoader = new GLTFLoader();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("decoder/");
gltfLoader.setDRACOLoader(dracoLoader)
  .setMeshoptDecoder(MeshoptDecoder);

var isModelSelected = false;
// Variables for tracking movement
let joystickContainer = document.getElementById('joystick-container');
let joystick = document.getElementById('joystick');
let joystickActive = false;
let startX, startY, currentX, currentY;
let firstHittest = true;


// Function to update joystick logic
function updateJoystick(event) {
  if (!joystickActive) return;

  const touch = event.touches[0];
  const diffX = touch.clientX - startX;
  const diffY = touch.clientY - startY;

  // Limit the joystick movement to within a 50px radius from the center
  const angle = Math.atan2(diffY, diffX);
  const distance = Math.min(50, Math.sqrt(diffX * diffX + diffY * diffY));

  if (operation == rotate || operation == move) {
    joystick.style.left = `${50 + distance * Math.cos(angle) - 25}px`;
  }
  if (operation == scale || operation == move) {
    joystick.style.top = `${55 + distance * Math.sin(angle) - 30}px`;
  }

  if (scene && operation == move)
    scene.Move(diffX, diffY);

  if (scene && operation == rotate)
    scene.Rotate(distance * Math.cos(angle) > 0);

  if (scene && operation == scale) {

    if (diffY > 100)
      diffY = 100;

    if (diffY < -100)
      diffY = -100;

    var coof = 200 - (diffY + 100);

    scene.Scale(coof);
  }


  // Here you can update the movement of a 3D object
  console.log('Joystick X:', diffX, 'Joystick Y:', diffY);
}

// Event listeners for joystick touch events
joystickContainer.addEventListener('touchstart', (event) => {
  joystickActive = true;
  const touch = event.touches[0];
  startX = touch.clientX;
  startY = touch.clientY;
  updateJoystick(event);
}, false);

joystickContainer.addEventListener('touchmove', updateJoystick, false);

joystickContainer.addEventListener('touchend', () => {
  joystickActive = false;
  joystick.style.left = '25px';
  joystick.style.top = '30px';
}, false);

const sceneLoader =
{
  loader: null,
  init: () => {
    sceneLoader.loader = document.getElementById("place-finder");
  },
  show: () => {
    sceneLoader.loader.style.display = ""
  },
  hide: () => {
    sceneLoader.loader.style.display = "none"
  }
}

async function fetchModels() {
  try {
    window.gltfLoader = gltfLoader; // Expose for scene.js
    let responce = await modelUtils.getModels();
    modelsList = responce.data;
    window.modelsList = modelsList; // Expose for scene.js
    typesList = responce.types;
    for (let i = 0; i < modelsList.length; i++) {
      modelsList[i].glb = modelsList[i].glb.replace('models', storagePaths.getModelsBaseUrl());
      modelsList[i].preview = modelsList[i].preview.replace('models', storagePaths.getModelsBaseUrl());
    }
    for (let i = 0; i < typesList.length; i++) {
      typesList[i].preview = typesList[i].preview.replace('models', storagePaths.getModelsBaseUrl());
    }
  } catch (err) {
    console.error('Ошибка загрузки моделей:', err);
  }
}

function AddLogs(logs) {
  document.getElementById("log").innerText += logs + "\n";
}

function insertLogs(logs) {
  document.getElementById("log").innerText = logs + "\n";
}

/**
 * Панель выбора комнаты на стартовом экране.
 *
 * Комнату выбирают явно: в другой физической комнате открывается тот же
 * `xrviewer.html`, и молчаливое переиспользование прошлой комнаты подставило бы
 * туда чужую расстановку. `?roomId=` остаётся прямой ссылкой на конкретную комнату.
 */
function renderRoomPanel() {
  const activeRoom = roomStorage.getActiveRoom();
  const activeLabel = document.getElementById("roomActive");
  const roomList = document.getElementById("roomList");
  const roomBadge = document.getElementById("roomBadge");

  if (activeLabel)
    activeLabel.innerText = activeRoom
      ? `Активная комната: ${activeRoom.name}`
      : "Комната не выбрана";

  if (roomBadge) {
    roomBadge.innerText = activeRoom ? activeRoom.name : "";
    roomBadge.classList.toggle("hidden", activeRoom === null);
  }

  if (!roomList)
    return;

  roomList.innerHTML = "";

  for (const room of roomStorage.listRooms()) {
    const button = document.createElement("button");
    button.type = "button";
    button.classList.add("room-panel__room");

    if (activeRoom && room.roomId === activeRoom.roomId)
      button.classList.add("room-panel__room__selected");

    button.innerText = room.name;
    button.addEventListener("click", () => {
      try {
        roomStorage.setActiveRoom(room.roomId);
      } catch (err) {
        console.error("Не удалось открыть комнату.", err);
        return;
      }
      renderRoomPanel();
    });

    roomList.appendChild(button);
  }
}

function initRoomPanel() {
  if (!document.getElementById("roomPanel"))
    return;

  try {
    roomStorage.resolveRoomIdFromUrl();
  } catch (err) {
    console.error("Не удалось открыть комнату из ссылки.", err);
  }

  document.getElementById("roomCreate")?.addEventListener("click", () => {
    try {
      roomStorage.createRoom();
    } catch (err) {
      console.error("Не удалось создать комнату.", err);
      alert("Не удалось создать комнату: локальное хранилище недоступно.");
      return;
    }
    renderRoomPanel();
  });

  renderRoomPanel();
}

initRoomPanel();

function initializeXRApp() {
  const { devicePixelRatio, innerHeight, innerWidth } = window;

  var mainElement = document.getElementById("main");
  mainElement.classList.remove("hidden");

  renderer = new WebGLRenderer({ antialias: true, alpha: true });

  renderer.setSize(innerWidth, innerHeight);
  renderer.setPixelRatio(devicePixelRatio);

  renderer.xr.enabled = true;

  renderer.xr.addEventListener('sessionstart', function (event) {
    document.getElementById("main").classList.add("hidden");
    document.getElementById("ar-main").classList.remove("hidden");

    session = renderer.xr.getSession();
  });

  renderer.xr.addEventListener('sessionend', function (event) {

    window.location.reload();
  });

  document.body.appendChild(ARButton.createButton(renderer,
    {
      requiredFeatures: ["hit-test"],
      optionalFeatures: ['dom-overlay', 'dom-overlay-for-handheld-ar'],
      domOverlay: { root: document.body }
    }));

  sceneLoader.init();

  fetchModels().then(async (models) => {
    try {
      await LoadModels(typesList, gltfLoader, "types");
      scene = createScene(renderer, [], sceneLoader, selectModel, clearSelection, null, null, hitTestReady, AddLogs);
    } catch (e) { alert(e) }
  });

};


function hitTestReady() {
  if (firstHittest) {
    firstHittest = false;
    scene.startCalibration();
  }
}

window.saveArRoom = () => {
    if(scene) scene.saveRoom();
}

function showArOptions() {
  var optionsButtons = document.getElementById("optionsButtons");
  if (optionsButtons.classList.contains("hidden"))
    optionsButtons.classList.remove("hidden")
}

function hideArOptions() {
  var optionsButtons = document.getElementById("optionsButtons");
  optionsButtons.classList.add("hidden")
}

function showPut() {
  let el = document.getElementById("putModel");
  if (el.classList.contains("hidden"))
    el.classList.remove("hidden")
}

function hidePut() {
  let el = document.getElementById("putModel");
  if (!el.classList.contains("hidden"))
    el.classList.add("hidden")

}

function hide(elName) {
  let el = document.getElementById(elName);
  if (!el.classList.contains("hidden"))
    el.classList.add("hidden")
}

function show(elName) {
  let el = document.getElementById(elName);
  if (el.classList.contains("hidden"))
    el.classList.remove("hidden")
}

function showJoystick() {
  let el = document.getElementById("joystick-container");
  if (el.classList.contains("hidden"))
    el.classList.remove("hidden")

  if (operation == rotate) {
    hide("arrowHorizontalUp");
    hide("arrowHorizontalDown");
  }

  if (operation == scale) {
    hide("arrowHorizontalLeft");
    hide("arrowHorizontalRight");
  }
}
function hideJoystick() {
  let el = document.getElementById("joystick-container");
  if (!el.classList.contains("hidden"))
    el.classList.add("hidden")


  show("arrowHorizontalUp");
  show("arrowHorizontalDown");
  show("arrowHorizontalLeft");
  show("arrowHorizontalRight");
}

function hideArButtons() {
  [...document.getElementsByClassName("toolbar_button__selected")].forEach(el => {
    el.classList.add("hidden")
  });
}

function showArButtons() {
  [...document.getElementsByClassName("toolbar_button__selected")].forEach(el => {
    if (el.classList.contains("hidden"))
      el.classList.remove("hidden")
  });
}

function selectModel(mode = "all") {
  isModelSelected = true;

  if (mode == "all") {
    showArButtons()
  }

  if (mode == "put") {
    showPut();
  }

  hideArOptions();

}

function clearSelection() {
  isModelSelected = false;
  hideArButtons();
}

window.unselect = async () => {
  scene.unselect();
  showArOptions();
}

window.closeSession = () => {
  if (session != null)
    session.end();
}

window.putModel = () => {
  if (scene) {
    if (operation == move) {
      hideJoystick();
    }
    else
      scene.Place();

    hidePut();
    showArOptions();
  }
}

window.placeModel = () => {
  window.event.stopPropagation();
  if (session != null && scene != null) {
    scene.onSelect();
  }
}

function openSlider() {
  try {
    scene.startTransform();
    document.getElementById("toolbarButtons").classList.add("hidden");
    document.getElementById("transformDoneBtn").classList.remove("hidden");
    showJoystick();
    showPut();
  } catch (ex) { alert(ex); }
}

function closeSlider() {
  document.getElementById("toolbarButtons").classList.remove("hidden");
  document.getElementById("transformDoneBtn").classList.add("hidden");
  hideJoystick();
  hidePut();

  operation = null;
}

window.moveModel = () => {
  operation = move;
  openSlider();
  hideArButtons();
  showJoystick();
}

window.transformDone = () => {
  setTimeout(scene.stopTransform(), 2000);
  closeSlider();
  showArButtons();
}

let oldRotation = 100;
window.sliderChange = (element) => {

  if (operation == rotate) {
    if (oldRotation != element.value) {
      scene.Rotate(oldRotation < element.value);
      oldRotation = element.value;
    }
  }

  if (operation == scale) {
    scene.Scale(element.value);
    oldScale = element.value;
  }
}

window.rotateModel = () => {
  window.event.stopPropagation()
  operation = rotate;
  document.getElementById("modelSlider").value = 100;
  oldRotation = 100;
  openSlider();
}

window.scaleModel = () => {
  window.event.stopPropagation()
  operation = scale;
  document.getElementById("modelSlider").value = 100;
  openSlider();
}

window.removeModel = async () => {
  window.event.stopPropagation()

  if (session != null && scene != null) {
    await scene.onRemove();
    showArOptions();
  }
}


window.showAr = () => {
  arButton.click();
}

function hideBack() {
  document.getElementById("arBack").classList.add("hidden");
}

function showBack() {
  document.getElementById("arBack").classList.remove("hidden");
}

window.arBack = async () => {
  let sceneModels = await LoadModels(typesList, gltfLoader, "types");
  scene.models = [];
  hideBack();
}

async function LoadModels(items, gltfLoader, type = "models") {
  var placeWrapper = document.getElementById("places");
  placeWrapper.innerHTML = "";

  for (let i = 0; i < items.length; i++) {

    let button = document.createElement("button");

    button.id = "buttonModel" + i;
    button.classList.add("session-button");
    button.dataset.alias = items[i].alias;
    button.dataset.aliasindex = i;
    button.dataset.modelLoaded = false;

    button.dataset.baseType = type;
    button.dataset.type = items[i].type;

    if (type == "models")
      button.innerHTML += `<i id="spinnerModel${i}" class="fa fa-spinner fa-pulse fa-3x fa-spin loading-model" aria-hidden="true"></i>`;

    button.innerHTML += `<img class="session-button__image" src="${items[i].preview}" />`

    button.addEventListener("click", (e) => {
      ClickToArButton(e);
    });

    placeWrapper.appendChild(button);
  }

  GetModelAsync(items).then(models => {
    scene.setModels(models);
  })

  return items;
}
async function GetModelAsync(items) {
  for (let i = 0; i < items.length; i++) {
    var sceneModel = await gltfLoader.loadAsync(items[i].glb);
    items[i]["glb_model"] = sceneModel;

    console.log(sceneModel)

    var spinner = document.getElementById(`spinnerModel${i}`);
    spinner?.classList?.add("hidden");

    var button = document.getElementById(`buttonModel${i}`);
    button.dataset.modelLoaded = true;

  }

  return items;
}

function ClickToArButton(e) {

  var dataset = e.currentTarget.dataset;
  console.log(e.currentTarget.dataset);

  if (dataset.baseType == "types") {
    var models = modelsList.filter(x => x.type == dataset.type)
    console.log(models);

    LoadModels(models, gltfLoader, "models").then(models => {
      scene.setModels(models);
      showBack();
    });
    return;
  }

  var aliasindex = parseInt(e.currentTarget.dataset.aliasindex);

  if (e.currentTarget.dataset.modelLoaded == "false")
    return;

  if (session != null && scene != null) {
    scene.onSelect(aliasindex);
  }
}

function showQR() {
  var qrcodeElement = document.getElementById("qr-code");
  qrcodeElement.classList.remove("hidden");

  var baseUrl = window.location.origin;
  console.log(window.location);

  var host = window.location.host.toString();

  if (baseUrl.indexOf('127.0.0.1') >= 0 || baseUrl.indexOf('localhost') >= 0) {
    baseUrl = "https://192.168.100.27:" + host.split(':')[1];
  }

  new QRCode(qrcodeElement,
    {
      text: baseUrl + "/xrviewer.html",
      width: 400,
      height: 400,
    });
}


window.addEventListener('vlaunch-initialized', async (event) => {
  if (!isImmersiveArSupported && os != "Windows" && os != "Android") {
    var launchUrl = VLaunch.getLaunchUrl(window.location.href + '?instantWebxr=true')
    window.location.href = launchUrl
  }
})

const isImmersiveArSupported = await browserHasImmersiveArCompatibility();
async function start() {

  if (mode == "artool") {
    document.getElementById("main").classList.add("hidden");
    document.getElementById("ar-main").classList.remove("hidden");
    initializeXRApp();
    return;
  }

  isImmersiveArSupported
    ? initializeXRApp()
    : showQR();
}


try {

  if (os == "Android" || mode == "artool") {
    let main = document.getElementById("main");
    main.classList.remove("hidden");
    await start(false);
  } else if (os == "Windows") {
    showQR();
    document.body.appendChild(ARButton.createButton(renderer,
      {
        requiredFeatures: ["hit-test"],
        optionalFeatures: ['dom-overlay', 'dom-overlay-for-handheld-ar'],
        domOverlay: { root: document.body }
      }));
  } else {
    if (isImmersiveArSupported) {
      let main = document.getElementById("main");
      main.classList.remove("hidden");
      await start(false);
    }
  }

} catch (err) {
  alert(err);
}

