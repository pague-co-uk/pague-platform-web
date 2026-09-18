export type NumberingAllocation =
  | {
    id: string;
    type: "PREFIX";
    value: string;
  }
  | {
    id: string;
    type: "RANGE";
    from: string;
    to: string;
  };

// ============================================================================
// Regex helpers
// ============================================================================

function escapeRegex(
  value: string,
): string {
  return value.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&",
  );
}

function digitRange(
  from: number,
  to: number,
): string {
  if (from === to) {
    return String(from);
  }

  if (from + 1 === to) {
    return `(?:${from}|${to})`;
  }

  return `[${from}-${to}]`;
}

// ============================================================================
// Numbering range regex
// ============================================================================

function buildRangeRegex(
  from: string,
  to: string,
): string {
  if (
    from.length !== to.length ||
    Number(from) > Number(to)
  ) {
    throw new Error(
      "Invalid numbering range.",
    );
  }

  const length =
    from.length;

  const build = (
    lower: string,
    upper: string,
    position: number,
  ): string => {
    if (
      position === length
    ) {
      return "";
    }

    const lowerDigit =
      Number(
        lower[position],
      );

    const upperDigit =
      Number(
        upper[position],
      );

    // The current digit is fixed.
    if (
      lowerDigit ===
      upperDigit
    ) {
      return (
        lower[position] +
        build(
          lower,
          upper,
          position + 1,
        )
      );
    }

    const parts: string[] = [];

    // ------------------------------------------------------------------------
    // Lower boundary
    // ------------------------------------------------------------------------

    if (
      lowerDigit < 9
    ) {
      const suffix =
        build(
          lower,
          "9".repeat(
            length,
          ),
          position + 1,
        );

      parts.push(
        lower[position] +
        suffix,
      );
    }

    // ------------------------------------------------------------------------
    // Middle digits
    // ------------------------------------------------------------------------

    if (
      lowerDigit + 1 <=
      upperDigit - 1
    ) {
      parts.push(
        digitRange(
          lowerDigit + 1,
          upperDigit - 1,
        ) +
        "\\d".repeat(
          length -
          position -
          1,
        ),
      );
    }

    // ------------------------------------------------------------------------
    // Upper boundary
    // ------------------------------------------------------------------------

    const suffix =
      build(
        "0".repeat(
          length,
        ),
        upper,
        position + 1,
      );

    parts.push(
      upper[position] +
      suffix,
    );

    if (
      parts.length === 1
    ) {
      return parts[0];
    }

    return `(?:${parts.join("|")})`;
  };

  return build(
    from,
    to,
    0,
  );
}

// ============================================================================
// Allocation regex
// ============================================================================

function buildAllocationRegex(
  allocation: NumberingAllocation,
): string {
  if (
    allocation.type ===
    "PREFIX"
  ) {
    return escapeRegex(
      allocation.value,
    );
  }

  return buildRangeRegex(
    allocation.from,
    allocation.to,
  );
}

// ============================================================================
// Routing regex
// ============================================================================

export function buildRoutingRegex(
  allocations:
    readonly NumberingAllocation[],
  callingCodes:
    readonly string[],
): string {
  if (
    allocations.length === 0 ||
    callingCodes.length === 0
  ) {
    return "";
  }

  // --------------------------------------------------------------------------
  // Allocations
  // --------------------------------------------------------------------------

  const allocationPatterns =
    allocations.map(
      buildAllocationRegex,
    );

  const allocationPattern =
    allocationPatterns.length ===
      1
      ? allocationPatterns[0]
      : `(?:${allocationPatterns.join("|")})`;

  // --------------------------------------------------------------------------
  // Calling codes
  // --------------------------------------------------------------------------

  const callingCodePatterns =
    callingCodes.map(
      escapeRegex,
    );

  const callingCodePattern =
    callingCodePatterns.length ===
      1
      ? callingCodePatterns[0]
      : `(?:${callingCodePatterns.join("|")})`;

  // --------------------------------------------------------------------------
  // Final pattern
  // --------------------------------------------------------------------------

  return `^${callingCodePattern}${allocationPattern}`;
}

// ============================================================================
// Validation
// ============================================================================

export function validatePrefix(
  value: string,
): string | null {
  const normalized =
    value.trim();

  if (!normalized) {
    return "Enter a numbering prefix.";
  }

  if (
    !/^\d+$/.test(
      normalized,
    )
  ) {
    return "A numbering prefix must contain digits only.";
  }

  return null;
}

export function validateRange(
  from: string,
  to: string,
): string | null {
  const normalizedFrom =
    from.trim();

  const normalizedTo =
    to.trim();

  if (
    !normalizedFrom ||
    !normalizedTo
  ) {
    return "Enter both the start and end of the range.";
  }

  if (
    !/^\d+$/.test(
      normalizedFrom,
    ) ||
    !/^\d+$/.test(
      normalizedTo,
    )
  ) {
    return "Numbering ranges must contain digits only.";
  }

  if (
    normalizedFrom.length !==
    normalizedTo.length
  ) {
    return "The start and end of a range must have the same number of digits.";
  }

  if (
    Number(normalizedFrom) >
    Number(normalizedTo)
  ) {
    return "The range start cannot be greater than the range end.";
  }

  return null;
}