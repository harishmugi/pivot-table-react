import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import PivotTable from "./components/PivotTable";
import { FieldType, ValueField } from "./types";

const App: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [fields, setFields] = useState<string[]>([]);
  const [fieldTypes, setFieldTypes] = useState<Record<string, FieldType>>({});
  const [rows, setRows] = useState<string[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [values, setValues] = useState<ValueField[]>([]);
  const [isActive, setIsActive] = useState(false);
  const [selected, setselected] = useState(true);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setselected(false);

    setTimeout(() => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (evt) => {
        const text = evt.target?.result as string;
        const lines = text.split("\n").filter(Boolean);
        const headers = lines[0].split(",").map((h) => h.trim());
        const rows = lines.slice(1).map((line) =>
          line.split(",").reduce((acc, val, idx) => {
            acc[headers[idx]] = val.trim();
            return acc;
          }, {} as Record<string, string>)
        );

        const types: Record<string, FieldType> = {};
        for (const field of headers) {
          const sample = rows[0]?.[field];
          types[field] = !isNaN(Number(sample)) ? "number" : "string";
        }

        setData(rows);
        setFields(headers);
        setFieldTypes(types);
      };

      reader.readAsText(file);
    }, 2000);
    setIsActive(true);
  };

  return (
    <div className="container">
      
      <div className="pivot-table">
        











        
        <div className={selected ? "title stitle" : "title"}>
          <h1>Pivot Table</h1>
          <input type="file" accept=".csv" onChange={handleFileUpload} autoFocus />
        </div>  

        {data.length > 0 && (
          <div>
          

            <PivotTable
              data={data}
              rows={rows}
              columns={columns}
              values={values}
              fieldTypes={fieldTypes}
            />
          </div>
        )}
      </div>

      <Sidebar
        isActive={isActive ? "sidebar active" : "sidebar"}
        fields={fields}
        rows={rows}
        columns={columns}
        values={values}
        setRows={setRows}
        setColumns={setColumns}
        setValues={setValues}
        fieldTypes={fieldTypes}
      />
    </div>
  );
};

export default App;
