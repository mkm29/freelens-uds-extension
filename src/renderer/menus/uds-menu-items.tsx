import { Renderer } from "@freelensapp/extensions";
import { copyToClipboard, createYamlCopyHandler } from "../../common/utils";
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

export const PackageMenuItem = (props: UDSMenuItemProps<Package>) => {
  const { object, toolbar } = props;

  if (!object) return null;

  const endpoints = Package.getExposeRules(object)
    .map((e) => e.host)
    .filter((h): h is string => !!h);
  const hasEndpoints = endpoints.length > 0;
  const ssoClients = Package.getSSOClients(object);
  const hasSSOClients = ssoClients.length > 0;

  const handleCopyYaml = createYamlCopyHandler({
    apiVersion: "uds.dev/v1alpha1",
    kind: "Package",
    metadata: buildMetadata(object),
    spec: object.spec,
  });

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

  const handleCopyYaml = createYamlCopyHandler({
    apiVersion: "uds.dev/v1alpha1",
    kind: "ClusterConfig",
    metadata: buildMetadata(object, false),
    spec: object.spec,
  });

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

  const handleCopyYaml = createYamlCopyHandler({
    apiVersion: "uds.dev/v1alpha1",
    kind: "Exemption",
    metadata: buildMetadata(object),
    spec: object.spec,
  });

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
