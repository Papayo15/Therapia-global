import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default:    "bg-surface-100 text-surface-700",
        brand:      "bg-brand-100 text-brand-700",
        clinical:   "bg-clinical-100 text-clinical-700",
        success:    "bg-green-100 text-green-700",
        warning:    "bg-amber-100 text-amber-700",
        danger:     "bg-red-100 text-red-700",
        outline:    "border border-surface-300 text-surface-600 bg-transparent",
        dark:       "bg-surface-900 text-white",
        free:       "bg-clinical-100 text-clinical-700",
        pro:        "bg-brand-100 text-brand-700",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
