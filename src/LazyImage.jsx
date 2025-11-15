import React, { useState } from "react";

export default function LazyImage({ src, alt = "", className = "" }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={`lazy-wrapper ${className}`}>
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className={`lazy-img ${loaded ? "loaded" : "loading"}`}
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
}
