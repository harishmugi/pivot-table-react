export const parseCSV = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
  
      reader.onload = () => {
        const text = reader.result as string;
        const lines = text.split("\n").map(line => line.trim()).filter(Boolean);
        const [headerLine, ...rows] = lines;
        const headers = headerLine.split(",");
  
        const data = rows.map(row => {
          const values = row.split(",");
          const entry: Record<string, string> = {};
          headers.forEach((header, idx) => {
            entry[header.trim()] = values[idx]?.trim() || "";
          });
          return entry;
        });
  
        resolve(data);
      };
  
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };
  