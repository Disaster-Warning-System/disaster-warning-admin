import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { clearAdminSession, getAdminSession, getAdminToken, isDistrictOfficer, saveAdminSession } from "../src/lib/auth.ts";
import { AdminAuthError, loginAdmin } from "../src/services/api/authApi.ts";

const originalFetch = globalThis.fetch;
const originalWindow = globalThis.window;
const officerSession = {
  token: "signed.jwt.token",
  user: {
    _id: "officer-1",
    name: "District Officer",
    email: "officer@example.lk",
    role: "District Officer",
    district: "Colombo",
  },
};

afterEach(() => {
  globalThis.fetch = originalFetch;
  if (originalWindow === undefined) delete globalThis.window;
  else globalThis.window = originalWindow;
});

function installSessionStorage() {
  const values = new Map();
  globalThis.window = {
    sessionStorage: {
      getItem: (key) => values.get(key) ?? null,
      setItem: (key, value) => values.set(key, value),
      removeItem: (key) => values.delete(key),
    },
  };
  return values;
}

describe("admin District Officer authentication", () => {
  it("calls the existing backend login endpoint and returns its JWT session", async () => {
    let requestUrl;
    let requestOptions;
    globalThis.fetch = async (url, options) => {
      requestUrl = url;
      requestOptions = options;
      return {
        ok: true,
        status: 200,
        json: async () => ({ success: true, data: officerSession }),
      };
    };

    assert.deepEqual(await loginAdmin({ email: officerSession.user.email, password: "password123" }), officerSession);
    assert.equal(requestUrl, "http://localhost:5000/api/auth/login");
    assert.equal(requestOptions.method, "POST");
    assert.deepEqual(JSON.parse(requestOptions.body), {
      email: officerSession.user.email,
      password: "password123",
    });
  });

  it("reports backend login failures with their status and message", async () => {
    globalThis.fetch = async () => ({
      ok: false,
      status: 401,
      json: async () => ({ success: false, message: "Invalid email or password" }),
    });

    await assert.rejects(loginAdmin({ email: "bad@example.lk", password: "wrong" }), (error) => {
      assert.ok(error instanceof AdminAuthError);
      assert.equal(error.statusCode, 401);
      assert.equal(error.message, "Invalid email or password");
      return true;
    });
  });

  it("stores and clears the session in tab-scoped storage and checks the officer role", () => {
    installSessionStorage();

    saveAdminSession(officerSession);
    assert.deepEqual(getAdminSession(), officerSession);
    assert.equal(getAdminToken(), officerSession.token);
    assert.equal(isDistrictOfficer(getAdminSession()), true);
    assert.equal(isDistrictOfficer({ ...officerSession, user: { ...officerSession.user, role: "Citizen" } }), false);

    clearAdminSession();
    assert.equal(getAdminSession(), null);
  });
});
