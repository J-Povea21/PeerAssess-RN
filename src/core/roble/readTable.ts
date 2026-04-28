const BASE_URL =
  "https://roble-api.openlab.uninorte.edu.co";

const ROBLE_TOKEN =
  "peerassess_dbc886f908";

type Filters = Record<string, string>;

const readTable = async (
  tableName: string,
  filters: Filters = {}
) => {
  const queryParams = new URLSearchParams({
    tableName,
    ...filters,
  });

  const response = await fetch(
    `${BASE_URL}/database/${ROBLE_TOKEN}/read?${queryParams.toString()}`
  );

  if (!response.ok) {
    throw new Error(
      `Read failed: ${response.status}`
    );
  }

  const data = await response.json();

  if (Array.isArray(data)) {
    return data;
  }

  if (data.data) {
    return data.data;
  }

  if (data.records) {
    return data.records;
  }

  return [];
};

export default readTable;