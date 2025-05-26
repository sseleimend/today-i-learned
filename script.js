const btn = document.querySelector(".btn-open");
const form = document.querySelector(".fact-form");
const factsList = document.querySelector(".facts-list");

factsList.innerHTML = "";

btn.addEventListener("click", () => {
  form.classList.toggle("hidden");
  btn.textContent =
    btn.textContent === "Share a fact" ? "Close" : "Share a fact";
});
