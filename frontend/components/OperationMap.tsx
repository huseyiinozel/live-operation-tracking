import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { Operation, Pax, VehiclePosition, Vehicle } from '@/lib/types';
import { MapPin, Navigation } from 'lucide-react';

interface OperationMapProps {
  operation: Operation;
  paxList: Pax[];
  vehiclePosition?: VehiclePosition;
}

export default function OperationMap({ operation, paxList, vehiclePosition }: OperationMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const vehicleMarkerRef = useRef<google.maps.Marker | null>(null);
  const paxMarkersRef = useRef<google.maps.Marker[]>([]);
  const routePolylineRef = useRef<google.maps.Polyline | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const vehicle = operation.vehicleId as Vehicle;

  useEffect(() => {
    const initMap = async () => {
      try {
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
        
        if (!apiKey || apiKey === 'YOUR_GOOGLE_MAPS_API_KEY_HERE') {
          setError('Google Maps API key not configured. Please add it to .env.local');
          setIsLoading(false);
          return;
        }

        const loader = new Loader({
          apiKey,
          version: 'weekly',
        });

        await loader.load();

        if (!mapRef.current) return;

        // Calculate center from pax pickup points
        const bounds = new google.maps.LatLngBounds();
        
        paxList.forEach((pax) => {
          bounds.extend({
            lat: pax.pickupPoint.lat,
            lng: pax.pickupPoint.lng,
          });
        });

        // If no pax, use Bangkok as default center
        const center = paxList.length > 0
          ? bounds.getCenter()
          : { lat: 13.750, lng: 100.491 };

        // Initialize map
        const map = new google.maps.Map(mapRef.current, {
          center,
          zoom: 14,
          mapTypeControl: true,
          streetViewControl: false,
          fullscreenControl: true,
        });

        googleMapRef.current = map;

        // Add pax pickup markers
        paxList.forEach((pax, index) => {
          const marker = new google.maps.Marker({
            position: {
              lat: pax.pickupPoint.lat,
              lng: pax.pickupPoint.lng,
            },
            map,
            title: pax.name,
            label: {
              text: pax.seatNo || String(index + 1),
              color: 'white',
              fontSize: '12px',
              fontWeight: 'bold',
            },
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 20,
              fillColor: pax.status === 'checked_in' ? '#10B981' : '#F59E0B',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 2,
            },
          });

          const infoWindow = new google.maps.InfoWindow({
            content: `
              <div style="padding: 8px; min-width: 200px;">
                <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">${pax.name}</h3>
                <p style="margin: 4px 0; font-size: 14px;"><strong>Phone:</strong> ${pax.phone}</p>
                <p style="margin: 4px 0; font-size: 14px;"><strong>Seat:</strong> ${pax.seatNo || 'N/A'}</p>
                <p style="margin: 4px 0; font-size: 14px;"><strong>Status:</strong> ${pax.status}</p>
                <p style="margin: 4px 0; font-size: 12px; color: #666;">${pax.pickupPoint.address}</p>
              </div>
            `,
          });

          marker.addListener('click', () => {
            infoWindow.open(map, marker);
          });

          paxMarkersRef.current.push(marker);
        });

        // Draw route using Directions API (gerçek yolları takip eder)
        const drawRouteWithDirections = async () => {
          if (paxList.length < 2) return;

          try {
            const directionsService = new google.maps.DirectionsService();
            const directionsRenderer = new google.maps.DirectionsRenderer({
              map: map,
              suppressMarkers: true, // Kendi marker'larımızı kullanıyoruz
              polylineOptions: {
                strokeColor: '#EF4444', // Kırmızı
                strokeOpacity: 0.8,
                strokeWeight: 5,
              },
            });

            // Yolcuları seat numarasına göre sırala
            const sortedPax = [...paxList].sort((a, b) => {
              if (a.seatNo && b.seatNo) {
                return a.seatNo.localeCompare(b.seatNo);
              }
              return 0;
            });

            // İlk nokta origin, son nokta destination, ortadakiler waypoints
            const origin = {
              lat: sortedPax[0].pickupPoint.lat,
              lng: sortedPax[0].pickupPoint.lng,
            };

            const destination = {
              lat: sortedPax[sortedPax.length - 1].pickupPoint.lat,
              lng: sortedPax[sortedPax.length - 1].pickupPoint.lng,
            };

            // Ortadaki noktaları waypoints olarak ekle (max 25 waypoint)
            const waypoints = sortedPax
              .slice(1, -1)
              .slice(0, 23) // Google max 25 waypoint limit
              .map(pax => ({
                location: {
                  lat: pax.pickupPoint.lat,
                  lng: pax.pickupPoint.lng,
                },
                stopover: true,
              }));

            // Directions API'yi çağır
            const result = await directionsService.route({
              origin: origin,
              destination: destination,
              waypoints: waypoints,
              travelMode: google.maps.TravelMode.DRIVING,
              optimizeWaypoints: false, // Sırayı korumak için false
            });

            directionsRenderer.setDirections(result);
            
            // DirectionsRenderer'ı ref'te sakla (temizlemek için)
            routePolylineRef.current = directionsRenderer as any;

          } catch (error) {
            console.error('Directions API error:', error);
            
            // Hata durumunda basit polyline çiz
            const routePath = paxList
              .sort((a, b) => {
                if (a.seatNo && b.seatNo) {
                  return a.seatNo.localeCompare(b.seatNo);
                }
                return 0;
              })
              .map(pax => ({
                lat: pax.pickupPoint.lat,
                lng: pax.pickupPoint.lng,
              }));

            const polyline = new google.maps.Polyline({
              path: routePath,
              geodesic: true,
              strokeColor: '#EF4444', // Kırmızı
              strokeOpacity: 0.6,
              strokeWeight: 4,
              map: map,
            });

            routePolylineRef.current = polyline;
          }
        };

        drawRouteWithDirections();

        // Fit bounds if we have pax
        if (paxList.length > 0) {
          map.fitBounds(bounds);
        }

        setIsLoading(false);
      } catch (err: any) {
        console.error('Error loading Google Maps:', err);
        setError('Failed to load Google Maps');
        setIsLoading(false);
      }
    };

    initMap();

    return () => {
      // Cleanup markers and route
      paxMarkersRef.current.forEach((marker) => marker.setMap(null));
      paxMarkersRef.current = [];
      if (vehicleMarkerRef.current) {
        vehicleMarkerRef.current.setMap(null);
      }
      if (routePolylineRef.current) {
        // DirectionsRenderer veya Polyline olabilir
        if (typeof (routePolylineRef.current as any).setMap === 'function') {
          (routePolylineRef.current as any).setMap(null);
        }
      }
    };
  }, [paxList, operation.route]);

  // Update vehicle position
  useEffect(() => {
    if (!googleMapRef.current || !vehiclePosition) return;

    const position = {
      lat: vehiclePosition.lat,
      lng: vehiclePosition.lng,
    };

    if (vehicleMarkerRef.current) {
      // Update existing marker
      vehicleMarkerRef.current.setPosition(position);
      
      // Update rotation if available
      if (vehiclePosition.heading !== undefined) {
        const icon = vehicleMarkerRef.current.getIcon() as google.maps.Symbol;
        if (icon) {
          icon.rotation = vehiclePosition.heading;
          vehicleMarkerRef.current.setIcon(icon);
        }
      }
    } else {
      // Create new vehicle marker
      const marker = new google.maps.Marker({
        position,
        map: googleMapRef.current,
        title: `Vehicle ${vehicle?.plate || ''}`,
        icon: {
          path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
          scale: 6,
          fillColor: '#3B82F6',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
          rotation: vehiclePosition.heading || 0,
        },
        zIndex: 1000,
      });

      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding: 8px;">
            <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">
              ${vehicle?.plate || 'Vehicle'} - ${vehicle?.vehicleModel || ''}
            </h3>
            <p style="margin: 4px 0; font-size: 14px;"><strong>Speed:</strong> ${vehiclePosition.speed} km/h</p>
            <p style="margin: 4px 0; font-size: 14px;"><strong>Heading:</strong> ${vehiclePosition.heading}°</p>
            <p style="margin: 4px 0; font-size: 12px; color: #666;">Last update: ${new Date(vehiclePosition.timestamp).toLocaleTimeString()}</p>
          </div>
        `,
      });

      marker.addListener('click', () => {
        infoWindow.open(googleMapRef.current!, marker);
      });

      vehicleMarkerRef.current = marker;
    }
  }, [vehiclePosition, vehicle]);

  if (error) {
    return (
      <div className="w-full h-[500px] bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <MapPin size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 mb-2">{error}</p>
          <p className="text-sm text-gray-500">
            Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your .env.local file
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[500px] bg-gray-100 rounded-lg overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading map...</p>
          </div>
        </div>
      )}
      
      <div ref={mapRef} className="w-full h-full" />
      
      {vehiclePosition && (
        <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4 z-10">
          <div className="flex items-center space-x-2 mb-2">
            <Navigation size={18} className="text-primary-500" />
            <span className="font-semibold text-gray-900">{vehicle?.plate || 'Vehicle'}</span>
          </div>
          <div className="text-sm space-y-1">
            <div className="text-gray-600">
              Speed: <span className="font-semibold">{vehiclePosition.speed} km/h</span>
            </div>
            <div className="text-gray-600">
              Heading: <span className="font-semibold">{vehiclePosition.heading}°</span>
            </div>
            <div className="text-xs text-gray-400 mt-2">
              Updated: {new Date(vehiclePosition.timestamp).toLocaleTimeString()}
            </div>
          </div>
        </div>
      )}

      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 z-10">
        <div className="space-y-2 text-sm">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span className="text-gray-600">Waiting</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-gray-600">Checked In</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 transform rotate-45"></div>
              <span className="text-gray-600">Vehicle</span>
            </div>
          </div>
          <div className="flex items-center space-x-2 pt-2 border-t border-gray-200">
            <div className="w-8 h-0.5 bg-red-500"></div>
            <span className="text-gray-600 text-xs">Planlı Güzergah</span>
          </div>
        </div>
      </div>
    </div>
  );
}

