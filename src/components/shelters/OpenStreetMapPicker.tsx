"use client";

import { useEffect, useRef, useState } from "react";
import type { Map as LeafletMap, Marker as LeafletMarker } from "leaflet";
import type { ShelterLocationPoint } from "@/src/types/shelter";
import { shelterStyles as ui } from "@/src/components/shelters/shelterStyles";

type Props = {
  value: ShelterLocationPoint | null;
  onChange: (point: ShelterLocationPoint | null) => void;
};

const SRI_LANKA_CENTER: [number, number] = [7.8731, 80.7718];

export default function OpenStreetMapPicker({ value, onChange }: Props) {
  const mapElement = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<LeafletMarker | null>(null);
  const onChangeRef = useRef(onChange);
  const valueRef = useRef(value);
  const [latitude, setLatitude] = useState(value ? String(value.coordinates[1]) : "");
  const [longitude, setLongitude] = useState(value ? String(value.coordinates[0]) : "");
  const [mapError, setMapError] = useState("");

  // Keep Leaflet event callbacks current without rebuilding the map on each render.
  useEffect(() => {
    onChangeRef.current = onChange;
    valueRef.current = value;
  }, [onChange, value]);

  useEffect(() => {
    let active = true;
    let clickHandler: ((event: import("leaflet").LeafletMouseEvent) => void) | undefined;

    void import("leaflet").then((leafletModule) => {
      if (!active || !mapElement.current) return;
      const L = leafletModule.default;
      const selected = valueRef.current?.coordinates;
      const initialCenter: [number, number] = selected
        ? [selected[1], selected[0]]
        : SRI_LANKA_CENTER;
      const map = L.map(mapElement.current, {
        center: initialCenter,
        zoom: selected ? 15 : 7,
        scrollWheelZoom: true,
      });
      mapRef.current = map;

      // OpenStreetMap requires visible attribution for its map tiles.
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
        maxZoom: 19,
      }).addTo(map);

      const shelterIcon = L.divIcon({
        className: "shelter-map-marker",
        html: '<span aria-hidden="true"></span>',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const updateMarker = (latitudeValue: number, longitudeValue: number, notify = true) => {
        const position: [number, number] = [latitudeValue, longitudeValue];
        if (markerRef.current) markerRef.current.setLatLng(position);
        else {
          markerRef.current = L.marker(position, { icon: shelterIcon, draggable: true }).addTo(map);
          markerRef.current.on("dragend", () => {
            const markerPosition = markerRef.current?.getLatLng();
            if (markerPosition) {
              setLatitude(String(markerPosition.lat));
              setLongitude(String(markerPosition.lng));
              onChangeRef.current({
                type: "Point",
                coordinates: [markerPosition.lng, markerPosition.lat],
              });
            }
          });
        }
        setLatitude(String(latitudeValue));
        setLongitude(String(longitudeValue));
        if (notify) {
          // MongoDB GeoJSON stores the selected point as [longitude, latitude].
          onChangeRef.current({ type: "Point", coordinates: [longitudeValue, latitudeValue] });
        }
      };

      if (selected) updateMarker(selected[1], selected[0], false);
      clickHandler = (event) => updateMarker(event.latlng.lat, event.latlng.lng);
      map.on("click", clickHandler);
    }).catch(() => {
      setMapError("The map could not load. Check your internet connection; you can still enter coordinates below.");
    });

    return () => {
      active = false;
      if (mapRef.current && clickHandler) mapRef.current.off("click", clickHandler);
      mapRef.current?.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  const selectedLatitude = value?.coordinates[1];
  const selectedLongitude = value?.coordinates[0];

  useEffect(() => {
    if (selectedLatitude === undefined || selectedLongitude === undefined) {
      markerRef.current?.remove();
      markerRef.current = null;
      return;
    }
    if (!markerRef.current) return;
    const selected: [number, number] = [selectedLatitude, selectedLongitude];
    markerRef.current.setLatLng(selected);
    mapRef.current?.panTo(selected);
  }, [selectedLatitude, selectedLongitude]);

  function updateManualCoordinate(nextLatitude: string, nextLongitude: string) {
    setLatitude(nextLatitude);
    setLongitude(nextLongitude);
    if (!nextLatitude.trim() || !nextLongitude.trim()) {
      onChange(null);
      return;
    }
    const parsedLatitude = Number(nextLatitude);
    const parsedLongitude = Number(nextLongitude);
    if (
      !Number.isFinite(parsedLatitude) || parsedLatitude < -90 || parsedLatitude > 90 ||
      !Number.isFinite(parsedLongitude) || parsedLongitude < -180 || parsedLongitude > 180
    ) {
      onChange(null);
      return;
    }
    onChange({ type: "Point", coordinates: [parsedLongitude, parsedLatitude] });
  }

  return (
    <fieldset className="space-y-2">
      <legend className={ui.label}>OpenStreetMap shelter location</legend>
      <p className={`text-sm ${ui.muted}`}>
        Click the shelter on the map or drag the pin to adjust its position. You can also enter coordinates below.
      </p>
      {mapError ? <p role="status" className={`text-sm ${ui.muted}`}>{mapError}</p> : null}
      <div
        ref={mapElement}
        className="shelter-map h-60 w-full overflow-hidden rounded-xl border border-[#DDE5EE] bg-[#F5F7FA] sm:h-80"
        aria-label="OpenStreetMap. Click to select the shelter location."
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <CoordinateField
          label="Latitude"
          value={latitude}
          onChange={(next) => updateManualCoordinate(next, longitude)}
          placeholder="e.g. 6.9271"
        />
        <CoordinateField
          label="Longitude"
          value={longitude}
          onChange={(next) => updateManualCoordinate(latitude, next)}
          placeholder="e.g. 79.8612"
        />
      </div>
      {value ? (
        <p className={`text-xs ${ui.muted}`}>
          Selected coordinates: {value.coordinates[1].toFixed(6)}, {value.coordinates[0].toFixed(6)}
        </p>
      ) : null}
    </fieldset>
  );
}

function CoordinateField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <label className={ui.label}>
      {label}
      <input
        type="text"
        inputMode="decimal"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={ui.input}
      />
    </label>
  );
}





