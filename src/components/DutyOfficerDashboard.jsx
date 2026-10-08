"use client";

import axios from "axios";
import { useState } from "react";

const ALERTS_URL = "http://localhost:5000/api/alerts";

const areaOptions = [
  { label: "Colombo", value: "Colombo" },
  { label: "Gampaha", value: "Gampaha" },
  { label: "Kelani Basin", value: "Kelani River Basin" },
];

const channelOptions = ["SMS", "Push"];
const severityOptions = ["Advisory", "Watch", "Warning", "Evacuation Order"];

const initialFormData = {
  headline: "",
  instruction: "",
  severity: "Warning",
  targetAreas: [],
  channels: [],
};

export default function DutyOfficerDashboard() {
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  const handleTextChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleCheckboxChange = (event) => {
    const { checked, name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: checked
        ? [...current[name], value]
        : current[name].filter((item) => item !== value),
    }));
  };

  const handleReview = (event) => {
    event.preventDefault();

    const nextErrors = {};
    if (!formData.headline.trim()) nextErrors.headline = "Headline is required.";
    if (!formData.instruction.trim()) {
      nextErrors.instruction = "Instruction is required.";
    }
    if (!formData.severity) nextErrors.severity = "Select a severity.";
    if (formData.targetAreas.length === 0) {
      nextErrors.targetAreas = "Select at least one target area.";
    }
    if (formData.channels.length === 0) {
      nextErrors.channels = "Select at least one delivery channel.";
    }

    setErrors(nextErrors);
    setMessage(null);

    if (Object.keys(nextErrors).length === 0) {
      setIsPreviewOpen(true);
    }
  };

  const handleConfirmDispatch = async () => {
    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await axios.post(ALERTS_URL, formData);
      const alert = response.data.alert;
      const isPartial = alert?.status === "Partially Dispatched";

      setMessage({
        type: isPartial ? "warning" : "success",
        text: isPartial
          ? `Alert ${alert.alertId} was created, but one or more delivery channels failed.`
          : `Alert ${alert.alertId} was broadcast successfully.`,
      });
      setIsPreviewOpen(false);
      setFormData(initialFormData);
      setErrors({});
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error.response?.data?.message ||
          "Unable to broadcast the alert. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <header className="mb-7">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-700">
            Disaster Management System
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
            Duty Officer Dashboard
          </h1>
          <p className="mt-2 text-slate-600">
            Monitor the current incident and coordinate a public hazard alert.
          </p>
        </header>

        {message && (
          <div
            className={`mb-6 rounded-lg border px-4 py-3 text-sm ${
              message.type === "success"
                ? "border-green-200 bg-green-50 text-green-800"
                : message.type === "warning"
                  ? "border-amber-300 bg-amber-50 text-amber-900"
                  : "border-red-200 bg-red-50 text-red-800"
            }`}
            role={message.type === "error" ? "alert" : "status"}
          >
            {message.text}
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-5">
          <section
            aria-labelledby="incident-monitoring-title"
            className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:col-span-2"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Situational awareness
                </p>
                <h2
                  id="incident-monitoring-title"
                  className="mt-1 text-xl font-bold text-slate-950"
                >
                  Active Incident Monitoring
                </h2>
              </div>
              <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-red-800">
                Active
              </span>
            </div>

            <article className="mt-6 rounded-xl border border-red-200 bg-red-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-red-700">
                Current incident
              </p>
              <h3 className="mt-2 text-lg font-bold leading-snug text-slate-950">
                Incident: Kelani River Inundation
              </h3>
              <div className="mt-5 flex items-center justify-between gap-3 border-t border-red-200 pt-4">
                <span className="text-sm text-slate-600">Severity</span>
                <span className="rounded-md bg-red-600 px-2.5 py-1 text-sm font-bold text-white">
                  Warning
                </span>
              </div>
              <div className="mt-4 flex items-center justify-between gap-3">
                <span className="text-sm text-slate-600">
                  Verified Ground Reports
                </span>
                <span className="text-2xl font-bold tabular-nums text-slate-950">
                  12
                </span>
              </div>
            </article>

            <p className="mt-4 text-sm leading-6 text-slate-600">
              Use verified reports to guide warning severity and target-area
              selection.
            </p>
          </section>

          <section
            aria-labelledby="alert-composer-title"
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:col-span-3"
          >
            <div className="mb-6">
              <p className="text-sm font-medium text-blue-700">
                Public warning
              </p>
              <h2
                id="alert-composer-title"
                className="mt-1 text-xl font-bold text-slate-950"
              >
                Alert Composer
              </h2>
            </div>

            <form onSubmit={handleReview} noValidate className="space-y-5">
              <div>
                <label
                  htmlFor="headline"
                  className="mb-1.5 block text-sm font-semibold text-slate-800"
                >
                  Headline
                </label>
                <input
                  id="headline"
                  name="headline"
                  type="text"
                  value={formData.headline}
                  onChange={handleTextChange}
                  aria-invalid={Boolean(errors.headline)}
                  aria-describedby={errors.headline ? "headline-error" : undefined}
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  placeholder="e.g. Flood warning for Kelani River Basin"
                />
                {errors.headline && (
                  <p id="headline-error" className="mt-1 text-sm text-red-700">
                    {errors.headline}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="instruction"
                  className="mb-1.5 block text-sm font-semibold text-slate-800"
                >
                  Public instruction
                </label>
                <textarea
                  id="instruction"
                  name="instruction"
                  rows={4}
                  value={formData.instruction}
                  onChange={handleTextChange}
                  aria-invalid={Boolean(errors.instruction)}
                  aria-describedby={
                    errors.instruction ? "instruction-error" : undefined
                  }
                  className="w-full resize-y rounded-lg border border-slate-300 px-3.5 py-2.5 text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  placeholder="Describe the hazard and the actions residents should take."
                />
                {errors.instruction && (
                  <p
                    id="instruction-error"
                    className="mt-1 text-sm text-red-700"
                  >
                    {errors.instruction}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="severity"
                  className="mb-1.5 block text-sm font-semibold text-slate-800"
                >
                  Severity
                </label>
                <select
                  id="severity"
                  name="severity"
                  value={formData.severity}
                  onChange={handleTextChange}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                >
                  {severityOptions.map((severity) => (
                    <option key={severity} value={severity}>
                      {severity}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <fieldset>
                  <legend className="text-sm font-semibold text-slate-800">
                    Target areas
                  </legend>
                  <div className="mt-3 space-y-2.5">
                    {areaOptions.map((area) => (
                      <label
                        key={area.value}
                        className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-700"
                      >
                        <input
                          type="checkbox"
                          name="targetAreas"
                          value={area.value}
                          checked={formData.targetAreas.includes(area.value)}
                          onChange={handleCheckboxChange}
                          className="h-4 w-4 rounded border-slate-300 accent-blue-700 focus:ring-blue-600"
                        />
                        {area.label}
                      </label>
                    ))}
                  </div>
                  {errors.targetAreas && (
                    <p className="mt-2 text-sm text-red-700" role="alert">
                      {errors.targetAreas}
                    </p>
                  )}
                </fieldset>

                <fieldset>
                  <legend className="text-sm font-semibold text-slate-800">
                    Delivery channels
                  </legend>
                  <div className="mt-3 space-y-2.5">
                    {channelOptions.map((channel) => (
                      <label
                        key={channel}
                        className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-700"
                      >
                        <input
                          type="checkbox"
                          name="channels"
                          value={channel}
                          checked={formData.channels.includes(channel)}
                          onChange={handleCheckboxChange}
                          className="h-4 w-4 rounded border-slate-300 accent-blue-700 focus:ring-blue-600"
                        />
                        {channel}
                      </label>
                    ))}
                  </div>
                  {errors.channels && (
                    <p className="mt-2 text-sm text-red-700" role="alert">
                      {errors.channels}
                    </p>
                  )}
                </fieldset>
              </div>

              <div className="border-t border-slate-200 pt-5">
                <button
                  type="submit"
                  className="w-full rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                >
                  Review &amp; Dispatch
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>

      {isPreviewOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/65 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !isSubmitting) {
              setIsPreviewOpen(false);
            }
          }}
        >
          <section
            aria-labelledby="dispatch-preview-title"
            aria-modal="true"
            className="my-auto w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl sm:p-8"
            role="dialog"
          >
            <p className="text-sm font-semibold uppercase tracking-wider text-red-700">
              Review before broadcast
            </p>
            <h2
              id="dispatch-preview-title"
              className="mt-2 text-2xl font-bold text-slate-950"
            >
              Confirm hazard alert
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              This alert will be sent to residents in the selected areas using
              the chosen delivery channels.
            </p>

            <dl className="mt-6 space-y-4 rounded-xl bg-slate-50 p-4">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Headline
                </dt>
                <dd className="mt-1 break-words font-semibold text-slate-900">
                  {formData.headline}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Instruction
                </dt>
                <dd className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-slate-800">
                  {formData.instruction}
                </dd>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Severity
                  </dt>
                  <dd className="mt-1 font-semibold text-slate-900">
                    {formData.severity}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Target areas
                  </dt>
                  <dd className="mt-1 text-sm text-slate-800">
                    {areaOptions
                      .filter((area) =>
                        formData.targetAreas.includes(area.value),
                      )
                      .map((area) => area.label)
                      .join(", ")}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Channels
                  </dt>
                  <dd className="mt-1 text-sm text-slate-800">
                    {formData.channels.join(", ")}
                  </dd>
                </div>
              </div>
            </dl>

            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setIsPreviewOpen(false)}
                disabled={isSubmitting}
                className="rounded-lg border border-slate-300 px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDispatch}
                disabled={isSubmitting}
                className="rounded-lg bg-red-700 px-5 py-3 font-bold text-white shadow-sm transition hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "BROADCASTING..." : "CONFIRM & BROADCAST NOW"}
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
