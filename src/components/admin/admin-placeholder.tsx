export function AdminPlaceholder({
  title,
  description,
}: {
  title: string;
  description: string;
  icon?: unknown;
}) {
  return (
    <div className="max-w-xl py-6">
      <h1 className="admin-title">{title}</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{description}</p>
    </div>
  );
}
