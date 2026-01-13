/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as quotations_mutations from "../quotations/mutations.js";
import type * as quotations_queries from "../quotations/queries.js";
import type * as sections_mutations from "../sections/mutations.js";
import type * as sections_queries from "../sections/queries.js";
import type * as templates_mutations from "../templates/mutations.js";
import type * as templates_queries from "../templates/queries.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import { anyApi, componentsGeneric } from "convex/server";

const fullApi: ApiFromModules<{
  "quotations/mutations": typeof quotations_mutations;
  "quotations/queries": typeof quotations_queries;
  "sections/mutations": typeof sections_mutations;
  "sections/queries": typeof sections_queries;
  "templates/mutations": typeof templates_mutations;
  "templates/queries": typeof templates_queries;
}> = anyApi as any;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
> = anyApi as any;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
> = anyApi as any;

export const components = componentsGeneric() as unknown as {};
