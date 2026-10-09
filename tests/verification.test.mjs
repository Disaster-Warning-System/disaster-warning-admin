import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { getAdminSession, saveAdminSession } from "../src/lib/auth.ts";
import { isAdmin, isDmcOfficer } from "../src/lib/roles.js";
import {
  VerificationApiError,
  getDashboard,
  getReport,
  getWarningDraft,
  listReports,
  photoUrl,
  reopenReport,
  submitDecision,
} from "../src/services/api/verificationApi.js";
import {
  buildQueueQuery,
  formatAge,
  readQueueFilters,
  validateDecision,
} from "../src/utils/verification.js";

const originalFetch = globalThis.fetch;
const originalWindow = globalThis.window;

const dmcSession = {
  token: "dmc.jwt.token",
  user: { _id: "officer-1", name: "Nimal Perera", email: "officer@dmc.lk", role: "DMC Officer", district: "Colombo" },
};

afterEach(() => {
  globalThis.fetch = originalFetch;
  if (originalWindow === undefined) delete globalThis.window;
  else globalThis.window = originalWindow;
});

// Fake browser storage and events so the API client runs without a browser
function installWindow() {
  const values = new Map();
  const events = [];
  globalThis.window = {
    sessionStorage: {
      getItem: (key) => values.get(key) ?? null,
      setItem: (key, value) => values.set(key, value),
      removeItem: (key) => values.delete(key),
    },
    dispatchEvent: (event) => events.push(event.type),
  };
  return events;
}

function signIn() {
  const events = installWindow();
  saveAdminSession(dmcSession);
  return events;
}

function mockFetch(payload, { status = 200 } = {}) {
  const calls = [];
  globalThis.fetch = async (url, options) => {
    calls.push({ url, options });
    return { ok: status >= 200 && status < 300, status, json: async () => payload };
  };
  return calls;
}

describe("verification API client", () => {
  it("sends the officer token and returns the dashboard data", async () => {
    signIn();
    const stats = { pendingCount: 3, overdueCount: 1, statusCounts: {}, recentActivity: [] };
    const calls = mockFetch({ success: true, data: stats });

    assert.deepEqual(await getDashboard(), stats);
    assert.equal(calls[0].url, "http://localhost:5000/api/officer/dashboard");
    assert.equal(calls[0].options.headers.Authorization, "Bearer dmc.jwt.token");
    assert.equal(calls[0].options.cache, "no-store");
  });

  it("puts only the filters that are set in the queue query and keeps the paging fields", async () => {
    signIn();
    const calls = mockFetch({ success: true, count: 1, total: 41, page: 3, pages: 3, data: [{ _id: "r1" }] });

    const result = await listReports({ status: "Rejected", hazardType: "", district: "Kandy", page: 3, limit: 20 });

    assert.deepEqual(result, { count: 1, total: 41, page: 3, pages: 3, data: [{ _id: "r1" }] });
    const url = new URL(calls[0].url);
    assert.equal(url.pathname, "/api/reports");
    assert.equal(url.searchParams.get("status"), "Rejected");
    assert.equal(url.searchParams.get("district"), "Kandy");
    assert.equal(url.searchParams.has("hazardType"), false);
    assert.equal(url.searchParams.get("page"), "3");
  });

  it("encodes the report ID in detail and warning-draft URLs", async () => {
    signIn();
    const calls = mockFetch({ success: true, data: { _id: "a/b" } });

    await getReport("a/b");
    await getWarningDraft("a/b");

    assert.equal(calls[0].url, "http://localhost:5000/api/reports/a%2Fb");
    assert.equal(calls[1].url, "http://localhost:5000/api/reports/a%2Fb/warning-draft");
  });

  it("posts the decision body and returns the updated report and verification record", async () => {
    signIn();
    const data = { report: { _id: "r1", status: "Verified" }, verification: { _id: "v1" } };
    const calls = mockFetch({ success: true, data });
    const body = {
      decision: "Verified",
      remarks: "",
      checklist: { locationChecked: true, evidenceReviewed: true, duplicatesChecked: false },
      severity: "High",
    };

    assert.deepEqual(await submitDecision("r1", body), data);
    assert.equal(calls[0].url, "http://localhost:5000/api/reports/r1/verification");
    assert.equal(calls[0].options.method, "POST");
    assert.equal(calls[0].options.headers["Content-Type"], "application/json");
    assert.deepEqual(JSON.parse(calls[0].options.body), body);
  });

  it("posts the remarks when reopening a rejected report", async () => {
    signIn();
    const calls = mockFetch({ success: true, data: { report: { _id: "r1" } } });

    await reopenReport("r1", "Rejected by mistake");

    assert.equal(calls[0].url, "http://localhost:5000/api/reports/r1/reopen");
    assert.deepEqual(JSON.parse(calls[0].options.body), { remarks: "Rejected by mistake" });
  });

  it("passes on a 409 conflict with the backend's message so the page can reload", async () => {
    signIn();
    mockFetch(
      { success: false, message: "This report has already been processed by another officer" },
      { status: 409 },
    );

    await assert.rejects(submitDecision("r1", { decision: "Rejected", remarks: "Duplicate" }), (error) => {
      assert.ok(error instanceof VerificationApiError);
      assert.equal(error.statusCode, 409);
      assert.equal(error.message, "This report has already been processed by another officer");
      return true;
    });
  });

  it("clears the session and signals expiry when the backend rejects the token", async () => {
    const events = signIn();
    mockFetch({ success: false, message: "Not authorized, token invalid" }, { status: 401 });

    await assert.rejects(getDashboard(), (error) => error.statusCode === 401);
    assert.equal(getAdminSession(), null);
    assert.deepEqual(events, ["disaster-warning.admin-session-expired"]);
  });

  it("does not call the backend when no officer is signed in", async () => {
    const events = installWindow();
    const calls = mockFetch({ success: true, data: {} });

    await assert.rejects(getDashboard(), (error) => error.statusCode === 401);
    assert.equal(calls.length, 0);
    assert.deepEqual(events, ["disaster-warning.admin-session-expired"]);
  });

  it("reports an unreachable server with a readable message", async () => {
    signIn();
    globalThis.fetch = async () => {
      throw new TypeError("fetch failed");
    };

    await assert.rejects(getDashboard(), /Unable to reach the server/);
  });

  it("builds photo URLs from the uploads endpoint", () => {
    assert.equal(photoUrl("abc123"), "http://localhost:5000/api/uploads/hazard-photo/abc123");
  });
});

describe("officer decision rules", () => {
  const withPhoto = { photoFileId: "f1", evidence: [] };
  const noEvidence = { photoFileId: null, evidence: [] };
  const allChecked = { locationChecked: true, evidenceReviewed: true, duplicatesChecked: true };

  it("requires a decision", () => {
    assert.equal(validateDecision({ decision: "", remarks: "", checklist: allChecked, report: noEvidence }), "Choose a decision.");
  });

  it("requires remarks to reject or to ask for more information", () => {
    assert.match(validateDecision({ decision: "Rejected", remarks: "  ", checklist: {}, report: noEvidence }), /reason/);
    assert.match(
      validateDecision({ decision: "Needs More Information", remarks: "", checklist: {}, report: noEvidence }),
      /information you need/,
    );
    assert.equal(validateDecision({ decision: "Rejected", remarks: "Duplicate of HR-1", checklist: {}, report: noEvidence }), "");
  });

  it("requires the location check before verifying", () => {
    assert.match(
      validateDecision({ decision: "Verified", remarks: "", checklist: { locationChecked: false }, report: noEvidence }),
      /location/,
    );
    assert.equal(validateDecision({ decision: "Verified", remarks: "", checklist: { locationChecked: true }, report: noEvidence }), "");
  });

  it("requires the evidence review only when the report has a photo or evidence", () => {
    assert.match(
      validateDecision({ decision: "Verified", remarks: "", checklist: { locationChecked: true }, report: withPhoto }),
      /evidence/,
    );
    assert.match(
      validateDecision({
        decision: "Verified",
        remarks: "",
        checklist: { locationChecked: true },
        report: { photoFileId: null, evidence: [{ url: "https://example.lk/1.jpg", type: "image" }] },
      }),
      /evidence/,
    );
    assert.equal(validateDecision({ decision: "Verified", remarks: "", checklist: allChecked, report: withPhoto }), "");
  });
});

describe("report queue filters", () => {
  it("uses the backend defaults when the URL has no filters", () => {
    assert.deepEqual(readQueueFilters(new URLSearchParams("")), {
      status: "Pending Verification",
      hazardType: "",
      district: "",
      search: "",
      sort: "newest",
      page: 1,
    });
  });

  it("ignores unknown statuses, hazard types, sorts and bad page numbers instead of sending them", () => {
    const filters = readQueueFilters(new URLSearchParams("status=Deleted&hazardType=Meteor&sort=oldest&page=-2"));
    assert.equal(filters.status, "Pending Verification");
    assert.equal(filters.hazardType, "");
    assert.equal(filters.sort, "newest");
    assert.equal(filters.page, 1);
  });

  it("round-trips filters through the URL and leaves defaults out", () => {
    const filters = {
      status: "Needs More Information",
      hazardType: "Flood",
      district: "Kandy",
      search: "HR-2026",
      sort: "severity",
      page: 2,
    };
    const query = buildQueueQuery(filters);
    assert.deepEqual(readQueueFilters(new URLSearchParams(query)), filters);
    assert.equal(buildQueueQuery(readQueueFilters(new URLSearchParams(""))), "");
  });
});

describe("admin roles and formatting", () => {
  it("lets both officer roles into the admin app but only DMC Officers into verification", () => {
    const districtSession = { ...dmcSession, user: { ...dmcSession.user, role: "District Officer" } };
    const citizenSession = { ...dmcSession, user: { ...dmcSession.user, role: "Citizen" } };

    assert.equal(isAdmin(dmcSession), true);
    assert.equal(isAdmin(districtSession), true);
    assert.equal(isAdmin(citizenSession), false);
    assert.equal(isAdmin(null), false);
    assert.equal(isDmcOfficer(dmcSession), true);
    assert.equal(isDmcOfficer(districtSession), false);
  });

  it("shows report age in minutes, hours or days", () => {
    assert.equal(formatAge(0), "just now");
    assert.equal(formatAge(45), "45 min");
    assert.equal(formatAge(150), "2 h");
    assert.equal(formatAge(60 * 50), "2 d");
  });
});
