import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  estimateRecipients,
  validateWarningForm,
} from "../src/services/api/warningApi.ts";

describe("Issue Warning form rules", () => {
  it("requires target areas before allowing the compose step", () => {
    const errors = validateWarningForm({
      severity: "Warning",
      targetMode: "District",
      targetAreas: [],
    }, 1);

    assert.equal(errors.targetAreas, "Select at least one target area.");
  });

  it("requires message content, language, and channel before review", () => {
    const errors = validateWarningForm({
      severity: "Warning",
      targetMode: "District",
      targetAreas: ["Colombo"],
      headline: "",
      instructions: "",
      languages: [],
      channels: [],
    }, 2);

    assert.equal(errors.headline, "Headline is required.");
    assert.equal(errors.instructions, "Instructions are required.");
    assert.equal(errors.languages, "Select at least one language.");
    assert.equal(errors.channels, "Select at least one delivery channel.");
  });

  it("deduplicates repeated areas in the simulated recipient estimate", () => {
    assert.equal(estimateRecipients(["Colombo", "Colombo", "Gampaha"], "District"), 4);
  });

  it("deduplicates citizens shared by overlapping simulated areas", () => {
    assert.equal(estimateRecipients(["Colombo", "Gampaha"], "District"), 4);
  });
});
