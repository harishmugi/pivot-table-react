import React from "react";
import { FieldType, ValueField } from "../types";

interface PivotProps {
  data: any[];
  rows: string[];
  columns: string[];
  values: ValueField[];
  fieldTypes: Record<string, FieldType>;
}

const aggregators: Record<string, (arr: any[]) => number> = {
  Sum: (arr) => arr.reduce((a, b) => a + b, 0),
  Average: (arr) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0),
  Min: (arr) => Math.min(...arr),
  Max: (arr) => Math.max(...arr),
  Count: (arr) => arr.length,
};

const PivotTable: React.FC<PivotProps> = ({ data, rows, columns, values, fieldTypes }) => {
  const groupData = () => {
    const grouped: any = {};
    for (const row of data) {
      const rowKey = rows.map((r) => row[r]).join(" | ");
      const colKey = columns.map((c) => row[c]).join(" | ");
      if (!grouped[rowKey]) grouped[rowKey] = {};
      if (!grouped[rowKey][colKey]) grouped[rowKey][colKey] = {};
      for (const { field } of values) {
        const value = fieldTypes[field] === "number" ? Number(row[field]) : row[field];
        const cell = grouped[rowKey][colKey];
        if (!cell[field]) cell[field] = [];
        cell[field].push(value);
      }
    }
    return grouped;
  };

  const grouped = groupData();
  const rowKeys = Object.keys(grouped);
  const colKeys = Array.from(new Set(rowKeys.flatMap((rk) => Object.keys(grouped[rk]))));

  const getAggregatedValue = (values: any[], aggregation: string) => {
    const result = aggregators[aggregation](values.filter((v) => typeof v === "number" || aggregation === "Count"));
    return Number.isFinite(result) ? result : "";
  };

  const renderHeader = () => {
    return (
      <thead>
        <tr>
          {rows.length > 0 && <th rowSpan={2}>{rows.join(" | ")}</th>}
          {colKeys.map((colKey) => (
            <th key={colKey} colSpan={values.reduce((sum, v) => sum + v.aggregations.length, 0)}>
              {colKey}
            </th>
          ))}
          <th rowSpan={2}>Total</th>
        </tr>
        <tr>
          {colKeys.flatMap((colKey) =>
            values.flatMap(({ field, aggregations }) =>
              aggregations.map((agg) => (
                <th key={`${colKey}-${field}-${agg}`}>
                  {field} ({agg.toLowerCase()})
                </th>
              ))
            )
          )}
        </tr>
      </thead>
    );
  };

  const renderBody = () => {
    return rowKeys.sort().map((rowKey) => {
      const row = grouped[rowKey];
      const rowTotalValues: number[] = [];

      return (
        <tr key={rowKey}>
          <td>{rowKey}</td>
          {colKeys.flatMap((colKey) =>
            values.flatMap(({ field, aggregations }) => {
              const cellValues = row[colKey]?.[field] || [];
              return aggregations.map((agg) => {
                const val = getAggregatedValue(cellValues, agg);
                rowTotalValues.push(typeof val === "number" ? val : 0);
                return (
                  <td key={`${rowKey}-${colKey}-${field}-${agg}`}>
                    {typeof val === "number" ? val.toFixed(2) : ""}
                  </td>
                );
              });
            })
          )}
          <td>
            <strong>
              {rowTotalValues.length > 0
                ? rowTotalValues.reduce((a, b) => a + b, 0).toFixed(2)
                : ""}
            </strong>
          </td>
        </tr>
      );
    });
  };

  const renderGrandTotal = () => {
    const colTotalValues: number[] = [];
    return (
      <tr>
        <td><strong>Total</strong></td>
        {colKeys.flatMap((colKey) =>
          values.flatMap(({ field, aggregations }) =>
            aggregations.map((agg) => {
              const totalValues: any[] = [];
              for (const rowKey of rowKeys) {
                const vals = grouped[rowKey][colKey]?.[field] || [];
                totalValues.push(...vals);
              }
              const val = getAggregatedValue(totalValues, agg);
              colTotalValues.push(typeof val === "number" ? val : 0);
              return (
                <td key={`total-${colKey}-${field}-${agg}`}>
                  <strong>{typeof val === "number" ? val.toFixed(2) : ""}</strong>
                </td>
              );
            })
          )
        )}
        <td>
          <strong>
            {colTotalValues.length > 0
              ? colTotalValues.reduce((a, b) => a + b, 0).toFixed(2)
              : ""}
          </strong>
        </td>
      </tr>
    );
  };

  return (
    <table border={1} cellPadding={5} style={{ background: "#fff", borderCollapse: "collapse", width: "100%" }}>
      {renderHeader()}
      <tbody>
        {renderBody()}
        {renderGrandTotal()}
      </tbody>
    </table>
  );
};

export default PivotTable;
