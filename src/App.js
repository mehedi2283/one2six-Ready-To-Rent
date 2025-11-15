import React, { useMemo, useState } from "react";
import "./App.css";

/* ------------------ Pricing ------------------ */
const PRICING = {
  living: { label: "Living Areas (Living/Family)", price: 4250 },
  dining: { label: "Dining Room", price: 2250 },
  bedroom: { label: "Bedroom", price: 2600 },
  bathroom: { label: "Bathroom", price: 250 },
  kitchenArt: { label: "Kitchen (Art & Accessories)", price: 100 },

  /* Editable qty add-ons */
  kitchenEssentials: { label: "Kitchen Essentials (Add-on)", price: 500 },
  patio: { label: "Patio Area (Add-on)", price: 1000 },

  /* Fixed toggle add-ons */
  entryway: { label: "Entryway Package (Add-on)", price: 600 },
  office: { label: "Office / Den Package (Add-on)", price: 1000 },
};

/* ------------------ Steps ------------------ */
const STEPS = [
  {
    id: "intro",
    kind: "intro",
    title: "Ready to Rent — Let’s furnish your Airbnb in style.",
    description:
      "Get your Airbnb guest-ready — fast, stylish, and turnkey. We’ll help you furnish quickly and budget-consciously, while still showing One Two Six Design’s curated touch.",
    cta: "Start My Quote",
    images: ["/images/File1.WEBP", "/images/File2.WEBP"],
  },

  {
    id: "style",
    kind: "style",
    title: "Choose Your Style",
    styles: [
      { label: "Modern Minimalist", image: "/Ready to Rent.jpg" },
      { label: "Boho Chic", image: "/Ready to rent design 4.jpg" },
      { label: "Vibrant Colorful", image: "/Ready to rent design 3.jpg" },
      { label: "Modern Farmhouse", image: "/Ready to Rent Design 2.jpg" },
    ],
  },

  /* Room qty steps with images */
  {
    id: "living",
    kind: "qty",
    title: "Living Room",
    image: "living.png",
    question: "How many living areas would you like refreshed?",
    priceKey: "living",
  },
  {
    id: "dining",
    kind: "qty",
    title: "Dining Room",
    image: "Dining room.png",
    question: "How many dining spaces are included?",
    priceKey: "dining",
  },
  {
    id: "bedroom",
    kind: "qty",
    title: "Bedroom",
    image: "Bedroom.png",
    question: "How many bedrooms would you like staged?",
    priceKey: "bedroom",
  },
  {
    id: "bathroom",
    kind: "qty",
    title: "Bathrooms",
    image: "Bathroom.png",
    question: "How many bathrooms to style?",
    priceKey: "bathroom",
  },
  {
    id: "kitchenArt",
    kind: "qty",
    title: "Kitchen (Art & Accessories)",
    image: "Kitchen.png",
    question: "How many kitchen areas to decorate?",
    priceKey: "kitchenArt",
  },

  /* Add-ons (editable qty) */
  {
    id: "kitchenEssentials",
    kind: "qtyNoImage",
    title: "Kitchen Essentials (Add-on)",
    question: "Would you like to include Kitchen Essentials?",
    priceKey: "kitchenEssentials",
  },
  {
    id: "patio",
    kind: "qtyNoImage",
    title: "Patio Area (Add-on)",
    question: "Include patio area setup?",
    priceKey: "patio",
  },

  /* Fixed toggle add-ons */
  {
    id: "entryway",
    kind: "fixedNoImage",
    title: "Entryway Package (Add-on)",
    question: "Include entryway area setup?",
    priceKey: "entryway",
  },
  {
    id: "office",
    kind: "fixedNoImage",
    title: "Office / Den Package (Add-on)",
    question: "Include office area setup?",
    priceKey: "office",
  },

  { id: "summary", kind: "summary", title: "Your Quote Summary" },

  {
    id: "contact",
    kind: "contact",
    title: "Your Ready to Rent Package Is Ready!",
    subtitle: "Please fill out your details and we’ll send you an estimate.",
  },
];

/* ------------------ Webhook ------------------ */
const WEBHOOK_URL =
  "https://services.leadconnectorhq.com/hooks/9BZdBwDz8uXZfiw31MXE/webhook-trigger/Z5Xbq96KX87B2hrAHIM6";

/* ------------------ Pill ------------------ */
const QtyPill = ({ value, active, onClick }) => (
  <button
    type="button"
    className={`qty-pill ${active ? "active" : ""}`}
    onClick={onClick}
  >
    {value}
  </button>
);

/* ===================================================== */

export default function App() {
  const [step, setStep] = useState(0);
  const [isBack, setIsBack] = useState(false);
  const [error, setError] = useState("");

  const [qty, setQty] = useState(
    Object.keys(PRICING).reduce((acc, k) => ({ ...acc, [k]: null }), {})
  );

  const [styleChoice, setStyleChoice] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    email: "",
    phone: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const current = STEPS[step];

  const setQuantity = (key, val) => {
    setQty((s) => ({ ...s, [key]: val }));
    setError("");
  };

  /* ---------- Line Items ---------- */
  const lineItems = useMemo(() => {
    return Object.entries(qty)
      .filter(([_, q]) => q && q > 0)
      .map(([key, q]) => ({
        key,
        label: PRICING[key].label,
        qty: q,
        unit: PRICING[key].price,
        total: PRICING[key].price * q,
      }));
  }, [qty]);

  const total = useMemo(
    () => lineItems.reduce((sum, it) => sum + it.total, 0),
    [lineItems]
  );

  /* ---------- Navigation ---------- */
  const next = () => {
    const optional = ["kitchenEssentials", "patio", "entryway", "office"];

    if (current.kind === "style" && !styleChoice) {
      setError("Please select a style.");
      return;
    }

    if (
      (current.kind === "qty" || current.kind === "qtyNoImage") &&
      !optional.includes(current.priceKey) &&
      (!qty[current.priceKey] || qty[current.priceKey] < 1)
    ) {
      setError("Please select a quantity to continue.");
      return;
    }

    setIsBack(false);
    setStep((s) => s + 1);
    window.scrollTo(0, 0);
  };

  const back = () => {
    setIsBack(true);
    setStep((s) => Math.max(0, s - 1));
  };

  /* ---------- Contact ---------- */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const missing =
      !formData.name || !formData.address || !formData.email || !formData.phone;

    if (missing) {
      setError("Please complete all fields.");
      return;
    }

    setLoading(true);

    const allItems = Object.keys(PRICING).map((key) => ({
      key,
      label: PRICING[key].label,
      qty: qty[key] || 0,
      unit: PRICING[key].price,
      total: (qty[key] || 0) * PRICING[key].price,
    }));

    const addOnKeys = ["kitchenEssentials", "patio", "entryway", "office"];
    const addOnsTotal = addOnKeys.reduce(
      (s, key) => s + (qty[key] || 0) * PRICING[key].price,
      0
    );

    const payload = {
      style: styleChoice || null,
      quoteDetails: allItems,
      addOnsTotal,
      total,
      contact: formData,
      source: "One Two Six – Ready to Rent",
    };

    try {
      await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      setSubmitted(true);
      
    } catch (err) {
      setError("Error sending. Try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ============================================================= */
  return (
    <div className="page">
      <div className="topbar">
        Step {step + 1} / {STEPS.length}
      </div>

      <div
        key={step + "-" + (isBack ? "back" : "forward")}
        className={`step-anim ${isBack ? "slide-in-left" : "slide-in-right"}`}
      >
        {/* INTRO */}
        {current.kind === "intro" && (
          <section className="intro">
            <h1 className="lux-title">{current.title}</h1>
            <p className="intro-copy">{current.description}</p>

            <div className="intro-images double">
              {current.images.map((img, i) => (
                <img key={i} src={img} alt="" />
              ))}
            </div>

            <div className="intro-btn">
              <button className="fancy-btn" onClick={next}>
                {current.cta}
              </button>
            </div>
          </section>
        )}

        {/* STYLE */}
        {current.kind === "style" && (
          <section>
            <h2 className="lux-h2">{current.title}</h2>

            <div className="style-grid">
              {current.styles.map((s) => (
                <div
                  key={s.label}
                  className={`style-option ${
                    styleChoice === s.label ? "active" : ""
                  }`}
                  onClick={() => setStyleChoice(s.label)}
                >
                  <img src={s.image} alt="" />
                  <div>{s.label}</div>
                </div>
              ))}
            </div>

            {error && <div className="inline-error">{error}</div>}

            <div className="nav-row">
              <button className="fancy-btn reverse" onClick={back}>
                ← Back
              </button>
              <button className="fancy-btn" onClick={next}>
                Next →
              </button>
            </div>
          </section>
        )}

        {/* ROOM QTY WITH IMAGE */}
        {current.kind === "qty" && (
          <section className="step card">
            <h2 className="lux-h2">{current.title}</h2>

            <div className="fixed-grid">
              <div className="media">
                <img src={current.image} alt="" />
              </div>

              <div>
                <p className="question">{current.question}</p>

                <div className="pill-row">
                  {[1, 2, 3].map((n) => (
                    <QtyPill
                      key={n}
                      value={n}
                      active={qty[current.priceKey] === n}
                      onClick={() =>
                        setQuantity(
                          current.priceKey,
                          qty[current.priceKey] === n ? null : n
                        )
                      }
                    />
                  ))}

                  <input
                    className="qty-input"
                    type="number"
                    min="4"
                    placeholder="Qty"
                    value={qty[current.priceKey] > 3 ? qty[current.priceKey] : ""}
                    onChange={(e) => {
                      const v = parseInt(e.target.value);
                      setQuantity(current.priceKey, isNaN(v) ? null : v);
                    }}
                  />
                </div>

                {error && <div className="inline-error">{error}</div>}

                <div className="nav-row">
                  <button className="fancy-btn reverse" onClick={back}>
                    ← Back
                  </button>
                  <button className="fancy-btn" onClick={next}>
                    Next →
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* QTY WITHOUT IMAGE */}
        {current.kind === "qtyNoImage" && (
          <section className="step card no-image">
            <h2 className="lux-h2">{current.title}</h2>
            <p className="question">{current.question}</p>

            <div className="pill-row">
              {[1, 2, 3].map((n) => (
                <QtyPill
                  key={n}
                  value={n}
                  active={qty[current.priceKey] === n}
                  onClick={() =>
                    setQuantity(
                      current.priceKey,
                      qty[current.priceKey] === n ? null : n
                    )
                  }
                />
              ))}

              <input
                className="qty-input"
                type="number"
                min="4"
                placeholder="Qty"
                value={qty[current.priceKey] > 3 ? qty[current.priceKey] : ""}
                onChange={(e) => {
                  const v = parseInt(e.target.value);
                  setQuantity(current.priceKey, isNaN(v) ? null : v);
                }}
              />
            </div>

            <div className="nav-row">
              <button className="fancy-btn reverse" onClick={back}>
                ← Back
              </button>
              <button className="fancy-btn" onClick={next}>
                Next →
              </button>
            </div>
          </section>
        )}

        {/* FIXED ADD-ON TOGGLE */}
        {current.kind === "fixedNoImage" && (
          <section className="step card no-image">
            <h2 className="lux-h2">{current.title}</h2>
            <p className="question">{current.question}</p>

            <div className="pill-row">
              <QtyPill
                value="Add"
                active={qty[current.priceKey] === 1}
                onClick={() =>
                  setQuantity(
                    current.priceKey,
                    qty[current.priceKey] === 1 ? null : 1
                  )
                }
              />
            </div>

            <div className="nav-row">
              <button className="fancy-btn reverse" onClick={back}>
                ← Back
              </button>
              <button className="fancy-btn" onClick={next}>
                Next →
              </button>
            </div>
          </section>
        )}

        {/* SUMMARY */}
        {current.kind === "summary" && (
          <section className="summary card">
            <h2 className="lux-h2">Your Quote Summary</h2>

            <ul className="summary-list">
              <li>Style: {styleChoice}</li>

              {lineItems.map((it) => (
                <li key={it.key}>
                  {it.qty} × {it.label}
                </li>
              ))}
            </ul>



            <div className="nav-row">
              <button className="fancy-btn reverse" onClick={back}>
                ← Back
              </button>
              <button className="fancy-btn" onClick={next}>
                Continue →
              </button>
            </div>
          </section>
        )}

        {/* CONTACT */}
        {current.kind === "contact" && !submitted && (
          <section className="contact-section">
            <h2 className="lux-title">{current.title}</h2>
            <p className="intro-desc">{current.subtitle}</p>

            <div className="contact-container">
              <form className="contact-form" onSubmit={handleSubmit}>
                {["name", "address", "email", "phone"].map((f) => (
                  <label key={f}>
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                    <input
                      name={f}
                      type={f === "email" ? "email" : f === "phone" ? "tel" : "text"}
                      value={formData[f]}
                      onChange={(e) =>
                        setFormData({ ...formData, [f]: e.target.value })
                      }
                      placeholder={`Enter your ${f}`}
                      required
                    />
                  </label>
                ))}

                {error && <div className="inline-error">{error}</div>}

                <button className="fancy-btn wide" disabled={loading}>
                  {loading ? "Sending..." : "Send Me My Quote"}
                </button>
              </form>
            </div>
          </section>
        )}

        {/* THANK YOU */}
        {submitted && (
          <section className="thankyou fade-in">
            <h2 className="lux-h2">Thank You!</h2>
            <p>Your quote has been sent. Our design team will contact you soon.</p>
          </section>
        )}
      </div>
    </div>
  );
}
