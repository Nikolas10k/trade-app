import { type ButtonHTMLAttributes, type InputHTMLAttributes, type LabelHTMLAttributes } from "react";

export function Card({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-2xl border border-white/10 bg-surface p-6 shadow-xl shadow-black/20 ${className}`}
      {...props}
    />
  );
}

export function Label({ className = "", ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label className={`mb-1.5 block text-sm font-medium text-text-secondary ${className}`} {...props} />
  );
}

export function Input({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-text-primary placeholder:text-text-disabled outline-none transition focus:border-secondary-light focus:ring-2 focus:ring-secondary-light/30 ${className}`}
      {...props}
    />
  );
}

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-sm text-danger">{message}</p>;
}

export function Button({
  className = "",
  variant = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" }) {
  const base =
    "inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50";
  const variants = {
    primary: "bg-gradient-brand text-white hover:brightness-110",
    ghost: "border border-white/15 text-text-primary hover:bg-white/5",
  };
  return <button className={`${base} ${variants[variant]} ${className}`} {...props} />;
}
