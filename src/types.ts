export type FieldType = "string" | "number";

export interface ValueField {
  field: string;
  aggregations: string[];
}

export interface DragItem {
  id: string;
  type: "available" | "rows" | "columns" | "values";
}
