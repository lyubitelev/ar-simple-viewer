import conf from "../../config/config.js"

const localMainDataKey = 'localId';

export function base64ToJson(encoded) {
    if (encoded == 'undefined' || encoded == null || encoded == '')
        return null;

    return JSON.parse(atob(encoded));
}

/**
 * Локальные данные создателя. Для публичной ссылки они не обязательны.
 */
export function readLocalMainData() {
    try {
        return JSON.parse(localStorage.getItem(localMainDataKey));
    }
    catch (err) {
        console.warn('Локальные данные создателя повреждены и игнорируются.', err);
        return null;
    }
}

async function loadModelParameters(id, folderId) {
    if (!id || !folderId)
        return null;

    try {
        const response = await fetch(`${conf.awsEndPoint}/avt-content/${conf.idsFolder}/${folderId}/${id}.json?response-content-type=json`);

        if (response.ok)
            return await response.json();

        if (response.status !== 403 && response.status !== 404)
            console.error(`Не удалось загрузить параметры модели: статус ${response.status}`);
    }
    catch (err) {
        console.error('Не удалось загрузить параметры модели.', err);
    }

    return null;
}

/**
 * Разрешает параметры модели по идентичности из URL (`id` + `mainDataId`).
 *
 * Публичная ссылка/QR обязаны открываться в чистом браузере, поэтому storage
 * запрашивается по идентичности из URL, а localStorage остаётся только fallback'ом
 * для локальных сценариев создателя.
 *
 * @returns {Promise<{folderId: string|null, armessage: object|null, message: object|null}>}
 */
export async function resolveModel(id, mainDataId) {
    const mainData = readLocalMainData();
    const folderId = mainDataId ?? mainData?.id ?? null;
    const localModel = mainData?.mainCollection?.data?.find(x => x.id === id) ?? null;

    const modelParameters = await loadModelParameters(id, folderId);

    if (modelParameters) {
        return {
            folderId,
            armessage: base64ToJson(modelParameters.armessage),
            message: base64ToJson(modelParameters.message)
        };
    }

    if (localModel) {
        const armessage = base64ToJson(localModel.armessage);

        if (armessage?.src)
            armessage['src'] = armessage['src'].replace('models', `${conf.awsEndPoint}/avt-models`);

        if (armessage?.['ios-src'])
            armessage['ios-src'] = armessage['ios-src'].replace('models', `${conf.awsEndPoint}/avt-models`);

        return {
            folderId,
            armessage,
            message: base64ToJson(localModel.message)
        };
    }

    return {
        folderId,
        armessage: null,
        message: null
    };
}

/**
 * Показывает честное сообщение, когда модель по ссылке не разрешается.
 */
export function showModelLoadError(text = 'Не удалось загрузить модель по этой ссылке.') {
    if (window.loaderHide)
        window.loaderHide();

    const errorBox = document.createElement('div');
    errorBox.className = 'viewer-error';
    errorBox.innerText = text;

    (document.getElementById('container') ?? document.body).appendChild(errorBox);
}

export default {
    base64ToJson,
    readLocalMainData,
    resolveModel,
    showModelLoadError
};
