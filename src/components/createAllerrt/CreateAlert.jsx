"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getOfficerReport } from "../../services/api/officerReportApi";
import {
  AREA_OPTIONS,
  CHANNEL_OPTIONS,
  LANGUAGE_OPTIONS,
  SEVERITY_OPTIONS,
  TARGET_MODE_OPTIONS,
  deleteWarningDraft,
  getWarning,
  getWarningDraft,
  getWarningDrafts,
  previewWarning,
  saveWarningDraft,
  submitWarning,
  validateWarningForm,
} from "../../services/api/warningApi";

const initialForm = {
  hazardType: "Flood",
  headline: "",
  instructions: "",
  severity: "Warning",
  targetMode: "District",
  targetAreas: [],
  languages: ["English"],
  channels: ["SMS", "Push"],
  sourceReportId: "",
  supersedesAlertId: "",
};

const severityStyles = {
  Advisory: "border-[#A8C6DA] bg-[#F1F8FC] text-[#17618F]",
  Watch: "border-[#E8C97A] bg-[#FFF8E8] text-[#8B6510]",
  Warning: "border-[#E9B18B] bg-[#FFF2EC] text-[#A94819]",
  "Evacuation Order": "border-[#E0A0A8] bg-[#FFF0F2] text-[#9D2636]",
};

function StepIndicator({ step }) {
  return (
    <ol className="flex items-center gap-2" aria-label="Warning workflow steps">
      {["Target & severity", "Compose warning", "Review & dispatch"].map((label, index) => {
        const number = index + 1;
        const active = step === number;
        const complete = step > number;
        return (
          <li key={label} className="flex items-center gap-2">
            <span
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                active || complete ? "bg-[#2378B9] text-white" : "bg-[#E7EEF5] text-[#6C7D8E]"
              }`}
            >
              {complete ? "✓" : number}
            </span>
            <span className={`hidden text-xs font-semibold sm:inline ${active ? "text-[#17243A]" : "text-[#7B8998]"}`}>
              {label}
            </span>
            {number < 3 && <span className="mx-1 hidden h-px w-6 bg-[#D9E3EC] sm:block" />}
          </li>
        );
      })}
    </ol>
  );
}

function FieldError({ children }) {
  return children ? <p className="mt-1 text-sm text-[#B42318]" role="alert">{children}</p> : null;
}

function CreateAlert() {
  const searchParams = useSearchParams();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sourceReport, setSourceReport] = useState(null);
  const [acknowledged, setAcknowledged] = useState(false);
  const [warningPreview, setWarningPreview] = useState(null);
  const [minimumAcknowledged, setMinimumAcknowledged] = useState(false);
  const [conflictAcknowledged, setConflictAcknowledged] = useState(false);
  const [draftId, setDraftId] = useState("");
  const [drafts, setDrafts] = useState([]);
  const [selectedDraftId, setSelectedDraftId] = useState("");
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);

  const availableAreas = AREA_OPTIONS[form.targetMode] || [];
  const recipientCount = warningPreview?.recipientCount ?? 0;

  useEffect(() => {
    getWarningDrafts().then(setDrafts).catch(() => {});
    const draftIdParam = searchParams.get("draftId");
    if (draftIdParam) {
      let active = true;
      getWarningDraft(draftIdParam)
        .then((draft) => {
          if (!active) return;
          setDraftId(draft.alertId);
          setForm({ ...initialForm, ...draft, instructions: draft.instructions || draft.instruction || "", channels: draft.channels || draft.selectedDeliveryChannels || [] });
        })
        .catch(() => { if (active) setErrors({ draft: "Unable to load this saved draft." }); });
      return () => { active = false; };
    }

    const supersedesAlertId = searchParams.get("supersedesAlertId");
    if (supersedesAlertId) {
      let active = true;
      getWarning(supersedesAlertId)
        .then((alert) => {
          if (!active) return;
          setForm({
            ...initialForm,
            ...alert,
            instructions: alert.instructions || alert.instruction || "",
            channels: alert.channels || alert.selectedDeliveryChannels || [],
            sourceReportId: alert.sourceReportId || "",
            supersedesAlertId: alert.alertId,
          });
        })
        .catch(() => { if (active) setErrors({ sourceReport: "Unable to load the warning being updated." }); });
      return () => { active = false; };
    }

    const reportId = searchParams.get("reportId");
    if (!reportId) return;
    let active = true;
    getOfficerReport(reportId)
      .then((report) => {
        if (!active) return;
        if (report.status !== "Verified") {
          setErrors({ sourceReport: "Only verified reports can be used to issue a warning." });
          return;
        }
        const district = report.location?.district || report.district || "";
        setSourceReport(report);
        setForm((current) => ({
          ...current,
          sourceReportId: report._id,
          hazardType: report.hazardType || current.hazardType,
          headline: `${report.hazardType || "Hazard"} warning${district ? ` - ${district}` : ""}`,
          instructions: report.description || current.instructions,
          targetAreas: AREA_OPTIONS.District.includes(district) ? [district] : current.targetAreas,
          severity: report.severity === "High" ? "Warning" : report.severity === "Low" ? "Advisory" : "Watch",
        }));
      })
      .catch(() => {
        if (active) setErrors({ sourceReport: "Unable to load the source hazard report." });
      });
    return () => { active = false; };
  }, [searchParams]);

  const update = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
    setWarningPreview(null);
  };

  const toggleArea = (area) => {
    const next = form.targetAreas.includes(area)
      ? form.targetAreas.filter((item) => item !== area)
      : [...form.targetAreas, area];
    update("targetAreas", next);
  };

  const toggleValue = (field, value) => {
    const next = form[field].includes(value)
      ? form[field].filter((item) => item !== value)
      : [...form[field], value];
    update(field, next);
  };

  const goToCompose = () => {
    const validation = validateWarningForm(form, 1);
    setErrors(validation);
    if (Object.keys(validation).length === 0) {
      setNotice(null);
      setStep(2);
    }
  };

  const goToReview = async () => {
    const validation = validateWarningForm(form, 2);
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;
    setIsPreviewing(true);
    setNotice({ type: "loading", text: "Resolving registered recipients and checking recent warnings..." });
    try {
      const preview = await previewWarning(form);
      setWarningPreview(preview);
      setAcknowledged(false);
      setMinimumAcknowledged(false);
      setConflictAcknowledged(false);
      setNotice(null);
      if (preview.noRecipients) {
        setStep(1);
        setNotice({ type: "error", text: "No registered recipients match these areas. Choose another target area before continuing." });
        return;
      }
      setStep(3);
    } catch (error) {
      setNotice({ type: "error", text: error.response?.data?.message || "Unable to resolve the recipients. Please try again." });
    } finally {
      setIsPreviewing(false);
    }
  };

  const saveDraft = async () => {
    if (isSavingDraft) return;
    setIsSavingDraft(true);
    try {
      const draft = await saveWarningDraft(form, draftId || undefined);
      setDraftId(draft.alertId);
      setDrafts(await getWarningDrafts());
      setNotice({ type: "success", text: "Draft saved to the server. No notifications were sent." });
    } catch (error) {
      setNotice({ type: "error", text: error.response?.data?.message || "Unable to save this draft." });
    } finally {
      setIsSavingDraft(false);
    }
  };

  const loadSelectedDraft = async (id) => {
    if (!id) return;
    try {
      const draft = await getWarningDraft(id);
      setDraftId(draft.alertId);
      setForm({ ...initialForm, ...draft, instructions: draft.instructions || draft.instruction || "", channels: draft.channels || draft.selectedDeliveryChannels || [] });
      setNotice({ type: "success", text: "Draft loaded. Review all fields before dispatch." });
    } catch (error) {
      setNotice({ type: "error", text: error.response?.data?.message || "Unable to load this draft." });
    }
  };

  const dispatchWarning = async () => {
    if (!acknowledged || isSubmitting) return;
    const validation = validateWarningForm(form, 2);
    if (Object.keys(validation).length) {
      setErrors(validation);
      setStep(2);
      return;
    }
    setIsSubmitting(true);
    setNotice({ type: "loading", text: "Submitting warning and processing delivery channels..." });
    try {
      const response = await submitWarning({ ...form, minimumAcknowledged, conflictAcknowledged });
      const data = response.data;
      setNotice({
        type: data.status === "Failed" ? "error" : "success",
        text: `Warning ${data.alertId || "request"} processed with status: ${data.status}.`,
        data,
      });
      setAcknowledged(false);
      if (draftId) {
        await deleteWarningDraft(draftId).catch(() => {});
        setDraftId("");
        setDrafts((current) => current.filter((draft) => draft.alertId !== draftId));
      }
    } catch (error) {
      if (error.response?.data?.code === "LOW_RECIPIENT_COUNT") {
        setWarningPreview((current) => ({ ...current, belowMinimum: true, minimumRecipients: error.response.data.minimumRecipients, recipientCount: error.response.data.recipientCount }));
        setMinimumAcknowledged(false);
      }
      if (error.response?.data?.code === "CONFLICTING_WARNING") {
        setWarningPreview((current) => ({ ...current, conflicts: error.response.data.conflicts || [] }));
        setConflictAcknowledged(false);
      }
      setNotice({
        type: "error",
        text: error.response?.data?.message || "The warning could not be dispatched. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-65px)] bg-[#F4F7FB] px-4 py-6 text-[#17243A] sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl gap-5">
        <aside className="hidden w-52 shrink-0 rounded-xl border border-[#DDE5EE] bg-white p-3 lg:block">
          <p className="px-3 pb-4 text-xs font-bold uppercase tracking-[0.14em] text-[#2378B9]">DMC CORE</p>
          {["Dashboard", "Hazard reports", "Issue warning"].map((item) => (
            <div key={item} className={`mb-1 rounded-lg px-3 py-2.5 text-sm font-semibold ${item === "Issue warning" ? "bg-[#E8F2FA] text-[#176A9F]" : "text-[#64758A]"}`}>
              <span className="mr-2 text-[#2378B9]">•</span>{item}
            </div>
          ))}
          <div className="mt-5 border-t border-[#EDF1F5] pt-4 px-3 text-xs leading-5 text-[#8492A2]">
            Official warning workspace
          </div>
        </aside>

        <section className="min-w-0 flex-1">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#2378B9]">Warning operations</p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">Issue hazard warning</h1>
              <p className="mt-1 text-sm text-[#718096]">Prepare, verify, and release an official public warning.</p>
            </div>
            <StepIndicator step={step} />
          </div>

          {drafts.length > 0 && step === 1 && (
            <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-[#DDE5EE] bg-white p-3">
              <label htmlFor="saved-drafts" className="text-sm font-semibold">Saved drafts</label>
              <select id="saved-drafts" value={selectedDraftId} onChange={(event) => setSelectedDraftId(event.target.value)} className="input min-w-56 flex-1">
                <option value="">Choose a saved draft</option>
                {drafts.map((draft) => <option key={draft.alertId} value={draft.alertId}>{draft.headline || "Untitled draft"} · {draft.alertId}</option>)}
              </select>
              <button type="button" className="button-secondary" disabled={!selectedDraftId} onClick={() => loadSelectedDraft(selectedDraftId)}>Load draft</button>
            </div>
          )}

          {notice && (
            <div className={`mb-4 rounded-xl border p-4 text-sm ${notice.type === "error" ? "border-[#F1C4C4] bg-[#FFF5F5] text-[#9B1C1C]" : notice.type === "loading" ? "border-[#BBD9EC] bg-[#F0F8FD] text-[#17618F]" : "border-[#B9DEC9] bg-[#F1FBF5] text-[#176B3B]"}`} role={notice.type === "loading" ? "status" : "alert"}>
              <p className="font-semibold">{notice.text}</p>
              {notice.data?.deliveryLogs?.length ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {notice.data.deliveryLogs.map((log) => (
                    <div key={log.channel} className={`max-w-full rounded-md px-2 py-1 text-xs ${["Success", "Accepted"].includes(log.status) ? "bg-[#DDF4E6] text-[#176B3B]" : "bg-[#FCE1E1] text-[#9B1C1C]"}`}>
                      <p className="font-semibold">{log.channel}: {log.status} · {log.acceptedCount || 0} accepted · {log.attemptedCount || 0} attempted · {log.failedCount || 0} not delivered</p>
                      {log.reason && <p className="mt-1">{log.reason}</p>}
                      {log.providerResults?.filter((result) => result.error).map((result, index) => (
                        <p key={`${result.userId || "recipient"}-${index}`} className="mt-1">{result.error}</p>
                      ))}
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          )}

          {errors.sourceReport && <p className="mb-4 rounded-xl border border-[#F1C4C4] bg-[#FFF5F5] p-3 text-sm text-[#9B1C1C]" role="alert">{errors.sourceReport}</p>}
          {sourceReport && <p className="mb-4 rounded-xl border border-[#B9DEC9] bg-[#F1FBF5] p-3 text-sm text-[#176B3B]">Linked to verified report <strong>{sourceReport.reportId || sourceReport._id}</strong>.</p>}

          <div className="rounded-xl border border-[#DDE5EE] bg-white p-5 shadow-[0_2px_8px_rgb(23_36_58/4%)] sm:p-7">
            {step === 1 && (
              <section aria-labelledby="target-heading">
                <div className="mb-6 border-b border-[#EDF1F5] pb-4">
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#8291A1]">Step 1 of 3</p>
                  <h2 id="target-heading" className="mt-1 text-xl font-bold">Target area & severity configuration</h2>
                  <p className="mt-1 text-sm text-[#718096]">Define who should receive this warning before composing the message.</p>
                </div>
                <div className="grid gap-6 lg:grid-cols-2">
                  <div>
                    <label htmlFor="hazardType" className="mb-2 block text-sm font-semibold">Hazard type</label>
                    <select id="hazardType" value={form.hazardType} onChange={(event) => update("hazardType", event.target.value)} className="input">
                      {["Flood", "Landslide", "Cyclone", "Drought", "Tsunami", "Other"].map((item) => <option key={item}>{item}</option>)}
                    </select>
                  </div>
                  <div>
                    <span className="mb-2 block text-sm font-semibold">Severity level</span>
                    <div className="grid grid-cols-2 gap-2">
                      {SEVERITY_OPTIONS.map((severity) => (
                        <button type="button" key={severity} onClick={() => update("severity", severity)} className={`rounded-lg border px-3 py-2.5 text-left text-sm font-semibold ${form.severity === severity ? severityStyles[severity] : "border-[#DDE5EE] text-[#66778A] hover:border-[#AFC3D3]"}`} aria-pressed={form.severity === severity}>
                          {severity}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="lg:col-span-2">
                    <span className="mb-2 block text-sm font-semibold">Target by</span>
                    <div className="flex flex-wrap gap-2">
                      {TARGET_MODE_OPTIONS.map((mode) => <button type="button" key={mode} onClick={() => { update("targetMode", mode); update("targetAreas", []); }} className={`rounded-lg border px-4 py-2 text-sm font-semibold ${form.targetMode === mode ? "border-[#2378B9] bg-[#E8F2FA] text-[#176A9F]" : "border-[#DDE5EE] text-[#66778A]"}`}>{mode}</button>)}
                    </div>
                  </div>
                  <div className="lg:col-span-2">
                    <span className="mb-2 block text-sm font-semibold">Select target areas</span>
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {availableAreas.map((area) => <button type="button" key={area} onClick={() => toggleArea(area)} className={`rounded-lg border px-3 py-3 text-left text-sm ${form.targetAreas.includes(area) ? "border-[#2378B9] bg-[#F0F8FD] font-semibold text-[#176A9F]" : "border-[#DDE5EE] text-[#536579] hover:border-[#AFC3D3]"}`} aria-pressed={form.targetAreas.includes(area)}>{form.targetAreas.includes(area) ? "✓ " : ""}{area}</button>)}
                    </div>
                    <FieldError>{errors.targetAreas}</FieldError>
                    {form.targetAreas.length > 0 && <div className="mt-4 flex flex-wrap gap-2">{form.targetAreas.map((area) => <span key={area} className="rounded-full bg-[#E8F2FA] px-3 py-1.5 text-xs font-semibold text-[#176A9F]">{area} <button type="button" onClick={() => toggleArea(area)} aria-label={`Remove ${area}`}>×</button></span>)}</div>}
                  </div>
                </div>
                <div className="mt-6 flex items-center justify-between rounded-lg border border-[#DDE5EE] bg-[#F8FAFC] p-4">
                  <div><p className="text-sm font-semibold">Unique registered recipients</p><p className="text-xs text-[#8291A1]">Resolved from citizen and volunteer accounts during review.</p></div>
                  <strong className="text-2xl text-[#2378B9]">{warningPreview ? recipientCount.toLocaleString() : "—"}</strong>
                </div>
                <div className="mt-6 flex justify-end"><button type="button" onClick={goToCompose} className="button-primary">Continue to compose <span aria-hidden="true">→</span></button></div>
              </section>
            )}

            {step === 2 && (
              <section aria-labelledby="compose-heading">
                <div className="mb-6 border-b border-[#EDF1F5] pb-4"><p className="text-xs font-bold uppercase tracking-[0.12em] text-[#8291A1]">Step 2 of 3</p><h2 id="compose-heading" className="mt-1 text-xl font-bold">Compose official hazard warning</h2><p className="mt-1 text-sm text-[#718096]">Use clear, actionable language citizens can understand quickly.</p></div>
                <div className="space-y-5">
                  <div><label htmlFor="headline" className="mb-2 block text-sm font-semibold">Headline <span className="text-[#B42318]">*</span></label><input id="headline" maxLength={120} value={form.headline} onChange={(event) => update("headline", event.target.value)} className="input" placeholder="e.g. Flood warning for Colombo District" /><div className="flex justify-between"><FieldError>{errors.headline}</FieldError><span className="mt-1 text-xs text-[#8291A1]">{form.headline.length}/120</span></div></div>
                  <div><label htmlFor="instructions" className="mb-2 block text-sm font-semibold">Instructions <span className="text-[#B42318]">*</span></label><textarea id="instructions" maxLength={500} rows={6} value={form.instructions} onChange={(event) => update("instructions", event.target.value)} className="input resize-y" placeholder="Tell citizens what action to take and where to get help." /><div className="flex justify-between"><FieldError>{errors.instructions}</FieldError><span className="mt-1 text-xs text-[#8291A1]">{form.instructions.length}/500</span></div></div>
                  <div><span className="mb-2 block text-sm font-semibold">Languages</span><div className="flex flex-wrap gap-2">{LANGUAGE_OPTIONS.map((language) => <label key={language} className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm ${form.languages.includes(language) ? "border-[#2378B9] bg-[#F0F8FD] text-[#176A9F]" : "border-[#DDE5EE] text-[#66778A]"}`}><input type="checkbox" checked={form.languages.includes(language)} onChange={() => toggleValue("languages", language)} className="accent-[#2378B9]" />{language}</label>)}</div><FieldError>{errors.languages}</FieldError></div>
                  <div><span className="mb-2 block text-sm font-semibold">Delivery channels</span><div className="flex flex-wrap gap-2">{CHANNEL_OPTIONS.map((channel) => <label key={channel.value} className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm ${form.channels.includes(channel.value) ? "border-[#2378B9] bg-[#F0F8FD] text-[#176A9F]" : "border-[#DDE5EE] text-[#66778A]"}`}><input type="checkbox" checked={form.channels.includes(channel.value)} onChange={() => toggleValue("channels", channel.value)} className="accent-[#2378B9]" />{channel.label}</label>)}</div><FieldError>{errors.channels}</FieldError></div>
                </div>
                <div className="mt-7 flex flex-wrap justify-between gap-3"><button type="button" onClick={() => setStep(1)} className="button-secondary">Back</button><div className="flex gap-3"><button type="button" onClick={saveDraft} disabled={isSavingDraft} className="button-secondary">{isSavingDraft ? "Saving..." : "Save draft"}</button><button type="button" onClick={goToReview} disabled={isPreviewing} className="button-primary disabled:opacity-50">{isPreviewing ? "Resolving..." : "Review warning"}</button></div></div>
              </section>
            )}

            {step === 3 && (
              <section aria-labelledby="review-heading">
                <div className="mb-6 border-b border-[#EDF1F5] pb-4"><p className="text-xs font-bold uppercase tracking-[0.12em] text-[#8291A1]">Step 3 of 3</p><h2 id="review-heading" className="mt-1 text-xl font-bold">Review warning & confirm dispatch</h2><p className="mt-1 text-sm text-[#718096]">Confirm the complete message before it is sent to the selected channels.</p></div>
                <div className="rounded-xl border border-[#DDE5EE] bg-[#F8FAFC] p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.1em] text-[#8291A1]">{form.hazardType}</p><h3 className="mt-1 text-xl font-bold">{form.headline}</h3></div><span className={`rounded-full border px-3 py-1 text-xs font-bold ${severityStyles[form.severity]}`}>{form.severity}</span></div>
                  <p className="mt-5 whitespace-pre-wrap text-sm leading-6 text-[#3D4E62]">{form.instructions}</p>
                  <dl className="mt-5 grid gap-4 border-t border-[#DDE5EE] pt-4 sm:grid-cols-2"><div><dt className="text-xs font-semibold uppercase text-[#8291A1]">Target areas</dt><dd className="mt-1 text-sm font-semibold">{warningPreview?.targetAreas.join(", ") || form.targetAreas.join(", ")}</dd></div><div><dt className="text-xs font-semibold uppercase text-[#8291A1]">Unique registered recipients</dt><dd className="mt-1 text-sm font-semibold">{recipientCount.toLocaleString()} citizens</dd></div><div><dt className="text-xs font-semibold uppercase text-[#8291A1]">Languages</dt><dd className="mt-1 text-sm font-semibold">{form.languages.join(", ")}</dd></div><div><dt className="text-xs font-semibold uppercase text-[#8291A1]">Channels</dt><dd className="mt-1 text-sm font-semibold">{form.channels.map((channel) => CHANNEL_OPTIONS.find((item) => item.value === channel)?.label || channel).join(", ")}</dd></div></dl>
                </div>
                {warningPreview?.belowMinimum && <div className="mt-4 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900"><p>{recipientCount} recipients is below the configured minimum of {warningPreview.minimumRecipients} for {form.severity}.</p><label className="mt-2 flex gap-2"><input type="checkbox" checked={minimumAcknowledged} onChange={(event) => setMinimumAcknowledged(event.target.checked)} />I reviewed this and approve proceeding.</label></div>}
                {!!warningPreview?.conflicts?.length && <div className="mt-4 rounded-lg border border-orange-300 bg-orange-50 p-4 text-sm text-orange-950"><p className="font-semibold">Recent overlapping warnings:</p><ul className="mt-2 list-inside list-disc">{warningPreview.conflicts.map((item) => <li key={item.alertId}>{item.alertId}: {item.headline} ({item.severity}) — {item.targetAreas.join(", ")}</li>)}</ul><label className="mt-2 flex gap-2"><input type="checkbox" checked={conflictAcknowledged} onChange={(event) => setConflictAcknowledged(event.target.checked)} />I reviewed the existing warning and approve this follow-up.</label></div>}
                <label className="mt-6 flex cursor-pointer gap-3 rounded-lg border border-[#DDE5EE] p-4 text-sm leading-6"><input type="checkbox" checked={acknowledged} onChange={(event) => setAcknowledged(event.target.checked)} className="mt-1 h-4 w-4 accent-[#2378B9]" />I confirm that this warning has been reviewed and is ready to be dispatched to the selected recipients.</label>
                <p className="mt-3 text-xs text-[#718096]">Provider acceptance confirms the service accepted the request; it does not confirm delivery to or display on a phone.</p>
                <div className="mt-7 flex flex-wrap justify-between gap-3"><button type="button" onClick={() => setStep(2)} className="button-secondary" disabled={isSubmitting}>Edit warning</button><button type="button" onClick={dispatchWarning} disabled={!acknowledged || (warningPreview?.belowMinimum && !minimumAcknowledged) || (!!warningPreview?.conflicts?.length && !conflictAcknowledged) || isSubmitting} className="button-primary disabled:cursor-not-allowed disabled:opacity-50">{isSubmitting ? "Dispatching..." : "Confirm & dispatch"}</button></div>
              </section>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

export default CreateAlert;
