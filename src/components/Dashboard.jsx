export default function Dashboard({ parcels }) {
  const props = parcels.map(({ properties }) => properties);
  const stats = [
    ['Total parcels', props.length, 'navy'],
    ['Verified', props.filter(p => p.verification_status === 'Verified').length, 'green'],
    ['Pending', props.filter(p => p.verification_status === 'Pending').length, 'amber'],
    ['Conflicts', props.filter(p => p.verification_status === 'Conflict').length, 'red'],
    ['Government', props.filter(p => p.owner_type === 'GOVERNMENT').length, 'blue'],
    ['Tax outstanding', props.filter(p => p.tax_status_normalized === 'OUTSTANDING').length, 'red'],
  ];
  return <section className="dashboard" aria-label="Parcel summary">{stats.map(([label, value, color]) => <div className={`stat ${color}`} key={label}><span>{label}</span><strong>{value}</strong></div>)}</section>;
}
