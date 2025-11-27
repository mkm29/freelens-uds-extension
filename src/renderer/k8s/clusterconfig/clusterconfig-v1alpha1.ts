import { Renderer } from "@freelensapp/extensions";

import type { UDSKubeObject } from "../types";

export interface ClusterConfigAttributes {
  clusterName?: string;
  tags?: string[];
}

export interface ClusterConfigExpose {
  domain?: string;
  adminDomain?: string;
  caCert?: string;
}

export interface ClusterConfigNetworking {
  kubeApiCIDR?: string;
  kubeNodeCIDRs?: string[];
}

export interface ClusterConfigPolicy {
  allowAllNsExemptions?: boolean;
}

export interface ClusterConfigSpec {
  attributes?: ClusterConfigAttributes;
  expose?: ClusterConfigExpose;
  networking?: ClusterConfigNetworking;
  policy?: ClusterConfigPolicy;
}

export interface ClusterConfigStatus {
  observedGeneration?: number;
  phase?: string;
}

export class ClusterConfig extends Renderer.K8sApi.LensExtensionKubeObject<
  Renderer.K8sApi.KubeObjectMetadata,
  ClusterConfigStatus,
  ClusterConfigSpec
> {
  static readonly kind = "ClusterConfig";
  static readonly namespaced = false;
  static readonly apiBase = "/apis/uds.dev/v1alpha1/clusterconfig";

  static readonly crd: UDSKubeObject = {
    apiVersions: ["uds.dev/v1alpha1"],
    plural: "clusterconfig",
    singular: "clusterconfig",
    shortNames: ["cc"],
    title: "UDS Cluster Configs",
  };

  // Attributes Helper Methods
  static getClusterName(object: ClusterConfig): string {
    return object.spec?.attributes?.clusterName ?? "Unknown";
  }

  static getTags(object: ClusterConfig): string[] {
    return object.spec?.attributes?.tags ?? [];
  }

  static hasAttributes(object: ClusterConfig): boolean {
    const attrs = object.spec?.attributes;
    return !!(attrs?.clusterName || (attrs?.tags && attrs.tags.length > 0));
  }

  // Expose Helper Methods
  static getDomain(object: ClusterConfig): string {
    return object.spec?.expose?.domain ?? "";
  }

  static getAdminDomain(object: ClusterConfig): string {
    return object.spec?.expose?.adminDomain ?? "";
  }

  static hasCACert(object: ClusterConfig): boolean {
    return !!object.spec?.expose?.caCert;
  }

  static hasExpose(object: ClusterConfig): boolean {
    const expose = object.spec?.expose;
    return !!(expose?.domain || expose?.adminDomain || expose?.caCert);
  }

  // Networking Helper Methods
  static getKubeApiCIDR(object: ClusterConfig): string {
    return object.spec?.networking?.kubeApiCIDR ?? "";
  }

  static getKubeNodeCIDRs(object: ClusterConfig): string[] {
    return object.spec?.networking?.kubeNodeCIDRs ?? [];
  }

  static hasNetworking(object: ClusterConfig): boolean {
    const net = object.spec?.networking;
    return !!(net?.kubeApiCIDR || (net?.kubeNodeCIDRs && net.kubeNodeCIDRs.length > 0));
  }

  // Policy Helper Methods
  static getAllowAllNsExemptions(object: ClusterConfig): boolean {
    return object.spec?.policy?.allowAllNsExemptions ?? false;
  }

  static hasPolicy(object: ClusterConfig): boolean {
    return object.spec?.policy?.allowAllNsExemptions !== undefined;
  }

  // Status Helper Methods
  static getPhase(object: ClusterConfig): string {
    return object.status?.phase ?? "Unknown";
  }

  static isReady(object: ClusterConfig): boolean {
    return object.status?.phase === "Ready";
  }
}

export class ClusterConfigApi extends Renderer.K8sApi.KubeApi<ClusterConfig> {}
export class ClusterConfigStore extends Renderer.K8sApi.KubeObjectStore<ClusterConfig, ClusterConfigApi> {}
