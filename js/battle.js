const boss = document.querySelector(".boss")
const brush = document.querySelector(".brush")
const modal = document.querySelector(".modal")
let count = 0;

brush.addEventListener("click", () => {
    console.log(1 + count++)
    boss.classList.toggle("damage")
    // brush = (1 + i++)
    if (count > 5) {
        boss.classList.add("active");
        modal.classList.add("active")
    }
})


// brush.addEventListener("click", () => {
//     boss.classList.toggle("active");
// })
