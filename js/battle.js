// js/battle.js

// ==============================
// 1. キャラクターデータ
// ==============================

const characters = [
    {
        id: "nobunaga",
        name: "織田のぶなが",
        role: "attacker",
        roleName: "アタッカー",
        attack: 120,
        hp: 800,
    },
    {
        id: "ieyasu",
        name: "徳川いえやす",
        role: "defender",
        roleName: "ディフェンダー",
        attack: 70,
        hp: 1100,
    },
    {
        id: "himiko",
        name: "卑弥呼",
        role: "supporter",
        roleName: "サポーター",
        attack: 60,
        hp: 700,
    },
];

// 今回は仮で3体固定
let party = [...characters];


// ==============================
// 2. ステージデータ
// ==============================

const stages = [
    {
        id: "front",
        name: "前の歯ゾーン",
        targetBrushCount: 30,
        timeLimit: 45,
        enemy: {
            name: "あまいものバイキン",
            hp: 1500,
            maxHp: 1500,
        },
    },
    {
        id: "rightBack",
        name: "右奥歯ゾーン",
        targetBrushCount: 40,
        timeLimit: 50,
        enemy: {
            name: "ねばねば食べかす",
            hp: 2000,
            maxHp: 2000,
        },
    },
    {
        id: "leftBack",
        name: "左奥歯ゾーン",
        targetBrushCount: 40,
        timeLimit: 50,
        enemy: {
            name: "バイキン大将",
            hp: 2500,
            maxHp: 2500,
        },
    },
];


// ==============================
// 3. バトル状態
// ==============================

let battleState = {
    isPlaying: false,

    currentStageIndex: 0,
    currentEnemy: null,

    stageBrushCount: 0,
    totalBrushCount: 0,

    timeLeft: 0,
    timerId: null,
    turnTimerId: null,

    score: 0,
    combo: 0,
    maxCombo: 0,

    specialGauge: 0,

    // 敵によるスコア減少
    scorePenalty: 0,

    // 敵による攻撃力低下
    attackDownRate: 1,

    // ディフェンダー必殺：一定時間デバフ無効
    shieldUntil: 0,

    // サポーター必殺：一定時間攻撃力アップ
    attackBuffUntil: 0,

    // 行動中の味方キャラ番号
    partyTurnIndex: 0,

    battleStartedAt: null,
};


// ==============================
// 4. DOM取得
// ==============================

const stageNameEl = document.getElementById("stageName");
const timeLeftEl = document.getElementById("timeLeft");
const brushCountEl = document.getElementById("brushCount");
const targetBrushCountEl = document.getElementById("targetBrushCount");

const enemyNameEl = document.getElementById("enemyName");
const enemyHpEl = document.getElementById("enemyHp");

const scoreEl = document.getElementById("score");
const comboEl = document.getElementById("combo");
const maxComboEl = document.getElementById("maxCombo");
const specialGaugeEl = document.getElementById("specialGauge");

const partyListEl = document.getElementById("partyList");
const startButton = document.getElementById("startButton");
const brushButton = document.getElementById("brushButton");
const battleLogEl = document.getElementById("battleLog");

// 結果モーダル
const resultModal = document.getElementById("resultModal");
const resultStageName = document.getElementById("resultStageName");
const resultScore = document.getElementById("resultScore");
const resultCombo = document.getElementById("resultCombo");
const resultStreak = document.getElementById("resultStreak");
const resultCoin = document.getElementById("resultCoin");
const resultCloseButton = document.getElementById("resultCloseButton");
const resultNextButton = document.getElementById("resultNextButton");


// ==============================
// 5. 初期表示・イベント設定
// ==============================

renderParty();
renderInitialScreen();

if (startButton) {
    startButton.addEventListener("click", startBattle);
}

// 開発用：MESHなしの仮ボタン
if (brushButton) {
    brushButton.addEventListener("click", () => {
        handleBrushMotion();
    });
}

// 開発用：スペースキーでも歯ブラシ動作扱い
window.addEventListener("keydown", (event) => {
    if (event.code === "Space") {
        handleBrushMotion();
    }
});

// 結果モーダル：閉じる
if (resultCloseButton) {
    resultCloseButton.addEventListener("click", () => {
        closeResultModal();
    });
}

// 結果モーダル：次へ
if (resultNextButton) {
    resultNextButton.addEventListener("click", () => {
        location.href = "./index.html";
    });
}

// MESH連携用：外部から呼べるようにする
window.handleBrushMotion = handleBrushMotion;


// ==============================
// 6. バトル開始
// ==============================

function startBattle() {
    if (battleState.isPlaying) return;

    closeResultModal();

    battleState.isPlaying = true;
    battleState.currentStageIndex = 0;
    battleState.score = 0;
    battleState.combo = 0;
    battleState.maxCombo = 0;
    battleState.totalBrushCount = 0;
    battleState.specialGauge = 0;
    battleState.scorePenalty = 0;
    battleState.attackDownRate = 1;
    battleState.shieldUntil = 0;
    battleState.attackBuffUntil = 0;
    battleState.partyTurnIndex = 0;
    battleState.battleStartedAt = new Date().toISOString();

    clearInterval(battleState.timerId);
    clearInterval(battleState.turnTimerId);

    log("バトル開始！");

    startStage(0);

    // 自動ターン制
    battleState.turnTimerId = setInterval(runTurn, 1200);
}


// ==============================
// 7. ステージ開始
// ==============================

function startStage(stageIndex) {
    const stage = stages[stageIndex];

    if (!stage) {
        finishBattle();
        return;
    }

    battleState.currentStageIndex = stageIndex;

    // enemyをコピーして使う
    battleState.currentEnemy = {
        ...stage.enemy,
    };

    battleState.stageBrushCount = 0;
    battleState.timeLeft = stage.timeLimit;
    battleState.partyTurnIndex = 0;

    log(`${stage.name} に進んだ！`);
    log(`${stage.enemy.name} が現れた！`);

    clearInterval(battleState.timerId);

    battleState.timerId = setInterval(() => {
        if (!battleState.isPlaying) return;

        battleState.timeLeft--;

        if (battleState.timeLeft <= 0) {
            clearStage("time");
            return;
        }

        render();
    }, 1000);

    render();
}


// ==============================
// 8. 歯ブラシの動き
// ==============================

// MESHと接続するときは、MESHが動きを検知したタイミングで
// この handleBrushMotion() を呼べばOKです。
function handleBrushMotion() {
    if (!battleState.isPlaying) return;

    battleState.stageBrushCount++;
    battleState.totalBrushCount++;

    battleState.combo++;
    battleState.maxCombo = Math.max(battleState.maxCombo, battleState.combo);

    // 歯ブラシを動かすだけでも少しスコアが入る
    battleState.score += 10;

    // 必殺ゲージ上昇
    battleState.specialGauge += 5;

    if (battleState.specialGauge >= 100) {
        battleState.specialGauge = 100;
        activateSpecial();
    }

    const stage = stages[battleState.currentStageIndex];

    if (stage && battleState.stageBrushCount >= stage.targetBrushCount) {
        clearStage("brush");
        return;
    }

    render();
}


// ==============================
// 9. 自動ターン制
// ==============================

function runTurn() {
    if (!battleState.isPlaying) return;
    if (!battleState.currentEnemy) return;

    const character = party[battleState.partyTurnIndex];

    playerAction(character);

    battleState.partyTurnIndex++;

    // 味方3体が行動したら敵のターン
    if (battleState.partyTurnIndex >= party.length) {
        battleState.partyTurnIndex = 0;
        enemyAction();
    }

    if (battleState.currentEnemy && battleState.currentEnemy.hp <= 0) {
        clearStage("enemyDefeated");
        return;
    }

    render();
}


// ==============================
// 10. 味方キャラの通常行動
// ==============================

function playerAction(character) {
    if (!battleState.currentEnemy) return;

    let damage = character.attack;

    // サポーター必殺などで攻撃力アップ中
    if (isAttackBuffActive()) {
        damage *= 1.5;
    }

    // 敵の攻撃力ダウン効果
    damage *= battleState.attackDownRate;

    // 役割によって通常行動を変える
    if (character.role === "attacker") {
        damage *= 1.3;
        log(`${character.name} の攻撃！`);
    }

    if (character.role === "defender") {
        damage *= 0.8;
        log(`${character.name} が守りながら攻撃！`);
    }

    if (character.role === "supporter") {
        damage *= 0.7;
        supportAction(character);
    }

    damage = Math.floor(damage);

    battleState.currentEnemy.hp -= damage;
    battleState.currentEnemy.hp = Math.max(0, battleState.currentEnemy.hp);

    battleState.score += damage;

    log(`${character.name} が ${damage} ダメージ！`);
}


// ==============================
// 11. サポーターの通常行動
// ==============================

function supportAction(character) {
    log(`${character.name} がチームをサポート！`);

    // 攻撃力ダウンを少し回復する
    if (battleState.attackDownRate < 1) {
        battleState.attackDownRate += 0.1;

        if (battleState.attackDownRate > 1) {
            battleState.attackDownRate = 1;
        }

        log("攻撃力ダウンを少し回復した！");
    }
}


// ==============================
// 12. 敵の行動
// ==============================

function enemyAction() {
    const now = Date.now();

    // ディフェンダー必殺中は敵のマイナス効果を防ぐ
    if (battleState.shieldUntil > now) {
        log("ディフェンダーの守りで敵の邪魔を防いだ！");
        return;
    }

    const actions = ["scoreDown", "attackDown", "comboBreak"];
    const action = actions[Math.floor(Math.random() * actions.length)];

    if (action === "scoreDown") {
        const downScore = 100;

        battleState.score -= downScore;
        battleState.score = Math.max(0, battleState.score);

        log(`敵の邪魔！スコアが ${downScore} 下がった！`);
    }

    if (action === "attackDown") {
        battleState.attackDownRate = 0.7;
        log("敵の邪魔！チームの攻撃力が下がった！");
    }

    if (action === "comboBreak") {
        battleState.combo = 0;
        log("敵の邪魔！コンボが切れた！");
    }
}


// ==============================
// 13. 必殺技
// ==============================

function activateSpecial() {
    if (!battleState.currentEnemy) return;

    const firstCharacter = party[0];

    log(`${firstCharacter.name} の必殺技発動！`);

    if (firstCharacter.role === "attacker") {
        attackerSpecial(firstCharacter);
    }

    if (firstCharacter.role === "defender") {
        defenderSpecial(firstCharacter);
    }

    if (firstCharacter.role === "supporter") {
        supporterSpecial(firstCharacter);
    }

    battleState.specialGauge = 0;

    if (battleState.currentEnemy && battleState.currentEnemy.hp <= 0) {
        clearStage("enemyDefeated");
        return;
    }

    render();
}


// アタッカー必殺：大ダメージ
function attackerSpecial(character) {
    const damage = character.attack * 8;

    battleState.currentEnemy.hp -= damage;
    battleState.currentEnemy.hp = Math.max(0, battleState.currentEnemy.hp);

    battleState.score += damage;

    log(`大ダメージ！${damage} ダメージを与えた！`);
}


// ディフェンダー必殺：一定時間デバフ無効
function defenderSpecial(character) {
    const duration = 10000;
    battleState.shieldUntil = Date.now() + duration;

    log("10秒間、敵のマイナス効果を防ぐ！");
}


// サポーター必殺：一定時間攻撃力アップ
function supporterSpecial(character) {
    const duration = 10000;
    battleState.attackBuffUntil = Date.now() + duration;

    log("10秒間、チームの攻撃力アップ！");
}


// ==============================
// 14. ステージクリア
// ==============================

function clearStage(reason) {
    if (!battleState.isPlaying) return;

    clearInterval(battleState.timerId);

    const stage = stages[battleState.currentStageIndex];

    if (!stage) return;

    if (battleState.currentEnemy) {
        battleState.currentEnemy.hp = 0;
    }

    if (reason === "brush") {
        log(`${stage.name} の目標回数達成！`);
    }

    if (reason === "time") {
        log(`${stage.name} の時間終了！`);
    }

    if (reason === "enemyDefeated") {
        log(`${stage.name} の敵を倒した！`);
    }

    const nextStageIndex = battleState.currentStageIndex + 1;

    if (nextStageIndex >= stages.length) {
        finishBattle();
    } else {
        startStage(nextStageIndex);
    }
}


// ==============================
// 15. バトル終了
// ==============================

function finishBattle() {
    if (!battleState.isPlaying) return;

    battleState.isPlaying = false;

    clearInterval(battleState.timerId);
    clearInterval(battleState.turnTimerId);

    const streak = getCurrentStreak();

    const earnedCoin = calculateCoins({
        score: battleState.score,
        maxCombo: battleState.maxCombo,
        streak,
    });

    const resultData = {
        date: new Date().toISOString(),
        result: "win",
        stageName: "はのまち",
        score: battleState.score,
        maxCombo: battleState.maxCombo,
        totalBrushCount: battleState.totalBrushCount,
        streak,
        earnedCoin,
        usedCharacters: party.map((character) => character.id),
        clearedStages: stages.map((stage) => stage.id),
    };

    saveBattleResult(resultData);

    log("バトル勝利！");
    log(`獲得コイン：${earnedCoin}`);

    // result.htmlには遷移せず、battle.html上でモーダル表示
    showResultModal(resultData);
}


// ==============================
// 16. コイン計算
// ==============================

function calculateCoins({ score, maxCombo, streak }) {
    const scoreCoin = Math.floor(score / 50);
    const comboCoin = maxCombo * 2;
    const streakCoin = streak * 40;

    return scoreCoin + comboCoin + streakCoin;
}


// ==============================
// 17. localStorage保存
// ==============================

const STORAGE_KEY = "hamigaki_taisen_save_v1";

function getSaveData() {
    const json = localStorage.getItem(STORAGE_KEY);

    if (!json) {
        const initialData = createInitialSaveData();
        saveData(initialData);
        return initialData;
    }

    try {
        const parsedData = JSON.parse(json);
        return normalizeSaveData(parsedData);
    } catch (error) {
        console.error("保存データが壊れています", error);

        const initialData = createInitialSaveData();
        saveData(initialData);
        return initialData;
    }
}


function saveData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}


function createInitialSaveData() {
    return {
        currency: {
            coin: 0,
        },
        brushRecords: [],
        streak: 0,
        lastBattle: null,
    };
}


// 過去の保存データに不足があっても落ちないようにする
function normalizeSaveData(data) {
    const initialData = createInitialSaveData();

    return {
        ...initialData,
        ...data,
        currency: {
            ...initialData.currency,
            ...(data.currency || {}),
        },
        brushRecords: Array.isArray(data.brushRecords) ? data.brushRecords : [],
        streak: typeof data.streak === "number" ? data.streak : 0,
        lastBattle: data.lastBattle || null,
    };
}


function saveBattleResult(resultData) {
    const saveDataObj = getSaveData();

    saveDataObj.currency.coin += resultData.earnedCoin;
    saveDataObj.brushRecords.push(resultData);
    saveDataObj.streak = resultData.streak;
    saveDataObj.lastBattle = resultData;

    saveData(saveDataObj);
}


// ==============================
// 18. 連続記録
// ==============================

function getCurrentStreak() {
    const saveDataObj = getSaveData();
    const records = saveDataObj.brushRecords;

    const today = formatDate(new Date());

    if (records.length === 0) {
        return 1;
    }

    const lastRecord = records[records.length - 1];
    const lastDate = formatDate(new Date(lastRecord.date));

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayText = formatDate(yesterday);

    if (lastDate === today) {
        return saveDataObj.streak || 1;
    }

    if (lastDate === yesterdayText) {
        return (saveDataObj.streak || 0) + 1;
    }

    return 1;
}


function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


// ==============================
// 19. 状態チェック
// ==============================

function isAttackBuffActive() {
    return battleState.attackBuffUntil > Date.now();
}


// ==============================
// 20. 結果モーダル
// ==============================

function showResultModal(resultData) {
    if (!resultModal) {
        console.warn("resultModal が見つかりません。battle.htmlに結果モーダルのHTMLを追加してください。");
        return;
    }

    if (resultStageName) {
        resultStageName.textContent = resultData.stageName;
    }

    if (resultScore) {
        resultScore.textContent = resultData.score.toLocaleString();
    }

    if (resultCombo) {
        resultCombo.textContent = resultData.maxCombo;
    }

    if (resultStreak) {
        resultStreak.textContent = String(resultData.streak).padStart(2, "0");
    }

    if (resultCoin) {
        resultCoin.textContent = resultData.earnedCoin;
    }

    resultModal.classList.add("is-show");
    resultModal.setAttribute("aria-hidden", "false");
}


function closeResultModal() {
    if (!resultModal) return;

    resultModal.classList.remove("is-show");
    resultModal.setAttribute("aria-hidden", "true");
}


// ==============================
// 21. 描画
// ==============================

function renderInitialScreen() {
    const stage = stages[0];

    if (stageNameEl) {
        stageNameEl.textContent = stage.name;
    }

    if (timeLeftEl) {
        timeLeftEl.textContent = stage.timeLimit;
    }

    if (brushCountEl) {
        brushCountEl.textContent = 0;
    }

    if (targetBrushCountEl) {
        targetBrushCountEl.textContent = stage.targetBrushCount;
    }

    if (enemyNameEl) {
        enemyNameEl.textContent = stage.enemy.name;
    }

    if (enemyHpEl) {
        enemyHpEl.textContent = stage.enemy.hp;
    }

    if (scoreEl) {
        scoreEl.textContent = 0;
    }

    if (comboEl) {
        comboEl.textContent = 0;
    }

    if (maxComboEl) {
        maxComboEl.textContent = 0;
    }

    if (specialGaugeEl) {
        specialGaugeEl.textContent = 0;
    }
}


function render() {
    const stage = stages[battleState.currentStageIndex];

    if (!stage) return;

    if (stageNameEl) {
        stageNameEl.textContent = stage.name;
    }

    if (timeLeftEl) {
        timeLeftEl.textContent = battleState.timeLeft;
    }

    if (brushCountEl) {
        brushCountEl.textContent = battleState.stageBrushCount;
    }

    if (targetBrushCountEl) {
        targetBrushCountEl.textContent = stage.targetBrushCount;
    }

    if (enemyNameEl) {
        enemyNameEl.textContent = battleState.currentEnemy
            ? battleState.currentEnemy.name
            : stage.enemy.name;
    }

    if (enemyHpEl) {
        enemyHpEl.textContent = battleState.currentEnemy
            ? battleState.currentEnemy.hp
            : stage.enemy.hp;
    }

    if (scoreEl) {
        scoreEl.textContent = battleState.score;
    }

    if (comboEl) {
        comboEl.textContent = battleState.combo;
    }

    if (maxComboEl) {
        maxComboEl.textContent = battleState.maxCombo;
    }

    if (specialGaugeEl) {
        specialGaugeEl.textContent = battleState.specialGauge;
    }
}


function renderParty() {
    if (!partyListEl) return;

    partyListEl.innerHTML = party
        .map((character) => {
            return `
        <div>
          <p>${character.name}</p>
          <p>役割：${character.roleName}</p>
          <p>攻撃力：${character.attack}</p>
          <p>HP：${character.hp}</p>
        </div>
      `;
        })
        .join("");
}


function log(message) {
    if (!battleLogEl) {
        console.log(message);
        return;
    }

    const li = document.createElement("li");
    li.textContent = message;
    battleLogEl.prepend(li);
}