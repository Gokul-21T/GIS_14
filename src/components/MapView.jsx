import { useEffect, useMemo } from 'react';
import L from 'leaflet';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import './parcel-label.css';
import { themeColour } from '../data/parcelData';

const colours = { Verified: '#159b70', Pending: '#e5a82d', Conflict: '#d94a4a', Disputed: '#d94a4a' };

function FrameParcels({ parcels, selected }) {
  const map = useMap();
  useEffect(() => {
    if (selected) { const [lng, lat] = selected.geometry.coordinates[0][0]; map.setView([lat, lng], 17); return; }
    const points = parcels.flatMap(f => f.geometry.coordinates[0].map(([lng, lat]) => [lat, lng]));
    const bounds = L.latLngBounds(points);
    if (bounds.isValid()) map.fitBounds(bounds.pad(0.16));
  }, [map, parcels, selected]);
  return null;
}

function ParcelLayer({ parcels, selected, onSelect, theme }) {
  const map = useMap();
  useEffect(() => {
    const group = L.layerGroup().addTo(map);
    parcels.forEach(feature => {
      const p = feature.properties;
      const positions = feature.geometry.coordinates[0].map(([lng, lat]) => [lat, lng]);
      const options = { color: selected?.properties.parcel_id === p.parcel_id ? '#071c38' : '#143b62', weight: selected?.properties.parcel_id === p.parcel_id ? 5 : 1.4, opacity: 1, fillColor: themeColour(p, theme), fillOpacity: .72, lineCap: 'round', lineJoin: 'round' };
      const polygon = L.polygon(positions, options).addTo(group);
      polygon.bindTooltip(`<strong>${p.survey_no}</strong>`, { permanent: true, direction: 'center', className: 'parcel-label' });
      polygon.on('click', () => onSelect(feature));
      polygon.on('mouseover', () => polygon.setStyle({ fillOpacity: .92 }));
      polygon.on('mouseout', () => polygon.setStyle(options));
    });
    return () => group.remove();
  }, [map, parcels, selected, onSelect]);
  return null;
}

export default function MapView({ parcels, selected, onSelect, layers, theme }) {
  const visible = useMemo(() => parcels.filter(f => layers.cadastral || (layers.conflicts && ['Conflict', 'Disputed'].includes(f.properties.verification_status)) || (layers.verified && f.properties.verification_status === 'Verified')), [parcels, layers]);
  return <div className="map-wrap"><MapContainer center={[12.972, 77.592]} zoom={16} scrollWheelZoom className="map"><TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" /><FrameParcels parcels={visible} selected={selected} /><ParcelLayer parcels={visible} selected={selected} onSelect={onSelect} theme={theme} /></MapContainer><div className="demo-label">DEMO DATA — NOT OFFICIAL CADASTRAL BOUNDARIES</div></div>;
}
