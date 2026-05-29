export type ParsedGroup = {
  name: string;
  members: string[];
};

export type ParsedCsvImport = {
  categoryName: string;
  groups: ParsedGroup[];
  memberCount: number;
};

// Brightspace Group Export columns: 0=category, 1=group, 5=firstName, 6=lastName.
const COL_CATEGORY = 0;
const COL_GROUP = 1;
const COL_FIRST_NAME = 5;
const COL_LAST_NAME = 6;
const MIN_COLUMNS = 8;

// RFC-4180-ish field splitter: handles quoted fields containing commas, quotes, and newlines.
function parseCsvRows(content: string): string[][] {
  const rows: string[][] = [];
  let field = "";
  let row: string[] = [];
  let inQuotes = false;

  for (let i = 0; i < content.length; i++) {
    const char = content[i];

    if (inQuotes) {
      if (char === '"') {
        if (content[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (char !== "\r") {
      field += char;
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows;
}

export function parseBrightspaceCsv(csvContent: string): ParsedCsvImport {
  const rows = parseCsvRows(csvContent);
  // Skip the header row.
  const dataRows = rows.slice(1);

  let categoryName = "";
  const groupOrder: string[] = [];
  const membersByGroup = new Map<string, string[]>();
  let memberCount = 0;

  for (const cols of dataRows) {
    if (cols.length < MIN_COLUMNS) continue;

    if (!categoryName) {
      categoryName = cols[COL_CATEGORY].trim();
    }

    const groupName = cols[COL_GROUP].trim();
    if (!groupName) continue;

    if (!membersByGroup.has(groupName)) {
      membersByGroup.set(groupName, []);
      groupOrder.push(groupName);
    }

    const fullName = `${cols[COL_FIRST_NAME].trim()} ${cols[COL_LAST_NAME].trim()}`.trim();
    if (fullName) {
      membersByGroup.get(groupName)!.push(fullName);
      memberCount++;
    }
  }

  const groups: ParsedGroup[] = groupOrder.map((name) => ({
    name,
    members: membersByGroup.get(name)!,
  }));

  return { categoryName, groups, memberCount };
}
