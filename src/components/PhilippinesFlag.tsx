import { cn } from "@/lib/utils";

interface PhilippinesFlagProps {
  className?: string;
}

export function PhilippinesFlag({ className }: PhilippinesFlagProps) {
  return (
    <img
      src="/flags/ph.svg"
      alt="Philippines"
      className={cn("h-4 w-6 shrink-0  object-cover border border-gray-200/80", className)}
    />
  );
}
