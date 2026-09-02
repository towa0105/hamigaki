// js/storage.js

import { CHARACTER_MASTER } from "../js/character.js";

const STORAGE_KEY = "hamigaki_taisen_save_v1";

// 初期データを作る
export function createInitialSaveData() {
    const characterStates = {};

    CHARACTER_MASTER.forEach((character) => {
        characterStates[character.id] = {
            level: 1,
            exp: 0,
            hp: character.baseHp,
            attack: character.baseAttack,
        };
    });

    return {
        version: 1,

        // 最初から持っているキャラ
        ownedCharacterIds: ["sakamoto", "ieyasu", "himiko"],

        // 最初の編成キャラ
        partyCharacterIds: ["sakamoto", "ieyasu", "himiko"],

        // キャラごとの成長データ
        characterStates,

        // 通貨
        currency: {
            pikaCoin: 0,
            gachaTicket: 0,
        },

        // 歯磨き記録
        brushRecords: [],

        // 最後のバトル結果
        lastBattle: null,
    };
}

// 保存データを取得する
export function getSaveData() {
    const json = localStorage.getItem(STORAGE_KEY);

    // 保存データがなければ初期データを作る
    if (!json) {
        const initialData = createInitialSaveData();
        saveData(initialData);
        return initialData;
    }

    try {
        return JSON.parse(json);
    } catch (error) {
        console.error("保存データの読み込みに失敗しました", error);

        const initialData = createInitialSaveData();
        saveData(initialData);
        return initialData;
    }
}

// 保存する
export function saveData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// 開発用：データリセット
export function resetSaveData() {
    const initialData = createInitialSaveData();
    saveData(initialData);
    return initialData;
}
