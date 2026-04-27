const API_BASE_URL = 'https://roble-api.openlab.uninorte.edu.co';
const ROBLE_TOKEN = 'peerassess_dbc886f908';

type Filters = Record<string, string>;

const BASE_URL = `${API_BASE_URL}/database/${ROBLE_TOKEN}`;

export async function readTable(
  tableName: string,
  filters?: Filters
) {
  const queryParams = new URLSearchParams({
    tableName,
    ...filters,
  });

  const response = await fetch(
    `${BASE_URL}/read?${queryParams.toString()}`
  );

  if (!response.ok) {
    throw new Error(`Failed to read table: ${tableName}`);
  }

  const data = await response.json();

  if (Array.isArray(data)) {
    return data;
  }

  return data.data || data.records || [];
}

export async function insertRecord(
  tableName: string,
  records: Record<string, unknown>[]
) {
  const response = await fetch(
    `${BASE_URL}/insert`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tableName,
        records,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to insert into: ${tableName}`);
  }

  return await response.json();
}

export async function updateRecord(
  tableName: string,
  idColumn: string,
  idValue: string,
  updates: Record<string, unknown>
) {
  const response = await fetch(
    `${BASE_URL}/update`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tableName,
        idColumn,
        idValue,
        updates,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to update: ${tableName}`);
  }

  return await response.json();
}

export async function deleteRecord(
  tableName: string,
  idColumn: string,
  idValue: string
) {
  const response = await fetch(
    `${BASE_URL}/delete`,
    {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tableName,
        idColumn,
        idValue,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to delete from: ${tableName}`);
  }

  return await response.json();
}