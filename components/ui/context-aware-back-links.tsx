import Link from "next/link";

interface ContextAwareBackLinksProps {
  readonly clientHref: string;
  readonly clientLabel: string;
  readonly platformHref?: string;
  readonly platformLabel?: string;
  readonly showPlatformLink: boolean;
}

const secondaryButtonClassName =
  "inline-flex h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2";

export function ContextAwareBackLinks({
  clientHref,
  clientLabel,
  platformHref,
  platformLabel,
  showPlatformLink,
}: ContextAwareBackLinksProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {showPlatformLink && platformHref && platformLabel && (
        <Link href={platformHref} className={secondaryButtonClassName}>
          {platformLabel}
        </Link>
      )}

      <Link href={clientHref} className={secondaryButtonClassName}>
        {clientLabel}
      </Link>
    </div>
  );
}
