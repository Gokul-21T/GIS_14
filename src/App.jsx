import { useState } from 'react';
import geojsonText from './data/parcels.geojson?raw';
import records from './data/landRecords.json';
import Dashboard from './components/Dashboard';
import SearchBar from './components/SearchBar';
import MapView from './components/MapView';
import ParcelDetails from './components/ParcelDetails';
import LayerControl from './components/LayerControl';
import { enrichParcel, themeDefinitions } from './data/parcelData';
let geojson = { features: [] };
try { geojson = JSON.parse(geojsonText.replace(/^\uFEFF/, '')); } catch { /* an empty map is safer than a crashed demo */ }
export default function App() {
  const parcels = (Array.isArray(geojson?.features) ? geojson.features : []).map(f => ({ ...f, properties: enrichParcel(f, records[f.properties.parcel_id]) }));
  const [selected,setSelected] = useState(null); const [layers,setLayers] = useState({cadastral:true,conflicts:false,verified:false});
  const [theme, setTheme] = useState('default'); const [filters, setFilters] = useState({ ownership:'ALL', tax:'ALL', verification:'ALL', landUse:'ALL' });
  const visible = parcels.filter(f => {
    const p = f.properties;
    return (filters.ownership === 'ALL' || p.owner_type === filters.ownership) && (filters.tax === 'ALL' || p.tax_status_normalized === filters.tax) && (filters.verification === 'ALL' || p.verification_normalized === filters.verification) && (filters.landUse === 'ALL' || p.land_use_normalized === filters.landUse);
  });
  return <main><header><div><p className="eyebrow">BhoomiSetu · parcel-centric land governance</p><h1>Unified Land Information System</h1><p className="subtitle">GIS-based Digital Public Infrastructure · Demo District, India</p></div><SearchBar parcels={parcels} onSelect={setSelected} /></header><Dashboard parcels={parcels}/><div className="workspace"><section className="map-area"><div className="toolbar"><LayerControl layers={layers} setLayers={setLayers}/><div className="theme-controls"><label>Visualization<select value={theme} onChange={e=>setTheme(e.target.value)}>{Object.entries(themeDefinitions).map(([key, item])=><option value={key} key={key}>{item.label}</option>)}</select></label><label>Ownership<select value={filters.ownership} onChange={e=>setFilters({...filters,ownership:e.target.value})}><option value="ALL">All</option><option>GOVERNMENT</option><option>PRIVATE</option><option>COMPANY</option><option>TRUST</option><option>COOPERATIVE</option></select></label><label>Tax<select value={filters.tax} onChange={e=>setFilters({...filters,tax:e.target.value})}><option value="ALL">All</option><option value="PAID">Paid</option><option value="PARTIALLY_PAID">Partially paid</option><option value="OUTSTANDING">Outstanding</option><option value="NO_RECORD">No record</option></select></label></div><div className="legend">{themeDefinitions[theme].entries.map(([label, colour])=><span key={label}><i style={{background:colour}}/>{label}</span>)}</div></div><MapView parcels={visible} selected={selected} onSelect={setSelected} layers={layers} theme={theme}/></section><ParcelDetails parcel={selected} record={selected && records[selected.properties.parcel_id]}/></div><p className="synthetic-note">Demo Environment — Synthetic Land Records — Not Official Government Data</p></main>;
}
