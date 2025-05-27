import { useEffect, useState } from "react";
import supabase from "./supabase.js";

import "./style.css";

function App() {
  const [facts, setFacts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function getFacts() {
      setIsLoading(true);
      const { data: facts } = await supabase.from("facts").select("*");
      setFacts(facts);
      setIsLoading(false);
    }
    getFacts();
  }, []);

  return (
    <>
      <Header setShowForm={setShowForm} showForm={showForm} />
      {showForm && (
        <NewFactForm setFacts={setFacts} setShowForm={setShowForm} />
      )}
      <main className="main">
        <CategoryFilter />
        {isLoading ? <Loader /> : <FactList facts={facts} />}
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
  const textLength = 200 - text.length;

  function handleSubmit(e) {
    e.preventDefault();

    if (!text || !isValidHttpURL(source) || !category || textLength >= 200) {
      return setError("Invalid data");
    }
    setError("");

    const newFact = {
      id: Math.round(Math.random() * Number.MAX_SAFE_INTEGER),
      text: text,
      source: source,
      category: category,
      votesInteresting: 0,
      votesMindblowing: 0,
      votesFalse: 0,
      createdIn: new Date().getFullYear(),
    };
    setFacts((facts) => [newFact, ...facts]);

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
        value={text}
        onChange={(e) => setText(e.target.value)}
        type="text"
        placeholder="Share a fact with the world..."
      />
      <span>{textLength}</span>
      <input
        value={source}
        onChange={(e) => setSource(e.target.value)}
        type="text"
        placeholder="Trustworthy source"
      />
      <select value={category} onChange={(e) => setCategory(e.target.value)}>
        <option value="">Choose a category</option>
        {CATEGORIES.map((cat) => (
          <option key={cat.name} value={cat.name}>
            {cat.name.toUpperCase()}
          </option>
        ))}
      </select>
      <button className="btn btn-large">Post</button>
    </form>
  );
}

function CategoryFilter() {
  return (
    <aside>
      <ul>
        <li className="category">
          <button className="btn btn-all-categories">All</button>
        </li>
        {CATEGORIES.map((cat) => (
          <li key={cat.name} className="category">
            <button
              className="btn btn-category"
              style={{ backgroundColor: cat.color }}
            >
              {cat.name}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}

function FactList({ facts }) {
  return (
    <section>
      <ul className="facts-list">
        {facts.map((fact) => (
          <Fact key={fact.id} fact={fact} />
        ))}
      </ul>
      <p>There are {facts.length} facts in the database.</p>
    </section>
  );
}

function Fact({ fact }) {
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
        <button>👍 {fact.votesInteresting}</button>
        <button>🤯 {fact.votesMindblowing}</button>
        <button>⛔️ {fact.votesFalse}</button>
      </div>
    </li>
  );
}

export default App;
