import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";
import {
  AREA_OPTIONS,
  apiClient,
  deleteWarningDraft,
  getWarningDraft,
  getWarningDrafts,
  previewWarning,
  saveWarningDraft,
  submitWarning,
  validateWarningForm,
} from "../src/services/api/warningApi.ts";

const form = {
  hazardType: "Flood", headline: "  Flood warning ", instructions: "  Move to safety  ",
  severity: "Warning", targetMode: "District", targetAreas: ["Colombo"],
  languages: ["English"], channels: ["SMS", "Push"], sourceReportId: "report-1",
};
const defaultAdapter = apiClient.defaults.adapter;

describe("Issue Warning frontend API and validation", () => {
  let requests;
  beforeEach(() => {
    requests = [];
    apiClient.defaults.adapter = async (config) => {
      requests.push(config);
      return { data: { draft: { alertId: "ALT-draft" }, recipientCount: 4 }, status: 200, statusText: "OK", headers: {}, config };
    };
  });
  afterEach(() => { apiClient.defaults.adapter = defaultAdapter; });

  it("requires target, severity and mode before composing", () => {
    const errors = validateWarningForm({ severity: "Warning", targetMode: "District", targetAreas: [] }, 1);
    assert.equal(errors.targetAreas, "Select at least one target area.");
    assert.equal(validateWarningForm(form, 1).targetAreas, undefined);
  });

  it("requires message content, language, and channel before review", () => {
    const errors = validateWarningForm({ ...form, headline: "", instructions: "", languages: [], channels: [] }, 2);
    assert.equal(errors.headline, "Headline is required.");
    assert.equal(errors.instructions, "Instructions are required.");
    assert.equal(errors.languages, "Select at least one language.");
    assert.equal(errors.channels, "Select at least one delivery channel.");
  });

  it("provides all configured districts and river basin choices", () => {
    assert.equal(AREA_OPTIONS.District.length, 25);
    assert.equal(AREA_OPTIONS["River Basin"].length, 103);
  });

  it("previews with the server and sends target, channel, and update reference fields", async () => {
    const preview = await previewWarning({ ...form, supersedesAlertId: "ALT-old" });
    assert.equal(preview.recipientCount, 4);
    assert.equal(requests[0].url, "/alerts/preview");
    assert.deepEqual(JSON.parse(requests[0].data), {
      severity: "Warning", targetMode: "District", targetAreas: ["Colombo"], channels: ["SMS", "Push"], supersedesAlertId: "ALT-old",
    });
  });

  it("creates and updates persistent drafts with trimmed text", async () => {
    await saveWarningDraft(form);
    await saveWarningDraft(form, "ALT/draft");
    assert.equal(requests[0].url, "/alerts/drafts");
    assert.equal(requests[0].method, "post");
    assert.equal(JSON.parse(requests[0].data).headline, "Flood warning");
    assert.equal(requests[1].url, "/alerts/drafts/ALT%2Fdraft");
    assert.equal(requests[1].method, "put");
    await getWarningDrafts();
    await getWarningDraft("ALT/draft");
    await deleteWarningDraft("ALT/draft");
    assert.deepEqual(requests.slice(2).map(({ method, url }) => [method, url]), [
      ["get", "/alerts/drafts"], ["get", "/alerts/drafts/ALT%2Fdraft"], ["delete", "/alerts/drafts/ALT%2Fdraft"],
    ]);
  });

  it("submits explicit review acknowledgements and linked report fields", async () => {
    await submitWarning({ ...form, supersedesAlertId: "ALT-old", minimumAcknowledged: true, conflictAcknowledged: true });
    assert.equal(requests[0].url, "/alerts");
    assert.deepEqual(JSON.parse(requests[0].data), {
      hazardType: "Flood", headline: "Flood warning", instructions: "Move to safety", severity: "Warning",
      targetMode: "District", targetAreas: ["Colombo"], languages: ["English"], channels: ["SMS", "Push"],
      sourceReportId: "report-1", supersedesAlertId: "ALT-old", minimumAcknowledged: true, conflictAcknowledged: true,
    });
  });
});
