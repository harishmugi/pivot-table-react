// Sidebar.tsx
import React from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { FieldType, ValueField } from "../types";

interface SidebarProps {
  isActive: string;
  fields: string[];
  rows: string[];
  columns: string[];
  values: ValueField[];
  setRows: React.Dispatch<React.SetStateAction<string[]>>;
  setColumns: React.Dispatch<React.SetStateAction<string[]>>;
  setValues: React.Dispatch<React.SetStateAction<ValueField[]>>;
  fieldTypes: Record<string, FieldType>;
  rowDateGroupings: Record<string, "Quarterly" | "Half-Yearly" | "Yearly" | null>;
  setRowDateGroupings: React.Dispatch<React.SetStateAction<Record<string, "Quarterly" | "Half-Yearly" | "Yearly" | null>>>;
  columnDateGroupings: Record<string, "Quarterly" | "Half-Yearly" | "Yearly" | null>;
  setColumnDateGroupings: React.Dispatch<React.SetStateAction<Record<string, "Quarterly" | "Half-Yearly" | "Yearly" | null>>>;
}

const getAggregations = (type: FieldType) => {
  return type === "number" ? ["Sum", "Average", "Min", "Max", "Count"] : ["Count"];
};

const Sidebar: React.FC<SidebarProps> = ({
  isActive,
  fields,
  rows,
  columns,
  values,
  setRows,
  setColumns,
  setValues,
  fieldTypes,
  rowDateGroupings,
  setRowDateGroupings,
  columnDateGroupings,
  setColumnDateGroupings,
}) => {
  const availableFields = fields.filter(
    (f) => !rows.includes(f) && !columns.includes(f) && !values.some((v) => v.field === f)
  );

  const onDragEnd = (result: DropResult) => {
    const { destination, draggableId } = result;
    if (!destination) return;

    const destinationId = destination.droppableId;

    const removeFromLists = () => {
      setRows((prev) => prev.filter((id) => id !== draggableId));
      setColumns((prev) => prev.filter((id) => id !== draggableId));
      setValues((prev) => prev.filter((v) => v.field !== draggableId));
      setRowDateGroupings((prev) => {
        const newGroupings = { ...prev };
        delete newGroupings[draggableId];
        return newGroupings;
      });
      setColumnDateGroupings((prev) => {
        const newGroupings = { ...prev };
        delete newGroupings[draggableId];
        return newGroupings;
      });
    };

    removeFromLists();

    if (destinationId === "rows") {
      setRows((prev) => [...prev.slice(0, destination.index), draggableId, ...prev.slice(destination.index)]);
      if (fieldTypes[draggableId] === "date") {
        setRowDateGroupings((prev) => ({ ...prev, [draggableId]: "Quarterly" }));
      }
    } else if (destinationId === "columns") {
      setColumns((prev) => [...prev.slice(0, destination.index), draggableId, ...prev.slice(destination.index)]);
      if (fieldTypes[draggableId] === "date") {
        setColumnDateGroupings((prev) => ({ ...prev, [draggableId]: "Quarterly" }));
      }
    } else if (destinationId === "values") {
      const fieldType = fieldTypes[draggableId];
      const defaultAgg = getAggregations(fieldType);
      setValues((prev) => [
        ...prev.slice(0, destination.index),
        {
          field: draggableId,
          aggregations: [defaultAgg[0]],
          dateGrouping: null, // No date grouping for values
        },
        ...prev.slice(destination.index),
      ]);
    }
  };

  const handleAggregationChange = (field: string, selected: string[]) => {
    setValues((prev: ValueField[]) => {
      const others = prev.filter((v) => v.field !== field);
      const existing = prev.find((v) => v.field === field);
      return [
        ...others,
        {
          field,
          aggregations: selected,
          dateGrouping: existing?.dateGrouping || null,
        },
      ];
    });
  };

  const handleDateGroupingChange = (field: string, grouping: string, type: "rows" | "columns") => {
    const dateGrouping = grouping === "" ? null : (grouping as "Quarterly" | "Half-Yearly" | "Yearly");
    if (type === "rows") {
      setRowDateGroupings((prev) => ({ ...prev, [field]: dateGrouping }));
    } else if (type === "columns") {
      setColumnDateGroupings((prev) => ({ ...prev, [field]: dateGrouping }));
    }
  };

  return (
    <div className={isActive}>
      <div className="print" style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", marginBottom: "1rem" }} onClick={() => window.print()}>
        <svg
          width="30px"
          height="30px"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          stroke="#c801ff"
        >
          <path opacity="0.15" d="M20 9H4V18H8V15H16V18H20V9Z" fill="#c801ff"></path>
          <path
            d="M16 18V15H8V18M16 18V21H8V18M16 18H20V9H16M8 18H4V9H8M8 9H16M8 9V4C8 3.44772 8.44772 3 9 3H15C15.5523 3 16 3.44772 16 4V9"
            stroke="#c801ff"
            strokeWidth="0.984"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <div>Print</div>
      </div>
      <h3>Pivot Controls</h3>
      <DragDropContext onDragEnd={onDragEnd}>
        {["available", "rows", "columns", "values"].map((type) => (
          <Droppable droppableId={type} key={type}>
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps} className="droppable-area">
                <strong>
                  {type !== "available" ? type.toUpperCase() + " (Drop here)" : type.toUpperCase()}
                </strong>
                {(type === "available"
                  ? availableFields
                  : type === "rows"
                  ? rows
                  : type === "columns"
                  ? columns
                  : values.map((v) => v.field)
                ).map((field, index) => (
                  <Draggable draggableId={field} index={index} key={field}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="draggable-item"
                      >
                        {field}
                        {type === "values" && (
                          <select
                            multiple
                            value={values.find((v) => v.field === field)?.aggregations || []}
                            onChange={(e) =>
                              handleAggregationChange(
                                field,
                                Array.from(e.target.selectedOptions, (opt) => opt.value)
                              )
                            }
                          >
                            {getAggregations(fieldTypes[field]).map((agg) => (
                              <option key={agg} value={agg}>{agg}</option>
                            ))}
                          </select>
                        )}
                        {(type === "rows" || type === "columns") && fieldTypes[field] === "date" && (
                          <select
                            className="date-grouping-select"
                            value={
                              type === "rows"
                                ? rowDateGroupings[field] ?? ""
                                : columnDateGroupings[field] ?? ""
                            }
                            onChange={(e) => handleDateGroupingChange(field, e.target.value, type as "rows" | "columns")}
                          >
                            <option value="Quarterly">Quarterly</option>
                            <option value="Half-Yearly">Half-Yearly</option>
                            <option value="Yearly">Yearly</option>
                            <option value="">None</option>
                          </select>
                        )}
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        ))}
      </DragDropContext>
    </div>
  );
};

export default Sidebar;