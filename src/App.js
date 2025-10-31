import React, { useState } from "react";
import "./App.css";

const WEBHOOK_URL =
  "https://services.leadconnectorhq.com/hooks/9BZdBwDz8uXZfiw31MXE/webhook-trigger/Z5Xbq96KX87B2hrAHIM6";

const PRICES = {
  bedroom: 2600,
  kitchenArtAccessories: 100,
  kitchenStarterKit: 500,
  beddingTowelsPerBedroom: 100,
  bathroomEssentialsPerBedroom: 50,
};

const BEDROOMS_BY_PROPERTY = {
  "1 Bedroom Condo": 1,
  "2 Bedroom Condo / Townhome": 2,
  "3 Bedroom House": 3,
};

export default function Survey() {
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    style: "",
    property: "",
    extras: [],
    contact: { name: "", address: "", email: "", phone: "" },
  });

  const styles = [
    { label: "Modern Minimalist", image: "Ready to Rent.jpg" },
    { label: "Boho Chic", image: "Ready to rent design 4.jpg" },
    { label: "Vibrant Colorful", image: "Ready to rent design 3.jpg" },
    { label: "Modern Farmhouse", image: "Ready to rent design 2.jpg" },
  ];

  const properties = [
    "1 Bedroom Condo",
    "2 Bedroom Condo / Townhome",
    "3 Bedroom House",
  ];

  const extras = [
    "Kitchen (Art & Accessories)",
    "Kitchen Starter Kit",
    "Bedding & Towels",
    "Bathroom Essentials",
  ];

  const bedrooms = BEDROOMS_BY_PROPERTY[formData.property] || 0;
  const has = (key) => formData.extras.includes(key);

  // ---------------- CALCULATION ----------------
  const buildLineItems = () => {
    const items = [];

    // Bedrooms
    if (bedrooms > 0) {
      items.push({
        label: "Bedroom",
        qty: bedrooms,
        unit: PRICES.bedroom,
        total: bedrooms * PRICES.bedroom,
      });
    }

    if (has("Kitchen (Art & Accessories)")) {
      items.push({
        label: "Kitchen (Art & Accessories)",
        qty: 1,
        unit: PRICES.kitchenArtAccessories,
        total: PRICES.kitchenArtAccessories,
      });
    }

    if (has("Kitchen Starter Kit")) {
      items.push({
        label: "Kitchen Starter Kit",
        qty: 1,
        unit: PRICES.kitchenStarterKit,
        total: PRICES.kitchenStarterKit,
      });
    }

    if (has("Bedding & Towels") && bedrooms > 0) {
      items.push({
        label: "Bedding & Towels",
        qty: bedrooms,
        unit: PRICES.beddingTowelsPerBedroom,
        total: bedrooms * PRICES.beddingTowelsPerBedroom,
      });
    }

    if (has("Bathroom Essentials") && bedrooms > 0) {
      items.push({
        label: "Bathroom Essentials",
        qty: bedrooms,
        unit: PRICES.bathroomEssentialsPerBedroom,
        total: bedrooms * PRICES.bathroomEssentialsPerBedroom,
      });
    }

    return items;
  };

  const total = () =>
    buildLineItems().reduce((sum, item) => sum + item.total, 0);

  // ---------------- NAVIGATION ----------------
  const next = () => {
    if (step === 2 && !formData.style) {
      setError("Please select a style to continue.");
      return;
    }
    if (step === 3 && !formData.property) {
      setError("Please select a property to continue.");
      return;
    }
    setError("");
    setStep((s) => Math.min(s + 1, 7));
    window.scrollTo(0, 0);
  };

  const back = () => {
    setError("");
    setStep((s) => Math.max(s - 1, 1));
    window.scrollTo(0, 0);
  };

  const toggleExtra = (label) => {
    setFormData((prev) => {
      const exists = prev.extras.includes(label);
      return {
        ...prev,
        extras: exists
          ? prev.extras.filter((x) => x !== label)
          : [...prev.extras, label],
      };
    });
  };

  const handleContactChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      contact: { ...prev.contact, [name]: value },
    }));
  };

  // ---------------- SUBMIT ----------------
  const submit = async (e) => {
    e.preventDefault();
    const payload = {
      style: formData.style,
      property: formData.property,
      bedrooms,
      extras: formData.extras,
      breakdown: buildLineItems(),
      total: total(),
      contact: formData.contact,
      source: "One Two Six – Ready to Rent",
    };

    try {
      await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setStep(7);
    } catch (err) {
      console.error("Webhook error:", err);
      alert("There was a problem submitting your quote. Please try again.");
    }
  };

  // ---------------- UI ----------------
  return (
    <div className="page">
      <div className="topbar">
        <div className="brand">ONE TWO SIX</div>
        <div>Step {Math.min(step, 7)} / 7</div>
      </div>

      {/* STEP 1 */}
      {step === 1 && (
        <section className="intro">
          <h2 className="lux-title">
            Ready to Rent — Let’s furnish your Airbnb in style.
          </h2>
          <p className="intro-desc">
            Get your Airbnb guest-ready — fast, stylish, and turnkey. We’ll help
            you furnish quickly and budget-consciously, while still showing One
            Two Six Design’s curated touch.
          </p>
          <div className="intro-images double">
            <img src="file 1.png" alt="Airbnb 1" />
            <img src="file 5.png" alt="Airbnb 2" />
          </div>
          <div className="intro-btn">
            <button className="btn btn-primary" onClick={next}>
              Start My Quote
            </button>
          </div>
        </section>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <section className="style-step">
          <h2 className="lux-h2">Choose Your Style</h2>
          <div className="style-grid">
            {styles.map((s) => (
              <div
                key={s.label}
                className={`style-option ${
                  formData.style === s.label ? "active" : ""
                }`}
                onClick={() => {
                  setFormData({ ...formData, style: s.label });
                  setError("");
                }}
              >
                <img src={s.image} alt={s.label} />
                <div>{s.label}</div>
              </div>
            ))}
          </div>
          {error && <div className="inline-error">{error}</div>}
          <div className="nav-row">
            <button className="btn btn-ghost" onClick={back}>
              ← Back
            </button>
            <button className="btn btn-primary" onClick={next}>
              Next →
            </button>
          </div>
        </section>
      )}

      {/* STEP 3 */}
      {step === 3 && (
        <section className="property-step">
          <h2 className="lux-h2">What are we furnishing?</h2>
          <div className="radio-group">
            {properties.map((p) => (
              <label key={p} className="radio-item">
                <input
                  type="radio"
                  name="property"
                  checked={formData.property === p}
                  onChange={() => {
                    setFormData({ ...formData, property: p });
                    setError("");
                  }}
                />
                {p}
              </label>
            ))}
          </div>
          {error && <div className="inline-error">{error}</div>}
          <div className="nav-row">
            <button className="btn btn-ghost" onClick={back}>
              ← Back
            </button>
            <button className="btn btn-primary" onClick={next}>
              Next →
            </button>
          </div>
        </section>
      )}

      {/* STEP 4 */}
      {step === 4 && (
        <section className="extras-step">
          <h2 className="lux-h2">Would you like to include...</h2>
          <div className="checkbox-group">
            {extras.map((x) => (
              <label key={x} className="checkbox-item">
                <input
                  type="checkbox"
                  checked={formData.extras.includes(x)}
                  onChange={() => toggleExtra(x)}
                />
                {x}
              </label>
            ))}
          </div>
          <div className="nav-row">
            <button className="btn btn-ghost" onClick={back}>
              ← Back
            </button>
            <button className="btn btn-primary" onClick={next}>
              Next →
            </button>
          </div>
        </section>
      )}

      {/* STEP 5 */}
      {step === 5 && (
        <section className="summary-step">
          <h2 className="lux-h2">Your Quote Summary</h2>
          <div className="summary-box">
            <ul className="summary-list">
              {formData.style && <li>{formData.style}</li>}
              {formData.property && <li>{formData.property}</li>}
              {formData.extras.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          </div>
          <div className="nav-row">
            <button className="btn btn-ghost" onClick={back}>
              ← Back
            </button>
            <button className="btn btn-primary" onClick={next}>
              Continue →
            </button>
          </div>
        </section>
      )}

      {/* STEP 6 */}
      {step === 6 && (
        <section className="contact-step">
          <h2 className="lux-title">Your Refresh & Reuse Package Is Ready!</h2>
          <p className="intro-desc">
            Please fill out your details and we’ll send you an estimate.
          </p>

          <div className="contact">
            <div className="contact-header">
              <img
                src="https://storage.googleapis.com/msgsndr/9BZdBwDz8uXZfiw31MXE/media/67b6de0a7c922f84a939e661.png"
                alt="One Two Six Design"
              />
            </div>

            <form className="contact-form" onSubmit={submit}>
              <label>
                Name
                <input
                  name="name"
                  type="text"
                  placeholder="Enter your name"
                  value={formData.contact.name}
                  onChange={handleContactChange}
                  required
                />
              </label>
              <label>
                Address
                <input
                  name="address"
                  type="text"
                  placeholder="Enter your address"
                  value={formData.contact.address}
                  onChange={handleContactChange}
                  required
                />
              </label>
              <label>
                Email
                <input
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.contact.email}
                  onChange={handleContactChange}
                  required
                />
              </label>
              <label>
                Phone
                <input
                  name="phone"
                  type="tel"
                  placeholder="Enter your phone"
                  value={formData.contact.phone}
                  onChange={handleContactChange}
                  required
                />
              </label>

              <button className="btn btn-primary" type="submit">
                Send Me My Quote
              </button>
            </form>
          </div>
        </section>
      )}

      {/* STEP 7 */}
      {step === 7 && (
        <section className="thankyou">
          <img
            className="thankyou-logo"
            src="https://storage.googleapis.com/msgsndr/9BZdBwDz8uXZfiw31MXE/media/67b6de0a7c922f84a939e661.png"
            alt="One Two Six Design"
          />
          <h2>Thank You!</h2>
          <p>
            Your quote request has been submitted. <br />
            Our team will be in touch soon to confirm your details.
          </p>
        </section>
      )}
    </div>
  );
}
