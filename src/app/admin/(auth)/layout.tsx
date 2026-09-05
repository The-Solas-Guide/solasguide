export default function AdminAuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div data-admin className="min-h-svh bg-background text-foreground">
      {children}
    </div>
  );
}
