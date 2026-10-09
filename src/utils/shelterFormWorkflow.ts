export type ShelterFormStage = "editing" | "review" | "saving" | "complete";
export type ShelterFormAction =
  | "valid-submit"
  | "confirm-save"
  | "save-success"
  | "save-failure"
  | "back-to-edit";

/** Restrict the form to the intended edit, review, save, and completion sequence. */
export function nextShelterFormStage(
  stage: ShelterFormStage,
  action: ShelterFormAction,
): ShelterFormStage {
  if (stage === "editing" && action === "valid-submit") return "review";
  if (stage === "review" && action === "confirm-save") return "saving";
  if (stage === "saving" && action === "save-success") return "complete";
  if (stage === "saving" && action === "save-failure") return "editing";
  if (stage === "review" && action === "back-to-edit") return "editing";
  return stage;
}
