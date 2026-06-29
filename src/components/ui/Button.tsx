import { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "success" | "info" | "warning";
  size?: "sm" | "md";
  children: ReactNode;
}

export default function Button({
  variant = "primary",
  size = "md",
  children,
  className = "",
  ...props
}: ButtonProps) {
  const variantClass =
    variant === "primary"
      ? "btn-primary"
      : variant === "danger"
      ? "btn-danger"
      : variant === "success"
      ? "btn-success"
      : variant === "info"
      ? "btn-info"
      : variant === "warning"
      ? "btn-warning"
      : "btn-secondary";
  const sizeClass = size === "sm" ? "btn-sm" : "";
  return (
    <button className={`btn ${variantClass} ${sizeClass} ${className}`} {...props}>
      {children}
    </button>
  );
}
