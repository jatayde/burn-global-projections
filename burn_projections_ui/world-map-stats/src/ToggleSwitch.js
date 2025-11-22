import React from "react";

export default function ToggleSwitch({ mode, onChange }) {
  const isPerCapita = mode === "perCapita";

  return (
    <div
      onClick={() => onChange(isPerCapita ? "raw" : "perCapita")}
      style={{
        width: "60px",
        height: "28px",
        borderRadius: "14px",
        background: isPerCapita ? "#4a90e2" : "#888",
        cursor: "pointer",
        position: "relative",
        marginBottom: "12px",
      }}
    >
      <div
        style={{
          width: "24px",
          height: "24px",
          borderRadius: "12px",
          background: "white",
          position: "absolute",
          top: "2px",
          left: isPerCapita ? "34px" : "2px",
          transition: "left 0.2s ease",
        }}
      />
    </div>
  );
}
