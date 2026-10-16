"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { getShelterImageUrl } from "@/src/services/api/shelterApi";
import { shelterStyles as ui } from "@/src/components/shelters/shelterStyles";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

type Props = {
  imageId?: string | null;
  selectedFile: File | null;
  onFileChange: (file: File | null) => void;
  removeImage: boolean;
  onRemoveChange: (remove: boolean) => void;
};

export default function ShelterImageField({
  imageId,
  selectedFile,
  onFileChange,
  removeImage,
  onRemoveChange,
}: Props) {
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<{ file: File; url: string } | null>(null);

  useEffect(() => {
    if (!selectedFile) return;
    const objectUrl = URL.createObjectURL(selectedFile);
    // Wait one frame before publishing the derived preview state to avoid a synchronous effect update.
    const frame = window.requestAnimationFrame(() => {
      setPreview({ file: selectedFile, url: objectUrl });
    });
    return () => {
      window.cancelAnimationFrame(frame);
      URL.revokeObjectURL(objectUrl);
    };
  }, [selectedFile]);

  function selectFile(file?: File) {
    setError("");
    if (!file) return;
    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      setError("Unsupported image type. Choose a JPG, PNG, or WebP file.");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setError("Image is larger than 5 MB. Choose a smaller file.");
      return;
    }
    onFileChange(file);
    onRemoveChange(false);
  }

  const previewUrl = selectedFile && preview?.file === selectedFile ? preview.url : "";
  const imageSource = previewUrl || (imageId ? getShelterImageUrl(imageId) : "");

  return (
    <fieldset className="space-y-3">
      <legend className={ui.label}>Shelter photo <span className={`font-normal ${ui.muted}`}>(optional, JPG/PNG/WebP up to 5 MB)</span></legend>
      {imageSource && !removeImage ? (
        <div className="relative h-52 w-full overflow-hidden rounded-xl border border-[#DDE5EE] bg-[#F5F7FA] sm:h-64">
          <Image src={imageSource} alt="Shelter preview" fill unoptimized className="object-cover" sizes="(max-width: 640px) 100vw, 640px" />
        </div>
      ) : null}
      {removeImage ? <p className={`text-sm ${ui.muted}`}>The current photo will be removed when you save.</p> : null}
      <label className={ui.label}>
        {imageId || selectedFile ? "Replace photo" : "Choose photo"}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(event) => selectFile(event.currentTarget.files?.[0])}
          className="mt-2 block min-h-11 w-full rounded-xl border border-[#DDE5EE] bg-white p-2 text-sm text-[#16283D] file:mr-3 file:min-h-9 file:rounded-lg file:border-0 file:bg-[#E8F2FC] file:px-3 file:font-semibold file:text-[#1877B9]"
        />
      </label>
      {(selectedFile || removeImage) ? (
        <button
          type="button"
          onClick={() => {
            onFileChange(null);
            onRemoveChange(Boolean(imageId) && !removeImage);
          }}
          className="min-h-10 rounded-lg px-3 text-sm font-semibold text-[#1877B9] hover:bg-[#E8F2FC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1877B9]"
        >
          {removeImage ? "Keep current photo" : imageId ? "Remove photo" : "Clear selected photo"}
        </button>
      ) : null}
      {error ? <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
    </fieldset>
  );
}
