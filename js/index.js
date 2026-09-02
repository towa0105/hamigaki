
const stages = document.querySelectorAll(".stage");
const modal = document.querySelector(".modal");
const overlay = document.querySelector(".overlay")
const modalStage = document.querySelector(".modal__stage");
const modalClose = document.querySelector(".modal__close");


// ステージをタップ
stages.forEach((stage) => {

    stage.addEventListener("click", () => {
        // const stageNumber = stage.dataset.stage;
        // modalStage.textContent = `STAGE ${stageNumber}`;
        modal.classList.toggle("active");

    });

});


// 閉じるボタン
modalClose.addEventListener("click", () => {

    modal.classList.toggle("active");

});