/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as accounts from "../accounts.js";
import type * as actions_email from "../actions/email.js";
import type * as auth from "../auth.js";
import type * as budgets from "../budgets.js";
import type * as categories from "../categories.js";
import type * as debts from "../debts.js";
import type * as emailConfigs from "../emailConfigs.js";
import type * as families from "../families.js";
import type * as goals from "../goals.js";
import type * as investments from "../investments.js";
import type * as migrations from "../migrations.js";
import type * as notifications from "../notifications.js";
import type * as seed from "../seed.js";
import type * as settings from "../settings.js";
import type * as transactions from "../transactions.js";
import type * as users from "../users.js";
import type * as utils from "../utils.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  accounts: typeof accounts;
  "actions/email": typeof actions_email;
  auth: typeof auth;
  budgets: typeof budgets;
  categories: typeof categories;
  debts: typeof debts;
  emailConfigs: typeof emailConfigs;
  families: typeof families;
  goals: typeof goals;
  investments: typeof investments;
  migrations: typeof migrations;
  notifications: typeof notifications;
  seed: typeof seed;
  settings: typeof settings;
  transactions: typeof transactions;
  users: typeof users;
  utils: typeof utils;
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

export declare const components: {};
