// import { team } from `../js/common.js`;

// const gatyaButton = document.querySelector(".gatya_button");
// gatyaButton.addEventListener("click", () => {

//     if (gatyaButton.classList.contains("is-drawing")) return;

//     gatyaButton.classList.add("is-drawing");
//     gatyaButton.textContent = "ガチャを引いています…";

//     setTimeout(() => {
//         gatyaButton.classList.remove("is-drawing");
//         gatyaButton.textContent = "ガチャを引く";
//         alert(team[2]);
//     }, 800);
// });

const team = [
    { name: "坂本龍馬", attack: "🦷🦷🦷", hp: "🦷🦷" },
    { name: "卑弥呼", attack: "🦷🦷", hp: "🦷🦷🦷" },
    { name: "しゅんや様", attack: "🦷🦷", hp: "🦷🦷🦷" },
    { name: "大穴口まくりべい", attack: "🦷🦷", hp: "🦷🦷🦷" },
    { name: "こうへいどん", attack: "🦷🦷", hp: "🦷🦷🦷" },
    { name: "らめん", attack: "🦷🦷", hp: "🦷🦷🦷" },
]
console.log(team[1]);

const gatyaBtn = document.querySelector(".gatya_button");
console.log(gatyaBtn);

gatyaBtn.addEventListener("click", () => {
    let random = Math.floor(Math.random() * 5)
    alert(team[random].name)
})