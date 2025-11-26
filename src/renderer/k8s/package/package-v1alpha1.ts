import { Renderer } from "@freelensapp/extensions";

import type { PackageKubeObjectCRD } from "../types";

// ============================================================================
// Monitor Types
// ============================================================================

export interface MonitorAuthorizationCredentials {
  name: string;
  key: string;
  optional?: boolean;
}

export interface MonitorAuthorization {
  type?: string;
  credentials?: MonitorAuthorizationCredentials;
}

export interface Monitor {
  kind?: "PodMonitor" | "ServiceMonitor";
  path?: string;
  portName?: string;
  targetPort?: number;
  description?: string;
  authorization?: MonitorAuthorization;
  fallbackScrapeProtocol?: string;
  selector?: Record<string, string>;
  podSelector?: Record<string, string>;
}

// ============================================================================
// Network Types
// ============================================================================

export type RemoteGenerated = "KubeAPI" | "KubeNodes" | "IntraNamespace" | "CloudMetadata" | "Anywhere";

export type NetworkDirection = "Ingress" | "Egress";

export interface NetworkAllow {
  direction: NetworkDirection;
  ports?: number[];
  port?: number;
  selector?: Record<string, string>;
  remoteSelector?: Record<string, string>;
  remoteNamespace?: string;
  remoteServiceAccount?: string;
  remoteGenerated?: RemoteGenerated;
  remoteCidr?: string;
  remoteHost?: string;
  description?: string;
}

export interface CORSPolicy {
  allowCredentials?: boolean;
  allowHeaders?: string[];
  allowMethods?: string[];
  allowOrigins?: string[];
  exposeHeaders?: string[];
  maxAge?: string;
}

export interface HTTPRedirect {
  authority?: string;
  derivePort?: string;
  port?: number;
  redirectCode?: number;
  scheme?: string;
  uri?: string;
}

export interface HTTPRetry {
  attempts?: number;
  perTryTimeout?: string;
  retryOn?: string;
  retryRemoteLocalities?: boolean;
}

export interface HTTPRewrite {
  authority?: string;
  uri?: string;
  uriRegexRewrite?: {
    match?: string;
    rewrite?: string;
  };
}

export interface HTTPDirectResponse {
  status?: number;
  body?: string;
}

export interface AdvancedHTTP {
  corsPolicy?: CORSPolicy;
  redirect?: HTTPRedirect;
  retries?: HTTPRetry;
  rewrite?: HTTPRewrite;
  directResponse?: HTTPDirectResponse;
  timeout?: string;
  weight?: number;
}

export type HTTPMatchType = "exact" | "prefix" | "regex";

export interface HTTPMatch {
  method?: string;
  uri?: {
    [key in HTTPMatchType]?: string;
  };
}

export interface NetworkExpose {
  service?: string;
  port?: number;
  targetPort?: number;
  gateway?: string;
  host?: string;
  domain?: string;
  match?: HTTPMatch[];
  advancedHTTP?: AdvancedHTTP;
  description?: string;
}

export interface Network {
  allow?: NetworkAllow[];
  expose?: NetworkExpose[];
}

// ============================================================================
// SSO Types
// ============================================================================

export type SSOProtocol = "openid-connect" | "saml";

export interface SSOSecret {
  name: string;
  key?: string;
}

export interface SSOGroup {
  name: string;
  path?: string;
}

export interface SSOProtocolMapperConfig {
  [key: string]: string;
}

export interface SSOProtocolMapper {
  name: string;
  protocol?: string;
  protocolMapper?: string;
  config?: SSOProtocolMapperConfig;
}

export interface SSO {
  clientId: string;
  protocol?: SSOProtocol;
  name?: string;
  description?: string;
  enabled?: boolean;
  publicClient?: boolean;
  redirectUris?: string[];
  webOrigins?: string[];
  baseUrl?: string;
  rootUrl?: string;
  adminUrl?: string;
  defaultClientScopes?: string[];
  secret?: string;
  secretName?: string;
  secretTemplate?: SSOSecret;
  groups?: SSOGroup[];
  protocolMappers?: SSOProtocolMapper[];
  enableAuthserviceSelector?: Record<string, string>;
  serviceAccountsEnabled?: boolean;
  standardFlowEnabled?: boolean;
  alwaysDisplayInConsole?: boolean;
}

// ============================================================================
// Package Spec and Status
// ============================================================================

export interface PackageSpec {
  monitor?: Monitor[];
  network?: Network;
  sso?: SSO[];
}

export interface PackageEndpoint {
  name: string;
  url: string;
}

export interface PackageStatus {
  observedGeneration?: number;
  phase?: string;
  endpoints?: PackageEndpoint[] | string[];
  monitors?: string[];
  networkPolicies?: string[];
  networkPolicyCount?: number;
  ssoClients?: string[];
}

// ============================================================================
// Package Class and API
// ============================================================================

export class Package extends Renderer.K8sApi.LensExtensionKubeObject<
  Renderer.K8sApi.KubeObjectMetadata,
  PackageStatus,
  PackageSpec
> {
  static readonly kind = "Package";
  static readonly namespaced = true;
  static readonly apiBase = "/apis/uds.dev/v1alpha1/packages";

  static readonly crd: PackageKubeObjectCRD = {
    apiVersions: ["uds.dev/v1alpha1"],
    plural: "packages",
    singular: "package",
    shortNames: ["pkg"],
    title: "UDS Packages",
  };

  // Monitor Helper Methods
  static getMonitors(object: Package): Monitor[] {
    return object.spec?.monitor ?? [];
  }

  static getMonitorCount(object: Package): number {
    return this.getMonitors(object).length;
  }

  static hasMonitors(object: Package): boolean {
    return this.getMonitorCount(object) > 0;
  }

  // Network Helper Methods
  static getAllowRules(object: Package): NetworkAllow[] {
    return object.spec?.network?.allow ?? [];
  }

  static getExposeRules(object: Package): NetworkExpose[] {
    return object.spec?.network?.expose ?? [];
  }

  static getNetworkRuleCount(object: Package): number {
    return this.getAllowRules(object).length + this.getExposeRules(object).length;
  }

  static hasNetworkPolicies(object: Package): boolean {
    return this.getNetworkRuleCount(object) > 0;
  }

  static getExposedHosts(object: Package): string[] {
    return this.getExposeRules(object)
      .map((r) => r.host)
      .filter((h): h is string => !!h);
  }

  // SSO Helper Methods
  static getSSOClients(object: Package): SSO[] {
    return object.spec?.sso ?? [];
  }

  static getSSOClientCount(object: Package): number {
    return this.getSSOClients(object).length;
  }

  static hasSSO(object: Package): boolean {
    return this.getSSOClientCount(object) > 0;
  }

  static getSSOClientById(object: Package, clientId: string): SSO | undefined {
    return this.getSSOClients(object).find((s) => s.clientId === clientId);
  }

  // Status Helper Methods
  static getPhase(object: Package): string {
    return object.status?.phase ?? "Unknown";
  }

  static isReady(object: Package): boolean {
    return object.status?.phase === "Ready";
  }
}

export class PackageApi extends Renderer.K8sApi.KubeApi<Package> {}
export class PackageStore extends Renderer.K8sApi.KubeObjectStore<Package, PackageApi> {}
