const gatyaButton = document.querySelector(".gatya_button");

gatyaButton.addEventListener("click", () => {
    if (gatyaButton.classList.contains("is-drawing")) return;

    gatyaButton.classList.add("is-drawing");
    gatyaButton.textContent = "ガチャを引いています…";

    setTimeout(() => {
        gatyaButton.classList.remove("is-drawing");
        gatyaButton.textContent = "ガチャを引く";
        alert("卑弥呼が出ました\nHP🦷🦷🦷\nこうげき🦷🦷")
    }, 800);
});
