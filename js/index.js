const modal = document.querySelector(".modal")
const playBtn = document.querySelector(".play_btn")
const backBtn = document.querySelector(".back_btn")

playBtn.addEventListener("click", () => {
    modal.classList.toggle("active");
    // if (!modal.classList.contains("active")) {
    //     console.log("あああ");
    //     modal.classList.add("active")
    // } else {
    //     modal.classList.remove("active")
    // }
})

backBtn.addEventListener("click", () => {
    modal.classList.toggle("active");
})

