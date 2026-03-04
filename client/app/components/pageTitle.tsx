export default function PageTitle({
  title,
  subtitle,
  icon,
}: {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        {icon && icon}
        <h1 className="font-dela-gothic-one text-xl sm:text-2xl font-bold tracking-tight capitalize">
          {title}
        </h1>
      </div>
      <p className="text-sm sm:text-base text-muted-foreground">{subtitle}</p>
    </div>
  );
}
