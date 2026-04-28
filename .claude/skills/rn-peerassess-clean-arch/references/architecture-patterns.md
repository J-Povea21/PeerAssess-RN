# PeerAssess RN Architecture Patterns Reference

This document contains the exact code patterns used in the PeerAssess React Native codebase. When generating or reviewing code, match these patterns precisely.

## Table of Contents
1. [Project Structure](#project-structure)
2. [Domain Layer — Entity Types](#domain-layer--entity-types)
3. [Domain Layer — Repository Interface](#domain-layer--repository-interface)
4. [Data Layer — Datasource Interface](#data-layer--datasource-interface)
5. [Data Layer — Local Datasource](#data-layer--local-datasource)
6. [Data Layer — Remote Datasource](#data-layer--remote-datasource)
7. [Data Layer — Concrete Repository](#data-layer--concrete-repository)
8. [Presentation Layer — Zustand Store](#presentation-layer--zustand-store)
9. [Presentation Layer — Screens](#presentation-layer--screens)
10. [DI Registration](#di-registration)
11. [Naming Conventions](#naming-conventions)
12. [Import Conventions](#import-conventions)

---

## Project Structure

```
src/features/[feature]/
├── domain/
│   ├── entities/
│   │   └── [Entity].ts
│   └── repositories/
│       └── [Entity]Repository.ts
├── data/
│   ├── datasources/
│   │   ├── [Entity]DataSource.ts          ← Abstract interface at root
│   │   ├── remote/
│   │   │   └── [Entity]RemoteDataSourceImpl.ts
│   │   └── local/
│   │       └── [Entity]LocalDataSourceImpl.ts
│   └── repositories/
│       └── [Entity]RepositoryImpl.ts
└── presentation/
    ├── context/
    │   └── [entity]Context.tsx
    └── screens/
        └── [Action][Entity]Screen.tsx     ← One file per screen
```

---

## Domain Layer — Entity Types

Location: `domain/entities/[Entity].ts`

Entities are plain TypeScript types — no classes, no serialization. Parsing from API responses happens in the datasource, not here.

```ts
export type Product = {
  _id: string;
  name: string;
  description: string;
  quantity: number;
};

// Omit _id for creation payloads (backend assigns the id)
export type NewProduct = Omit<Product, "_id">;
```

**Key points:**
- Always `type`, never `class`
- `_id` is a `string` (assigned by backend/Roble)
- Use `New[Entity] = Omit<[Entity], '_id'>` for creation payloads
- No framework imports — pure TypeScript
- The `_id` field and `New[Entity]` pattern apply to **Roble-backed CRUD entities**. Auth-related domain types (e.g., `AuthUser`) represent credentials and do not have `_id` or a creation variant.

---

## Domain Layer — Repository Interface

Location: `domain/repositories/[Entity]Repository.ts`

Defines the contract that the data layer must implement. The presentation layer only knows about this interface — never the concrete implementation.

```ts
import { NewProduct, Product } from "../entities/Product";

export interface ProductRepository {
  getProducts(): Promise<Product[]>;
  getProductById(id: string): Promise<Product | undefined>;
  addProduct(product: NewProduct): Promise<void>;
  updateProduct(product: Product): Promise<void>;
  deleteProduct(id: string): Promise<void>;
}
```

**Key points:**
- Use `interface`, not `abstract class`
- No `I` prefix — just `ProductRepository`, `AuthRepository`
- Write operations return `Promise<void>` (throw on failure)
- Read operations return `Promise<T>` or `Promise<T | undefined>`
- Import only from within the domain layer

---

## Data Layer — Datasource Interface

Location: `data/datasources/[Entity]DataSource.ts`

Lives at the root of the `datasources/` folder. Both local and remote implementations implement this interface.

```ts
import { NewProduct, Product } from "../../domain/entities/Product";

export interface ProductDataSource {
  getProducts(): Promise<Product[]>;
  getProductById(id: string): Promise<Product | undefined>;
  addProduct(product: NewProduct): Promise<void>;
  updateProduct(product: Product): Promise<void>;
  deleteProduct(id: string): Promise<void>;
}
```

**Key points:**
- Mirrors the repository interface (same method signatures)
- Abstract interface sits at `datasources/` root, shared by local and remote
- Uses relative imports to reach domain entities

---

## Data Layer — Local Datasource

Location: `data/datasources/local/[Entity]LocalDataSourceImpl.ts`

In-memory implementation for development/testing. Uses a private array as storage.

```ts
import { NewProduct, Product } from "../../../domain/entities/Product";
import { ProductDataSource } from "../ProductDataSource";

export class ProductLocalDataSourceImpl implements ProductDataSource {
  private items: Product[] = [];

  async getProducts(): Promise<Product[]> {
    return [...this.items];
  }

  async getProductById(id: string): Promise<Product | undefined> {
    return this.items.find((p) => p._id === id);
  }

  async addProduct(product: NewProduct): Promise<void> {
    const newItem: Product = {
      ...product,
      _id: Date.now().toString(),
    };
    this.items.push(newItem);
  }

  async updateProduct(product: Product): Promise<void> {
    const index = this.items.findIndex((p) => p._id === product._id);
    if (index !== -1) {
      this.items[index] = product;
    }
  }

  async deleteProduct(id: string): Promise<void> {
    this.items = this.items.filter((p) => p._id !== id);
  }
}
```

**Key points:**
- No constructor dependencies — works standalone
- Generates IDs with `Date.now().toString()`
- Returns copies of arrays (`[...this.items]`) to prevent mutation
- All methods are `async` even though they're synchronous internally

---

## Data Layer — Remote Datasource

Location: `data/datasources/remote/[Entity]RemoteDataSourceImpl.ts`

HTTP-based implementation using the Roble API. Takes `AuthRemoteDataSourceImpl` via constructor for token refresh. Uses `authorizedFetch` for all requests.

```ts
import { ILocalPreferences } from "@/src/core/iLocalPreferences";
import { LocalPreferencesAsyncStorage } from "@/src/core/LocalPreferencesAsyncStorage";
import { AuthRemoteDataSourceImpl } from "@/src/features/auth/data/datasources/AuthRemoteDataSourceImp";
import { NewProduct, Product } from "../../../domain/entities/Product";
import { ProductDataSource } from "../ProductDataSource";

export class ProductRemoteDataSourceImpl implements ProductDataSource {
  private readonly projectId: string;
  private readonly baseUrl: string;
  private readonly table = "Product"; // Roble table name

  private prefs: ILocalPreferences;

  constructor(
    private authService: AuthRemoteDataSourceImpl,
    projectId = process.env.EXPO_PUBLIC_ROBLE_PROJECT_ID
  ) {
    if (!projectId) {
      throw new Error("Missing EXPO_PUBLIC_ROBLE_PROJECT_ID env var");
    }
    this.prefs = LocalPreferencesAsyncStorage.getInstance();
    this.projectId = projectId;
    this.baseUrl = `https://roble-api.openlab.uninorte.edu.co/database/${this.projectId}`;
  }

  private async authorizedFetch(
    url: string,
    options: RequestInit,
    retry = true
  ): Promise<Response> {
    const token = await this.prefs.retrieveData<string>("token");
    const headers = {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
    };

    const response = await fetch(url, { ...options, headers });

    if (response.status === 401 && retry) {
      const refreshed = await this.authService.refreshToken();
      if (refreshed) {
        const newToken = await this.prefs.retrieveData<string>("token");
        const retryHeaders = {
          ...(options.headers || {}),
          Authorization: `Bearer ${newToken}`,
        };
        return fetch(url, { ...options, headers: retryHeaders });
      }
    }

    return response;
  }

  async getProducts(): Promise<Product[]> {
    const url = `${this.baseUrl}/read?tableName=${this.table}`;
    const response = await this.authorizedFetch(url, { method: "GET" });

    if (!response.ok) throw new Error(`Error fetching products: ${response.status}`);

    return response.json() as Promise<Product[]>;
  }

  async getProductById(id: string): Promise<Product | undefined> {
    const url = `${this.baseUrl}/read?tableName=${this.table}&_id=${id}`;
    const response = await this.authorizedFetch(url, { method: "GET" });

    if (!response.ok) throw new Error(`Error fetching product: ${response.status}`);

    const data: Product[] = await response.json();
    return data.length > 0 ? data[0] : undefined;
  }

  async addProduct(product: NewProduct): Promise<void> {
    const response = await this.authorizedFetch(`${this.baseUrl}/insert`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tableName: this.table, records: [product] }),
    });

    if (response.status !== 201) {
      const body = await response.json().catch(() => ({}));
      throw new Error(`Error adding product: ${response.status} - ${body.message ?? "Unknown"}`);
    }
  }

  async updateProduct(product: Product): Promise<void> {
    const { _id, ...updates } = product;
    const response = await this.authorizedFetch(`${this.baseUrl}/update`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tableName: this.table, idColumn: "_id", idValue: _id, updates }),
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(`Error updating product: ${response.status} - ${body.message ?? "Unknown"}`);
    }
  }

  async deleteProduct(id: string): Promise<void> {
    const response = await this.authorizedFetch(`${this.baseUrl}/delete`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tableName: this.table, idColumn: "_id", idValue: id }),
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(`Error deleting product: ${response.status} - ${body.message ?? "Unknown"}`);
    }
  }
}
```

**Key points:**
- Constructor receives `AuthRemoteDataSourceImpl` for token refresh capability
- All requests go through `authorizedFetch` — never call `fetch` directly
- `table` field maps to the Roble database table name (change per entity)
- Destructure `{ _id, ...updates }` for update requests (Roble API pattern)
- Roble insert expects `{ tableName, records: [...] }`
- Roble update expects `{ tableName, idColumn, idValue, updates }`
- Roble delete expects `{ tableName, idColumn, idValue }`

---

## Data Layer — Concrete Repository

Location: `data/repositories/[Entity]RepositoryImpl.ts`

Delegates all calls to the datasource. This is the glue between domain and data layers.

```ts
import { NewProduct, Product } from "../../domain/entities/Product";
import { ProductRepository } from "../../domain/repositories/ProductRepository";
import { ProductDataSource } from "../datasources/ProductDataSource";

export class ProductRepositoryImpl implements ProductRepository {
  constructor(private dataSource: ProductDataSource) {}

  async getProducts(): Promise<Product[]> {
    return this.dataSource.getProducts();
  }

  async getProductById(id: string): Promise<Product | undefined> {
    return this.dataSource.getProductById(id);
  }

  async addProduct(product: NewProduct): Promise<void> {
    return this.dataSource.addProduct(product);
  }

  async updateProduct(product: Product): Promise<void> {
    return this.dataSource.updateProduct(product);
  }

  async deleteProduct(id: string): Promise<void> {
    return this.dataSource.deleteProduct(id);
  }
}
```

**Key points:**
- `implements` the domain's repository interface
- Constructor receives the **datasource interface** (`ProductDataSource`), never the concrete class
- Each method is a one-liner delegating to the datasource

---

## Presentation Layer — Zustand Store

Location: `presentation/store/use[Entity]Store.ts`

Zustand store that manages state and delegates to the repository. Exports a single hook consumed directly in screens — no provider wrapping needed.

```ts
import { create } from "zustand";

import { NewProduct, Product } from "@/src/features/products/domain/entities/Product";
import { ProductRepository } from "@/src/features/products/domain/repositories/ProductRepository";

type ProductState = {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  _repo: ProductRepository | null;
  init: (repo: ProductRepository) => void;
  fetchProducts: () => Promise<void>;
  addProduct: (product: NewProduct) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  removeProduct: (id: string) => Promise<void>;
  clearError: () => void;
};

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  isLoading: false,
  error: null,
  _repo: null,

  init: (repo) => set({ _repo: repo }),

  fetchProducts: async () => {
    const { _repo } = get();
    if (!_repo) throw new Error("ProductStore not initialized");
    set({ isLoading: true, error: null });
    try {
      set({ products: await _repo.getProducts() });
    } catch (e) {
      set({ error: (e as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  addProduct: async (product) => {
    const { _repo } = get();
    if (!_repo) throw new Error("ProductStore not initialized");
    set({ isLoading: true, error: null });
    try {
      await _repo.addProduct(product);
      await get().fetchProducts();
    } catch (e) {
      set({ error: (e as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  updateProduct: async (product) => {
    const { _repo } = get();
    if (!_repo) throw new Error("ProductStore not initialized");
    set({ isLoading: true, error: null });
    try {
      await _repo.updateProduct(product);
      await get().fetchProducts();
    } catch (e) {
      set({ error: (e as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  removeProduct: async (id) => {
    const { _repo } = get();
    if (!_repo) throw new Error("ProductStore not initialized");
    set({ isLoading: true, error: null });
    try {
      await _repo.deleteProduct(id);
      await get().fetchProducts();
    } catch (e) {
      set({ error: (e as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
```

**Key points:**
- `_repo: null` starts uninitialized — `DIProvider` calls `use[Entity]Store.getState().init(repo)` synchronously inside its `useMemo` block before any child renders
- Every action calls `get()._repo` and throws if `null` — this surfaces misconfigured DI early at runtime
- Write operations call `fetchProducts()` via `get()` after the mutation to keep state fresh (read-after-write pattern)
- No provider wrapping required — `useProductStore()` works in any component anywhere in the tree
- `_repo` is typed as the domain interface (`ProductRepository`), never the concrete class — the store only knows about the interface contract

---

## Presentation Layer — Screens

Location: `presentation/screens/[Action][Entity]Screen.tsx`

Screens are not prescriptive — their number and purpose depend on the feature's design. Each screen gets its own file.

### File and class conventions
- One screen per file, named `[Action][Entity]Screen.tsx` (e.g., `AddProductScreen.tsx`)
- Default export functional component: `export default function AddProductScreen(...)`
- Use `navigation` prop for navigation (`{ navigation: any }`)

### Accessing context state
- Consume via the feature hook: `const { products, addProduct, isLoading } = useProducts()`
- Never resolve DI tokens directly in screens

### Navigation patterns
- Navigate forward: `navigation.navigate("ScreenName", { param: value })`
- Receive params: `const { id } = route.params`
- Go back: `navigation.goBack()`

### Error handling in screens
- Display errors via `<Snackbar>` from `react-native-paper`
- Use `error` and `clearError` from the context

### Loading states
- Show `<ActivityIndicator>` when `isLoading` is true
- Wrap in a `<Surface style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>`

### UI component library
- Use `react-native-paper` components: `Surface`, `Appbar`, `FAB`, `List`, `Button`, `Snackbar`, `ActivityIndicator`

---

## DI Registration

### tokens.ts

Add a token per datasource and per repository:

```ts
export const TOKENS = {
  AuthRemoteDS: Symbol("AuthRemoteDS"),
  AuthRepo: Symbol("AuthRepo"),
  ProductRemoteDS: Symbol("ProductRemoteDS"),
  ProductRepo: Symbol("ProductRepo"),
  // [Entity]RemoteDS: Symbol("[Entity]RemoteDS"),
  // [Entity]Repo: Symbol("[Entity]Repo"),
} as const;
```

### DIProvider.tsx

Register inside the `useMemo` block. Order matters: datasource first, then repository.

```tsx
import { AuthRemoteDataSourceImpl } from "@/src/features/auth/data/datasources/AuthRemoteDataSourceImp";
import { useProductStore } from "@/src/features/products/presentation/store/useProductStore";

export function DIProvider({ children }: { children: React.ReactNode }) {
  const container = useMemo(() => {
    const c = new Container();

    // Auth
    const authDS = new AuthRemoteDataSourceImpl();
    const authRepo = new AuthRepositoryImpl(authDS);
    c.register(TOKENS.AuthRemoteDS, authDS)
     .register(TOKENS.AuthRepo, authRepo);

    // Product
    const productDS = new ProductRemoteDataSourceImpl(authDS);
    const productRepo = new ProductRepositoryImpl(productDS);
    c.register(TOKENS.ProductRemoteDS, productDS)
     .register(TOKENS.ProductRepo, productRepo);
    useProductStore.getState().init(productRepo);

    // [Entity] — add new modules here
    return c;
  }, []);

  return <DIContext.Provider value={container}>{children}</DIContext.Provider>;
}
```

**Key points:**
- `authDS` is passed to feature datasources that need token refresh
- Register datasource **typed as concrete** (it's needed for `authService`)
- Register repository token so contexts can resolve via the interface
- Add a comment block per module for readability

---

## Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| File names | `PascalCase.ts` / `.tsx` | `ProductRepository.ts` |
| Interfaces | No prefix, just name | `ProductRepository`, `ProductDataSource` |
| Concrete classes | `*Impl` suffix | `ProductRepositoryImpl` |
| Remote datasource | `*RemoteDataSourceImpl` | `ProductRemoteDataSourceImpl` |
| Local datasource | `*LocalDataSourceImpl` | `ProductLocalDataSourceImpl` |
| Store file | `use[Entity]Store.ts` | `useProductStore.ts` |
| Store hook | `use[Entity]Store` | `useProductStore` |
| Screen components | `[Action][Entity]Screen` | `AddProductScreen` |
| Entity type | `PascalCase` | `Product` |
| Creation type | `New[Entity]` | `NewProduct` |
| DI tokens | `[Entity]RemoteDS`, `[Entity]Repo` | `ProductRemoteDS`, `ProductRepo` |

---

## Import Conventions

Use the `@/src/` path alias for cross-feature imports:
```ts
import { useDI } from "@/src/core/di/DIProvider";
import { TOKENS } from "@/src/core/di/tokens";
import { AuthRemoteDataSourceImpl } from "@/src/features/auth/data/datasources/AuthRemoteDataSourceImp";
```

Use relative imports within the same feature:
```ts
import { Product } from "../../domain/entities/Product";
import { ProductDataSource } from "../datasources/ProductDataSource";
```

Never import from the `data/` layer in the `domain/` layer — dependency flows inward only.
Never import from `presentation/` in `domain/` or `data/`.
