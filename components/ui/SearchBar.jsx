"use client";
import { useState } from "react";

export default function SearchBar({ placeholder = "Search...", onSearch, className = "" }) {
  const [value, setValue] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch?.(value);
  };

  return (
    <form onSubmit={handleSubmit} className={className} style={{ display: "flex", gap: 8 }}>
      <input
        className="form-input"
        style={{ maxWidth: 320 }}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
      />
      <button type="submit" className="btn btn-ghost btn-sm">Search</button>
    </form>
  );
}
