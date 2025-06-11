export type FieldType = "string" | "number" | "date";

export interface ValueField {
  field: string;
  aggregations: string[];
  dateGrouping?: "Quarterly" | "Half-Yearly" | "Yearly" | null;
  
}

export interface DragItem {
  id: string;
  type: "available" | "rows" | "columns" | "values";
}
