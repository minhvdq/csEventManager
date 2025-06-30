import React, { useState, useRef } from "react";
import { Autocomplete, useJsApiLoader } from "@react-google-maps/api";

// ✅ Fix: move libraries array outside component
const LIBRARIES = ["places"];

export default function NewAutoComplete({ setAddress, setLat, setLng }) {
  const [autocomplete, setAutocomplete] = useState(null);
  const inputRef = useRef(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: LIBRARIES,
  });

  const onLoad = (autoC) => {
    setAutocomplete(autoC);
  };

  const onPlaceChanged = () => {
    if (!autocomplete) {
      console.warn("Autocomplete not loaded");
      return;
    }

    const place = autocomplete.getPlace();
    if (place?.geometry) {
      setAddress(place.formatted_address || place.name);
      setLat(place.geometry.location.lat());
      setLng(place.geometry.location.lng());
    } else {
      console.warn("Place has no geometry");
    }
  };

  if (!isLoaded) return <p>Loading Google Maps...</p>;

  return (
    <div className="w-100">
      <Autocomplete onLoad={onLoad} onPlaceChanged={onPlaceChanged}>
        <input
          ref={inputRef}
          type="text"
          placeholder="Enter address"
          className="form-control shadow-sm rounded-pill px-4 py-2"
          style={{
            border: '1px solid #ccc',
            fontSize: '1rem',
            outline: 'none',
            width: '100%',
          }}
        />
      </Autocomplete>
    </div>
  );
}
