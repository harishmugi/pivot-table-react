// detectFieldTypes.ts
const detectFieldTypes = (
  data: Record<string, string>[],
  headers: string[]
): Record<string, "string" | "number" | "date"> => {
  const result: Record<string, "string" | "number" | "date"> = {};

  headers.forEach((header) => {
    let isNumeric = true;
    let isDate = true;
    for (let i = 0; i < Math.min(data.length, 10); i++) {
      const val = data[i][header].trim();
      if (val === "") {
        isNumeric = false;
        isDate = false;
        break;
      }
      if (isNaN(Number(val))) {
        isNumeric = false;
      }
      if (isDate) {
        const date = new Date(val);
        if (isNaN(date.getTime())) {
          isDate = false;
        }
      }
    }
    if (isDate) {
      result[header] = "date";
    } else if (isNumeric) {
      result[header] = "number";
    } else {
      result[header] = "string";
    }
  });

  return result;
};

export default detectFieldTypes;