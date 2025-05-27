const CATEGORIES = [
  { name: "technology", color: "#3b82f6" },
  { name: "science", color: "#16a34a" },
  { name: "finance", color: "#ef4444" },
  { name: "society", color: "#eab308" },
  { name: "entertainment", color: "#db2777" },
  { name: "health", color: "#14b8a6" },
  { name: "history", color: "#f97316" },
  { name: "news", color: "#8b5cf6" },
];

const btn = document.querySelector(".btn-open");
const form = document.querySelector(".fact-form");
const factsList = document.querySelector(".facts-list");

factsList.innerHTML = "";

loadFacts();

async function loadFacts() {
  const res = await fetch(
    "https://odajskgmexabuqzmcjlb.supabase.co/rest/v1/facts",
    {
      headers: {
        apiKey: "",
        authorization: "Bearer",
      },
    }
  );
  const data = await res.json();
  createFactsList(data);
}

function createFactsList(data) {
  const htmlArr = data.map(
    (fact) => `
      <li class="fact">
        <p>
          ${fact.text}
          <a
            class="source"
            href="${fact.source}"
            target="_blank"
          >
            (Source)
          </a>
        </p>
        <span class="tag" style="background-color: ${
          CATEGORIES.find((cat) => cat.name === fact.category).color
        }">
          ${fact.category}
        </span>
      </li>`
  );
  factsList.insertAdjacentHTML("afterbegin", htmlArr.join(""));
}

btn.addEventListener("click", () => {
  form.classList.toggle("hidden");
  btn.textContent =
    btn.textContent === "Share a fact" ? "Close" : "Share a fact";
});
