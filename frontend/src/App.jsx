import { useEffect, useMemo, useState } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const skinOptions = [
  { value: "Mixte", label: "Mixte" },
  { value: "Sèche", label: "Sèche" },
  { value: "Normale", label: "Normale" },
  { value: "Grasse", label: "Grasse" },
];

function Card({ title, text, children, className = "" }) {
  return (
    <section className={`card ${className}`}>
      {title && <h2>{title}</h2>}
      {text && <p className="section-intro">{text}</p>}
      {children}
    </section>
  );
}

function Metric({ label, value }) {
  return (
    <div className="metric">
      <div className="metric-top"><span>{label}</span><strong>{value}%</strong></div>
      <div className="meter"><i style={{ width: `${value}%` }} /></div>
    </div>
  );
}

function ProductCard({ product }) {
  return (
    <article className="product">
      <div className="product-image">
        <img src={product.image} alt={product.name} />
        <span className="pill">{product.category}</span>
      </div>
      <div className="product-body">
        <div className="rating">★ {product.rating}</div>
        <h3>{product.name}</h3>
        <p>{product.description}</p>
        <div className="product-bottom">
          <b>{Number(product.price).toFixed(2)} €</b>
          <button type="button" onClick={() => alert(`${product.name} — produit de démonstration`)}>
            Découvrir
          </button>
        </div>
      </div>
    </article>
  );
}

export default function App() {
  const [apiOk, setApiOk] = useState(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [skinType, setSkinType] = useState("Mixte");
  const [routine, setRoutine] = useState(null);
  const [routineLoading, setRoutineLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [chat, setChat] = useState([
    { role: "ai", text: "Bonjour 👋 Je suis votre assistant IA Beauté. Posez-moi une question sur votre routine." }
  ]);
  const [message, setMessage] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [makeup, setMakeup] = useState(0);

  const selectedProducts = useMemo(() => {
    const type = result?.skin_type || skinType;
    return products.filter((p) => p.skin_types?.some((x) => x.toLowerCase() === type.toLowerCase()));
  }, [products, result, skinType]);

  useEffect(() => {
    checkApi();
    loadProducts();
    loadHistory();
  }, []);

  useEffect(() => {
    if (result?.skin_type) {
      setSkinType(result.skin_type);
      getRoutine(result.skin_type);
      loadProducts(result.skin_type);
    }
  }, [result]);

  async function checkApi() {
    try {
      const response = await fetch("http://localhost:8000/health");
      setApiOk(response.ok);
    } catch {
      setApiOk(false);
    }
  }

  async function loadProducts(type = "") {
    try {
      const query = type ? `?skin_type=${encodeURIComponent(type)}` : "";
      const response = await fetch(`${API}/products/${query}`);
      if (!response.ok) throw new Error();
      setProducts(await response.json());
    } catch {
      setProducts([]);
    }
  }

  async function loadHistory() {
    setHistoryLoading(true);
    try {
      const response = await fetch(`${API}/analysis/history`);
      if (!response.ok) throw new Error();
      setHistory(await response.json());
    } catch {
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  }

  function chooseFile(event) {
    const selected = event.target.files?.[0];
    if (!selected) return;
    if (!selected.type.startsWith("image/")) return alert("Choisissez une image.");
    if (selected.size > 10 * 1024 * 1024) return alert("Image trop volumineuse : 10 Mo maximum.");
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
    setResult(null);
  }

  async function analyze() {
    if (!file) return alert("Veuillez choisir une photo.");
    setLoading(true);
    try {
      const form = new FormData();
      form.append("image", file);
      const response = await fetch(`${API}/analysis/`, { method: "POST", body: form });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Analyse impossible");
      setResult(data);
      await loadHistory();
    } catch (error) {
      alert(error.message || "Impossible de contacter l'API.");
    } finally {
      setLoading(false);
    }
  }

  async function getRoutine(type = skinType) {
    setRoutineLoading(true);
    try {
      const response = await fetch(`${API}/routine/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skin_type: type }),
      });
      if (!response.ok) throw new Error();
      setRoutine(await response.json());
    } catch {
      alert("Impossible de générer la routine.");
    } finally {
      setRoutineLoading(false);
    }
  }

  async function send(event) {
    event.preventDefault();
    const userText = message.trim();
    if (!userText || chatLoading) return;
    setMessage("");
    setChat((items) => [...items, { role: "user", text: userText }]);
    setChatLoading(true);
    try {
      const response = await fetch(`${API}/chat/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error();
      setChat((items) => [...items, { role: "ai", text: data.answer }]);
    } catch {
      setChat((items) => [...items, { role: "ai", text: "L'API est indisponible. Vérifiez Docker puis réessayez." }]);
    } finally {
      setChatLoading(false);
    }
  }

  return (
    <div>
      <header className="header">
        <a className="brand" href="#accueil">✿ <span>IA Beauté</span></a>
        <nav>
          <a href="#analyse">Analyse</a>
          <a href="#routine">Routine</a>
          <a href="#produits">Produits</a>
          <a href="#chat">Assistant</a>
        </nav>
        <div className={`api-status ${apiOk === true ? "online" : apiOk === false ? "offline" : ""}`}>
          <i /> {apiOk === true ? "API connectée" : apiOk === false ? "API hors ligne" : "Connexion..."}
        </div>
      </header>

      <main>
        <section id="accueil" className="hero">
          <div className="hero-copy">
            <span className="eyebrow">BEAUTÉ • IA • PERSONNALISATION</span>
            <h1>Comprendre votre peau.<br /><em>Révéler votre routine.</em></h1>
            <p>
              IA Beauté transforme une photo en indicateurs simples, puis vous propose
              une routine, des produits et des conseils adaptés.
            </p>
            <div className="hero-actions">
              <a className="button" href="#analyse">Analyser ma peau ✨</a>
              <a className="text-link" href="#routine">Voir les routines →</a>
            </div>
            <div className="trust-row">
              <span>✓ Résultat instantané</span>
              <span>✓ Données locales</span>
              <span>✓ Sans diagnostic médical</span>
            </div>
          </div>
          <div className="hero-visual">
            <img src="/images/hero.jpg" alt="Univers beauté" />
            <div className="floating-card">
              <span>Score indicatif</span>
              <strong>{result?.score ?? 87}<small>/100</small></strong>
              <b>✦ Analyse personnalisée</b>
            </div>
          </div>
        </section>

        <section className="features">
          {[
            ["🧠", "Analyse IA", "3 indicateurs de peau"],
            ["🧴", "Routine", "Matin + soir"],
            ["🛍️", "Produits", "Catalogue personnalisé"],
            ["💬", "Assistant", "Conseils instantanés"],
          ].map(([icon, title, text]) => (
            <div className="feature" key={title}>
              <span className="feature-icon">{icon}</span>
              <b>{title}</b><small>{text}</small>
            </div>
          ))}
        </section>

        <section id="analyse" className="analysis-layout">
          <Card title="Analyse de peau par IA" text="Importez une photo nette et obtenez un résultat indicatif.">
            <label className="upload-box">
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={chooseFile} />
              <span className="upload-icon">＋</span>
              <b>{file ? file.name : "Choisir une photo"}</b>
              <small>JPG, PNG ou WEBP • 10 Mo maximum</small>
            </label>

            {preview && (
              <div className="preview-wrap">
                <img
                  className="preview"
                  src={preview}
                  alt="Prévisualisation"
                  style={{ filter: `saturate(${1 + makeup / 100}) brightness(${1 + makeup / 300})` }}
                />
              </div>
            )}

            <button className="button full" onClick={analyze} disabled={loading}>
              {loading ? "Analyse en cours..." : "Lancer l'analyse"}
            </button>

            {result && (
              <div className="result-panel">
                <div className="result-title">
                  <div><span>Votre résultat</span><h3>{result.skin_type}</h3></div>
                  <strong>{result.score}<small>/100</small></strong>
                </div>
                <div className="metrics">
                  <Metric label="Hydratation" value={result.metrics.hydration} />
                  <Metric label="Éclat" value={result.metrics.radiance} />
                  <Metric label="Texture" value={result.metrics.texture} />
                </div>
                <h4>Conseils personnalisés</h4>
                <ul className="check-list">
                  {result.recommendations.map((item) => <li key={item}>✓ {item}</li>)}
                </ul>
                <small className="disclaimer">⚠️ {result.disclaimer}</small>
              </div>
            )}
          </Card>

          <Card title="Votre profil beauté" text="Le résultat de l'analyse vous sert de point de départ pour personnaliser la suite.">
            <div className="profile-art">
              <img src={preview || "/images/makeup.jpg"} alt="Profil beauté" />
              <div><span>Type de peau</span><b>{result?.skin_type || skinType}</b></div>
            </div>
            <div className="quick-stats">
              <div><span>Analyses</span><b>{history.length}</b></div>
              <div><span>Produits adaptés</span><b>{selectedProducts.length || products.length}</b></div>
              <div><span>Routine</span><b>{routine ? "Prête" : "À créer"}</b></div>
            </div>
            <a className="button secondary" href="#routine">Personnaliser ma routine →</a>
          </Card>
        </section>

        <section id="routine" className="routine-section">
          <div className="section-heading">
            <span className="eyebrow">VOTRE ROUTINE</span>
            <h2>Une routine simple, matin et soir.</h2>
            <p>Choisissez votre type de peau ou utilisez directement celui détecté lors de l'analyse.</p>
          </div>
          <div className="routine-controls">
            <select value={skinType} onChange={(e) => { setSkinType(e.target.value); loadProducts(e.target.value); }}>
              {skinOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
            <button className="button" onClick={() => getRoutine()} disabled={routineLoading}>
              {routineLoading ? "Création..." : "Créer ma routine"}
            </button>
          </div>
          {routine && (
            <div className="routine-grid">
              <div className="routine-card"><span>☀️ MATIN</span><ol>{routine.morning.map((x) => <li key={x}>{x}</li>)}</ol></div>
              <div className="routine-card"><span>🌙 SOIR</span><ol>{routine.evening.map((x) => <li key={x}>{x}</li>)}</ol></div>
              <div className="routine-tip"><b>Conseil IA</b><p>{routine.tip}</p></div>
            </div>
          )}
        </section>

        <section id="produits" className="products-section">
          <div className="section-heading center-heading">
            <span className="eyebrow">CATALOGUE</span>
            <h2>Des produits pour votre profil.</h2>
            <p>{result ? `Sélection adaptée à une peau ${result.skin_type.toLowerCase()}.` : "Les produits sont chargés depuis l'API et la base PostgreSQL."}</p>
          </div>
          {products.length ? (
            <div className="products">
              {(selectedProducts.length ? selectedProducts : products).map((product) => <ProductCard key={product.id} product={product} />)}
            </div>
          ) : (
            <div className="empty">Impossible de charger le catalogue. Vérifiez que le backend est démarré.</div>
          )}
        </section>

        <section id="historique" className="history-section">
          <Card title="Historique des analyses" text="Les analyses sont enregistrées dans PostgreSQL.">
            <div className="history-head">
              <span>{history.length} analyse{history.length > 1 ? "s" : ""} enregistrée{history.length > 1 ? "s" : ""}</span>
              <button className="button small" onClick={loadHistory} disabled={historyLoading}>{historyLoading ? "..." : "Actualiser"}</button>
            </div>
            {history.length === 0 ? (
              <div className="empty compact">Aucune analyse pour le moment. Lancez votre première analyse.</div>
            ) : (
              <div className="history-list">
                {history.map((item) => (
                  <article className="history-item" key={item.id}>
                    <strong>{item.score}<small>/100</small></strong>
                    <div><b>{item.skin_type}</b><span>{new Date(item.created_at).toLocaleString("fr-FR")}</span></div>
                    <p>{item.filename}</p>
                  </article>
                ))}
              </div>
            )}
          </Card>
        </section>

        <section id="maquillage" className="makeup card">
          <div>
            <span className="eyebrow">EXPÉRIENCE</span>
            <h2>Maquillage virtuel</h2>
            <p>Un aperçu visuel simple à partir de votre photo. Ajustez l'intensité pour explorer différents rendus.</p>
            <label className="range-label">Intensité <b>{makeup}%</b></label>
            <input className="range" type="range" min="0" max="100" value={makeup} onChange={(e) => setMakeup(Number(e.target.value))} />
          </div>
          <img src={preview || "/images/makeup.jpg"} alt="Aperçu maquillage" style={{ filter: `saturate(${1 + makeup / 100}) contrast(${1 + makeup / 300})` }} />
        </section>

        <section id="chat" className="chat card">
          <div className="chat-heading"><div><span className="eyebrow">ASSISTANT</span><h2>Votre conseiller beauté IA</h2></div><span className="online-badge">● En ligne</span></div>
          <div className="messages">
            {chat.map((item, index) => <div key={index} className={`message ${item.role}`}>{item.text}</div>)}
            {chatLoading && <div className="message ai">Je réfléchis…</div>}
          </div>
          <form onSubmit={send}>
            <input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Ex. Quelle routine pour une peau sèche ?" />
            <button className="button" disabled={chatLoading}>Envoyer</button>
          </form>
        </section>
      </main>

      <footer>
        <b>✿ IA Beauté</b>
        <span>React • FastAPI • PostgreSQL • Docker</span>
        <small>Projet portfolio — résultats indicatifs, pas de diagnostic médical.</small>
      </footer>
    </div>
  );
}
