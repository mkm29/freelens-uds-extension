export function maybe<T>(wrapped: () => T): T | null {
  try {
    return wrapped();
  } catch (error) {
    return null;
  }
}

/**
 * Returns a color class name based on the phase status.
 * Used for Badge styling across UDS resource pages.
 */
export function getPhaseColor(phase: string): string {
  switch (phase.toLowerCase()) {
    case "ready":
      return "success";
    case "pending":
      return "warning";
    case "failed":
      return "error";
    default:
      return "default";
  }
}

/**
 * Converts a JavaScript object to YAML format.
 * Used for generating YAML manifests for clipboard copy operations.
 */
export function jsonToYaml(obj: unknown, indent = 0): string {
  const spaces = "  ".repeat(indent);

  if (obj === null || obj === undefined) {
    return "null";
  }

  if (typeof obj === "string") {
    // Check if string needs quoting (contains special chars or looks like a number/boolean)
    if (
      obj.includes(":") ||
      obj.includes("#") ||
      obj.includes("\n") ||
      obj.startsWith(" ") ||
      obj.endsWith(" ") ||
      /^(true|false|yes|no|on|off|null|\d+\.?\d*)$/i.test(obj)
    ) {
      return JSON.stringify(obj);
    }
    return obj;
  }

  if (typeof obj === "number" || typeof obj === "boolean") {
    return String(obj);
  }

  if (Array.isArray(obj)) {
    if (obj.length === 0) return "[]";
    return obj
      .map((item) => {
        if (typeof item === "object" && item !== null && !Array.isArray(item)) {
          // For object array items, format inline with dash
          const entries = Object.entries(item).filter(([, v]) => v !== undefined);
          if (entries.length === 0) return `${spaces}- {}`;
          const firstEntry = entries[0];
          const restEntries = entries.slice(1);
          const firstValue = jsonToYaml(firstEntry[1], indent + 2);
          const isFirstComplex =
            typeof firstEntry[1] === "object" &&
            firstEntry[1] !== null &&
            (Array.isArray(firstEntry[1])
              ? (firstEntry[1] as unknown[]).length > 0
              : Object.keys(firstEntry[1]).length > 0);

          let result = isFirstComplex
            ? `${spaces}- ${firstEntry[0]}:\n${firstValue}`
            : `${spaces}- ${firstEntry[0]}: ${firstValue}`;

          for (const [key, value] of restEntries) {
            const yamlValue = jsonToYaml(value, indent + 2);
            const isComplex =
              typeof value === "object" &&
              value !== null &&
              (Array.isArray(value) ? (value as unknown[]).length > 0 : Object.keys(value).length > 0);
            if (isComplex) {
              result += `\n${spaces}  ${key}:\n${yamlValue}`;
            } else {
              result += `\n${spaces}  ${key}: ${yamlValue}`;
            }
          }
          return result;
        }
        return `${spaces}- ${jsonToYaml(item, indent + 1)}`;
      })
      .join("\n");
  }

  if (typeof obj === "object") {
    const entries = Object.entries(obj).filter(([, v]) => v !== undefined);
    if (entries.length === 0) return "{}";
    return entries
      .map(([key, value]) => {
        const yamlValue = jsonToYaml(value, indent + 1);
        if (
          typeof value === "object" &&
          value !== null &&
          (Array.isArray(value) ? (value as unknown[]).length > 0 : Object.keys(value).length > 0)
        ) {
          return `${spaces}${key}:\n${yamlValue}`;
        }
        return `${spaces}${key}: ${yamlValue}`;
      })
      .join("\n");
  }

  return String(obj);
}
