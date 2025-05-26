const btn = document.querySelector(".btn-open");
const form = document.querySelector(".fact-form");

btn.addEventListener("click", () => {
  form.classList.toggle("hidden");
  btn.textContent =
    btn.textContent === "Share a fact" ? "Close" : "Share a fact";
});
