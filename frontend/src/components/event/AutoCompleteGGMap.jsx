// import React, { useState, useRef } from "react";
// import { Autocomplete, useJsApiLoader } from "@react-google-maps/api";

// // ✅ Fix: move libraries array outside component
// const LIBRARIES = ["places"];

// export default function NewAutoComplete({ setAddress, setLat, setLng }) {
//   const [autocomplete, setAutocomplete] = useState(null);
//   const inputRef = useRef(null);

//   const { isLoaded } = useJsApiLoader({
//     googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
//     libraries: LIBRARIES,
//   });

//   const onLoad = (autoC) => {
//     setAutocomplete(autoC);
//   };

//   const onPlaceChanged = () => {
//     if (!autocomplete) {
//       console.warn("Autocomplete not loaded");
//       return;
//     }

//     const place = autocomplete.getPlace();
//     if (place?.geometry) {
//       setAddress(place.formatted_address || place.name);
//       setLat(place.geometry.location.lat());
//       setLng(place.geometry.location.lng());
//     } else {
//       console.warn("Place has no geometry");
//     }
//   };

//   if (!isLoaded) return <p>Loading Google Maps...</p>;

//   return (
//     <div className="w-100">
//       <Autocomplete onLoad={onLoad} onPlaceChanged={onPlaceChanged}>
//         <input
//           ref={inputRef}
//           type="text"
//           placeholder="Enter address"
//           className="form-control shadow-sm rounded-pill px-4 py-2"
//           style={{
//             border: '1px solid #ccc',
//             fontSize: '1rem',
//             outline: 'none',
//             width: '100%',
//           }}
//         />
//       </Autocomplete>
//     </div>
//   );
// }

import React, { useEffect, useRef, useState } from "react";

const MIN_QUERY_LENGTH = 3;
const DEBOUNCE_MS = 200;
const RESULT_LIMIT = 5;

export default function NewAutoComplete({
  setAddress,
  setLat,
  setLng,
}) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasFetched, setHasFetched] = useState(false);
  const [selected, setSelected] = useState(false);

  const abortControllerRef = useRef(null);
  const containerRef = useRef(null);

  const API_KEY = import.meta.env.VITE_GEOAPIFY_API_KEY;

  useEffect(() => {
    const trimmedQuery = query.trim();

    if (trimmedQuery.length < MIN_QUERY_LENGTH) {
      abortControllerRef.current?.abort();
      setSuggestions([]);
      setLoading(false);
      setError("");
      return;
    }

    if (!API_KEY) {
      setSuggestions([]);
      setLoading(false);
      setError(
        "Geoapify API key is missing. Check VITE_GEOAPIFY_API_KEY in your .env file."
      );
      return;
    }

    const timeoutId = setTimeout(async () => {
      abortControllerRef.current?.abort();

      const controller = new AbortController();
      abortControllerRef.current = controller;

      setLoading(true);
      setError("");

      try {
        const params = new URLSearchParams({
          text: trimmedQuery,
          format: "json",
          limit: String(RESULT_LIMIT),
          apiKey: API_KEY,
        });

        const response = await fetch(
          `https://api.geoapify.com/v1/geocode/autocomplete?${params.toString()}`,
          {
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          let details = "";

          try {
            const body = await response.text();
            details = body ? ` - ${body}` : "";
          } catch {
            // Ignore response parsing failure
          }

          throw new Error(
            `Geoapify request failed (${response.status} ${response.statusText})${details}`
          );
        }

        const data = await response.json();

        if (!Array.isArray(data.results)) {
          throw new Error(
            `Unexpected Geoapify response format: ${JSON.stringify(data)}`
          );
        }

        setSuggestions(data.results);
        setHasFetched(true);
      } catch (err) {
        if (err.name === "AbortError") {
          return;
        }

        console.error("Geoapify autocomplete error:", err);

        setSuggestions([]);
        setError(err.message || "Failed to search for addresses.");
        setHasFetched(true);
      } finally {
        if (abortControllerRef.current === controller) {
          setLoading(false);
        }
      }
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [query, API_KEY]);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setSuggestions([]);
        setHasFetched(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (place) => {
    if (
      !place ||
      typeof place.lat !== "number" ||
      typeof place.lon !== "number"
    ) {
      console.error("Invalid Geoapify place result:", place);

      setError(
        `Selected result does not contain valid coordinates: ${JSON.stringify(
          place
        )}`
      );

      return;
    }

    const formattedAddress =
      place.formatted ||
      place.address_line1 ||
      place.name ||
      "";

    setQuery(formattedAddress);
    setSuggestions([]);
    setError("");
    setHasFetched(false);
    setSelected(true);

    setAddress(formattedAddress);
    setLat(place.lat);
    setLng(place.lon);
  };

  const shouldShowDropdown = loading || Boolean(error) || suggestions.length > 0 || (hasFetched && query.trim().length >= MIN_QUERY_LENGTH);

  return (
    <div className="w-100 position-relative" ref={containerRef}>
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setError("");
          setHasFetched(false);
          setSelected(false);
        }}
        placeholder="Enter address"
        autoComplete="off"
        className="form-control shadow-sm rounded-pill px-4 py-2"
        aria-label="Address search"
        style={{
          border: selected ? "1px solid #28a745" : "1px solid #ccc",
          fontSize: "1rem",
          outline: "none",
          width: "100%",
          transition: "border-color 0.2s",
        }}
      />

      {shouldShowDropdown && (
        <div
          className="position-absolute w-100 bg-white border rounded shadow-sm mt-1"
          style={{
            zIndex: 1000,
            maxHeight: "250px",
            overflowY: "auto",
          }}
        >
          {loading && (
            <div className="px-3 py-2 text-muted">
              Searching...
            </div>
          )}

          {!loading && error && (
            <div className="px-3 py-2 text-danger">
              <strong>Address search error</strong>

              <div className="small mt-1 text-break">
                {error}
              </div>
            </div>
          )}

          {!loading &&
            !error &&
            suggestions.map((place) => (
              <button
                key={
                  place.place_id ||
                  `${place.lat}-${place.lon}-${place.formatted}`
                }
                type="button"
                className="w-100 text-start border-0 bg-white px-3 py-2"
                onClick={() => handleSelect(place)}
                style={{
                  cursor: "pointer",
                  borderBottom: "1px solid #eee",
                }}
              >
                <div>
                  {place.address_line1 ||
                    place.name ||
                    place.formatted}
                </div>

                {place.address_line2 && (
                  <small className="text-muted">
                    {place.address_line2}
                  </small>
                )}
              </button>
            ))}

          {!loading &&
            !error &&
            suggestions.length === 0 &&
            hasFetched && (
              <div className="px-3 py-2 text-muted">
                No addresses found.
              </div>
            )}
        </div>
      )}
    </div>
  );
}