import React from "react";

interface AggregationSelectorProps {
  field: string;
  type: "string" | "number";
  aggregation: string;
  onChange: (agg: string) => void;
}

const AggregationSelector: React.FC<AggregationSelectorProps> = ({
  field,
  type,
  aggregation,
  onChange,
}) => {
  const options =
    type === "number"
      ? ["count", "sum", "avg"]
      : ["count"]; // strings can only be counted

  return (
    <div style={{ marginBottom: "0.5rem" }}>
      <div style={{ fontWeight: "bold" }}>{field}</div>
      <select value={aggregation} onChange={(e) => onChange(e.target.value)} style={{ width: "100%" }}>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt.toUpperCase()}
          </option>
        ))}
      </select>
    </div>
  );
};

export default AggregationSelector;
