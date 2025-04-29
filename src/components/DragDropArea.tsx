import React from "react";
import { Droppable, Draggable } from "@hello-pangea/dnd";

interface DragDropAreaProps {
  id: string;
  title: string;
  items: string[];
  onDrop: (
    sourceId: string,
    destinationId: string,
    sourceIndex: number,
    destIndex: number
  ) => void;
}

const DragDropArea: React.FC<DragDropAreaProps> = ({ id, title, items }) => {
  return (
    <div>
      {title && <h4>{title}</h4>}
      <Droppable droppableId={id}>
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            style={{
              minHeight: "50px",
              border: "1px solid #ccc",
              padding: "0.5rem",
              backgroundColor: "#fff",
              marginBottom: "1rem"
            }}
          >
            {items.map((item, index) => (
              <Draggable key={item} draggableId={item} index={index}>
                {(providedDraggable) => (
                  <div
                    ref={providedDraggable.innerRef}
                    {...providedDraggable.draggableProps}
                    {...providedDraggable.dragHandleProps}
                    style={{
                      userSelect: "none",
                      padding: "0.5rem",
                      margin: "0 0 0.5rem 0",
                      background: "#e9ecef",
                      border: "1px solid #bbb",
                      borderRadius: "4px",
                      ...providedDraggable.draggableProps.style,
                    }}
                  >
                    {item}
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default DragDropArea;
