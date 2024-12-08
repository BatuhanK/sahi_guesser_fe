import React, { ButtonHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline";
}

export const Button: React.FC<ButtonProps> = ({
  className = "",
  variant = "primary",
  children,
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

  const variants = {
    primary:
      "bg-[var(--accent-color)] text-white hover:bg-[var(--accent-hover)] focus:ring-[var(--accent-color)]",
    secondary:
      "bg-[var(--bg-tertiary)] text-[var(--text-primary)] hover:bg-[var(--hover-color)] focus:ring-[var(--accent-color)]",
    outline:
      "border border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--hover-color)] focus:ring-[var(--accent-color)]",
  };

  return (
    <button className={cn(baseStyles, variants[variant], className)} {...props}>
      {children}
    </button>
  );
};
