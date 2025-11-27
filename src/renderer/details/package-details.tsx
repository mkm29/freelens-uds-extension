import { Renderer } from "@freelensapp/extensions";
import { observer } from "mobx-react";
import { useEffect, useState } from "react";
import { withErrorPage } from "../components/error-page";
import styles from "./package-details.module.scss";
import stylesInline from "./package-details.module.scss?inline";

import type {
  Monitor,
  NetworkAllow,
  NetworkExpose,
  Package,
  PackageEndpoint,
  SSO,
} from "../k8s/package/package-v1alpha1";

const {
  Component: { Badge, DrawerItem, SubTitle, Table, TableCell, TableHead, TableRow },
  Navigation,
} = Renderer;

export interface PackageDetailsProps extends Renderer.Component.KubeObjectDetailsProps<Package> {
  extension: Renderer.LensExtension;
}

interface NetworkPolicyInfo {
  name: string;
  namespace: string;
}

export const PackageDetails = observer((props: PackageDetailsProps) =>
  withErrorPage(props, () => {
    const { object } = props;
    const [networkPolicies, setNetworkPolicies] = useState<NetworkPolicyInfo[]>([]);
    const [loadingPolicies, setLoadingPolicies] = useState(true);

    // Fetch NetworkPolicies in the Package's namespace that belong to this Package (via uds/package label)
    useEffect(() => {
      const fetchNetworkPolicies = async () => {
        try {
          const namespace = object.getNs();
          const packageName = object.getName();

          // Use the apiManager to get or create a NetworkPolicy API instance
          // The apiBase for NetworkPolicies follows the standard K8s API pattern
          const networkPolicyApi = new Renderer.K8sApi.KubeApi({
            objectConstructor: Renderer.K8sApi.KubeObject,
            apiBase: "/apis/networking.k8s.io/v1/networkpolicies",
            kind: "NetworkPolicy",
            checkPreferredVersion: true,
          });

          // List NetworkPolicies with label selector
          const labelSelector = `uds/package=${packageName}`;
          const allPolicies = await networkPolicyApi.list({ namespace }, { labelSelector });

          if (allPolicies) {
            setNetworkPolicies(
              allPolicies.map((p: any) => ({
                // KubeObject uses getName() and getNs() methods
                name: typeof p.getName === "function" ? p.getName() : p.metadata?.name || "",
                namespace: typeof p.getNs === "function" ? p.getNs() : p.metadata?.namespace || namespace,
              })),
            );
          }
        } catch (error) {
          // If we can't fetch policies, we'll just show the count from status
          console.warn("Could not fetch NetworkPolicies:", error);
        } finally {
          setLoadingPolicies(false);
        }
      };

      fetchNetworkPolicies();
    }, [object]);

    const renderSelector = (selector?: { [key: string]: string }) => {
      if (!selector || Object.keys(selector).length === 0) return "None";
      return Object.entries(selector)
        .map(([key, value]) => `${key}=${value}`)
        .join(", ");
    };

    const renderSSOClients = (ssoClients?: SSO[]) => {
      if (!ssoClients || ssoClients.length === 0) {
        return <div className={styles.empty}>No SSO clients configured</div>;
      }

      return (
        <Table className={styles.table}>
          <TableHead>
            <TableCell className={styles.clientId}>Client ID</TableCell>
            <TableCell className={styles.protocol}>Protocol</TableCell>
            <TableCell className={styles.public}>Public</TableCell>
            <TableCell className={styles.redirects}>Redirect URIs</TableCell>
            <TableCell className={styles.groups}>Groups</TableCell>
          </TableHead>
          {ssoClients.map((client, idx) => (
            <TableRow key={idx}>
              <TableCell className={styles.clientId}>{client.clientId}</TableCell>
              <TableCell className={styles.protocol}>{client.protocol || "openid-connect"}</TableCell>
              <TableCell className={styles.public}>
                <Badge label={client.publicClient ? "Yes" : "No"} />
              </TableCell>
              <TableCell className={styles.redirects}>
                {client.redirectUris?.length ? client.redirectUris.join(", ") : "None"}
              </TableCell>
              <TableCell className={styles.groups}>
                {client.groups?.length ? client.groups.map((g) => g.name).join(", ") : "None"}
              </TableCell>
            </TableRow>
          ))}
        </Table>
      );
    };

    const renderNetworkAllowRules = (allowRules?: NetworkAllow[]) => {
      if (!allowRules || allowRules.length === 0) {
        return <div className={styles.empty}>No network allow rules configured</div>;
      }

      return (
        <div className={styles.rulesList}>
          {allowRules.map((rule, idx) => (
            <div key={idx} className={styles.rule}>
              <div className={styles.ruleHeader}>
                <Badge label={rule.direction || "Ingress"} />
                {rule.description && <span className={styles.description}>{rule.description}</span>}
              </div>
              <div className={styles.ruleDetails}>
                {rule.selector && <div>Selector: {renderSelector(rule.selector)}</div>}
                {rule.remoteSelector && <div>Remote Selector: {renderSelector(rule.remoteSelector)}</div>}
                {rule.remoteGenerated && <div>Remote Generated: {rule.remoteGenerated}</div>}
                {rule.remoteCidr && <div>Remote CIDR: {rule.remoteCidr}</div>}
                {rule.ports && rule.ports.length > 0 && <div>Ports: {rule.ports.join(", ")}</div>}
                {rule.port && <div>Port: {rule.port}</div>}
              </div>
            </div>
          ))}
        </div>
      );
    };

    const renderNetworkExposeRules = (exposeRules?: NetworkExpose[]) => {
      if (!exposeRules || exposeRules.length === 0) {
        return <div className={styles.empty}>No network expose rules configured</div>;
      }

      return (
        <Table className={styles.table}>
          <TableHead>
            <TableCell className={styles.service}>Service</TableCell>
            <TableCell className={styles.port}>Port</TableCell>
            <TableCell className={styles.gateway}>Gateway</TableCell>
            <TableCell className={styles.host}>Host</TableCell>
          </TableHead>
          {exposeRules.map((expose, idx) => (
            <TableRow key={idx}>
              <TableCell className={styles.service}>{expose.service}</TableCell>
              <TableCell className={styles.port}>
                {expose.port || expose.targetPort
                  ? `${expose.port || "auto"} → ${expose.targetPort || "auto"}`
                  : "auto"}
              </TableCell>
              <TableCell className={styles.gateway}>{expose.gateway || "default"}</TableCell>
              <TableCell className={styles.host}>
                {expose.host || (expose.domain ? `*.${expose.domain}` : "N/A")}
              </TableCell>
            </TableRow>
          ))}
        </Table>
      );
    };

    const renderMonitors = (monitors?: Monitor[]) => {
      if (!monitors || monitors.length === 0) {
        return <div className={styles.empty}>No monitors configured</div>;
      }

      return (
        <div className={styles.monitorsList}>
          {monitors.map((monitor, idx) => (
            <div key={idx} className={styles.monitor}>
              <div className={styles.monitorHeader}>
                <Badge label={monitor.kind || "ServiceMonitor"} />
                {monitor.description && <span className={styles.description}>{monitor.description}</span>}
              </div>
              <div className={styles.monitorDetails}>
                {monitor.path && <div>Path: {monitor.path}</div>}
                {monitor.portName && <div>Port Name: {monitor.portName}</div>}
                {monitor.targetPort && <div>Target Port: {monitor.targetPort}</div>}
                {monitor.selector && <div>Selector: {renderSelector(monitor.selector)}</div>}
                {monitor.authorization && (
                  <div>
                    Authorization: {monitor.authorization.type || "bearer"}
                    {monitor.authorization.credentials?.name && ` (secret: ${monitor.authorization.credentials.name})`}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      );
    };

    const renderNetworkPolicies = () => {
      const policyCount = object.status?.networkPolicyCount || 0;

      if (loadingPolicies) {
        return <div className={styles.empty}>Loading network policies...</div>;
      }

      if (networkPolicies.length === 0) {
        if (policyCount > 0) {
          // We have a count but couldn't fetch the policies - show count only
          return <div className={styles.empty}>{policyCount} network policies created (names not available)</div>;
        }
        return <div className={styles.empty}>No network policies created</div>;
      }

      return (
        <div className={styles.networkPoliciesList}>
          {networkPolicies.map((policy, idx) => (
            <div key={idx} className={styles.networkPolicyItem}>
              <div className={styles.networkPolicyHeader}>
                <Badge label="NetworkPolicy" />
                <a
                  href="#"
                  className={styles.networkPolicyName}
                  onClick={(e) => {
                    e.preventDefault();
                    // Navigate to the Network Policies page with the specific policy's details open
                    // The selfLink format for NetworkPolicies is: /apis/networking.k8s.io/v1/namespaces/{ns}/networkpolicies/{name}
                    const selfLink = `/apis/networking.k8s.io/v1/namespaces/${policy.namespace}/networkpolicies/${policy.name}`;
                    Navigation.navigate(`/network-policies?kubeDetails=${encodeURIComponent(selfLink)}`);
                  }}
                >
                  {policy.name || `[unnamed-${idx}]`}
                </a>
              </div>
            </div>
          ))}
        </div>
      );
    };

    return (
      <>
        <style>{stylesInline}</style>
        <DrawerItem name="API Version">uds.dev/v1alpha1</DrawerItem>
        <DrawerItem name="Phase">
          <Badge label={object.status?.phase || "Unknown"} />
        </DrawerItem>
        {object.status?.observedGeneration && (
          <DrawerItem name="Observed Generation">{object.status.observedGeneration}</DrawerItem>
        )}

        <SubTitle title={`Network Policies (${loadingPolicies ? "..." : networkPolicies.length})`} />
        <div className={styles.section}>{renderNetworkPolicies()}</div>

        <SubTitle title={`SSO Clients (${object.spec.sso?.length || 0})`} />
        <div className={styles.section}>{renderSSOClients(object.spec.sso)}</div>

        <SubTitle title={`Network Allow Rules (${object.spec.network?.allow?.length || 0})`} />
        <div className={styles.section}>{renderNetworkAllowRules(object.spec.network?.allow)}</div>

        <SubTitle title={`Network Expose Rules (${object.spec.network?.expose?.length || 0})`} />
        <div className={styles.section}>{renderNetworkExposeRules(object.spec.network?.expose)}</div>

        <SubTitle title={`Monitors (${object.spec.monitor?.length || 0})`} />
        <div className={styles.section}>{renderMonitors(object.spec.monitor)}</div>

        {object.status?.endpoints && object.status.endpoints.length > 0 && (
          <>
            <SubTitle title="Endpoints" />
            {object.status.endpoints.map((endpoint: PackageEndpoint | string, idx: number) => {
              const isString = typeof endpoint === "string";
              const url = isString ? endpoint : endpoint.url;
              const name = isString ? `Endpoint ${idx + 1}` : endpoint.name;
              return (
                <DrawerItem key={idx} name={name}>
                  <a href={url} target="_blank" rel="noopener noreferrer">
                    {url}
                  </a>
                </DrawerItem>
              );
            })}
          </>
        )}
      </>
    );
  }),
);
