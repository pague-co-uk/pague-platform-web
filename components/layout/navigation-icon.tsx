import type {
  SVGProps,
} from "react";

export type NavigationIconName =
  | "dashboard"
  | "messaging"
  | "payments"
  | "mobile-money"
  | "network"
  | "mobile-network"
  | "connector"
  | "route"
  | "clients"
  | "messages"
  | "webhooks"
  | "users"
  | "roles"
  | "settings"
  | "audit"
  | "reports"
  | "notifications"
  | "sender"
  | "smpp"
  | "wallet"
  | "webhook"
  | "shield"
  | "permissions"
  | "key"
  | "integrations";

interface NavigationIconProps
  extends SVGProps<SVGSVGElement> {
  name: NavigationIconName;
}

export function NavigationIcon({
  name,
  ...props
}: NavigationIconProps) {
  const commonProps: SVGProps<SVGSVGElement> = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.75,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
    ...props,
  };

  switch (name) {

    // ========================================================================
    // Overview
    // ========================================================================

    case "dashboard":
      return (
        <svg {...commonProps}>
          <rect
            x="3"
            y="3"
            width="7"
            height="7"
            rx="1"
          />
          <rect
            x="14"
            y="3"
            width="7"
            height="7"
            rx="1"
          />
          <rect
            x="3"
            y="14"
            width="7"
            height="7"
            rx="1"
          />
          <rect
            x="14"
            y="14"
            width="7"
            height="7"
            rx="1"
          />
        </svg>
      );

    // ========================================================================
    // Messaging
    // ========================================================================

    case "messaging":
    case "messages":
      return (
        <svg {...commonProps}>
          <path d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5H8l-4 2v-4.5A7.5 7.5 0 1 1 20 11.5Z" />
          <path d="M8 11h8" />
          <path d="M8 8h5" />
        </svg>
      );

    case "sender":
      return (
        <svg {...commonProps}>
          <path d="M4 7h16" />
          <path d="M4 12h10" />
          <path d="M4 17h7" />
          <path d="M17 14v6" />
          <path d="M14 17h6" />
        </svg>
      );

    case "smpp":
      return (
        <svg {...commonProps}>
          <rect
            x="3"
            y="5"
            width="18"
            height="14"
            rx="2"
          />
          <path d="M7 9h2" />
          <path d="M11 9h2" />
          <path d="M15 9h2" />
          <path d="M7 13h10" />
          <path d="M7 16h6" />
        </svg>
      );

    // ========================================================================
    // Network & Routing
    // ========================================================================

    case "network":
      return (
        <svg {...commonProps}>
          <circle
            cx="12"
            cy="5"
            r="2.5"
          />
          <circle
            cx="5"
            cy="18"
            r="2.5"
          />
          <circle
            cx="19"
            cy="18"
            r="2.5"
          />

          <path d="M10.7 7.1 6.3 15.9" />
          <path d="m13.3 7.1 4.4 8.8" />
          <path d="M7.5 18h9" />
        </svg>
      );

    case "mobile-network":
      return (
        <svg {...commonProps}>
          <rect
            x="7"
            y="3"
            width="10"
            height="18"
            rx="2"
          />
          <path d="M10 6h4" />
          <path d="M9 14a4 4 0 0 1 6 0" />
          <path d="M10.5 11.5a2 2 0 0 1 3 0" />
          <circle
            cx="12"
            cy="17"
            r="1"
          />
        </svg>
      );

    case "connector":
      return (
        <svg {...commonProps}>
          <path d="M8 12h8" />
          <path d="M12 8v8" />

          <rect
            x="3"
            y="8"
            width="6"
            height="8"
            rx="2"
          />

          <rect
            x="15"
            y="8"
            width="6"
            height="8"
            rx="2"
          />
        </svg>
      );

    case "route":
      return (
        <svg {...commonProps}>
          <circle
            cx="5"
            cy="5"
            r="2"
          />
          <circle
            cx="19"
            cy="19"
            r="2"
          />

          <path d="M7 5h5a5 5 0 0 1 5 5v7" />
          <path d="M17 17h2" />

          <path d="m15 15 2 2-2 2" />
        </svg>
      );

    // ========================================================================
    // Clients
    // ========================================================================

    case "clients":
      return (
        <svg {...commonProps}>
          <path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
          <circle
            cx="9.5"
            cy="7"
            r="4"
          />
          <path d="M17 11a4 4 0 0 0 0-8" />
          <path d="M21 21v-2a4 4 0 0 0-3-3.87" />
        </svg>
      );

    // ========================================================================
    // Finance
    // ========================================================================

    case "wallet":
      return (
        <svg {...commonProps}>
          <path d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2H6a2 2 0 0 0 0 4h14v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6Z" />
          <path d="M20 10H6a2 2 0 0 1 0-4" />
          <path d="M16 14h.01" />
        </svg>
      );

    case "payments":
      return (
        <svg {...commonProps}>
          <rect
            x="3"
            y="5"
            width="18"
            height="14"
            rx="2"
          />
          <path d="M3 10h18" />
          <path d="M7 15h3" />
          <path d="M15 15h2" />
        </svg>
      );

    case "mobile-money":
      return (
        <svg {...commonProps}>
          <rect
            x="7"
            y="2.5"
            width="10"
            height="19"
            rx="2"
          />
          <path d="M10 5.5h4" />
          <path d="M11 18.5h2" />
          <path d="m10 11 2-2 2 2" />
          <path d="M12 9v5" />
        </svg>
      );

    // ========================================================================
    // Integrations
    // ========================================================================

    case "integrations":
      return (
        <svg {...commonProps}>
          <path d="M8 8h3V5a2 2 0 1 1 4 0v3h1a3 3 0 0 1 3 3v1h-3v3a2 2 0 1 1-4 0v-3H9a3 3 0 0 1-3-3V8h2Z" />
          <path d="M8 16H5a2 2 0 1 0 0 4h3" />
          <path d="M16 8h3" />
        </svg>
      );

    case "webhook":
    case "webhooks":
      return (
        <svg {...commonProps}>
          <path d="M18 8a4 4 0 0 0-7.5-2" />
          <path d="M6 16a4 4 0 0 0 7.5 2" />
          <path d="M10 6 8 8l2 2" />
          <path d="m14 18 2-2-2-2" />
          <path d="M8 8h6a4 4 0 0 1 4 4" />
          <path d="M16 16h-6a4 4 0 0 1-4-4" />
        </svg>
      );

    case "key":
      return (
        <svg {...commonProps}>
          <circle
            cx="8"
            cy="15"
            r="4"
          />
          <path d="m11 12 8-8" />
          <path d="m16 7 2 2" />
          <path d="m14 9 2 2" />
        </svg>
      );

    // ========================================================================
    // Administration
    // ========================================================================

    case "users":
      return (
        <svg {...commonProps}>
          <circle
            cx="9"
            cy="7"
            r="3"
          />
          <path d="M3 21v-2a6 6 0 0 1 12 0v2" />
          <path d="M16 4.5a3 3 0 0 1 0 5.8" />
          <path d="M21 21v-2a6 6 0 0 0-4-5.65" />
        </svg>
      );

    case "roles":
      return (
        <svg {...commonProps}>
          <path d="m12 3 7 3v5c0 4.5-3 7.5-7 10-4-2.5-7-5.5-7-10V6l7-3Z" />
          <path d="m9.5 12 1.5 1.5 3.5-4" />
        </svg>
      );

    case "shield":
      return (
        <svg {...commonProps}>
          <path d="m12 3 8 3v5c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-3Z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      );

    case "permissions":
      return (
        <svg {...commonProps}>
          <circle
            cx="8"
            cy="8"
            r="3"
          />
          <path d="M11 8h9" />
          <path d="M17 8v3" />
          <path d="M20 8v2" />
          <path d="M5 14h6" />
          <path d="M8 14v6" />
        </svg>
      );

    case "settings":
      return (
        <svg {...commonProps}>
          <circle
            cx="12"
            cy="12"
            r="3"
          />
          <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-1.41 1.41-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.56V21h-2v-.09a1.7 1.7 0 0 0-1.03-1.56 1.7 1.7 0 0 0-1.88.34l-.06.06-1.41-1.41.06-.06A1.7 1.7 0 0 0 9.4 15a1.7 1.7 0 0 0-1.56-1.03H7v-2h.84A1.7 1.7 0 0 0 9.4 11a1.7 1.7 0 0 0-.34-1.88L9 9.06l1.41-1.41.06.06A1.7 1.7 0 0 0 12.35 8a1.7 1.7 0 0 0 1.03-1.56V6h2v.44A1.7 1.7 0 0 0 16.4 8a1.7 1.7 0 0 0 1.88-.34l.06-.06 1.41 1.41-.06.06A1.7 1.7 0 0 0 19.4 11a1.7 1.7 0 0 0 1.56 1.03H21v2h-.09A1.7 1.7 0 0 0 19.4 15Z" />
        </svg>
      );

    // ========================================================================
    // Audit & Reporting
    // ========================================================================

    case "audit":
      return (
        <svg {...commonProps}>
          <path d="M4 4h16v16H4z" />
          <path d="M8 8h8" />
          <path d="M8 12h8" />
          <path d="M8 16h5" />
        </svg>
      );

    case "reports":
      return (
        <svg {...commonProps}>
          <path d="M4 20V10" />
          <path d="M10 20V4" />
          <path d="M16 20v-7" />
          <path d="M22 20H2" />
        </svg>
      );

    case "notifications":
      return (
        <svg {...commonProps}>
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
          <path d="M10 21h4" />
        </svg>
      );

    default:
      return null;
  }
}