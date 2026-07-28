const boss = document.querySelector(".boss")
const brush = document.querySelector(".brush")
const modal = document.querySelector(".modal")
const lifeBar = document.querySelector(".boss_gauge")
let count = 0;
let life = 100;
lifeBar.style.width = "100%";


brush.addEventListener("click", () => {
    console.log(1 + count++)
    let Bar = (life -= 19);
    console.log(Bar);
    lifeBar.style.width = Bar + `%`;


    boss.classList.toggle("damage")
    if (count > 5) {
        boss.classList.add("active");
        modal.classList.add("active")
    }
})
