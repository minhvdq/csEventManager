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

export default function NewAutoComplete({
  setAddress,
  setLat,
  setLng,
}) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  const abortControllerRef = useRef(null);

  const API_KEY = import.meta.env.VITE_GEOAPIFY_API_KEY;

  useEffect(() => {
    // Don't search tiny queries
    if (query.trim().length < 3) {
      setSuggestions([]);
      return;
    }

    // Debounce requests
    const timeout = setTimeout(async () => {
      // Cancel previous request
      abortControllerRef.current?.abort();

      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        setLoading(true);

        const params = new URLSearchParams({
          text: query,
          format: "json",
          limit: "5",
          apiKey: API_KEY,
        });

        const response = await fetch(
          `https://api.geoapify.com/v1/geocode/autocomplete?${params}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch addresses");
        }

        const data = await response.json();
        setSuggestions(data);
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Autocomplete error:", error);
        }
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => clearTimeout(timeout);
  }, [query, API_KEY]);

  const handleSelect = (place) => {
    setQuery(place.formatted);
    setSuggestions([]);

    setAddress(place.formatted);
    setLat(place.lat);
    setLng(place.lon);
  };

  return (
    <div className="w-100 position-relative">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Enter address"
        className="form-control shadow-sm rounded-pill px-4 py-2"
        style={{
          border: "1px solid #ccc",
          fontSize: "1rem",
          outline: "none",
          width: "100%",
        }}
      />

      {loading && (
        <div className="position-absolute mt-1 px-3">
          Searching...
        </div>
      )}

      {suggestions.length > 0 && (
        <div
          className="position-absolute w-100 bg-white border rounded shadow-sm mt-1"
          style={{
            zIndex: 1000,
            maxHeight: "250px",
            overflowY: "auto",
          }}
        >
          {suggestions.map((place) => (
            <button
              key={place.place_id}
              type="button"
              className="w-100 text-start border-0 bg-white px-3 py-2"
              onClick={() => handleSelect(place)}
              style={{
                cursor: "pointer",
              }}
            >
              <div>{place.address_line1}</div>

              <small className="text-muted">
                {place.address_line2}
              </small>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}