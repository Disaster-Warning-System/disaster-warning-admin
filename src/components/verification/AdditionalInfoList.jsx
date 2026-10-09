import Image from "next/image";
import { verificationStyles as ui } from "@/src/components/verification/verificationStyles";
import { photoUrl } from "@/src/services/api/verificationApi";
import { formatDateTime } from "@/src/utils/verification";

/** The citizen's replies to "Needs More Information" requests, oldest first. */
export default function AdditionalInfoList({ items }) {
  if (!items?.length) return null;
  return (
    <section className={`${ui.card} p-5`}>
      <h2 className="text-lg font-bold text-[#16283D]">Citizen replies</h2>
      <ol className="mt-3 space-y-3">
        {items.map((item, index) => (
          <li key={`${item.addedAt}-${index}`} className="rounded-xl border border-sky-200 bg-sky-50 p-3">
            <p className="text-xs font-semibold text-sky-800">{formatDateTime(item.addedAt)}</p>
            <p className="mt-1 whitespace-pre-line text-sm text-[#16283D]">{item.message}</p>
            {item.photoFileId ? (
              <a href={photoUrl(item.photoFileId)} target="_blank" rel="noreferrer">
                <Image
                  src={photoUrl(item.photoFileId)}
                  alt={`Photo sent with reply ${index + 1}`}
                  width={480}
                  height={360}
                  unoptimized
                  className="mt-2 max-h-60 w-auto rounded-lg border border-sky-200 object-contain"
                />
              </a>
            ) : null}
          </li>
        ))}
      </ol>
    </section>
  );
}
