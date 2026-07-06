export default function PageHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="border-b border-slate-200 bg-primary-light/40 py-16">
      <div className="container-page">
        <h1 className="text-4xl font-extrabold text-navy">{title}</h1>
        {subtitle && (
          <p className="mt-3 max-w-2xl text-slate-600">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
