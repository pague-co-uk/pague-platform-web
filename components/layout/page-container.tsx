import type {
  ReactNode,
} from "react";

// ============================================================================
// Types
// ============================================================================

export interface PageContainerProps {
  children: ReactNode;

  className?: string;
}

// ============================================================================
// Page container
// ============================================================================

export function PageContainer({
  children,
  className = "",
}: PageContainerProps) {
  return (
    <main
      className={[
        "w-full min-w-0",
        "px-4 py-6",
        "sm:px-6 sm:py-8",
        "lg:px-8 lg:py-8",
        "xl:px-10",
        "2xl:px-12",
        className,
      ].join(" ")}
    >
      <div className="mx-auto w-full max-w-[1600px]">
        {children}
      </div>
    </main>
  );
}