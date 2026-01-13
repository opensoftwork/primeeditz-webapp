/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admin from "../admin.js";
import type * as auth from "../auth.js";
import type * as functions_admin_dashboard from "../functions/admin/dashboard.js";
import type * as functions_profiles_mutations from "../functions/profiles/mutations.js";
import type * as functions_profiles_queries from "../functions/profiles/queries.js";
import type * as functions_projectCategories_mutations from "../functions/projectCategories/mutations.js";
import type * as functions_projectCategories_queries from "../functions/projectCategories/queries.js";
import type * as functions_projectTypeFields_mutations from "../functions/projectTypeFields/mutations.js";
import type * as functions_projectTypeFields_queries from "../functions/projectTypeFields/queries.js";
import type * as functions_projectTypeFields_seed from "../functions/projectTypeFields/seed.js";
import type * as functions_projectTypes_mutations from "../functions/projectTypes/mutations.js";
import type * as functions_projectTypes_queries from "../functions/projectTypes/queries.js";
import type * as functions_projects_mutations from "../functions/projects/mutations.js";
import type * as functions_projects_queries from "../functions/projects/queries.js";
import type * as functions_projects_storage from "../functions/projects/storage.js";
import type * as functions_seed from "../functions/seed.js";
import type * as functions_storage_actions from "../functions/storage/actions.js";
import type * as http from "../http.js";
import type * as lib_customFunctions from "../lib/customFunctions.js";
import type * as lib_helpers from "../lib/helpers.js";
import type * as lib_storageUtils from "../lib/storageUtils.js";
import type * as lib_validators from "../lib/validators.js";
import type * as migrations from "../migrations.js";
import type * as profiles from "../profiles.js";
import type * as quotation from "../quotation.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  auth: typeof auth;
  "functions/admin/dashboard": typeof functions_admin_dashboard;
  "functions/profiles/mutations": typeof functions_profiles_mutations;
  "functions/profiles/queries": typeof functions_profiles_queries;
  "functions/projectCategories/mutations": typeof functions_projectCategories_mutations;
  "functions/projectCategories/queries": typeof functions_projectCategories_queries;
  "functions/projectTypeFields/mutations": typeof functions_projectTypeFields_mutations;
  "functions/projectTypeFields/queries": typeof functions_projectTypeFields_queries;
  "functions/projectTypeFields/seed": typeof functions_projectTypeFields_seed;
  "functions/projectTypes/mutations": typeof functions_projectTypes_mutations;
  "functions/projectTypes/queries": typeof functions_projectTypes_queries;
  "functions/projects/mutations": typeof functions_projects_mutations;
  "functions/projects/queries": typeof functions_projects_queries;
  "functions/projects/storage": typeof functions_projects_storage;
  "functions/seed": typeof functions_seed;
  "functions/storage/actions": typeof functions_storage_actions;
  http: typeof http;
  "lib/customFunctions": typeof lib_customFunctions;
  "lib/helpers": typeof lib_helpers;
  "lib/storageUtils": typeof lib_storageUtils;
  "lib/validators": typeof lib_validators;
  migrations: typeof migrations;
  profiles: typeof profiles;
  quotation: typeof quotation;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  betterAuth: {
    adapter: {
      create: FunctionReference<
        "mutation",
        "internal",
        {
          input:
            | {
                data: {
                  createdAt: number;
                  displayUsername?: null | string;
                  email: string;
                  emailVerified: boolean;
                  image?: null | string;
                  isAnonymous?: null | boolean;
                  name: string;
                  phoneNumber?: null | string;
                  phoneNumberVerified?: null | boolean;
                  twoFactorEnabled?: null | boolean;
                  updatedAt: number;
                  userId?: null | string;
                  username?: null | string;
                };
                model: "user";
              }
            | {
                data: {
                  createdAt: number;
                  expiresAt: number;
                  ipAddress?: null | string;
                  token: string;
                  updatedAt: number;
                  userAgent?: null | string;
                  userId: string;
                };
                model: "session";
              }
            | {
                data: {
                  accessToken?: null | string;
                  accessTokenExpiresAt?: null | number;
                  accountId: string;
                  createdAt: number;
                  idToken?: null | string;
                  password?: null | string;
                  providerId: string;
                  refreshToken?: null | string;
                  refreshTokenExpiresAt?: null | number;
                  scope?: null | string;
                  updatedAt: number;
                  userId: string;
                };
                model: "account";
              }
            | {
                data: {
                  createdAt: number;
                  expiresAt: number;
                  identifier: string;
                  updatedAt: number;
                  value: string;
                };
                model: "verification";
              }
            | {
                data: { backupCodes: string; secret: string; userId: string };
                model: "twoFactor";
              }
            | {
                data: {
                  aaguid?: null | string;
                  backedUp: boolean;
                  counter: number;
                  createdAt?: null | number;
                  credentialID: string;
                  deviceType: string;
                  name?: null | string;
                  publicKey: string;
                  transports?: null | string;
                  userId: string;
                };
                model: "passkey";
              }
            | {
                data: {
                  clientId?: null | string;
                  clientSecret?: null | string;
                  createdAt?: null | number;
                  disabled?: null | boolean;
                  icon?: null | string;
                  metadata?: null | string;
                  name?: null | string;
                  redirectURLs?: null | string;
                  type?: null | string;
                  updatedAt?: null | number;
                  userId?: null | string;
                };
                model: "oauthApplication";
              }
            | {
                data: {
                  accessToken?: null | string;
                  accessTokenExpiresAt?: null | number;
                  clientId?: null | string;
                  createdAt?: null | number;
                  refreshToken?: null | string;
                  refreshTokenExpiresAt?: null | number;
                  scopes?: null | string;
                  updatedAt?: null | number;
                  userId?: null | string;
                };
                model: "oauthAccessToken";
              }
            | {
                data: {
                  clientId?: null | string;
                  consentGiven?: null | boolean;
                  createdAt?: null | number;
                  scopes?: null | string;
                  updatedAt?: null | number;
                  userId?: null | string;
                };
                model: "oauthConsent";
              }
            | {
                data: {
                  createdAt: number;
                  privateKey: string;
                  publicKey: string;
                };
                model: "jwks";
              }
            | {
                data: {
                  count?: null | number;
                  key?: null | string;
                  lastRequest?: null | number;
                };
                model: "rateLimit";
              };
          onCreateHandle?: string;
          select?: Array<string>;
        },
        any
      >;
      deleteMany: FunctionReference<
        "mutation",
        "internal",
        {
          input:
            | {
                model: "user";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "name"
                    | "email"
                    | "emailVerified"
                    | "image"
                    | "createdAt"
                    | "updatedAt"
                    | "twoFactorEnabled"
                    | "isAnonymous"
                    | "username"
                    | "displayUsername"
                    | "phoneNumber"
                    | "phoneNumberVerified"
                    | "userId"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "session";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "expiresAt"
                    | "token"
                    | "createdAt"
                    | "updatedAt"
                    | "ipAddress"
                    | "userAgent"
                    | "userId"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "account";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "accountId"
                    | "providerId"
                    | "userId"
                    | "accessToken"
                    | "refreshToken"
                    | "idToken"
                    | "accessTokenExpiresAt"
                    | "refreshTokenExpiresAt"
                    | "scope"
                    | "password"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "verification";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "identifier"
                    | "value"
                    | "expiresAt"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "twoFactor";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field: "secret" | "backupCodes" | "userId" | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "passkey";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "name"
                    | "publicKey"
                    | "userId"
                    | "credentialID"
                    | "counter"
                    | "deviceType"
                    | "backedUp"
                    | "transports"
                    | "createdAt"
                    | "aaguid"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "oauthApplication";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "name"
                    | "icon"
                    | "metadata"
                    | "clientId"
                    | "clientSecret"
                    | "redirectURLs"
                    | "type"
                    | "disabled"
                    | "userId"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "oauthAccessToken";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "accessToken"
                    | "refreshToken"
                    | "accessTokenExpiresAt"
                    | "refreshTokenExpiresAt"
                    | "clientId"
                    | "userId"
                    | "scopes"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "oauthConsent";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "clientId"
                    | "userId"
                    | "scopes"
                    | "createdAt"
                    | "updatedAt"
                    | "consentGiven"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "jwks";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field: "publicKey" | "privateKey" | "createdAt" | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "rateLimit";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field: "key" | "count" | "lastRequest" | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              };
          onDeleteHandle?: string;
          paginationOpts: {
            cursor: string | null;
            endCursor?: string | null;
            id?: number;
            maximumBytesRead?: number;
            maximumRowsRead?: number;
            numItems: number;
          };
        },
        any
      >;
      deleteOne: FunctionReference<
        "mutation",
        "internal",
        {
          input:
            | {
                model: "user";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "name"
                    | "email"
                    | "emailVerified"
                    | "image"
                    | "createdAt"
                    | "updatedAt"
                    | "twoFactorEnabled"
                    | "isAnonymous"
                    | "username"
                    | "displayUsername"
                    | "phoneNumber"
                    | "phoneNumberVerified"
                    | "userId"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "session";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "expiresAt"
                    | "token"
                    | "createdAt"
                    | "updatedAt"
                    | "ipAddress"
                    | "userAgent"
                    | "userId"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "account";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "accountId"
                    | "providerId"
                    | "userId"
                    | "accessToken"
                    | "refreshToken"
                    | "idToken"
                    | "accessTokenExpiresAt"
                    | "refreshTokenExpiresAt"
                    | "scope"
                    | "password"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "verification";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "identifier"
                    | "value"
                    | "expiresAt"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "twoFactor";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field: "secret" | "backupCodes" | "userId" | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "passkey";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "name"
                    | "publicKey"
                    | "userId"
                    | "credentialID"
                    | "counter"
                    | "deviceType"
                    | "backedUp"
                    | "transports"
                    | "createdAt"
                    | "aaguid"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "oauthApplication";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "name"
                    | "icon"
                    | "metadata"
                    | "clientId"
                    | "clientSecret"
                    | "redirectURLs"
                    | "type"
                    | "disabled"
                    | "userId"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "oauthAccessToken";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "accessToken"
                    | "refreshToken"
                    | "accessTokenExpiresAt"
                    | "refreshTokenExpiresAt"
                    | "clientId"
                    | "userId"
                    | "scopes"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "oauthConsent";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "clientId"
                    | "userId"
                    | "scopes"
                    | "createdAt"
                    | "updatedAt"
                    | "consentGiven"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "jwks";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field: "publicKey" | "privateKey" | "createdAt" | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "rateLimit";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field: "key" | "count" | "lastRequest" | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              };
          onDeleteHandle?: string;
        },
        any
      >;
      findMany: FunctionReference<
        "query",
        "internal",
        {
          join?: any;
          limit?: number;
          model:
            | "user"
            | "session"
            | "account"
            | "verification"
            | "twoFactor"
            | "passkey"
            | "oauthApplication"
            | "oauthAccessToken"
            | "oauthConsent"
            | "jwks"
            | "rateLimit";
          offset?: number;
          paginationOpts: {
            cursor: string | null;
            endCursor?: string | null;
            id?: number;
            maximumBytesRead?: number;
            maximumRowsRead?: number;
            numItems: number;
          };
          sortBy?: { direction: "asc" | "desc"; field: string };
          where?: Array<{
            connector?: "AND" | "OR";
            field: string;
            operator?:
              | "lt"
              | "lte"
              | "gt"
              | "gte"
              | "eq"
              | "in"
              | "not_in"
              | "ne"
              | "contains"
              | "starts_with"
              | "ends_with";
            value:
              | string
              | number
              | boolean
              | Array<string>
              | Array<number>
              | null;
          }>;
        },
        any
      >;
      findOne: FunctionReference<
        "query",
        "internal",
        {
          join?: any;
          model:
            | "user"
            | "session"
            | "account"
            | "verification"
            | "twoFactor"
            | "passkey"
            | "oauthApplication"
            | "oauthAccessToken"
            | "oauthConsent"
            | "jwks"
            | "rateLimit";
          select?: Array<string>;
          where?: Array<{
            connector?: "AND" | "OR";
            field: string;
            operator?:
              | "lt"
              | "lte"
              | "gt"
              | "gte"
              | "eq"
              | "in"
              | "not_in"
              | "ne"
              | "contains"
              | "starts_with"
              | "ends_with";
            value:
              | string
              | number
              | boolean
              | Array<string>
              | Array<number>
              | null;
          }>;
        },
        any
      >;
      updateMany: FunctionReference<
        "mutation",
        "internal",
        {
          input:
            | {
                model: "user";
                update: {
                  createdAt?: number;
                  displayUsername?: null | string;
                  email?: string;
                  emailVerified?: boolean;
                  image?: null | string;
                  isAnonymous?: null | boolean;
                  name?: string;
                  phoneNumber?: null | string;
                  phoneNumberVerified?: null | boolean;
                  twoFactorEnabled?: null | boolean;
                  updatedAt?: number;
                  userId?: null | string;
                  username?: null | string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "name"
                    | "email"
                    | "emailVerified"
                    | "image"
                    | "createdAt"
                    | "updatedAt"
                    | "twoFactorEnabled"
                    | "isAnonymous"
                    | "username"
                    | "displayUsername"
                    | "phoneNumber"
                    | "phoneNumberVerified"
                    | "userId"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "session";
                update: {
                  createdAt?: number;
                  expiresAt?: number;
                  ipAddress?: null | string;
                  token?: string;
                  updatedAt?: number;
                  userAgent?: null | string;
                  userId?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "expiresAt"
                    | "token"
                    | "createdAt"
                    | "updatedAt"
                    | "ipAddress"
                    | "userAgent"
                    | "userId"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "account";
                update: {
                  accessToken?: null | string;
                  accessTokenExpiresAt?: null | number;
                  accountId?: string;
                  createdAt?: number;
                  idToken?: null | string;
                  password?: null | string;
                  providerId?: string;
                  refreshToken?: null | string;
                  refreshTokenExpiresAt?: null | number;
                  scope?: null | string;
                  updatedAt?: number;
                  userId?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "accountId"
                    | "providerId"
                    | "userId"
                    | "accessToken"
                    | "refreshToken"
                    | "idToken"
                    | "accessTokenExpiresAt"
                    | "refreshTokenExpiresAt"
                    | "scope"
                    | "password"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "verification";
                update: {
                  createdAt?: number;
                  expiresAt?: number;
                  identifier?: string;
                  updatedAt?: number;
                  value?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "identifier"
                    | "value"
                    | "expiresAt"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "twoFactor";
                update: {
                  backupCodes?: string;
                  secret?: string;
                  userId?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field: "secret" | "backupCodes" | "userId" | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "passkey";
                update: {
                  aaguid?: null | string;
                  backedUp?: boolean;
                  counter?: number;
                  createdAt?: null | number;
                  credentialID?: string;
                  deviceType?: string;
                  name?: null | string;
                  publicKey?: string;
                  transports?: null | string;
                  userId?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "name"
                    | "publicKey"
                    | "userId"
                    | "credentialID"
                    | "counter"
                    | "deviceType"
                    | "backedUp"
                    | "transports"
                    | "createdAt"
                    | "aaguid"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "oauthApplication";
                update: {
                  clientId?: null | string;
                  clientSecret?: null | string;
                  createdAt?: null | number;
                  disabled?: null | boolean;
                  icon?: null | string;
                  metadata?: null | string;
                  name?: null | string;
                  redirectURLs?: null | string;
                  type?: null | string;
                  updatedAt?: null | number;
                  userId?: null | string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "name"
                    | "icon"
                    | "metadata"
                    | "clientId"
                    | "clientSecret"
                    | "redirectURLs"
                    | "type"
                    | "disabled"
                    | "userId"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "oauthAccessToken";
                update: {
                  accessToken?: null | string;
                  accessTokenExpiresAt?: null | number;
                  clientId?: null | string;
                  createdAt?: null | number;
                  refreshToken?: null | string;
                  refreshTokenExpiresAt?: null | number;
                  scopes?: null | string;
                  updatedAt?: null | number;
                  userId?: null | string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "accessToken"
                    | "refreshToken"
                    | "accessTokenExpiresAt"
                    | "refreshTokenExpiresAt"
                    | "clientId"
                    | "userId"
                    | "scopes"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "oauthConsent";
                update: {
                  clientId?: null | string;
                  consentGiven?: null | boolean;
                  createdAt?: null | number;
                  scopes?: null | string;
                  updatedAt?: null | number;
                  userId?: null | string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "clientId"
                    | "userId"
                    | "scopes"
                    | "createdAt"
                    | "updatedAt"
                    | "consentGiven"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "jwks";
                update: {
                  createdAt?: number;
                  privateKey?: string;
                  publicKey?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field: "publicKey" | "privateKey" | "createdAt" | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "rateLimit";
                update: {
                  count?: null | number;
                  key?: null | string;
                  lastRequest?: null | number;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field: "key" | "count" | "lastRequest" | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              };
          onUpdateHandle?: string;
          paginationOpts: {
            cursor: string | null;
            endCursor?: string | null;
            id?: number;
            maximumBytesRead?: number;
            maximumRowsRead?: number;
            numItems: number;
          };
        },
        any
      >;
      updateOne: FunctionReference<
        "mutation",
        "internal",
        {
          input:
            | {
                model: "user";
                update: {
                  createdAt?: number;
                  displayUsername?: null | string;
                  email?: string;
                  emailVerified?: boolean;
                  image?: null | string;
                  isAnonymous?: null | boolean;
                  name?: string;
                  phoneNumber?: null | string;
                  phoneNumberVerified?: null | boolean;
                  twoFactorEnabled?: null | boolean;
                  updatedAt?: number;
                  userId?: null | string;
                  username?: null | string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "name"
                    | "email"
                    | "emailVerified"
                    | "image"
                    | "createdAt"
                    | "updatedAt"
                    | "twoFactorEnabled"
                    | "isAnonymous"
                    | "username"
                    | "displayUsername"
                    | "phoneNumber"
                    | "phoneNumberVerified"
                    | "userId"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "session";
                update: {
                  createdAt?: number;
                  expiresAt?: number;
                  ipAddress?: null | string;
                  token?: string;
                  updatedAt?: number;
                  userAgent?: null | string;
                  userId?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "expiresAt"
                    | "token"
                    | "createdAt"
                    | "updatedAt"
                    | "ipAddress"
                    | "userAgent"
                    | "userId"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "account";
                update: {
                  accessToken?: null | string;
                  accessTokenExpiresAt?: null | number;
                  accountId?: string;
                  createdAt?: number;
                  idToken?: null | string;
                  password?: null | string;
                  providerId?: string;
                  refreshToken?: null | string;
                  refreshTokenExpiresAt?: null | number;
                  scope?: null | string;
                  updatedAt?: number;
                  userId?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "accountId"
                    | "providerId"
                    | "userId"
                    | "accessToken"
                    | "refreshToken"
                    | "idToken"
                    | "accessTokenExpiresAt"
                    | "refreshTokenExpiresAt"
                    | "scope"
                    | "password"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "verification";
                update: {
                  createdAt?: number;
                  expiresAt?: number;
                  identifier?: string;
                  updatedAt?: number;
                  value?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "identifier"
                    | "value"
                    | "expiresAt"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "twoFactor";
                update: {
                  backupCodes?: string;
                  secret?: string;
                  userId?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field: "secret" | "backupCodes" | "userId" | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "passkey";
                update: {
                  aaguid?: null | string;
                  backedUp?: boolean;
                  counter?: number;
                  createdAt?: null | number;
                  credentialID?: string;
                  deviceType?: string;
                  name?: null | string;
                  publicKey?: string;
                  transports?: null | string;
                  userId?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "name"
                    | "publicKey"
                    | "userId"
                    | "credentialID"
                    | "counter"
                    | "deviceType"
                    | "backedUp"
                    | "transports"
                    | "createdAt"
                    | "aaguid"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "oauthApplication";
                update: {
                  clientId?: null | string;
                  clientSecret?: null | string;
                  createdAt?: null | number;
                  disabled?: null | boolean;
                  icon?: null | string;
                  metadata?: null | string;
                  name?: null | string;
                  redirectURLs?: null | string;
                  type?: null | string;
                  updatedAt?: null | number;
                  userId?: null | string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "name"
                    | "icon"
                    | "metadata"
                    | "clientId"
                    | "clientSecret"
                    | "redirectURLs"
                    | "type"
                    | "disabled"
                    | "userId"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "oauthAccessToken";
                update: {
                  accessToken?: null | string;
                  accessTokenExpiresAt?: null | number;
                  clientId?: null | string;
                  createdAt?: null | number;
                  refreshToken?: null | string;
                  refreshTokenExpiresAt?: null | number;
                  scopes?: null | string;
                  updatedAt?: null | number;
                  userId?: null | string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "accessToken"
                    | "refreshToken"
                    | "accessTokenExpiresAt"
                    | "refreshTokenExpiresAt"
                    | "clientId"
                    | "userId"
                    | "scopes"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "oauthConsent";
                update: {
                  clientId?: null | string;
                  consentGiven?: null | boolean;
                  createdAt?: null | number;
                  scopes?: null | string;
                  updatedAt?: null | number;
                  userId?: null | string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "clientId"
                    | "userId"
                    | "scopes"
                    | "createdAt"
                    | "updatedAt"
                    | "consentGiven"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "jwks";
                update: {
                  createdAt?: number;
                  privateKey?: string;
                  publicKey?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field: "publicKey" | "privateKey" | "createdAt" | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "rateLimit";
                update: {
                  count?: null | number;
                  key?: null | string;
                  lastRequest?: null | number;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field: "key" | "count" | "lastRequest" | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              };
          onUpdateHandle?: string;
        },
        any
      >;
    };
    adapterTest: {
      runCustomTests: FunctionReference<"action", "internal", any, any>;
      runTests: FunctionReference<"action", "internal", any, any>;
    };
  };
  quotation: {
    quotations: {
      mutations: {
        approveQuotation: FunctionReference<
          "mutation",
          "internal",
          { quotationId: string },
          null
        >;
        createQuotation: FunctionReference<
          "mutation",
          "internal",
          {
            clientId?: string;
            createdBy: string;
            discountAmount?: number;
            lineItems: Array<{
              description: string;
              id: string;
              image?: string;
              length?: string;
              quantity: number;
              rate: number;
              sectionId: string;
              subItems?: Array<{
                description: string;
                id: string;
                quantity: number;
                rate: number;
                unit: string;
              }>;
              unit: string;
              width?: string;
            }>;
            projectId?: string;
            projectIds?: Array<string>;
            taxRate?: number;
            templateId?: string;
            terms?: string;
            validUntil?: number;
          },
          string
        >;
        createQuotationRevision: FunctionReference<
          "mutation",
          "internal",
          { createdBy: string; quotationId: string },
          string
        >;
        deleteQuotation: FunctionReference<
          "mutation",
          "internal",
          { quotationId: string },
          null
        >;
        markQuotationViewed: FunctionReference<
          "mutation",
          "internal",
          { quotationId: string },
          null
        >;
        rejectQuotation: FunctionReference<
          "mutation",
          "internal",
          { clientNotes?: string; quotationId: string },
          null
        >;
        requestChanges: FunctionReference<
          "mutation",
          "internal",
          { clientNotes: string; quotationId: string },
          null
        >;
        sendQuotation: FunctionReference<
          "mutation",
          "internal",
          { quotationId: string },
          null
        >;
        updateQuotation: FunctionReference<
          "mutation",
          "internal",
          {
            clientId?: string;
            discountAmount?: number;
            lineItems?: Array<{
              description: string;
              id: string;
              image?: string;
              length?: string;
              quantity: number;
              rate: number;
              sectionId: string;
              subItems?: Array<{
                description: string;
                id: string;
                quantity: number;
                rate: number;
                unit: string;
              }>;
              unit: string;
              width?: string;
            }>;
            projectId?: string;
            quotationId: string;
            taxRate?: number;
            terms?: string;
            validUntil?: number;
          },
          null
        >;
      };
      queries: {
        getQuotation: FunctionReference<
          "query",
          "internal",
          { quotationId: string },
          {
            _creationTime: number;
            _id: string;
            approvedAt?: number;
            clientId?: string;
            clientNotes?: string;
            code: string;
            createdBy: string;
            discountAmount?: number;
            lineItems: Array<{
              description: string;
              id: string;
              image?: string;
              length?: string;
              quantity: number;
              rate: number;
              sectionId: string;
              subItems?: Array<{
                description: string;
                id: string;
                quantity: number;
                rate: number;
                unit: string;
              }>;
              unit: string;
              width?: string;
            }>;
            parentQuotationId?: string;
            projectId?: string;
            projectIds?: Array<string>;
            rejectedAt?: number;
            sentAt?: number;
            status:
              | "draft"
              | "sent"
              | "viewed"
              | "approved"
              | "changes_requested"
              | "rejected"
              | "expired"
              | "superseded";
            subtotal: number;
            taxAmount: number;
            taxRate: number;
            templateId?: string;
            terms?: string;
            total: number;
            updatedAt: number;
            validUntil?: number;
            version: number;
            viewedAt?: number;
          } | null
        >;
        getQuotationByCode: FunctionReference<
          "query",
          "internal",
          { code: string },
          {
            _creationTime: number;
            _id: string;
            approvedAt?: number;
            clientId?: string;
            clientNotes?: string;
            code: string;
            createdBy: string;
            discountAmount?: number;
            lineItems: Array<{
              description: string;
              id: string;
              image?: string;
              length?: string;
              quantity: number;
              rate: number;
              sectionId: string;
              subItems?: Array<{
                description: string;
                id: string;
                quantity: number;
                rate: number;
                unit: string;
              }>;
              unit: string;
              width?: string;
            }>;
            parentQuotationId?: string;
            projectId?: string;
            projectIds?: Array<string>;
            rejectedAt?: number;
            sentAt?: number;
            status:
              | "draft"
              | "sent"
              | "viewed"
              | "approved"
              | "changes_requested"
              | "rejected"
              | "expired"
              | "superseded";
            subtotal: number;
            taxAmount: number;
            taxRate: number;
            templateId?: string;
            terms?: string;
            total: number;
            updatedAt: number;
            validUntil?: number;
            version: number;
            viewedAt?: number;
          } | null
        >;
        getQuotationHistory: FunctionReference<
          "query",
          "internal",
          { quotationId: string },
          Array<{
            _creationTime: number;
            _id: string;
            approvedAt?: number;
            clientId?: string;
            clientNotes?: string;
            code: string;
            createdBy: string;
            discountAmount?: number;
            lineItems: Array<{
              description: string;
              id: string;
              image?: string;
              length?: string;
              quantity: number;
              rate: number;
              sectionId: string;
              subItems?: Array<{
                description: string;
                id: string;
                quantity: number;
                rate: number;
                unit: string;
              }>;
              unit: string;
              width?: string;
            }>;
            parentQuotationId?: string;
            projectId?: string;
            projectIds?: Array<string>;
            rejectedAt?: number;
            sentAt?: number;
            status:
              | "draft"
              | "sent"
              | "viewed"
              | "approved"
              | "changes_requested"
              | "rejected"
              | "expired"
              | "superseded";
            subtotal: number;
            taxAmount: number;
            taxRate: number;
            templateId?: string;
            terms?: string;
            total: number;
            updatedAt: number;
            validUntil?: number;
            version: number;
            viewedAt?: number;
          }>
        >;
        getQuotations: FunctionReference<
          "query",
          "internal",
          {
            clientId?: string;
            limit?: number;
            projectId?: string;
            status?:
              | "draft"
              | "sent"
              | "viewed"
              | "approved"
              | "changes_requested"
              | "rejected"
              | "expired"
              | "superseded";
          },
          Array<{
            _creationTime: number;
            _id: string;
            approvedAt?: number;
            clientId?: string;
            clientNotes?: string;
            code: string;
            createdBy: string;
            discountAmount?: number;
            lineItems: Array<{
              description: string;
              id: string;
              image?: string;
              length?: string;
              quantity: number;
              rate: number;
              sectionId: string;
              subItems?: Array<{
                description: string;
                id: string;
                quantity: number;
                rate: number;
                unit: string;
              }>;
              unit: string;
              width?: string;
            }>;
            parentQuotationId?: string;
            projectId?: string;
            projectIds?: Array<string>;
            rejectedAt?: number;
            sentAt?: number;
            status:
              | "draft"
              | "sent"
              | "viewed"
              | "approved"
              | "changes_requested"
              | "rejected"
              | "expired"
              | "superseded";
            subtotal: number;
            taxAmount: number;
            taxRate: number;
            templateId?: string;
            terms?: string;
            total: number;
            updatedAt: number;
            validUntil?: number;
            version: number;
            viewedAt?: number;
          }>
        >;
        getQuotationWithSections: FunctionReference<
          "query",
          "internal",
          { quotationId: string },
          {
            quotation: {
              _creationTime: number;
              _id: string;
              approvedAt?: number;
              clientId?: string;
              clientNotes?: string;
              code: string;
              createdBy: string;
              discountAmount?: number;
              lineItems: Array<{
                description: string;
                id: string;
                image?: string;
                length?: string;
                quantity: number;
                rate: number;
                sectionId: string;
                subItems?: Array<{
                  description: string;
                  id: string;
                  quantity: number;
                  rate: number;
                  unit: string;
                }>;
                unit: string;
                width?: string;
              }>;
              parentQuotationId?: string;
              projectId?: string;
              projectIds?: Array<string>;
              rejectedAt?: number;
              sentAt?: number;
              status:
                | "draft"
                | "sent"
                | "viewed"
                | "approved"
                | "changes_requested"
                | "rejected"
                | "expired"
                | "superseded";
              subtotal: number;
              taxAmount: number;
              taxRate: number;
              templateId?: string;
              terms?: string;
              total: number;
              updatedAt: number;
              validUntil?: number;
              version: number;
              viewedAt?: number;
            };
            sections: Array<{
              _creationTime: number;
              _id: string;
              color?: string;
              displayOrder: number;
              icon?: string;
              isActive: boolean;
              name: string;
            }>;
          } | null
        >;
      };
    };
    sections: {
      mutations: {
        createSection: FunctionReference<
          "mutation",
          "internal",
          {
            color?: string;
            displayOrder?: number;
            icon?: string;
            name: string;
          },
          string
        >;
        deleteSection: FunctionReference<
          "mutation",
          "internal",
          { sectionId: string },
          null
        >;
        reorderSections: FunctionReference<
          "mutation",
          "internal",
          { orderedIds: Array<string> },
          null
        >;
        toggleSectionActive: FunctionReference<
          "mutation",
          "internal",
          { sectionId: string },
          boolean
        >;
        updateSection: FunctionReference<
          "mutation",
          "internal",
          {
            color?: string;
            displayOrder?: number;
            icon?: string;
            isActive?: boolean;
            name?: string;
            sectionId: string;
          },
          null
        >;
      };
      queries: {
        getSection: FunctionReference<
          "query",
          "internal",
          { sectionId: string },
          {
            _creationTime: number;
            _id: string;
            color?: string;
            displayOrder: number;
            icon?: string;
            isActive: boolean;
            name: string;
          } | null
        >;
        getSections: FunctionReference<
          "query",
          "internal",
          { activeOnly?: boolean },
          Array<{
            _creationTime: number;
            _id: string;
            color?: string;
            displayOrder: number;
            icon?: string;
            isActive: boolean;
            name: string;
          }>
        >;
      };
    };
    templates: {
      mutations: {
        createTemplate: FunctionReference<
          "mutation",
          "internal",
          {
            createdBy: string;
            description?: string;
            lineItems: Array<{
              defaultQuantity: number;
              description: string;
              sectionId: string;
              subItems?: Array<{
                defaultQuantity: number;
                description: string;
                unit: string;
                unitPrice: number;
              }>;
              unit: string;
              unitPrice: number;
            }>;
            name: string;
            projectTypeHint?: string;
            terms?: string;
          },
          string
        >;
        deleteTemplate: FunctionReference<
          "mutation",
          "internal",
          { templateId: string },
          null
        >;
        duplicateTemplate: FunctionReference<
          "mutation",
          "internal",
          { createdBy: string; newName: string; templateId: string },
          string
        >;
        toggleTemplateActive: FunctionReference<
          "mutation",
          "internal",
          { templateId: string },
          boolean
        >;
        updateTemplate: FunctionReference<
          "mutation",
          "internal",
          {
            description?: string;
            isActive?: boolean;
            lineItems?: Array<{
              defaultQuantity: number;
              description: string;
              sectionId: string;
              subItems?: Array<{
                defaultQuantity: number;
                description: string;
                unit: string;
                unitPrice: number;
              }>;
              unit: string;
              unitPrice: number;
            }>;
            name?: string;
            projectTypeHint?: string;
            templateId: string;
            terms?: string;
          },
          null
        >;
      };
      queries: {
        getTemplate: FunctionReference<
          "query",
          "internal",
          { templateId: string },
          {
            _creationTime: number;
            _id: string;
            createdBy: string;
            description?: string;
            isActive: boolean;
            lineItems: Array<{
              defaultQuantity: number;
              description: string;
              sectionId: string;
              subItems?: Array<{
                defaultQuantity: number;
                description: string;
                unit: string;
                unitPrice: number;
              }>;
              unit: string;
              unitPrice: number;
            }>;
            name: string;
            projectTypeHint?: string;
            terms?: string;
            updatedAt: number;
          } | null
        >;
        getTemplates: FunctionReference<
          "query",
          "internal",
          { activeOnly?: boolean },
          Array<{
            _creationTime: number;
            _id: string;
            createdBy: string;
            description?: string;
            isActive: boolean;
            lineItems: Array<{
              defaultQuantity: number;
              description: string;
              sectionId: string;
              subItems?: Array<{
                defaultQuantity: number;
                description: string;
                unit: string;
                unitPrice: number;
              }>;
              unit: string;
              unitPrice: number;
            }>;
            name: string;
            projectTypeHint?: string;
            terms?: string;
            updatedAt: number;
          }>
        >;
        getTemplatesByProjectType: FunctionReference<
          "query",
          "internal",
          { projectTypeHint: string },
          Array<{
            _creationTime: number;
            _id: string;
            createdBy: string;
            description?: string;
            isActive: boolean;
            lineItems: Array<{
              defaultQuantity: number;
              description: string;
              sectionId: string;
              subItems?: Array<{
                defaultQuantity: number;
                description: string;
                unit: string;
                unitPrice: number;
              }>;
              unit: string;
              unitPrice: number;
            }>;
            name: string;
            projectTypeHint?: string;
            terms?: string;
            updatedAt: number;
          }>
        >;
      };
    };
  };
  library: {
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
        Array<string>
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
        string
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
        string
      >;
      deleteCategory: FunctionReference<
        "mutation",
        "internal",
        { categoryId: string },
        null
      >;
      deleteItem: FunctionReference<
        "mutation",
        "internal",
        { itemId: string },
        null
      >;
      duplicateItem: FunctionReference<
        "mutation",
        "internal",
        { createdBy: string; itemId: string; newName?: string },
        string
      >;
      reorderCategories: FunctionReference<
        "mutation",
        "internal",
        { orderedIds: Array<string> },
        null
      >;
      reorderItems: FunctionReference<
        "mutation",
        "internal",
        { orderedIds: Array<string> },
        null
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
        null
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
        null
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
        }>
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
        } | null
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
        } | null
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
        }>
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
        }>
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
        }>
      >;
    };
  };
};
