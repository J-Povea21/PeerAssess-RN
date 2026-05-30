type FetchFn = (url: string, options?: RequestInit) => Promise<Response>;

const BASE_URL = `https://roble-api.openlab.uninorte.edu.co/database/${process.env.EXPO_PUBLIC_ROBLE_PROJECT_ID}`;

export class RobleDbClient {
  constructor(private fetchFn: FetchFn) {
    if (!process.env.EXPO_PUBLIC_ROBLE_PROJECT_ID) {
      throw new Error("Missing EXPO_PUBLIC_ROBLE_PROJECT_ID env var");
    }
  }

  // Uses a plain HEAD — no auth needed, just reading the Date header.
  async getServerTime(): Promise<Date> {
    const response = await fetch(BASE_URL, { method: "HEAD" });
    const dateHeader = response.headers.get("date");
    if (!dateHeader) throw new Error("Missing Date header in Roble response");
    return new Date(dateHeader);
  }

  async readTable<T>(
    tableName: string,
    filters?: Record<string, string>
  ): Promise<T[]> {
    const params = new URLSearchParams({ tableName, ...filters });
    const response = await this.fetchFn(`${BASE_URL}/read?${params}`);

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(
        `readTable failed: ${response.status} — ${(body as { message?: string }).message ?? JSON.stringify(body)}`
      );
    }

    const decoded: unknown = await response.json();

    let rows: unknown[];
    if (Array.isArray(decoded)) {
      rows = decoded;
    } else if (decoded && typeof decoded === "object") {
      const obj = decoded as Record<string, unknown>;
      rows = (obj["data"] ?? obj["records"] ?? []) as unknown[];
    } else {
      return [];
    }

    return rows as T[];
  }

  async insertRecord(
    tableName: string,
    record: Record<string, unknown>
  ): Promise<void> {
    const requestBody = { tableName, records: [record] };
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.log("[RobleDbClient] insertRecord →", JSON.stringify(requestBody));
    }
    const response = await this.fetchFn(`${BASE_URL}/insert`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    const responseBody = await response.json().catch(() => ({}));
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.log("[RobleDbClient] insertRecord ←", response.status, JSON.stringify(responseBody));
    }

    if (response.status !== 200 && response.status !== 201) {
      const body = responseBody;
      throw new Error(
        `insertRecord failed: ${response.status} — ${(body as { message?: string }).message ?? "Unknown"}`
      );
    }

    // Roble returns 2xx even when it silently discards rows that fail validation
    // (e.g. schema/column mismatch). Surface those as errors instead of a false success.
    const body = responseBody as {
      skipped?: unknown[];
      inserted?: unknown[];
      errors?: unknown[];
    };
    if (Array.isArray(body.skipped) && body.skipped.length > 0) {
      throw new Error(`insertRecord skipped by Roble: ${JSON.stringify(body.skipped)}`);
    }
    if (Array.isArray(body.errors) && body.errors.length > 0) {
      throw new Error(`insertRecord rejected by Roble: ${JSON.stringify(body.errors)}`);
    }
    if (Array.isArray(body.inserted) && body.inserted.length === 0) {
      throw new Error(`insertRecord inserted no rows: ${JSON.stringify(responseBody)}`);
    }
  }

  async updateRecord(
    tableName: string,
    idColumn: string,
    idValue: string,
    updates: Record<string, unknown>
  ): Promise<void> {
    const response = await this.fetchFn(`${BASE_URL}/update`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tableName, idColumn, idValue, updates }),
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(
        `updateRecord failed: ${response.status} — ${(body as { message?: string }).message ?? "Unknown"}`
      );
    }
  }

  async deleteRecord(
    tableName: string,
    idColumn: string,
    idValue: string
  ): Promise<void> {
    const response = await this.fetchFn(`${BASE_URL}/delete`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tableName, idColumn, idValue }),
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(
        `deleteRecord failed: ${response.status} — ${(body as { message?: string }).message ?? "Unknown"}`
      );
    }
  }
}
