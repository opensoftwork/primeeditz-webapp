/* eslint-disable */
/**
 * Generated `ComponentApi` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type { FunctionReference } from "convex/server";

/**
 * A utility for referencing a Convex component's exposed API.
 *
 * Useful when expecting a parameter like `components.myComponent`.
 * Usage:
 * ```ts
 * async function myFunction(ctx: QueryCtx, component: ComponentApi) {
 *   return ctx.runQuery(component.someFile.someQuery, { ...args });
 * }
 * ```
 */
export type ComponentApi<Name extends string | undefined = string | undefined> =
  {
    mutations: {
      bulkImportItems: FunctionReference<
        "mutation",
        "internal",
        {
          categoryId: string;
          createdBy: string;
          items: Array<{
            defaultRate: number;
            description?: string;
            name: string;
            sku?: string;
            tags?: Array<string>;
            unit: string;
          }>;
        },
        Array<string>,
        Name
      >;
      createCategory: FunctionReference<
        "mutation",
        "internal",
        {
          color?: string;
          createdBy: string;
          description?: string;
          displayOrder?: number;
          icon?: string;
          name: string;
        },
        string,
        Name
      >;
      createItem: FunctionReference<
        "mutation",
        "internal",
        {
          categoryId: string;
          createdBy: string;
          defaultRate: number;
          description?: string;
          displayOrder?: number;
          image?: string;
          metadata?: any;
          name: string;
          sku?: string;
          tags?: Array<string>;
          unit: string;
        },
        string,
        Name
      >;
      deleteCategory: FunctionReference<
        "mutation",
        "internal",
        { categoryId: string },
        null,
        Name
      >;
      deleteItem: FunctionReference<
        "mutation",
        "internal",
        { itemId: string },
        null,
        Name
      >;
      duplicateItem: FunctionReference<
        "mutation",
        "internal",
        { createdBy: string; itemId: string; newName?: string },
        string,
        Name
      >;
      reorderCategories: FunctionReference<
        "mutation",
        "internal",
        { orderedIds: Array<string> },
        null,
        Name
      >;
      reorderItems: FunctionReference<
        "mutation",
        "internal",
        { orderedIds: Array<string> },
        null,
        Name
      >;
      updateCategory: FunctionReference<
        "mutation",
        "internal",
        {
          categoryId: string;
          color?: string;
          description?: string;
          displayOrder?: number;
          icon?: string;
          isActive?: boolean;
          name?: string;
        },
        null,
        Name
      >;
      updateItem: FunctionReference<
        "mutation",
        "internal",
        {
          categoryId?: string;
          defaultRate?: number;
          description?: string;
          displayOrder?: number;
          image?: string;
          isActive?: boolean;
          itemId: string;
          metadata?: any;
          name?: string;
          sku?: string;
          tags?: Array<string>;
          unit?: string;
        },
        null,
        Name
      >;
    };
    queries: {
      getCategories: FunctionReference<
        "query",
        "internal",
        { activeOnly?: boolean },
        Array<{
          _creationTime: number;
          _id: string;
          color?: string;
          createdBy: string;
          description?: string;
          displayOrder: number;
          icon?: string;
          isActive: boolean;
          name: string;
          updatedAt: number;
        }>,
        Name
      >;
      getCategory: FunctionReference<
        "query",
        "internal",
        { categoryId: string },
        {
          _creationTime: number;
          _id: string;
          color?: string;
          createdBy: string;
          description?: string;
          displayOrder: number;
          icon?: string;
          isActive: boolean;
          name: string;
          updatedAt: number;
        } | null,
        Name
      >;
      getItem: FunctionReference<
        "query",
        "internal",
        { itemId: string },
        {
          _creationTime: number;
          _id: string;
          categoryId: string;
          createdBy: string;
          defaultRate: number;
          description?: string;
          displayOrder: number;
          image?: string;
          isActive: boolean;
          metadata?: any;
          name: string;
          sku?: string;
          tags?: Array<string>;
          unit: string;
          updatedAt: number;
        } | null,
        Name
      >;
      getItems: FunctionReference<
        "query",
        "internal",
        { activeOnly?: boolean; categoryId?: string },
        Array<{
          _creationTime: number;
          _id: string;
          categoryId: string;
          createdBy: string;
          defaultRate: number;
          description?: string;
          displayOrder: number;
          image?: string;
          isActive: boolean;
          metadata?: any;
          name: string;
          sku?: string;
          tags?: Array<string>;
          unit: string;
          updatedAt: number;
        }>,
        Name
      >;
      getItemsGroupedByCategory: FunctionReference<
        "query",
        "internal",
        { activeOnly?: boolean },
        Array<{
          category: {
            _creationTime: number;
            _id: string;
            color?: string;
            createdBy: string;
            description?: string;
            displayOrder: number;
            icon?: string;
            isActive: boolean;
            name: string;
            updatedAt: number;
          };
          items: Array<{
            _creationTime: number;
            _id: string;
            categoryId: string;
            createdBy: string;
            defaultRate: number;
            description?: string;
            displayOrder: number;
            image?: string;
            isActive: boolean;
            metadata?: any;
            name: string;
            sku?: string;
            tags?: Array<string>;
            unit: string;
            updatedAt: number;
          }>;
        }>,
        Name
      >;
      searchItems: FunctionReference<
        "query",
        "internal",
        { limit?: number; query: string },
        Array<{
          _creationTime: number;
          _id: string;
          categoryId: string;
          createdBy: string;
          defaultRate: number;
          description?: string;
          displayOrder: number;
          image?: string;
          isActive: boolean;
          metadata?: any;
          name: string;
          sku?: string;
          tags?: Array<string>;
          unit: string;
          updatedAt: number;
        }>,
        Name
      >;
    };
  };
