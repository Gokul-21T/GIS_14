const pad = value => String(value).padStart(4, '0');

const ownerTypes = ['PRIVATE', 'PRIVATE', 'GOVERNMENT', 'COMPANY', 'TRUST', 'COOPERATIVE'];
const landUses = ['Residential', 'Agricultural', 'Commercial', 'Mixed Use', 'Industrial', 'Public'];

export function canonicalId(parcelId) {
  if (parcelId === 'P014') return 'BS-DEMO-0014';
  return `BS-DEMO-${pad(String(parcelId || '').replace(/\D/g, ''))}`;
}

export function enrichParcel(feature, sourceRecord = {}) {
  const p = feature.properties;
  const number = Number(String(p.parcel_id).replace(/\D/g, '')) || 1;
  const isDemo = p.parcel_id === 'P014';
  const taxRaw = String(sourceRecord.tax?.status || p.tax_status || 'NO_RECORD').toUpperCase();
  const taxStatus = isDemo ? 'OUTSTANDING' : taxRaw === 'DUE' ? 'OUTSTANDING' : taxRaw === 'PAID' ? 'PAID' : taxRaw === 'PARTIAL' ? 'PARTIALLY_PAID' : taxRaw;
  const verification = isDemo ? 'CONFLICT' : String(p.verification_status || 'UNVERIFIED').toUpperCase();
  const ownerType = isDemo ? 'PRIVATE' : ownerTypes[number % ownerTypes.length];
  const registrationStatus = isDemo ? 'REGISTERED' : String(sourceRecord.registration?.status || p.registration_status || 'UNKNOWN').toUpperCase().replace('VERIFIED', 'REGISTERED');
  const buildingStatus = isDemo ? 'APPROVED' : ['APPROVED', 'PENDING', 'NOT_FOUND', 'EXPIRED'][number % 4];
  const landUse = isDemo ? 'Residential' : (p.land_use || sourceRecord.land?.land_use || landUses[number % landUses.length]);
  const conflictCount = isDemo ? 2 : Number(p.conflict_count || sourceRecord.verification?.conflicts?.length || 0);
  const conflicts = isDemo
    ? [
        'OWNER_MISMATCH — Revenue: Arun Kumar; Registration: Arun Kumar S. Requires authorized verification.',
        'AREA_MISMATCH — Revenue: 2.50 acres; Registration: 2.10 acres; GIS: 2.48 acres.'
      ]
    : (sourceRecord.verification?.conflicts || []);
  return {
    ...p,
    canonical_id: canonicalId(p.parcel_id),
    ulpin: `DEMO-ULPIN-${pad(isDemo ? 14 : number)}`,
    aliases: [p.parcel_id, canonicalId(p.parcel_id), p.survey_no],
    owner_type: ownerType,
    tax_status_normalized: taxStatus,
    verification_normalized: verification,
    registration_status_normalized: registrationStatus,
    building_status: buildingStatus,
    land_use_normalized: landUse,
    conflict_count_normalized: conflictCount,
    conflict_severity: conflictCount >= 2 ? 'HIGH' : conflictCount ? 'MEDIUM' : 'NONE',
    completeness: isDemo ? 'HIGH' : number % 5 === 0 ? 'LOW' : number % 3 === 0 ? 'MEDIUM' : 'HIGH',
    source_availability: isDemo ? 'Revenue + Registration + Tax + Planning + GIS' : number % 4 === 0 ? 'Revenue + GIS' : 'Revenue + Registration + Tax + GIS',
    unified: {
      location: sourceRecord.location || { district: 'Demo District', taluk: 'Demo Taluk', village: 'Demo Village' },
      owner: isDemo ? 'Arun Kumar' : (sourceRecord.owner?.name || p.owner_name),
      registrationOwner: isDemo ? 'Arun Kumar S.' : (sourceRecord.owner?.name || p.owner_name),
      rorId: isDemo ? 'ROR-DEMO-77881' : `ROR-DEMO-${pad(number)}`,
      registrationNo: isDemo ? 'REG-TN-DEMO-2026-00871' : (sourceRecord.registration?.registration_number || `REG-DEMO-${pad(number)}`),
      propertyId: isDemo ? 'PROP-DEMO-99182' : `PROP-DEMO-${pad(number)}`,
      taxId: isDemo ? 'TAX-DEMO-5512' : `TAX-DEMO-${pad(number)}`,
      cadastralPlot: isDemo ? 'PLOT-DEMO-1827' : `PLOT-DEMO-${pad(number)}`,
      rorArea: isDemo ? '2.50 acres' : `${p.area_acres} acres`,
      registrationArea: isDemo ? '2.10 acres' : `${p.area_acres} acres`,
      gisArea: isDemo ? '2.48 acres' : `${p.area_acres} acres`,
      taxOutstanding: isDemo ? '₹9,100' : taxStatus === 'OUTSTANDING' ? '₹4,200' : '₹0',
      conflicts,
    }
  };
}

export const themeDefinitions = {
  default: { label: 'Default Parcel View', entries: [['Verified', '#159b70'], ['Pending', '#e5a82d'], ['Conflict / disputed', '#d94a4a']] },
  ownership: { label: 'Government vs Private', entries: [['Government', '#2563eb'], ['Private / non-government', '#f97316'], ['Unknown', '#94a3b8']] },
  taxation: { label: 'Taxation Status', entries: [['Paid', '#16a34a'], ['Partially paid', '#eab308'], ['Outstanding', '#dc2626'], ['No record / not applicable', '#94a3b8']] },
  verification: { label: 'Verification Status', entries: [['Verified', '#16a34a'], ['Pending review', '#eab308'], ['Conflict', '#dc2626'], ['Unverified / incomplete', '#94a3b8']] },
  conflict: { label: 'Conflict Severity', entries: [['No conflict', '#16a34a'], ['Low / medium', '#eab308'], ['High', '#f97316'], ['Critical', '#dc2626']] },
  landUse: { label: 'Land Use', entries: [['Agricultural', '#84cc16'], ['Residential', '#a855f7'], ['Commercial', '#f59e0b'], ['Industrial', '#64748b'], ['Public', '#0ea5e9']] },
  registration: { label: 'Registration Status', entries: [['Registered', '#16a34a'], ['Pending', '#eab308'], ['Cancelled / expired', '#dc2626'], ['Unknown', '#94a3b8']] },
  building: { label: 'Building Permission', entries: [['Approved', '#16a34a'], ['Pending', '#eab308'], ['Rejected / expired', '#dc2626'], ['Not found', '#94a3b8']] },
  completeness: { label: 'Data Completeness', entries: [['High (8/8)', '#16a34a'], ['Medium', '#eab308'], ['Low', '#dc2626']] },
  sources: { label: 'Source Availability', entries: [['Four sources', '#2563eb'], ['Partial sources', '#eab308'], ['Revenue + GIS only', '#94a3b8']] },
};

export function themeColour(p, theme) {
  const v = p.verification_normalized;
  if (theme === 'ownership') return p.owner_type === 'GOVERNMENT' ? '#2563eb' : p.owner_type === 'UNKNOWN' ? '#94a3b8' : '#f97316';
  if (theme === 'taxation') return p.tax_status_normalized === 'PAID' ? '#16a34a' : p.tax_status_normalized === 'PARTIALLY_PAID' ? '#eab308' : p.tax_status_normalized === 'OUTSTANDING' ? '#dc2626' : '#94a3b8';
  if (theme === 'verification') return v === 'VERIFIED' ? '#16a34a' : v === 'PENDING' ? '#eab308' : v === 'CONFLICT' || v === 'DISPUTED' ? '#dc2626' : '#94a3b8';
  if (theme === 'conflict') return p.conflict_severity === 'NONE' ? '#16a34a' : p.conflict_severity === 'MEDIUM' ? '#eab308' : p.conflict_severity === 'HIGH' ? '#f97316' : '#dc2626';
  if (theme === 'landUse') return ({ Agricultural:'#84cc16', Residential:'#a855f7', Commercial:'#f59e0b', Industrial:'#64748b', Public:'#0ea5e9', 'Mixed Use':'#ec4899' })[p.land_use_normalized] || '#94a3b8';
  if (theme === 'registration') return p.registration_status_normalized === 'REGISTERED' ? '#16a34a' : p.registration_status_normalized === 'PENDING' ? '#eab308' : ['CANCELLED','EXPIRED'].includes(p.registration_status_normalized) ? '#dc2626' : '#94a3b8';
  if (theme === 'building') return p.building_status === 'APPROVED' ? '#16a34a' : p.building_status === 'PENDING' ? '#eab308' : ['REJECTED','EXPIRED'].includes(p.building_status) ? '#dc2626' : '#94a3b8';
  if (theme === 'completeness') return p.completeness === 'HIGH' ? '#16a34a' : p.completeness === 'MEDIUM' ? '#eab308' : '#dc2626';
  if (theme === 'sources') return p.source_availability.includes('Registration + Tax') ? '#2563eb' : p.source_availability === 'Revenue + GIS' ? '#94a3b8' : '#eab308';
  return themeColour(p, 'verification');
}
