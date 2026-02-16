import { httpRouter } from "convex/server";
import { authComponent, createAuth } from "./auth";
import * as contactsHttp from "./functions/contacts/http";
import * as feedbacksHttp from "./functions/feedbacks/http";
import * as surveysHttp from "./functions/surveys/http";

const http = httpRouter();

// ─── Auth Routes ─────────────────────────────────────────
authComponent.registerRoutes(http, createAuth);

// ─── Contacts ────────────────────────────────────────────
http.route({
  path: "/contacts",
  method: "POST",
  handler: contactsHttp.handlePost,
});

http.route({
  path: "/contacts",
  method: "OPTIONS",
  handler: contactsHttp.handleOptions,
});

// ─── Feedbacks ───────────────────────────────────────────
http.route({
  path: "/feedbacks",
  method: "POST",
  handler: feedbacksHttp.handlePost,
});

http.route({
  path: "/feedbacks",
  method: "OPTIONS",
  handler: feedbacksHttp.handleOptions,
});

// ─── Surveys ─────────────────────────────────────────────
http.route({
  path: "/surveys",
  method: "POST",
  handler: surveysHttp.handlePost,
});

http.route({
  path: "/surveys",
  method: "OPTIONS",
  handler: surveysHttp.handleOptions,
});

export default http;
