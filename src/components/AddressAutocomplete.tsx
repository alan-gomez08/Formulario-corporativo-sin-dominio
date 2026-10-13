import { useState, useEffect, useRef } from 'react';
import { MapPin, Loader2 } from 'lucide-react';

interface Props {
  value: string;
  onChange: (addressUrl: string) => void;
}

export default function AddressAutocomplete({ value, onChange }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Cerrar el menú si hacemos clic afuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Buscador con delay (debounce) para no saturar la API gratuita
  useEffect(() => {
    if (query.trim().length < 3) {
      setResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        // Usamos OpenStreetMap que es 100% gratis y sin API Key
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=ar`);
        const data = await response.json();
        setResults(data);
        setIsOpen(true);
      } catch (error) {
        console.error("Error buscando dirección:", error);
      } finally {
        setIsSearching(false);
      }
    }, 600); // Espera 600ms después de que el cliente deja de escribir

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleSelect = (addressName: string) => {
    setQuery(addressName);
    setIsOpen(false);
    
    // EL TRUCO: Armamos el link de Google Maps con la dirección elegida
    const googleMapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressName)}`;
    onChange(googleMapsLink);
  };

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div className="h-12 flex items-center gap-2.5 bg-white border border-slate-200 focus-within:border-slate-900 focus-within:ring-1 focus-within:ring-slate-900 rounded-xl px-3.5 shadow-2xs transition-all">
        <MapPin className="text-slate-400 shrink-0" size={18}/>
        <input
          type="text"
          value={query || value.replace('https://www.google.com/maps/search/?api=1&query=', decodeURIComponent)}
          onChange={(e) => {
            setQuery(e.target.value);
            onChange(''); // Limpiamos el link viejo si vuelven a escribir
          }}
          onFocus={() => { if (results.length > 0) setIsOpen(true); }}
          placeholder="Escribe la dirección oficial o sede..."
          className="w-full text-sm bg-transparent outline-none font-medium text-slate-900 placeholder:text-slate-400"
        />
        {isSearching && <Loader2 className="animate-spin text-slate-500 shrink-0" size={16} />}
      </div>

      {/* Menú desplegable flotante estilo minimalista */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden z-50">
          {results.map((result) => (
            <button
              key={result.place_id}
              onClick={() => handleSelect(result.display_name)}
              className="w-full text-left px-4 py-3 hover:bg-slate-50 border-b border-slate-100 last:border-b-0 transition-colors flex flex-col gap-0.5 cursor-pointer"
            >
              <span className="font-semibold text-slate-900 text-sm line-clamp-1">{result.display_name.split(',')[0]}</span>
              <span className="text-xs text-slate-500 line-clamp-1">{result.display_name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}