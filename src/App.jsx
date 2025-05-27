import { useEffect, useState } from "react";
import supabase from "./supabase.js";

import "./style.css";

function App() {
  const [facts, setFacts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentCategory, setCurrentCategory] = useState("all");

  useEffect(() => {
    async function getFacts() {
      setIsLoading(true);
      let query = supabase.from("facts").select("*");

      if (currentCategory !== "all") {
        query = query.eq("category", currentCategory);
      }

      const { data: facts, error } = await query
        .order("votesInteresting", {
          ascending: false,
        })
        .limit(1000);

      if (!error) setFacts(facts);
      else alert("There was a problem getting data");

      setIsLoading(false);
    }
    getFacts();
  }, [currentCategory]);

  return (
    <>
      <Header setShowForm={setShowForm} showForm={showForm} />
      {showForm && (
        <NewFactForm setFacts={setFacts} setShowForm={setShowForm} />
      )}
      <main className="main">
        <CategoryFilter setCurrentCategory={setCurrentCategory} />
        {isLoading ? (
          <Loader />
        ) : (
          <FactList setFacts={setFacts} facts={facts} />
        )}
      </main>
    </>
  );
}

function Loader() {
  return <p className="message">Loading...</p>;
}

function Header({ setShowForm, showForm }) {
  return (
    <header className="header">
      <div className="logo">
        <img src="logo.png" height="68" width="68" alt="Today I Learned Logo" />
        <h1>Today I Learned</h1>
      </div>
      <button
        onClick={() => setShowForm((showForm) => !showForm)}
        className="btn btn-large btn-open"
      >
        {!showForm ? "Share a fact" : "Close"}
      </button>
    </header>
  );
}

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

function isValidHttpURL(url) {
  try {
    const parsedURL = new URL(url);
    return parsedURL.protocol === "http:" || parsedURL.protocol === "https:";
  } catch (error) {
    console.log(error);
    return false;
  }
}

function NewFactForm({ setFacts, setShowForm }) {
  const [text, setText] = useState("");
  const [source, setSource] = useState("");
  const [category, setCategory] = useState("");
  const [error, setError] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const textLength = 200 - text.length;

  async function handleSubmit(e) {
    e.preventDefault();

    if (!text || !isValidHttpURL(source) || !category || textLength >= 200) {
      return setError("Invalid data");
    }
    setError("");

    setIsUploading(true);
    const { data: newFact } = await supabase
      .from("facts")
      .insert([{ text, source, category }])
      .select();
    setIsUploading(false);

    if (!error) setFacts((facts) => [...newFact, ...facts]);

    setShowForm(false);
  }

  return (
    <form onSubmit={handleSubmit} className="fact-form">
      {error && (
        <p
          style={{
            backgroundColor: "#ef4444",
            padding: "8px 16px",
            borderRadius: "8px",
          }}
        >
          {error}
        </p>
      )}
      <input
        disabled={isUploading}
        value={text}
        onChange={(e) => setText(e.target.value)}
        type="text"
        placeholder="Share a fact with the world..."
      />
      <span>{textLength}</span>
      <input
        disabled={isUploading}
        value={source}
        onChange={(e) => setSource(e.target.value)}
        type="text"
        placeholder="Trustworthy source"
      />
      <select
        disabled={isUploading}
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      >
        <option value="">Choose a category</option>
        {CATEGORIES.map((cat) => (
          <option key={cat.name} value={cat.name}>
            {cat.name.toUpperCase()}
          </option>
        ))}
      </select>
      <button className="btn btn-large" disabled={isUploading}>
        Post
      </button>
    </form>
  );
}

function CategoryFilter({ setCurrentCategory }) {
  return (
    <aside>
      <ul>
        <li className="category">
          <button
            className="btn btn-all-categories"
            onClick={() => setCurrentCategory("all")}
          >
            All
          </button>
        </li>
        {CATEGORIES.map((cat) => (
          <li key={cat.name} className="category">
            <button
              className="btn btn-category"
              style={{ backgroundColor: cat.color }}
              onClick={() => setCurrentCategory(cat.name)}
            >
              {cat.name}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}

function FactList({ facts, setFacts }) {
  if (!facts.length)
    return (
      <p className="message">
        No facts for this category yet! Create the first one ✌️
      </p>
    );

  return (
    <section>
      <ul className="facts-list">
        {facts.map((fact) => (
          <Fact key={fact.id} fact={fact} setFacts={setFacts} />
        ))}
      </ul>
      <p>There are {facts.length} facts in the database. Add your own!</p>
    </section>
  );
}

function Fact({ fact, setFacts }) {
  const [isUpdating, setIsUpdating] = useState(false);

  async function handleVote(columnName) {
    setIsUpdating(true);
    const { data: updatedFact, error } = await supabase
      .from("facts")
      .update({ [columnName]: fact[columnName] + 1 })
      .eq("id", fact.id)
      .select();
    setIsUpdating(false);

    if (!error)
      setFacts((facts) =>
        facts.map((f) => (f.id === fact.id ? updatedFact[0] : f))
      );
  }

  return (
    <li className="fact">
      <p>
        {fact.text}
        <a className="source" href={fact.source} target="_blank">
          (Source)
        </a>
      </p>
      <span
        className="tag"
        style={{
          backgroundColor: CATEGORIES.find((cat) => cat.name === fact.category)
            .color,
        }}
      >
        {fact.category}
      </span>
      <div className="vote-buttons">
        <button
          disabled={isUpdating}
          onClick={() => handleVote("votesInteresting")}
        >
          👍 {fact.votesInteresting}
        </button>
        <button
          disabled={isUpdating}
          onClick={() => handleVote("votesMindblowing")}
        >
          🤯 {fact.votesMindblowing}
        </button>
        <button disabled={isUpdating} onClick={() => handleVote("votesFalse")}>
          ⛔️ {fact.votesFalse}
        </button>
      </div>
    </li>
  );
}

export default App;
