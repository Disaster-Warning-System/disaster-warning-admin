import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import {
  createShelter,
  deleteShelter,
  getShelter,
  getShelterOccupancyHistory,
  getShelters,
  ShelterApiError,
  updateShelter,
} from "../src/services/api/shelterApi.ts";
import { saveAdminSession } from "../src/lib/auth.ts";

const shelterId = "shelter/with spaces";
const shelter = {
  id: "shelter-1",
  name: "Community Hall",
  location: "Colombo",
  locationPoint: { type: "Point", coordinates: [79.8612, 6.9271] },
  capacity: 100,
  occupancy: 35,
  operationalStatus: "Open",
  remarks: "",
  availableSpaces: 65,
  availabilityStatus: "Open",
  createdAt: "2026-10-09T00:00:00.000Z",
  updatedAt: "2026-10-09T00:00:00.000Z",
};

const originalFetch = globalThis.fetch;
const originalWindow = globalThis.window;

afterEach(() => {
  globalThis.fetch = originalFetch;
  if (originalWindow === undefined) delete globalThis.window;
  else globalThis.window = originalWindow;
});

// Mock fetch to check the HTTP contract without calling the backend or MongoDB.
function mockResponse(data, { ok = true, status = 200 } = {}) {
  return {
    ok,
    status,
    json: async () => ({ success: ok, data }),
  };
}

describe("admin shelter API CRUD requests", () => {
  it("reads the shelter collection", async () => {
    const fetchCalls = [];
    globalThis.fetch = async (...args) => {
      fetchCalls.push(args);
      return mockResponse([shelter]);
    };

    assert.deepEqual(await getShelters(), [shelter]);
    assert.equal(fetchCalls[0][0], "http://localhost:5000/api/shelters");
    assert.equal(fetchCalls[0][1].method, undefined);
    assert.equal(fetchCalls[0][1].cache, "no-store");
  });

  it("reads one shelter using an encoded ID", async () => {
    let requestedUrl;
    globalThis.fetch = async (url) => {
      requestedUrl = url;
      return mockResponse(shelter);
    };

    assert.deepEqual(await getShelter(shelterId), shelter);
    assert.equal(requestedUrl, "http://localhost:5000/api/shelters/shelter%2Fwith%20spaces");
  });

  it("reads occupancy history for a shelter using its encoded ID", async () => {
    const history = { shelter: { id: "shelter-1", name: shelter.name, capacity: 100 }, entries: [] };
    let requestedUrl;
    globalThis.fetch = async (url) => {
      requestedUrl = url;
      return mockResponse(history);
    };

    assert.deepEqual(await getShelterOccupancyHistory(shelterId), history);
    assert.equal(requestedUrl, "http://localhost:5000/api/shelters/shelter%2Fwith%20spaces/history");
  });

  it("creates a shelter with the submitted details", async () => {
    const input = {
      name: shelter.name,
      location: shelter.location,
      locationPoint: shelter.locationPoint,
      capacity: shelter.capacity,
      occupancy: shelter.occupancy,
      operationalStatus: shelter.operationalStatus,
      remarks: shelter.remarks,
    };
    let requestOptions;
    globalThis.fetch = async (_url, options) => {
      requestOptions = options;
      return mockResponse(shelter, { status: 201 });
    };

    assert.deepEqual(await createShelter(input), shelter);
    assert.equal(requestOptions.method, "POST");
    assert.deepEqual(JSON.parse(requestOptions.body), input);
  });

  it("updates the selected shelter with only the requested changes", async () => {
    const changes = { occupancy: 50, operationalStatus: "Closed" };
    let requestOptions;
    let requestedUrl;
    globalThis.fetch = async (url, options) => {
      requestedUrl = url;
      requestOptions = options;
      return mockResponse({ ...shelter, ...changes });
    };

    assert.deepEqual(await updateShelter(shelterId, changes), { ...shelter, ...changes });
    assert.equal(requestedUrl, "http://localhost:5000/api/shelters/shelter%2Fwith%20spaces");
    assert.equal(requestOptions.method, "PATCH");
    assert.deepEqual(JSON.parse(requestOptions.body), changes);
  });

  it("deletes the selected shelter", async () => {
    let requestedUrl;
    let requestOptions;
    globalThis.fetch = async (url, options) => {
      requestedUrl = url;
      requestOptions = options;
      return mockResponse(shelter);
    };

    assert.deepEqual(await deleteShelter(shelterId), shelter);
    assert.equal(requestedUrl, "http://localhost:5000/api/shelters/shelter%2Fwith%20spaces");
    assert.equal(requestOptions.method, "DELETE");
  });

  it("preserves server validation messages and status codes", async () => {
    globalThis.fetch = async () => ({
      ok: false,
      status: 400,
      json: async () => ({
        success: false,
        errors: ["Capacity must be greater than 0."],
      }),
    });

    await assert.rejects(createShelter({}), (error) => {
      assert.ok(error instanceof ShelterApiError);
      assert.equal(error.statusCode, 400);
      assert.equal(error.message, "Capacity must be greater than 0.");
      return true;
    });
  });

  it("sends the signed-in officer JWT with protected shelter requests", async () => {
    const values = new Map();
    globalThis.window = {
      sessionStorage: {
        getItem: (key) => values.get(key) ?? null,
        setItem: (key, value) => values.set(key, value),
        removeItem: (key) => values.delete(key),
      },
      location: { pathname: "/shelters", assign() {} },
    };
    saveAdminSession({
      token: "officer.jwt.token",
      user: { _id: "officer-1", name: "Officer", email: "officer@example.lk", role: "District Officer", district: "Colombo" },
    });
    let requestOptions;
    globalThis.fetch = async (_url, options) => {
      requestOptions = options;
      return mockResponse(shelter);
    };

    await updateShelter("shelter-1", { occupancy: 50 });

    assert.equal(requestOptions.headers.Authorization, "Bearer officer.jwt.token");
  });
});
