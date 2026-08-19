interface KpiCardProps {
  icon: string
  label: string
  value: string | number
  details?: string | number
}

export function KpiCard({ icon, label, value, details }: KpiCardProps) {
  return (
    <div className="card-surface kpi-card d-flex align-items-start justify-content-between">
      <div>
        <div className="kpi-label">{label}</div>
        <div className="kpi-value">{value}</div>
        {details && <div className="kpi-details">{details}</div>}
      </div>
      <div className="kpi-icon"><i className={`bi ${icon}`}></i></div>
    </div>
  );
}
