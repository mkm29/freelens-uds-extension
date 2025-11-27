import { Renderer } from "@freelensapp/extensions";

export interface NamespacedObjectReference {
  name: string;
  namespace?: string;
}

/**
 * Unified CRD interface for all UDS custom resources.
 * Extends the base LensExtensionKubeObjectCRD with a title field.
 */
export interface UDSKubeObject extends Renderer.K8sApi.LensExtensionKubeObjectCRD {
  title: string;
}
