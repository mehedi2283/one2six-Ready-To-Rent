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
  const [direction, setDirection] = useState("forward");
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    style: "",
    property: "",
    extras: [],
    contact: { name: "", address: "", email: "", phone: "" },
  });

  const styles = [
    { label: "Modern Minimalist", image: "/Ready to Rent.jpg" },
    { label: "Boho Chic", image: "/Ready to rent design 4.jpg" },
    { label: "Vibrant Colorful", image: "/Ready to rent design 3.jpg" },
    { label: "Modern Farmhouse", image: "/Ready to Rent Design 2.jpg" },
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

  const buildLineItems = () => {
    const items = [];
    if (bedrooms > 0)
      items.push({
        label: "Bedroom",
        qty: bedrooms,
        unit: PRICES.bedroom,
        total: bedrooms * PRICES.bedroom,
      });
    if (has("Kitchen (Art & Accessories)"))
      items.push({
        label: "Kitchen (Art & Accessories)",
        qty: 1,
        unit: PRICES.kitchenArtAccessories,
        total: PRICES.kitchenArtAccessories,
      });
    if (has("Kitchen Starter Kit"))
      items.push({
        label: "Kitchen Starter Kit",
        qty: 1,
        unit: PRICES.kitchenStarterKit,
        total: PRICES.kitchenStarterKit,
      });
    if (has("Bedding & Towels") && bedrooms > 0)
      items.push({
        label: "Bedding & Towels",
        qty: bedrooms,
        unit: PRICES.beddingTowelsPerBedroom,
        total: bedrooms * PRICES.beddingTowelsPerBedroom,
      });
    if (has("Bathroom Essentials") && bedrooms > 0)
      items.push({
        label: "Bathroom Essentials",
        qty: bedrooms,
        unit: PRICES.bathroomEssentialsPerBedroom,
        total: bedrooms * PRICES.bathroomEssentialsPerBedroom,
      });
    return items;
  };

  const total = () =>
    buildLineItems().reduce((sum, item) => sum + item.total, 0);

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
    setDirection("forward");
    setStep((s) => Math.min(s + 1, 7));
    window.scrollTo(0, 0);
  };

  const back = () => {
    setError("");
    setDirection("backward");
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

  return (
    <div className="page">
      <div className="topbar">
        <div>Step {Math.min(step, 7)} / 7</div>
      </div>

      <div className="step-wrapper">
        <div
          key={`${step}-${direction}`}
          className={`step-anim ${
            direction === "forward" ? "slide-in-right" : "slide-in-left"
          }`}
        >
          {step === 1 && (
            <section>
              <h2 className="lux-title">
                Ready to Rent — Let’s furnish your Airbnb in style.
              </h2>
              <p className="intro-desc">
                Get your Airbnb guest-ready — fast, stylish, and turnkey. We’ll
                help you furnish quickly and budget-consciously, while still
                showing One Two Six Design’s curated touch.
              </p>
              <div className="intro-images double">
                <img src="/images/File1.png" alt="Airbnb 1" />
                <img src="/images/File5.png" alt="Airbnb 2" />
              </div>
              <div className="intro-btn">
                <button className="fancy-btn" onClick={next}>
                  Start My Quote
                </button>
              </div>
            </section>
          )}

          {step === 2 && (
            <section>
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
                <button className="fancy-btn reverse" onClick={back}>
                  ← Back
                </button>
                <button className="fancy-btn" onClick={next}>
                  Next →
                </button>
              </div>
            </section>
          )}

          {step === 3 && (
            <section>
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
                <button className="fancy-btn reverse" onClick={back}>
                  ← Back
                </button>
                <button className="fancy-btn" onClick={next}>
                  Next →
                </button>
              </div>
            </section>
          )}

          {step === 4 && (
            <section>
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
                <button className="fancy-btn reverse" onClick={back}>
                  ← Back
                </button>
                <button className="fancy-btn" onClick={next}>
                  Next →
                </button>
              </div>
            </section>
          )}

          {step === 5 && (
            <section>
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
                <button className="fancy-btn reverse" onClick={back}>
                  ← Back
                </button>
                <button className="fancy-btn" onClick={next}>
                  Continue →
                </button>
              </div>
            </section>
          )}

          {step === 6 && (
            <section>
              <h2 className="lux-title">
                Your Refresh & Reuse Package Is Ready!
              </h2>
              <p className="intro-desc">
                Please fill out your details and we’ll send you an estimate.
              </p>

              <form className="contact-form" onSubmit={submit}>
                {["name", "address", "email", "phone"].map((field) => (
                  <label key={field}>
                    {field.charAt(0).toUpperCase() + field.slice(1)}
                    <input
                      type={
                        field === "email"
                          ? "email"
                          : field === "phone"
                          ? "tel"
                          : "text"
                      }
                      name={field}
                      placeholder={`Enter your ${field}`}
                      value={formData.contact[field]}
                      onChange={handleContactChange}
                      required
                    />
                  </label>
                ))}

                <button className="fancy-btn wide" type="submit">
                  Send Me My Quote
                </button>
              </form>
            </section>
          )}

          {step === 7 && (
            <section className="thankyou fade-in">
              <img
                className="thankyou-logo"
                src="https://storage.googleapis.com/msgsndr/9BZdBwDz8uXZfiw31MXE/media/67b6de0a7c922f84a939e661.png"
                alt="One Two Six Design"
              />
              <h2>Thank You!</h2>
              <p>
                Your quote request has been submitted. <br />
                Our team will be in touch soon.
              </p>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
