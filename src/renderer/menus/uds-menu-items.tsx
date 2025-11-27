import { Renderer } from "@freelensapp/extensions";
import { Package } from "../k8s/package/package-v1alpha1";

import type { ClusterConfig } from "../k8s/clusterconfig/clusterconfig-v1alpha1";
import type { Exemption } from "../k8s/exemption/exemption-v1alpha1";

const {
  Component: { Icon, MenuItem, SubMenu },
} = Renderer;

// Menu item props for each UDS CR type
export interface UDSMenuItemProps<T extends Renderer.K8sApi.KubeObject>
  extends Renderer.Component.KubeObjectMenuProps<T> {
  extension: Renderer.LensExtension;
}

// Clipboard helper
const copyToClipboard = async (text: string): Promise<void> => {
  await navigator.clipboard.writeText(text);
};

// Open URL helper
const openUrl = (url: string): void => {
  window.open(url, "_blank", "noopener,noreferrer");
};

// Build metadata object with labels and annotations
const buildMetadata = (object: Renderer.K8sApi.KubeObject, includeNamespace = true): Record<string, unknown> => {
  const metadata: Record<string, unknown> = {
    name: object.getName(),
  };

  if (includeNamespace) {
    const ns = object.getNs();
    if (ns) {
      metadata.namespace = ns;
    }
  }

  // Access labels directly from metadata object
  const labels = object.metadata?.labels;
  if (labels && Object.keys(labels).length > 0) {
    metadata.labels = { ...labels };
  }

  // Access annotations directly from metadata object
  const annotations = object.metadata?.annotations;
  if (annotations && Object.keys(annotations).length > 0) {
    metadata.annotations = { ...annotations };
  }

  return metadata;
};

// Simple JSON to YAML converter
const jsonToYaml = (obj: unknown, indent = 0): string => {
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
};

export const PackageMenuItem = (props: UDSMenuItemProps<Package>) => {
  const { object, toolbar } = props;

  if (!object) return null;

  const endpoints = Package.getExposeRules(object)
    .map((e) => e.host)
    .filter((h): h is string => !!h);
  const hasEndpoints = endpoints.length > 0;
  const ssoClients = Package.getSSOClients(object);
  const hasSSOClients = ssoClients.length > 0;

  const handleCopyYaml = async (event: React.MouseEvent) => {
    event.stopPropagation();
    const manifest = {
      apiVersion: "uds.dev/v1alpha1",
      kind: "Package",
      metadata: buildMetadata(object),
      spec: object.spec,
    };
    await copyToClipboard(jsonToYaml(manifest));
  };

  return (
    <>
      <MenuItem onClick={handleCopyYaml} title="Copy the full YAML manifest to clipboard">
        <Icon material="content_copy" interactive={toolbar} />
        <span className="title">Copy YAML Manifest</span>
      </MenuItem>
      {hasEndpoints && (
        <SubMenu>
          <MenuItem title="Open an exposed endpoint in your browser">
            <Icon material="link" interactive={toolbar} />
            <span className="title">Open Endpoint</span>
          </MenuItem>
          {endpoints.map((endpoint, idx) => (
            <MenuItem
              key={idx}
              title={`Open https://${endpoint} in a new tab`}
              onClick={(event: React.MouseEvent) => {
                event.stopPropagation();
                openUrl(`https://${endpoint}`);
              }}
            >
              <span className="title">{endpoint}</span>
            </MenuItem>
          ))}
        </SubMenu>
      )}
      {hasSSOClients && (
        <SubMenu>
          <MenuItem title="Copy an SSO client ID to clipboard">
            <Icon material="vpn_key" interactive={toolbar} />
            <span className="title">SSO Clients</span>
          </MenuItem>
          {ssoClients.map((client, idx) => (
            <MenuItem
              key={idx}
              title={`Copy client ID "${client.clientId}" to clipboard`}
              onClick={async (event: React.MouseEvent) => {
                event.stopPropagation();
                await copyToClipboard(client.clientId);
              }}
            >
              <span className="title">{client.clientId} (copy)</span>
            </MenuItem>
          ))}
        </SubMenu>
      )}
    </>
  );
};

export const ClusterConfigMenuItem = (props: UDSMenuItemProps<ClusterConfig>) => {
  const { object, toolbar } = props;

  if (!object) return null;

  const domain = object.spec?.expose?.domain;
  const adminDomain = object.spec?.expose?.adminDomain;

  const handleCopyYaml = async (event: React.MouseEvent) => {
    event.stopPropagation();
    const manifest = {
      apiVersion: "uds.dev/v1alpha1",
      kind: "UDSClusterConfig",
      metadata: buildMetadata(object, false),
      spec: object.spec,
    };
    await copyToClipboard(jsonToYaml(manifest));
  };

  const handleCopyDomain = async (event: React.MouseEvent, domainValue: string) => {
    event.stopPropagation();
    await copyToClipboard(domainValue);
  };

  return (
    <>
      <MenuItem onClick={handleCopyYaml} title="Copy the full YAML manifest to clipboard">
        <Icon material="content_copy" interactive={toolbar} />
        <span className="title">Copy YAML Manifest</span>
      </MenuItem>
      {domain && (
        <MenuItem
          onClick={(e: React.MouseEvent) => handleCopyDomain(e, domain)}
          title={`Copy domain "${domain}" to clipboard`}
        >
          <Icon material="dns" interactive={toolbar} />
          <span className="title">Copy Domain ({domain})</span>
        </MenuItem>
      )}
      {adminDomain && (
        <MenuItem
          onClick={(e: React.MouseEvent) => handleCopyDomain(e, adminDomain)}
          title={`Copy admin domain "${adminDomain}" to clipboard`}
        >
          <Icon material="admin_panel_settings" interactive={toolbar} />
          <span className="title">Copy Admin Domain ({adminDomain})</span>
        </MenuItem>
      )}
    </>
  );
};

export const ExemptionMenuItem = (props: UDSMenuItemProps<Exemption>) => {
  const { object, toolbar } = props;

  if (!object) return null;

  const exemptions = object.spec?.exemptions ?? [];
  const policies = new Set<string>();
  exemptions.forEach((e) => e.policies?.forEach((p) => policies.add(p)));

  const handleCopyYaml = async (event: React.MouseEvent) => {
    event.stopPropagation();
    const manifest = {
      apiVersion: "uds.dev/v1alpha1",
      kind: "Exemption",
      metadata: buildMetadata(object),
      spec: object.spec,
    };
    await copyToClipboard(jsonToYaml(manifest));
  };

  const handleCopyPolicies = async (event: React.MouseEvent) => {
    event.stopPropagation();
    await copyToClipboard(Array.from(policies).join("\n"));
  };

  return (
    <>
      <MenuItem onClick={handleCopyYaml} title="Copy the full YAML manifest to clipboard">
        <Icon material="content_copy" interactive={toolbar} />
        <span className="title">Copy YAML Manifest</span>
      </MenuItem>
      {policies.size > 0 && (
        <MenuItem onClick={handleCopyPolicies} title="Copy all exempted policy names to clipboard">
          <Icon material="policy" interactive={toolbar} />
          <span className="title">Copy Policies ({policies.size})</span>
        </MenuItem>
      )}
    </>
  );
};
