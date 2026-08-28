import { GUID } from "../common/guid.js"

const currentRoomKey = 'ar_room_current';
const roomSavePrefix = 'ar_room_save:';
const roomSaveVersion = 1;

function rememberCurrentRoom(roomId) {
    try {
        localStorage.setItem(currentRoomKey, roomId);
    }
    catch (err) {
        console.warn('Не удалось запомнить текущую комнату.', err);
    }
}

function roomKey(roomId) {
    return `${roomSavePrefix}${roomId}`;
}

/**
 * Идентичность комнаты для сохранённого layout'а.
 *
 * Берётся из URL (`?roomId=`), иначе — последняя использованная комната этого браузера,
 * иначе создаётся новая. Один слот на комнату: сохранение одной комнаты не перетирает другую.
 */
export function resolveRoomId(search = window.location.search) {
    const urlRoomId = new URLSearchParams(search).get('roomId');

    if (urlRoomId) {
        rememberCurrentRoom(urlRoomId);
        return urlRoomId;
    }

    try {
        const currentRoomId = localStorage.getItem(currentRoomKey);
        if (currentRoomId)
            return currentRoomId;
    }
    catch (err) {
        console.warn('Локальное хранилище недоступно, комната будет временной.', err);
    }

    const newRoomId = GUID();
    rememberCurrentRoom(newRoomId);
    return newRoomId;
}

/**
 * Сохраняет layout конкретной комнаты. Координаты остаются room-local.
 *
 * @throws {Error} если локальное хранилище недоступно
 */
export function saveRoomLayout(roomId, models) {
    if (!roomId)
        throw new Error('Комната не идентифицирована, сохранение невозможно.');

    const layout = {
        version: roomSaveVersion,
        roomId: roomId,
        savedAt: new Date().toISOString(),
        models: models
    };

    localStorage.setItem(roomKey(roomId), JSON.stringify(layout));
    rememberCurrentRoom(roomId);
}

/**
 * Возвращает сохранённые модели только этой комнаты.
 * Запись без совпадающей идентичности игнорируется, чтобы не подтянуть мебель из другой комнаты.
 */
export function loadRoomLayout(roomId) {
    if (!roomId)
        return [];

    let raw = null;
    try {
        raw = localStorage.getItem(roomKey(roomId));
    }
    catch (err) {
        console.warn('Локальное хранилище недоступно, сохранённая комната не загружена.', err);
        return [];
    }

    if (!raw)
        return [];

    try {
        const layout = JSON.parse(raw);

        if (!layout || layout.roomId !== roomId || !Array.isArray(layout.models)) {
            console.warn(`Сохранённый layout не принадлежит комнате ${roomId} и проигнорирован.`);
            return [];
        }

        return layout.models;
    }
    catch (err) {
        console.error('Сохранённая комната повреждена и проигнорирована.', err);
        return [];
    }
}

export default {
    resolveRoomId,
    saveRoomLayout,
    loadRoomLayout
};
