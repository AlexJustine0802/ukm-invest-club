export default function PageHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="bg-navy py-16 text-white">
      <div className="container-page">
        <h1 className="text-4xl font-extrabold">{title}</h1>
        {subtitle && (
          <p className="mt-3 max-w-2xl text-slate-300">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
