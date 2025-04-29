import React, { JSX } from "react";
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
      const rowKey = rows.map((r) => row[r]);
      const colKey = columns.map((c) => row[c]).join("|||"); // internal join
      const rowKeyStr = rowKey.join("|||");
      if (!grouped[rowKeyStr]) grouped[rowKeyStr] = { rowKey, cols: {} };
      if (!grouped[rowKeyStr].cols[colKey]) grouped[rowKeyStr].cols[colKey] = {};
      for (const { field } of values) {
        const value = fieldTypes[field] === "number" ? Number(row[field]) : row[field];
        const cell = grouped[rowKeyStr].cols[colKey];
        if (!cell[field]) cell[field] = [];
        cell[field].push(value);
      }
    }
    return grouped;
  };

  const grouped = groupData();
  const rowKeys = Object.keys(grouped);
  const colKeys = Array.from(
    new Set(rowKeys.flatMap((rk) => Object.keys(grouped[rk].cols)))
  ).sort();

  const getAggregatedValue = (values: any[], aggregation: string) =>
    aggregators[aggregation](values.filter((v) => typeof v === "number" || aggregation === "Count"));

  // Build multi-level header tree
  const buildHeaderTree = () => {
    const tree: any = {};

    for (const colKey of colKeys) {
      const parts = colKey.split("|||");
      let current = tree;
      for (const part of parts) {
        current[part] = current[part] || {};
        current = current[part];
      }
    }

    return tree;
  };

  // Recursively render header rows
  const renderHeaderRows = (node: any, _depth: number, maxDepth: number): JSX.Element[][] => {
    const rows: JSX.Element[][] = Array.from({ length: maxDepth }, () => []);
    const fillRows = (node: any, level: number, colSpanCalc: () => number, parentKey = ""): number => {
      let totalColSpan = 0;

      for (const key of Object.keys(node)) {
        const subTree = node[key];
        const fullKey = parentKey ? `${parentKey}|||${key}` : key;
        const colSpan = Object.keys(subTree).length
          ? fillRows(subTree, level + 1, colSpanCalc, fullKey)
          : values.reduce((acc, v) => acc + v.aggregations.length, 0);

        rows[level].push(
          <th key={fullKey} colSpan={colSpan} rowSpan={Object.keys(subTree).length ? 1 : maxDepth - level}>
            {key}
          </th>
        );
        totalColSpan += colSpan;
      }

      return totalColSpan;
    };

    fillRows(node, 0, () => values.reduce((acc, v) => acc + v.aggregations.length, 0));
    return rows;
  };

  const renderHeader = () => {
    const tree = buildHeaderTree();
    const maxDepth = columns.length;
  
    const headerRows =
      maxDepth > 0 ? renderHeaderRows(tree, 0, maxDepth) : [];
  
    return (
      <thead>
        {headerRows.map((row, i) => (
          <tr key={`header-row-${i}`} className="col-header">
            {i === 0 &&
              rows.map((r) => (
                <th key={`row-header-${r}`} rowSpan={headerRows.length + 1}>
                  {r}
                </th>
              ))}
            {row}
            {i === 0 &&
              values.flatMap(({ field, aggregations }) =>
                aggregations.map((agg) => (
                  <th  key={`total-${field}-${agg}`} rowSpan={headerRows.length + 1}>
                    Total {field} ({agg})
                  </th>
                ))
              )}
          </tr>
        ))}
  
        {/* If no column headers, just show field headers in one row */}
        {maxDepth === 0 && (
          <tr className="col-header">
            {rows.map((r) => (
              <th key={`row-header-${r}`}>{r}</th>
            ))}
            {colKeys.flatMap((colKey) =>
              values.flatMap(({ field, aggregations }) =>
                aggregations.map((agg) => (
                  <th key={`${colKey}-${field}-${agg}`}>
                    {field} ({agg})
                  </th>
                ))
              )
            )}
            {values.flatMap(({ field, aggregations }) =>
              aggregations.map((agg) => (
                <th key={`total-${field}-${agg}`}>
                  Total {field} ({agg})
                </th>
              ))
            )}
          </tr>
        )}
  
        {/* Only show bottom metric header row if columns exist */}
        {maxDepth > 0 && (
          <tr>
            {colKeys.flatMap((colKey) =>
              values.flatMap(({ field, aggregations }) =>
                aggregations.map((agg) => (
                  <th className="agg-header" key={`${colKey}-${field}-${agg}`}>
                    {field} ({agg})
                  </th>
                ))
              )
            )}
          </tr>
        )}
      </thead>
    );
  };
  

  const renderBody = () => {
    return rowKeys.sort().map((rowKeyStr) => {
      const { rowKey, cols } = grouped[rowKeyStr];
      const rowAggTotals: Record<string, number> = {};

      return (
        <tr key={rowKeyStr}>
          {rowKey.map((value:any, i:any) => (
            <td key={`${rowKeyStr}-row-${i}`}>{value}</td>
          ))}
          {colKeys.flatMap((colKey) =>
            values.flatMap(({ field, aggregations }) =>
              aggregations.map((agg) => {
                const cellValues = cols[colKey]?.[field] || [];
                const val = getAggregatedValue(cellValues, agg);
                const key = `${field}-${agg}`;
                rowAggTotals[key] = (rowAggTotals[key] || 0) + (Number.isFinite(val) ? val : 0);
                return (
                  <td key={`${rowKeyStr}-${colKey}-${field}-${agg}`}>
                    {Number.isFinite(val) && val !== 0 ? val.toFixed(2) : ""}
                  </td>
                );
              })
            )
          )}
          {values.flatMap(({ field, aggregations }) =>
            aggregations.map((agg) => {
              const key = `${field}-${agg}`;
              const val = rowAggTotals[key];
              return (
                <td key={`row-total-${rowKeyStr}-${key}`}>
                  <strong>{val !== 0 ? val.toFixed(2) : ""}</strong>
                </td>
              );
            })
          )}
        </tr>
      );
    });
  };

  const renderGrandTotal = () => {
    const colAggTotals: Record<string, number> = {};
  
    return (
      <tr>
        {rows.length > 0 ? (
          <td colSpan={rows.length}><strong>Total</strong></td>
        ) : null}
        {colKeys.flatMap((colKey) =>
          values.flatMap(({ field, aggregations }) =>
            aggregations.map((agg) => {
              const key = `${field}-${agg}`;
              const totalValues: any[] = [];
  
              for (const rowKey of rowKeys) {
                const vals = grouped[rowKey].cols[colKey]?.[field] || [];
                totalValues.push(...vals);
              }
  
              const val = getAggregatedValue(totalValues, agg);
              colAggTotals[key] = (colAggTotals[key] || 0) + (Number.isFinite(val) ? val : 0);
  
              return (
                <td key={`grand-${colKey}-${field}-${agg}`}>
                  <strong>{Number.isFinite(val) && val !== 0 ? val.toFixed(2) : ""}</strong>
                </td>
              );
            })
          )
        )}
        {values.flatMap(({ field, aggregations }) =>
          aggregations.map((agg) => {
            const key = `${field}-${agg}`;
            const val = colAggTotals[key];
            return (
              <td key={`grand-total-${key}`}>
                <strong>{val !== 0 ? val.toFixed(2) : ""}</strong>
              </td>
            );
          })
        )}
      </tr>
    );
  };
  

  return (
    <table
      border={1}
      cellPadding={5}
      style={{
        background: "#fff",
        borderCollapse: "collapse",
        width: "100%",
        fontFamily: "sans-serif",
      }}
    >
      {renderHeader()}
      <tbody>
        {renderBody()}
        {renderGrandTotal()}
      </tbody>
    </table>
  );
};

export default PivotTable;