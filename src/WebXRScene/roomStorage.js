import { GUID } from "../common/guid.js"

const roomIndexKey = 'ar_rooms';
const roomSavePrefix = 'ar_room_save:';
const roomStoreVersion = 1;

/**
 * Активная комната живёт только в текущей загрузке страницы.
 *
 * Это намеренно: переход в другую физическую комнату открывает тот же
 * `xrviewer.html`, и молчаливое переиспользование прошлой комнаты подставило бы
 * туда чужую мебель. Комнату всегда выбирают явно — из URL или из списка.
 */
let activeRoomId = null;

function roomKey(roomId) {
    return `${roomSavePrefix}${roomId}`;
}

function defaultRoomName(position) {
    return `Комната ${position}`;
}

function readIndex() {
    let raw = null;

    try {
        raw = localStorage.getItem(roomIndexKey);
    }
    catch (err) {
        console.warn('Локальное хранилище недоступно, список комнат пуст.', err);
        return [];
    }

    if (!raw)
        return [];

    try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed?.rooms)
            ? parsed.rooms.filter(room => room && typeof room.roomId === 'string')
            : [];
    }
    catch (err) {
        console.error('Список комнат повреждён и проигнорирован.', err);
        return [];
    }
}

function writeIndex(rooms) {
    localStorage.setItem(roomIndexKey, JSON.stringify({
        version: roomStoreVersion,
        rooms: rooms
    }));
}

/**
 * Идентификаторы комнат, у которых есть сохранённый layout.
 * Нужны, чтобы комната, сохранённая до появления индекса, не потерялась.
 */
function savedRoomIds() {
    const ids = [];

    try {
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(roomSavePrefix))
                ids.push(key.slice(roomSavePrefix.length));
        }
    }
    catch (err) {
        console.warn('Локальное хранилище недоступно, сохранённые комнаты не перечислены.', err);
    }

    return ids;
}

/**
 * Все известные комнаты этого браузера: индекс плюс комнаты, у которых
 * сохранён layout, но нет записи в индексе.
 */
export function listRooms() {
    const rooms = readIndex();
    const known = new Set(rooms.map(room => room.roomId));

    for (const roomId of savedRoomIds()) {
        if (!known.has(roomId)) {
            rooms.push({
                roomId: roomId,
                name: defaultRoomName(rooms.length + 1),
                createdAt: null,
                updatedAt: null
            });
            known.add(roomId);
        }
    }

    return rooms;
}

export function getRoom(roomId) {
    return listRooms().find(room => room.roomId === roomId) ?? null;
}

export function getActiveRoomId() {
    return activeRoomId;
}

export function getActiveRoom() {
    return activeRoomId ? getRoom(activeRoomId) : null;
}

/**
 * Добавляет комнату в индекс, если её там ещё нет (например, пришла из `?roomId=`).
 */
function ensureRoom(roomId) {
    const rooms = listRooms();
    let room = rooms.find(item => item.roomId === roomId);

    if (!room) {
        const now = new Date().toISOString();
        room = { roomId: roomId, name: defaultRoomName(rooms.length + 1), createdAt: now, updatedAt: now };
        rooms.push(room);

        try {
            writeIndex(rooms);
        }
        catch (err) {
            console.warn('Не удалось сохранить список комнат.', err);
        }
    }

    return room;
}

/**
 * Явный выбор существующей комнаты.
 */
export function setActiveRoom(roomId) {
    if (!roomId)
        throw new Error('Комната не указана.');

    const room = ensureRoom(roomId);
    activeRoomId = room.roomId;
    return room;
}

/**
 * Явное создание новой комнаты. Новая комната всегда пустая:
 * layout прошлой комнаты к ней не привязывается.
 */
export function createRoom(name = null) {
    const rooms = listRooms();
    const now = new Date().toISOString();
    const room = {
        roomId: GUID(),
        name: (name ?? '').trim() || defaultRoomName(rooms.length + 1),
        createdAt: now,
        updatedAt: now
    };

    rooms.push(room);
    writeIndex(rooms);
    activeRoomId = room.roomId;
    return room;
}

/**
 * `?roomId=` остаётся явным способом открыть конкретную комнату.
 * Без параметра активная комната не выбирается автоматически.
 */
export function resolveRoomIdFromUrl(search = window.location.search) {
    const roomId = new URLSearchParams(search).get('roomId');

    if (!roomId)
        return null;

    return setActiveRoom(roomId).roomId;
}

function touchRoom(roomId) {
    const rooms = listRooms();
    const room = rooms.find(item => item.roomId === roomId);

    if (!room)
        return;

    room.updatedAt = new Date().toISOString();
    writeIndex(rooms);
}

/**
 * Сохраняет layout конкретной комнаты. Координаты остаются room-local.
 *
 * @throws {Error} если комната не выбрана или локальное хранилище недоступно
 */
export function saveRoomLayout(roomId, models) {
    if (!roomId)
        throw new Error('Комната не идентифицирована, сохранение невозможно.');

    const layout = {
        version: roomStoreVersion,
        roomId: roomId,
        savedAt: new Date().toISOString(),
        models: models
    };

    localStorage.setItem(roomKey(roomId), JSON.stringify(layout));
    ensureRoom(roomId);
    touchRoom(roomId);
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
    listRooms,
    getRoom,
    getActiveRoom,
    getActiveRoomId,
    setActiveRoom,
    createRoom,
    resolveRoomIdFromUrl,
    saveRoomLayout,
    loadRoomLayout
};
