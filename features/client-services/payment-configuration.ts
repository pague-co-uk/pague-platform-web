export function paymentConfigurationTemplate(serviceCode: string): string {
  const airtel = serviceCode === "AIRTEL_MONEY_MW";
  return JSON.stringify({
    version: 2,
    accountType: airtel ? "mobile" : "identifier",
    requiredFields: [],
    countries: airtel ? ["MW"] : [],
    dataFields: {},
    validation: {
      limits: airtel ? { minimumAmount: "2.00", maximumAmount: "1000000.00" } : {},
      currencies: airtel ? ["MWK"] : [],
      transactionTypes: airtel ? ["COLLECTIONS"] : [],
    },
  }, null, 2);
}

export function paymentConfigurationError(configuration: Record<string, unknown> | undefined): string | null {
  if (!configuration || !Object.keys(configuration).length) return "Payment services require configuration. Insert the payment template and review the allowed currencies, transaction types and limits.";
  if (configuration.version === 2 && !["mobile", "bank", "identifier"].includes(String(configuration.accountType))) return "Select an accountType: mobile, bank or identifier.";
  if (configuration.version !== 2 && configuration.requiredFields === undefined) return "Legacy payment configuration requires requiredFields: []. Insert the payment template for the version 2 format.";
  if (configuration.requiredFields !== undefined && (!Array.isArray(configuration.requiredFields) || configuration.requiredFields.some(field => typeof field !== "string" || !field.trim()))) return "requiredFields must be an array of field names; use [] when no extra fields are required.";
  const validation = configuration.validation;
  if (!validation || typeof validation !== "object" || Array.isArray(validation)) return "Payment configuration must include validation with limits, currencies and transactionTypes.";
  const rules = validation as Record<string, unknown>;
  if (!rules.limits || typeof rules.limits !== "object" || Array.isArray(rules.limits)) return "validation.limits must be an object; use {} when no amount limits apply.";
  for (const field of ["currencies", "transactionTypes"]) {
    const values = rules[field];
    if (!Array.isArray(values) || !values.length || values.some(value => typeof value !== "string" || !value.trim())) return `validation.${field} must contain at least one active code.`;
  }
  return null;
}
