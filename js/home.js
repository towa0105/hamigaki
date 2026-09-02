// js/home.js

import { CHARACTER_MASTER } from "../js/character.js";
import { getSaveData } from "../js/storage.js";

const saveData = getSaveData();

const partyList = document.getElementById("partyList");

// 編成中キャラのIDをもとに、表示用データを作る
const partyCharacters = saveData.partyCharacterIds.map((characterId) => {
    const master = CHARACTER_MASTER.find((character) => character.id === characterId);
    const state = saveData.characterStates[characterId];

    return {
        ...master,
        ...state,
    };
});

partyList.innerHTML = partyCharacters
    .map((character) => {
        return `
      <div class="character-card">
        <img src="${character.image}" alt="${character.name}" class="character-card__image">
        <h3>${character.name}</h3>
        <p>Lv.${character.level}</p>
        <p>こうげき：${character.attack}</p>
        <p>ぞくせい：${character.attribute}</p>
        <p>ひっさつ：${character.skillName}</p>
      </div>
    `;
    })
    .join("");