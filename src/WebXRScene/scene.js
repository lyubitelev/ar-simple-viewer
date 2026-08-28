import { createPlaneMarker, createPlaceButton } from "./createPlaneMarker";
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { handleXRHitTest } from "../common/xr/hitTest";
import { resolveRoomId, saveRoomLayout, loadRoomLayout } from "./roomStorage.js";

import {
  AmbientLight,
  DirectionalLight,
  HemisphereLight,
  Matrix4,
  Mesh,
  Object3D,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
  XRFrame,
  Box3,
  Raycaster,
  BoxGeometry,
  MeshBasicMaterial,
  Vector3,
  MeshNormalMaterial
} from "three";



// Custom 3D model augmentation

export function createScene(renderer, sceneModels, loader = null, selectModel = null, clearSelection = null, max = 5, changeModelsNumber = null, hittestRady = null, AddLogs = null) {
  const scene = new Scene();

  var intersectedObject;
  var isTransforming = false;

  // Сохранённый layout принадлежит конкретной комнате, а не origin'у в целом.
  const roomId = resolveRoomId();

  let calibrationStep = 0;
  let roomOriginMatrix = new Matrix4();
  let pointAMatrix = new Matrix4();
  let pointBMatrix = new Matrix4();
  let roomInverseMatrix = new Matrix4();

  function startCalibration() {
    calibrationStep = 1;
    let ui = document.getElementById("calibrationUI");
    if(ui) {
      ui.classList.remove("hidden");
      document.getElementById("calibrationText").innerText = "Шаг 1: Наведите прицел (кружок) на левый угол стены и коснитесь экрана";
    }
  }

  function handleCalibrationTap() {
     if(!planeMarker.visible) return;
     if(calibrationStep === 1) {
         pointAMatrix.copy(planeMarker.matrix);
         calibrationStep = 2;
         document.getElementById("calibrationText").innerText = "Шаг 2: Теперь наведите на правый угол стены и коснитесь экрана";
     } else if(calibrationStep === 2) {
         pointBMatrix.copy(planeMarker.matrix);
         calibrationStep = 0;
         document.getElementById("calibrationUI").classList.add("hidden");
         
         let posA = new Vector3().setFromMatrixPosition(pointAMatrix);
         let posB = new Vector3().setFromMatrixPosition(pointBMatrix);
         
         let xAxis = new Vector3().subVectors(posB, posA).normalize();
         let yAxis = new Vector3(0, 1, 0);
         let zAxis = new Vector3().crossVectors(xAxis, yAxis).normalize();
         xAxis.crossVectors(yAxis, zAxis).normalize();
         
         roomOriginMatrix.makeBasis(xAxis, yAxis, zAxis);
         roomOriginMatrix.setPosition(posA);
         roomInverseMatrix.copy(roomOriginMatrix).invert();

         loadSavedRoom();
         let optionsButtons = document.getElementById("optionsButtons");
         if(optionsButtons) optionsButtons.classList.remove("hidden");
     }
  }

  function saveRoom() {
     if(calibrationStep > 0) {
         alert("Сначала завершите калибровку!");
         return;
     }
     let savedModels = [];
     installedModels.forEach(item => {
        let model = item.model;
        let worldMatrix = model.matrix;
        let localMatrix = new Matrix4().multiplyMatrices(roomInverseMatrix, worldMatrix);
        
        savedModels.push({
           alias: model.userData.alias,
           matrix: localMatrix.toArray()
        });
     });
     try {
        saveRoomLayout(roomId, savedModels);
     } catch(e) {
        console.error("Не удалось сохранить комнату", e);
        alert("Не удалось сохранить комнату: локальное хранилище недоступно.");
        return;
     }
     alert("Комната сохранена! Мебель появится на этих же местах при следующем запуске этой комнаты.");
  }

  async function loadSavedRoom() {
     const savedModels = loadRoomLayout(roomId);
     if(savedModels.length === 0) return;
     try {
        for(let data of savedModels) {
            let modelAlias = data.alias;
            let mData = window.modelsList ? window.modelsList.find(m => m.alias === modelAlias) : null;
            if(!mData) continue;

            if(!mData.glb_model && window.gltfLoader) {
               mData.glb_model = await window.gltfLoader.loadAsync(mData.glb);
            }

            let newModel = mData.glb_model.scene.clone();
            newModel.userData.alias = modelAlias;
            newModel.visible = true;
            newModel.matrixAutoUpdate = false;

            let localMatrix = new Matrix4().fromArray(data.matrix);
            let worldMatrix = new Matrix4().multiplyMatrices(roomOriginMatrix, localMatrix);
            
            newModel.matrix.copy(worldMatrix);
            scene.add(newModel);

            // Reconstruct bounding boxes
            const materialboundaryBox = new MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0 });
            var mesh = getFirstMeshInScene(newModel);
            const box3 = new Box3().setFromObject(mesh);
            const boxGeometry = new BoxGeometry(box3.getSize(new Vector3()).x, box3.getSize(new Vector3()).y, box3.getSize(new Vector3()).z);
            const boundaryBox = new Mesh(boxGeometry, materialboundaryBox);
            boundaryBox.setRotationFromMatrix(worldMatrix);
            boundaryBox.position.setFromMatrixPosition(worldMatrix);
            boundaryBox.name = "modelBox";
            scene.add(boundaryBox);

            const hightLightBoxGeometry = new BoxGeometry(box3.getSize(new Vector3()).x + 0.01, 0.02, box3.getSize(new Vector3()).z + 0.01);
            const materialhightLightBox = new MeshBasicMaterial({ color: 0xe6ffe6, transparent: false });
            const hightLightBox = new Mesh(hightLightBoxGeometry, materialhightLightBox);
            hightLightBox.setRotationFromMatrix(worldMatrix);
            hightLightBox.position.setFromMatrixPosition(worldMatrix);
            hightLightBox.name = "hightLightBox";
            hightLightBox.visible = false;
            scene.add(hightLightBox);

            installedModels.push({
               model: newModel,
               boundaryBox: boundaryBox,
               hightLightBox: hightLightBox
            });
        }
        if (changeModelsNumber) changeModelsNumber(installedModels.length);
     } catch(e) {
        console.error("Error loading saved room", e);
     }
  }

  const camera = new PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    0.02,
    20,
  );

  /**
   * Add some simple ambient lights to illuminate the model.
   */
  const ambientLight = new AmbientLight(0xffffff, 1.0);
  scene.add(ambientLight);


  /**
   * Load the gLTF model and assign result to variable.
   */
  var models = sceneModels;

  /**
   * Create the plane marker to show on tracked surfaces.
   */
  const planeMarker = createPlaneMarker();
  let selectedModel;
  scene.add(planeMarker);
  //scene.add(placeButton);


  /**
   * Setup the controller to get input from the XR space.
   */
  // Controllers
  var controller1 = renderer.xr.getController(0);
  controller1.addEventListener('selectstart', onSelectStart);
  scene.add(controller1);

  var controller2 = renderer.xr.getController(1);
  controller2.addEventListener('selectstart', onSelectStart);
  scene.add(controller2);

  //controller.addEventListener("select", onSelect);

  /**
   * The onSelect function is called whenever we tap the screen
   * in XR mode.
   */

  // Raycasting setup
  const raycaster = new Raycaster();
  let tempMatrix = new Matrix4();

  function hightLightObject(boundaryBox) {
    if (boundaryBox) {
      let hModel = installedModels.filter(x => x.boundaryBox == boundaryBox)[0];
      hModel.hightLightBox.visible = true;
      selectedModel = hModel;

      if (selectModel)
        selectModel(hModel.model);
    }
  }

  function unHightLightObject(boundaryBox) {
    try {
      if (boundaryBox) {
        let model = installedModels.filter(x => x.boundaryBox == boundaryBox);
        model[0].hightLightBox.visible = false;
        intersectedObject = null;
        selectedModel = null;

        if (clearSelection)
          clearSelection();
      }
    } catch (ex) {
      alert(ex);
    }
  }


  function setModels(sourceModels) {
    models = sourceModels;
  }

  function nextPlace() {
    currentModel = null;
    currentPosition = null;
  }

  let installedModels = [];

  var currentModel = null;
  var currentPosition = null;

  function onSelectStart(event) {
    if (isTransforming)
      return;

    if (calibrationStep > 0) {
      handleCalibrationTap();
      return;
    }

    try {
      const controller = event.target;
      tempMatrix.identity().extractRotation(controller.matrixWorld);
      raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
      raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);
      const intersects = raycaster.intersectObjects(scene.children, true).filter(x => x.object.name == "modelBox");

      if (intersects.length > 0) {
        if (intersectedObject) {
          unHightLightObject(intersectedObject);
        }

        intersectedObject = intersects[0].object;
        
        hightLightObject(intersectedObject);

        selectModel();
      }

    } catch (e) { alert(e); }
  }

  function unselect() {
    unHightLightObject(intersectedObject);
  }

  async function onRemove() {
    if (isTransforming)
      return;

    if (intersectedObject) {
      try {
        let currentModel = installedModels.filter(x => x.boundaryBox == intersectedObject)[0];
        unHightLightObject(intersectedObject);

        await scene.remove(currentModel.model);
        await scene.remove(currentModel.boundaryBox);
        await scene.remove(currentModel.hightLightBox);

        installedModels = installedModels.filter(x => x.boundaryBox != currentModel.boundaryBox);

        intersectedObject = null;

        if (changeModelsNumber)
          changeModelsNumber(installedModels.length);

      } catch (e) {
        alert(e);
      }
    }
  }

  function getFirstMeshInScene(scene) {
    for (let i = 0; i < scene.children.length; i++) {
      const child = scene.children[i];
      if (child.isMesh) {
        return child;
      }
    }
    return scene; // If no mesh is found
  }

  function Place() {
    try {
      var matrix = currentModel.matrix;
      currentModel.matrixAutoUpdate = true;

      currentModel.position.setFromMatrixPosition(matrix);
      currentModel.setRotationFromMatrix(matrix);

      // Rotate the model randomly to give a bit of variation.
      // currentModel.setRotationFromMatrix(planeMarker.matrix);
      const materialboundaryBox = new MeshBasicMaterial({
        color: 0xffffff, // Green color
        transparent: true, // Enable transparency
        opacity: 0 // Set the opacity (50% transparent)
      });

      var mesh = getFirstMeshInScene(currentModel);
      const box3 = new Box3().setFromObject(mesh);

      const boxGeometry = new BoxGeometry(
        box3.getSize(new Vector3()).x,
        box3.getSize(new Vector3()).y,
        box3.getSize(new Vector3()).z
      );

      const boundaryBox = new Mesh(boxGeometry, materialboundaryBox);
      boundaryBox.setRotationFromMatrix(planeMarker.matrix);
      boundaryBox.position.setFromMatrixPosition(planeMarker.matrix);
      boundaryBox.name = "modelBox";
      scene.add(boundaryBox);

      const hightLightBoxGeometry = new BoxGeometry(
        box3.getSize(new Vector3()).x + 0.01,
        0.02,
        box3.getSize(new Vector3()).z + 0.01,
      );

      const materialhightLightBox = new MeshBasicMaterial({
        color: 0xe6ffe6, // Green color
        transparent: false,// Enable transparency
      });

      const hightLightBox = new Mesh(hightLightBoxGeometry, materialhightLightBox);
      hightLightBox.setRotationFromMatrix(planeMarker.matrix);
      hightLightBox.position.setFromMatrixPosition(planeMarker.matrix);
      hightLightBox.name = "hightLightBox";
      hightLightBox.visible = false;
      scene.add(hightLightBox);

      installedModels.push({
        model: currentModel,
        boundaryBox: boundaryBox,
        hightLightBox: hightLightBox
      });

      if (currentModel.scale) {
        currentModel.scale.set(1, 1, 1)
      }

      if (changeModelsNumber)
        changeModelsNumber(installedModels.length);

      currentModel = null;
      clearSelection();
    } catch (e) { alert(e); }
  }

  function onSelect(i) {
    if (planeMarker.visible) {
      try {

        if (currentModel != null) {
          scene.remove(currentModel);
        }

        currentModel = models[i].glb_model.scene.clone();
        currentModel.userData.alias = models[i].alias;

        currentModel.visible = true;
        currentModel.matrixAutoUpdate = false;

        currentModel.matrix.fromArray(planeMarker.matrix);

        scene.add(currentModel);

        selectModel("put");

      } catch (e) {
        alert(e);
      }
    }
  }

  function Scale(rangaValue) {
    let currentModel = installedModels.filter(x => x.boundaryBox == intersectedObject)[0];
    var rotationModel = currentModel.model;
    var rotationBoundary = currentModel.boundaryBox;
    var rotationHightLight = currentModel.hightLightBox;

    var value = rangaValue / 100;

    rotationModel.scale.set(value, value, value)
    rotationBoundary.scale.set(value, value, value)
    rotationHightLight.scale.set(value, value, value)
  }

  function Move(diffX, diffY) {
    let currentModel = installedModels.filter(x => x.boundaryBox == intersectedObject)[0];
    let rotationModel = currentModel.model;
    let rotationBoundary = currentModel.boundaryBox;
    let rotationHightLight = currentModel.hightLightBox;

    const speedFactor = 0.0001;
    rotationModel.position.x += diffX * speedFactor;
    rotationModel.position.z += diffY * speedFactor; // Invert y for intuitive upward motion

    rotationBoundary.position.x += diffX * speedFactor;
    rotationBoundary.position.z += diffY * speedFactor;

    rotationHightLight.position.x += diffX * speedFactor;
    rotationHightLight.position.z += diffY * speedFactor;
  }

  function Rotate(isUp) {
    let currentModel = installedModels.filter(x => x.boundaryBox == intersectedObject)[0];
    let rotationModel = currentModel.model;
    let rotationBoundary = currentModel.boundaryBox;
    let rotationHightLight = currentModel.hightLightBox;

    //installedModels=installedModels.filter(x => x.boundaryBox != intersectedObject);

    if (isUp) {
      rotationModel.rotation.y += 0.1;
      rotationBoundary.rotation.y += 0.1;
      rotationHightLight.rotation.y += 0.1;
    }
    else {
      rotationModel.rotation.y -= 0.1;
      rotationBoundary.rotation.y -= 0.1;
      rotationHightLight.rotation.y -= 0.1;
    }

  }
  /**
   * Called whenever a new hit test result is ready.
   */
  function onHitTestResultReady(hitPoseTransformed) {
    if (hitPoseTransformed) {
      planeMarker.visible = true;
      planeMarker.matrix.fromArray(hitPoseTransformed);

      if (currentModel) {
        currentModel.matrix.fromArray(hitPoseTransformed);
        currentModel.visible = true;
      }

      if (hittestRady)
        hittestRady()

      if (loader)
        loader.hide();
    }
  }

  /**
   * Called whenever the hit test is empty/unsuccesful.
   */
  function onHitTestResultEmpty() {
    planeMarker.visible = false;


    if (currentModel) {
      currentModel.visible = false;
    }
  }

  /**
   * The main render loop.
   *
   * This is where we perform hit-tests and update the scene
   * whenever anything changes.
   */
  const renderLoop = (timestamp, frame) => {
    if (renderer.xr.isPresenting) {
      if (frame) {
        handleXRHitTest(
          renderer,
          frame,
          onHitTestResultReady,
          onHitTestResultEmpty,
        );
      }

      renderer.render(scene, camera);
    }
  };

  function startTransform() {
    isTransforming = true;
  }

  function stopTransform() {
    try {
      isTransforming = false;
      currentModel = null;
    } catch (e) {
      alert(e);
    }
  }



  renderer.setAnimationLoop(renderLoop);

  return { scene, roomId, onSelect, setModels, nextPlace, onRemove, Scale, Rotate, startTransform, stopTransform, unselect, Place, Move, startCalibration, saveRoom }
}