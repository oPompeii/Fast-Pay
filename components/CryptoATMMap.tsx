import React, { useState, useEffect, useRef } from 'react';
import { MapPin } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ATM {
  id: string;
  location: string;
  city: string;
  country: string;
  supported_currencies: string[];
  operating_hours: Record<string, { open: string; close: string }>;
  status: string;
  transaction_types: string[];
  latitude: number;
  longitude: number;
}

// Global variable to track script loading
let googleMapsLoaded = false;

const CryptoATMMap: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [atms, setAtms] = useState<ATM[]>([]);
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);

  useEffect(() => {
    const initMap = async () => {
      if (!window.google?.maps || !mapRef.current) return;

      // Initialize map
      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat: -23.5505, lng: -46.6333 }, // São Paulo
        zoom: 12,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ]
      });

      googleMapRef.current = map;
      infoWindowRef.current = new window.google.maps.InfoWindow();

      // Fetch ATMs after map is ready
      await fetchATMs();
    };

    const loadGoogleMaps = () => {
      if (!window.google?.maps && !googleMapsLoaded) {
        googleMapsLoaded = true; // Set flag before loading script
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`;
        script.async = true;
        script.defer = true;
        script.addEventListener('load', initMap);
        document.head.appendChild(script);
      } else if (window.google?.maps) {
        initMap();
      }
    };

    loadGoogleMaps();

    return () => {
      // Cleanup markers
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];
    };
  }, []);

  const fetchATMs = async () => {
    try {
      const { data: atms, error: fetchError } = await supabase
        .from('crypto_atms')
        .select('*')
        .eq('status', 'active');

      if (fetchError) throw fetchError;

      setAtms(atms || []);
      updateMarkers(atms || []);
    } catch (err) {
      console.error('Error fetching ATMs:', err);
      setError(err instanceof Error ? err.message : 'Error fetching ATMs');
    } finally {
      setLoading(false);
    }
  };

  const updateMarkers = (atms: ATM[]) => {
    if (!googleMapRef.current || !infoWindowRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    const bounds = new google.maps.LatLngBounds();

    atms.forEach(atm => {
      const marker = new google.maps.Marker({
        position: { lat: atm.latitude, lng: atm.longitude },
        map: googleMapRef.current,
        title: atm.location,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: '#059669',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2
        }
      });

      marker.addListener('click', () => {
        if (!infoWindowRef.current) return;

        const content = `
          <div class="p-4">
            <h3 class="font-bold text-lg mb-2">${atm.location}</h3>
            <p class="text-gray-600">${atm.city}, ${atm.country}</p>
            <div class="mt-2">
              <p class="text-sm font-medium">Supported Currencies:</p>
              <p class="text-sm">${atm.supported_currencies.join(', ')}</p>
            </div>
            <div class="mt-2">
              <p class="text-sm font-medium">Services:</p>
              <p class="text-sm">${atm.transaction_types.join(', ')}</p>
            </div>
            <div class="mt-2">
              <p class="text-sm font-medium">Operating Hours:</p>
              <p class="text-sm">
                ${atm.operating_hours.monday.open} - ${atm.operating_hours.monday.close}
              </p>
            </div>
          </div>
        `;

        infoWindowRef.current.setContent(content);
        infoWindowRef.current.open(googleMapRef.current, marker);
      });

      bounds.extend(marker.getPosition()!);
      markersRef.current.push(marker);
    });

    // Only fit bounds if we have markers
    if (markersRef.current.length > 0) {
      googleMapRef.current.fitBounds(bounds);
      // Adjust zoom if too close
      const listener = google.maps.event.addListener(googleMapRef.current, 'idle', () => {
        if (googleMapRef.current?.getZoom()! > 15) googleMapRef.current?.setZoom(15);
        google.maps.event.removeListener(listener);
      });
    }
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <MapPin className="h-5 w-5 text-red-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error loading ATM map</h3>
            <p className="mt-2 text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {loading && (
        <div className="absolute inset-0 bg-gray-100 bg-opacity-75 flex items-center justify-center z-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        </div>
      )}
      <div 
        ref={mapRef}
        className="w-full h-[400px] rounded-lg shadow-lg"
        style={{ minHeight: '400px' }}
      />
    </div>
  );
};

export default CryptoATMMap;