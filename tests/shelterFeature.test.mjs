import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getShelterFormValidationError } from "../src/utils/shelterFormValidation.ts";
import { shelterStatus } from "../src/utils/shelterStatus.ts";
import { nextShelterFormStage } from "../src/utils/shelterFormWorkflow.ts";
import {
  removeShelterQueueItem,
  shouldRetryShelterUpdate,
  upsertShelterQueueItem,
} from "../src/services/api/shelterUpdateQueueCore.ts";

const mapPoint = { type: "Point", coordinates: [79.8612, 6.9271] };
const validForm = {
  mode: "create",
  name: "Community Hall",
  location: "Colombo",
  locationPoint: mapPoint,
  capacity: 100,
  occupancy: 35,
  occupancyText: "35",
  maximumCapacity: 100,
};

describe("admin shelter availability status", () => {
  it("shows Full when occupancy reaches capacity", () => {
    assert.equal(
      shelterStatus({ capacity: 100, occupancy: 100, operationalStatus: "Open" }),
      "Full",
    );
  });

  it("retains operational status while spaces remain", () => {
    assert.equal(
      shelterStatus({ capacity: 100, occupancy: 99, operationalStatus: "Closed" }),
      "Closed",
    );
  });
});

describe("admin shelter form validation", () => {
  it("accepts a valid registration for review", () => {
    assert.equal(getShelterFormValidationError(validForm), null);
  });

  it("explains missing shelter name and map point", () => {
    assert.match(
      getShelterFormValidationError({ ...validForm, name: " " }),
      /Shelter name is required/,
    );
    assert.match(
      getShelterFormValidationError({ ...validForm, locationPoint: null }),
      /Map location is required/,
    );
  });

  it("rejects invalid capacity, negative occupancy, and occupancy above capacity", () => {
    assert.match(
      getShelterFormValidationError({ ...validForm, capacity: 0, maximumCapacity: 0 }),
      /Capacity must be a whole number greater than 0/,
    );
    assert.match(
      getShelterFormValidationError({ ...validForm, occupancy: 0, occupancyText: " " }),
      /Current occupancy is required/,
    );
    assert.match(
      getShelterFormValidationError({ ...validForm, occupancy: -1 }),
      /Current occupancy must be a whole number/,
    );
    assert.match(
      getShelterFormValidationError({ ...validForm, occupancy: 101 }),
      /cannot exceed capacity/,
    );
  });

  it("does not require a name or capacity when updating an existing shelter", () => {
    assert.equal(
      getShelterFormValidationError({
        ...validForm,
        mode: "update",
        name: "",
        capacity: 0,
        maximumCapacity: 100,
      }),
      null,
    );
  });
});

describe("admin shelter review and save workflow", () => {
  it("moves through edit, review, saving, and completion only after confirmation", () => {
    const review = nextShelterFormStage("editing", "valid-submit");
    assert.equal(review, "review");
    assert.equal(nextShelterFormStage(review, "confirm-save"), "saving");
    assert.equal(nextShelterFormStage("saving", "save-success"), "complete");
  });

  it("returns to editing after a save failure and lets the user revise a review", () => {
    assert.equal(nextShelterFormStage("saving", "save-failure"), "editing");
    assert.equal(nextShelterFormStage("review", "back-to-edit"), "editing");
  });

  it("does not let an invalid event skip the review step", () => {
    assert.equal(nextShelterFormStage("editing", "confirm-save"), "editing");
    assert.equal(nextShelterFormStage("review", "save-success"), "review");
  });
});

describe("admin offline shelter update queue rules", () => {
  const item = (shelterId, queueId, changes) => ({
    shelterId,
    queueId,
    changes,
    queuedAt: "2026-10-09T00:00:00.000Z",
  });

  it("coalesces updates for one shelter and preserves unrelated queued updates", () => {
    const initial = [
      item("shelter-a", "queue-a", { occupancy: 10, remarks: "Original note" }),
      item("shelter-b", "queue-b", { occupancy: 20 }),
    ];
    const updated = upsertShelterQueueItem(
      initial,
      item("shelter-a", "queue-new", { occupancy: 15 }),
    );

    assert.equal(updated.length, 2);
    assert.equal(updated[0].queueId, "queue-a");
    assert.deepEqual(updated[0].changes, { occupancy: 15, remarks: "Original note" });
    assert.equal(updated[1].shelterId, "shelter-b");
  });

  it("removes only the selected queued update", () => {
    const initial = [item("shelter-a", "queue-a", {}), item("shelter-b", "queue-b", {})];
    assert.deepEqual(removeShelterQueueItem(initial, "queue-a"), [initial[1]]);
  });

  it("retries network and server failures but leaves client errors for correction", () => {
    assert.equal(shouldRetryShelterUpdate(null), true);
    assert.equal(shouldRetryShelterUpdate(503), true);
    assert.equal(shouldRetryShelterUpdate(400), false);
    assert.equal(shouldRetryShelterUpdate(404), false);
  });
});
