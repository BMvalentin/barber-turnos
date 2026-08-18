"use client";

interface CampoFormularioProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: React.ElementType;
  errors?: string[];
  unit?: string;
}

export default function CampoFormulario({
  label,
  icon: Icon,
  unit,
  errors,
  required,
  ...props
}: CampoFormularioProps) {
  return (
    <div className="space-y-2">
      <label className="block text-xs font-medium text-[var(--admin-texto-secundario)]">
        {label} {required && <span style={{ color: "var(--page-primary-tinta)" }}>*</span>}
      </label>
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--admin-texto-muted)]" />
        )}
        <input
          {...props}
          className={`w-full bg-[var(--admin-surface-elevated)] border rounded-lg ${Icon ? "pl-11" : "pl-4"} ${
            unit ? "pr-14" : "pr-4"
          } py-3 text-[var(--admin-texto-primario)] text-sm transition-colors duration-150 placeholder:text-[var(--admin-texto-muted)] focus:outline-none focus:border-[var(--page-primary)]/60 focus:ring-2 focus:ring-[var(--page-focus-ring)]`}
          style={{
            borderColor: errors ? "#ef4444" : "var(--admin-border)",
          }}
        />
        {unit && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[var(--admin-texto-muted)] uppercase">
            {unit}
          </span>
        )}
      </div>
      {errors && (
        <p className="text-[10px] text-red-500 font-medium">
          {errors[0]}
        </p>
      )}
    </div>
  );
}