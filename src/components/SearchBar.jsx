import { useState } from 'react';
export default function SearchBar({ parcels, onSelect }) {
  const [query, setQuery] = useState('');
  const term = query.trim().toLowerCase();
  const results = term ? parcels.filter(({ properties:p }) => [p.parcel_id,p.canonical_id,p.ulpin,p.survey_no,p.owner_name,p.unified?.propertyId].filter(Boolean).some(v => String(v).toLowerCase().includes(term))).slice(0, 6) : [];
  return <div className="search-wrap"><label htmlFor="parcel-search">Find a parcel</label><input id="parcel-search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Parcel ID, ULPIN, survey, property ID or owner" />
    {term && <div className="search-results">{results.length ? results.map(f => <button key={f.properties.parcel_id} onClick={() => { onSelect(f); setQuery(''); }}><b>{f.properties.canonical_id}</b><span>{f.properties.survey_no} · {f.properties.owner_name}</span></button>) : <p>No matching parcel found.</p>}</div>}
  </div>;
}
