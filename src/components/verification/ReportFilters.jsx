"use client";

import { useState } from "react";
import { shelterStyles as ui } from "@/src/components/shelters/shelterStyles";
import { HAZARD_TYPES, REPORT_STATUS, REPORT_STATUSES } from "@/src/utils/verification";

const STATUS_LABELS = {
  [REPORT_STATUS.PENDING]: "Pending",
  [REPORT_STATUS.NEEDS_INFO]: "Waiting on citizen",
  [REPORT_STATUS.VERIFIED]: "Verified",
  [REPORT_STATUS.REJECTED]: "Rejected",
};

const TAB_ORDER = [
  REPORT_STATUS.PENDING,
  REPORT_STATUS.NEEDS_INFO,
  REPORT_STATUS.VERIFIED,
  REPORT_STATUS.REJECTED,
].filter((status) => REPORT_STATUSES.includes(status));

const selectClass =
  "mt-1 block min-h-11 w-full rounded-xl border border-[#DDE5EE] bg-white px-3 text-sm text-[#16283D] outline-none focus:border-[#1877B9] focus:ring-2 focus:ring-[#1877B9]/20";

/** filters: { status, hazardType, district, search, sort }. onChange receives the changed fields. */
export default function ReportFilters({ filters, onChange }) {
  const [district, setDistrict] = useState(filters.district);
  const [search, setSearch] = useState(filters.search);

  function submitText(event) {
    event.preventDefault();
    onChange({ district: district.trim(), search: search.trim() });
  }

  return (
    <div className="space-y-4">
      <div role="tablist" aria-label="Report status" className="flex flex-wrap gap-2">
        {TAB_ORDER.map((status) => {
          const selected = filters.status === status;
          return (
            <button
              key={status}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => onChange({ status })}
              className={`min-h-10 rounded-full px-4 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1877B9] ${
                selected
                  ? "bg-[#1877B9] text-white"
                  : "border border-[#DDE5EE] bg-white text-[#16283D] hover:border-[#1877B9]"
              }`}
            >
              {STATUS_LABELS[status]}
            </button>
          );
        })}
      </div>

      <form
        onSubmit={submitText}
        className={`${ui.card} grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1.4fr_1fr_auto] lg:items-end`}
      >
        <label className={ui.label}>
          Hazard type
          <select
            value={filters.hazardType}
            onChange={(event) => onChange({ hazardType: event.target.value })}
            className={selectClass}
          >
            <option value="">All types</option>
            {HAZARD_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>
        <label className={ui.label}>
          District
          <input
            value={district}
            onChange={(event) => setDistrict(event.target.value)}
            placeholder="e.g. Kandy"
            className={ui.input}
          />
        </label>
        <label className={ui.label}>
          Search
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Report ID or description"
            className={ui.input}
          />
        </label>
        <label className={ui.label}>
          Sort by
          <select
            value={filters.sort}
            onChange={(event) => onChange({ sort: event.target.value })}
            className={selectClass}
          >
            <option value="newest">Newest first</option>
            <option value="severity">Highest severity first</option>
          </select>
        </label>
        <button type="submit" className={ui.primaryButton}>
          Apply
        </button>
      </form>
    </div>
  );
}
