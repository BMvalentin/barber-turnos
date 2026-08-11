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
      <label className="block text-[10px] font-bold text-[#8E8675] uppercase tracking-wider">
        {label} {required && <span style={{ color: "var(--page-primary)" }}>*</span>}
      </label>
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E8675]" />
        )}
        <input
          {...props}
          className={`w-full bg-black/70 border rounded-lg ${Icon ? "pl-11" : "pl-4"} ${
            unit ? "pr-14" : "pr-4"
          } py-3 text-[#E4E0D9] text-sm outline-none transition-colors`}
          style={{
            borderColor: errors ? "#ef4444" : "var(--page-secondary)",
          }}
        />
        {unit && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[#8E8675] uppercase">
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