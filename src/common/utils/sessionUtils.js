import { GUID } from "../guid.js"
import modelUtils from "./modelUtils.js"
import storagePaths from "./storagePaths.js"

const key = 'localId';
let typesInfo = [];
let modelsInfo = [];
export async function init() {
    let localId = localStorage.getItem(key);
    if (localId === null) {
        let res = await modelUtils.getModels();
        typesInfo = res.types;
        enrichModels(res.data)
        const id = GUID();
        await modelUtils.createMainfolder(id);
        localStorage.setItem("localId", JSON.stringify({
            id,
            mainCollection: {
                data: modelsInfo,
                types: typesInfo
            }
        }));
    }
}

async function enrichModels(models) {
    for (var i = 0; i < models.length; i++) {
      const imglink = models[i].preview.replace('models', storagePaths.getModelsBaseUrl());
      let strWitOutArMessageId = models[i].previewLink.replace('viewer.html?armessage=', '');
      let parts = (strWitOutArMessageId[0] === '/' ? strWitOutArMessageId.replace('/', '') : strWitOutArMessageId).split('&message=')
      const armessage = parts[0];
      const message = parts[1];
      const id = modelUtils.generateIdModel();
      const modelAlias = models[i].alias;
      const modelName = models[i].name;
      const imgLink = `${imglink}?response-content-type=jpg`;
      const gblLink = models[i].glb;
      const usdzLink = models[i].usdz;
      const configLink = `arconfigurator.html?android=${gblLink}&ios=${usdzLink}&name=${modelName}&alias=${modelAlias}&id=${id}`
  
      if (modelsInfo.find(x => x.name === modelName) === undefined) {
        const type = typesInfo.find(x => x.type === models[i].type);
        modelsInfo.push({
          id: id,
          type: type === undefined ? undefined : type.type,
          visible: true,
          name: modelName,
          imgLink: imgLink,
          configLink: configLink,
          armessage,
          message
        });
      }
    }
}

export default {
    init
};