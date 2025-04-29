const detectFieldTypes = (
    data: Record<string, string>[],
    headers: string[]
  ): Record<string, "string" | "number"> => {
    const result: Record<string, "string" | "number"> = {};
  
    headers.forEach((header) => {
      let isNumeric = true;
      for (let i = 0; i < Math.min(data.length, 10); i++) {
        const val = data[i][header];
        if (val.trim() === "" || isNaN(Number(val))) {
          isNumeric = false;
          break;
        }
      }
      result[header] = isNumeric ? "number" : "string";
    });
  
    return result;
  };
  
  export default detectFieldTypes;
  