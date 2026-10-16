import Image from "next/image";
import { verificationStyles as ui } from "@/src/components/verification/verificationStyles";
import { photoUrl } from "@/src/services/api/verificationApi";
import { describeLocation, formatDateTime } from "@/src/utils/verification";
import SeverityBadge from "./SeverityBadge";
import StatusBadge from "./StatusBadge";

// Evidence links come from citizens, so only plain web links are rendered as clickable
function isWebLink(url) {
  try {
    return ["http:", "https:"].includes(new URL(url).protocol);
  } catch {
    return false;
  }
}

function mapLink(location) {
  if (!Number.isFinite(location?.latitude) || !Number.isFinite(location?.longitude)) return null;
  return `https://www.openstreetmap.org/?mlat=${location.latitude}&mlon=${location.longitude}#map=15/${location.latitude}/${location.longitude}`;
}

export default function ReportEvidence({ report }) {
  const reporterName =
    report.reportedBy && typeof report.reportedBy === "object"
      ? report.reportedBy.name
      : report.reportedBy
        ? "Registered user"
        : "Anonymous";
  const osmLink = mapLink(report.location);

  return (
    <section className={`${ui.card} space-y-5 p-5`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[#6B7C8F]">{report.reportId}</p>
          <h2 className="mt-1 flex flex-wrap items-center gap-2 text-2xl font-bold text-[#16283D]">
            {report.hazardType}
            <SeverityBadge severity={report.severity} />
          </h2>
          <p className={`mt-1 text-sm ${ui.muted}`}>
            Submitted {formatDateTime(report.createdAt)} by {reporterName}
          </p>
        </div>
        <StatusBadge status={report.status} />
      </div>

      <div>
        <h3 className="text-sm font-semibold text-[#16283D]">Description</h3>
        <p className="mt-1 whitespace-pre-line text-[#16283D]">{report.description}</p>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-[#16283D]">Location</h3>
        <p className="mt-1 text-[#16283D]">{describeLocation(report.location)}</p>
        {osmLink ? (
          <a href={osmLink} target="_blank" rel="noreferrer" className={`${ui.secondaryLink} text-sm`}>
            Open on map ↗
          </a>
        ) : null}
      </div>

      <div>
        <h3 className="text-sm font-semibold text-[#16283D]">Photo evidence</h3>
        {report.photoFileId ? (
          <a href={photoUrl(report.photoFileId)} target="_blank" rel="noreferrer">
            <Image
              src={photoUrl(report.photoFileId)}
              alt={`Photo submitted with ${report.reportId}`}
              width={800}
              height={600}
              unoptimized
              className="mt-2 max-h-96 w-auto rounded-xl border border-[#DDE5EE] object-contain"
            />
          </a>
        ) : (
          <p className={`mt-1 text-sm ${ui.muted}`}>No photo attached.</p>
        )}
        {report.evidence?.length ? (
          <ul className="mt-3 space-y-1 text-sm">
            {report.evidence.map((item, index) => (
              <li key={`${item.url}-${index}`}>
                {isWebLink(item.url) ? (
                  <a href={item.url} target="_blank" rel="noreferrer" className={ui.secondaryLink}>
                    Evidence {index + 1} ({item.type}) ↗
                  </a>
                ) : (
                  <span className={ui.muted}>
                    Evidence {index + 1} ({item.type}): {item.url}
                  </span>
                )}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}
