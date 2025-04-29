import React from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { FieldType, ValueField } from "../types";

interface SidebarProps {isActive:string;
  fields: string[];
  rows: string[];
  columns: string[];
  values: ValueField[];
  setRows: React.Dispatch<React.SetStateAction<string[]>>;
  setColumns: React.Dispatch<React.SetStateAction<string[]>>;
  setValues: React.Dispatch<React.SetStateAction<ValueField[]>>;
  fieldTypes: Record<string, FieldType>;
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
}) => {
  const availableFields = fields.filter(
    (f) => !rows.includes(f) && !columns.includes(f) && !values.some((v) => v.field === f)
  );

  const onDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;

    const sourceId = source.droppableId;
    const destinationId = destination.droppableId;

    const updateList = (
      listSetter: React.Dispatch<React.SetStateAction<string[]>>,
      currentList: string[]
    ) => {
      const newList = [...currentList];
      newList.splice(source.index, 1);
      newList.splice(destination.index, 0, draggableId);
      listSetter(newList);
    };

    const removeFromLists = () => {
      setRows((prev) => prev.filter((id) => id !== draggableId));
      setColumns((prev) => prev.filter((id) => id !== draggableId));
      setValues((prev) => prev.filter((v) => v.field !== draggableId));
    };

    removeFromLists();

    if (destinationId === "rows") setRows((prev) => [...prev.slice(0, destination.index), draggableId, ...prev.slice(destination.index)]);
    else if (destinationId === "columns") setColumns((prev) => [...prev.slice(0, destination.index), draggableId, ...prev.slice(destination.index)]);
    else if (destinationId === "values") {
      const fieldType = fieldTypes[draggableId];
      const defaultAgg = getAggregations(fieldType);
      setValues((prev) => [...prev.slice(0, destination.index), { field: draggableId, aggregations: [defaultAgg[0]] }, ...prev.slice(destination.index)]);
    }
  };

  const handleAggregationChange = (field: string, selected: string[]) => {
    setValues((prev: ValueField[]) => {
      const others = prev.filter((v) => v.field !== field);
      return [...others, { field, aggregations: selected }];
    });
  };

  return (
    <div className={isActive}>{/* Print button shown only after file upload */}
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
      {type !== "available"
        ? type.toUpperCase() + " (Drop here)"
        : type.toUpperCase()}
    </strong>

                {(type === "available" ? availableFields :
                  type === "rows" ? rows :
                  type === "columns" ? columns :
                  values.map(v => v.field)
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
