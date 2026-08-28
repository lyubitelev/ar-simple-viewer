import conf from "../../config/config.js"

// Единственный владелец публичных путей в Object Storage.
// Имя бакета одинаково для local/dev/prod: изоляция окружений живёт в conf.idsFolder,
// а environment-specific адресом хранилища остаётся conf.awsEndPoint.
const modelsBucket = 'avt-models';

// Демонстрационный ролик лендинга лежит в том же бакете (в репозитории его нет: video/* в .gitignore).
const promoVideoKey = 'video/promo_video.mp4';

/**
 * Базовый публичный адрес бакета моделей.
 */
export function getModelsBaseUrl() {
    return `${conf.awsEndPoint}/${modelsBucket}`;
}

/**
 * Публичный адрес промо-ролика лендинга.
 */
export function getPromoVideoUrl() {
    return `${getModelsBaseUrl()}/${promoVideoKey}`;
}

export default {
    getModelsBaseUrl,
    getPromoVideoUrl
};
