"use client";

import type { ReactNode } from "react";
import { Button } from "./ui";

export function ConfirmSubmitButton({
  confirmMessage,
  children,
  variant,
}: {
  confirmMessage: string;
  children: ReactNode;
  variant?: "primary" | "ghost" | "danger";
}) {
  return (
    <Button
      type="submit"
      variant={variant}
      onClick={(e) => {
        if (!window.confirm(confirmMessage)) {
          e.preventDefault();
        }
      }}
    >
      {children}
    </Button>
  );
}
