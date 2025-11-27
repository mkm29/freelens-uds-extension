import { Renderer } from "@freelensapp/extensions";

import type { ExemptionKubeObjectCRD } from "../types";

export type ExemptionPolicy =
  | "DisallowHostNamespaces"
  | "DisallowNodePortServices"
  | "DisallowPrivileged"
  | "DisallowSELinuxOptions"
  | "DropAllCapabilities"
  | "RequireNonRootUser"
  | "RestrictCapabilities"
  | "RestrictExternalNames"
  | "RestrictHostPathWrite"
  | "RestrictHostPorts"
  | "RestrictIstioAmbientOverrides"
  | "RestrictIstioSidecarOverrides"
  | "RestrictIstioTrafficOverrides"
  | "RestrictIstioUser"
  | "RestrictProcMount"
  | "RestrictSeccomp"
  | "RestrictSELinuxType"
  | "RestrictVolumeTypes";

export type ExemptionMatcherKind = "pod" | "service";

export interface ExemptionMatcher {
  kind: ExemptionMatcherKind;
  name: string;
  namespace: string;
}

export interface ExemptionItem {
  title?: string;
  description?: string;
  matcher: ExemptionMatcher;
  policies: ExemptionPolicy[];
}

export interface ExemptionSpec {
  exemptions?: ExemptionItem[];
}

export interface ExemptionStatus {
  observedGeneration?: number;
  phase?: string;
}

export class Exemption extends Renderer.K8sApi.LensExtensionKubeObject<
  Renderer.K8sApi.KubeObjectMetadata,
  ExemptionStatus,
  ExemptionSpec
> {
  static readonly kind = "Exemption";
  static readonly namespaced = true;
  static readonly apiBase = "/apis/uds.dev/v1alpha1/exemptions";

  static readonly crd: ExemptionKubeObjectCRD = {
    apiVersions: ["uds.dev/v1alpha1"],
    plural: "exemptions",
    singular: "exemption",
    shortNames: ["exempt"],
    title: "UDS Exemptions",
  };

  // Exemption Helper Methods
  static getExemptions(object: Exemption): ExemptionItem[] {
    return object.spec?.exemptions ?? [];
  }

  static getExemptionCount(object: Exemption): number {
    return this.getExemptions(object).length;
  }

  static hasExemptions(object: Exemption): boolean {
    return this.getExemptionCount(object) > 0;
  }

  static getPolicyCount(object: Exemption): number {
    return this.getExemptions(object).reduce((count, exemption) => count + (exemption.policies?.length ?? 0), 0);
  }

  static getUniqueNamespaces(object: Exemption): string[] {
    const namespaces = new Set<string>();
    this.getExemptions(object).forEach((exemption) => {
      if (exemption.matcher?.namespace) {
        namespaces.add(exemption.matcher.namespace);
      }
    });
    return Array.from(namespaces);
  }

  static getUniquePolicies(object: Exemption): ExemptionPolicy[] {
    const policies = new Set<ExemptionPolicy>();
    this.getExemptions(object).forEach((exemption) => {
      exemption.policies?.forEach((policy) => policies.add(policy));
    });
    return Array.from(policies);
  }

  static getExemptionsByKind(object: Exemption, kind: ExemptionMatcherKind): ExemptionItem[] {
    return this.getExemptions(object).filter((e) => e.matcher?.kind === kind);
  }

  static getPodExemptions(object: Exemption): ExemptionItem[] {
    return this.getExemptionsByKind(object, "pod");
  }

  static getServiceExemptions(object: Exemption): ExemptionItem[] {
    return this.getExemptionsByKind(object, "service");
  }

  // Status Helper Methods
  static getPhase(object: Exemption): string {
    return object.status?.phase ?? "Unknown";
  }

  static isReady(object: Exemption): boolean {
    return object.status?.phase === "Ready";
  }
}

export class ExemptionApi extends Renderer.K8sApi.KubeApi<Exemption> {}
export class ExemptionStore extends Renderer.K8sApi.KubeObjectStore<Exemption, ExemptionApi> {}
