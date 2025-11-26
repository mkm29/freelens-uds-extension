import { Renderer } from "@freelensapp/extensions";
import { observer } from "mobx-react";
import { withErrorPage } from "../components/error-page";
import styles from "./clusterconfig-details.module.scss";
import stylesInline from "./clusterconfig-details.module.scss?inline";

import type { ClusterConfig } from "../k8s/clusterconfig/clusterconfig-v1alpha1";

const {
  Component: { Badge, DrawerItem, SubTitle },
} = Renderer;

export interface ClusterConfigDetailsProps extends Renderer.Component.KubeObjectDetailsProps<ClusterConfig> {
  extension: Renderer.LensExtension;
}

export const ClusterConfigDetails = observer((props: ClusterConfigDetailsProps) =>
  withErrorPage(props, () => {
    const { object } = props;

    const renderAttributes = () => {
      const attrs = object.spec?.attributes;
      if (!attrs || (!attrs.clusterName && (!attrs.tags || attrs.tags.length === 0))) {
        return <div className={styles.empty}>No attributes configured</div>;
      }

      return (
        <div className={styles.configItem}>
          <div className={styles.configDetails}>
            {attrs.clusterName && <div>Cluster Name: {attrs.clusterName}</div>}
            {attrs.tags && attrs.tags.length > 0 && (
              <div>
                Tags:
                <div className={styles.tagsList}>
                  {attrs.tags.map((tag, idx) => (
                    <Badge key={idx} label={tag} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      );
    };

    const renderExpose = () => {
      const expose = object.spec?.expose;
      if (!expose || (!expose.domain && !expose.adminDomain && !expose.caCert)) {
        return <div className={styles.empty}>No expose configuration</div>;
      }

      return (
        <div className={styles.configItem}>
          <div className={styles.configDetails}>
            {expose.domain && <div>Domain: {expose.domain}</div>}
            {expose.adminDomain && <div>Admin Domain: {expose.adminDomain}</div>}
            {expose.caCert && (
              <div>
                CA Certificate: <Badge label="Configured" />
                <div className={styles.caCert}>{expose.caCert}</div>
              </div>
            )}
          </div>
        </div>
      );
    };

    const renderNetworking = () => {
      const net = object.spec?.networking;
      if (!net || (!net.kubeApiCIDR && (!net.kubeNodeCIDRs || net.kubeNodeCIDRs.length === 0))) {
        return <div className={styles.empty}>No networking configuration</div>;
      }

      return (
        <div className={styles.configItem}>
          <div className={styles.configDetails}>
            {net.kubeApiCIDR && (
              <div>
                Kube API CIDR: <code>{net.kubeApiCIDR}</code>
              </div>
            )}
            {net.kubeNodeCIDRs && net.kubeNodeCIDRs.length > 0 && (
              <div>
                Kube Node CIDRs:
                <div className={styles.cidrList}>
                  {net.kubeNodeCIDRs.map((cidr, idx) => (
                    <code key={idx}>{cidr}</code>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      );
    };

    const renderPolicy = () => {
      const policy = object.spec?.policy;
      if (!policy || policy.allowAllNsExemptions === undefined) {
        return <div className={styles.empty}>No policy configuration</div>;
      }

      return (
        <div className={styles.configItem}>
          <div className={styles.configDetails}>
            <div>
              Allow All Namespace Exemptions: <Badge label={policy.allowAllNsExemptions ? "Yes" : "No"} />
            </div>
          </div>
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

        <SubTitle title="Attributes" />
        <div className={styles.section}>{renderAttributes()}</div>

        <SubTitle title="Expose" />
        <div className={styles.section}>{renderExpose()}</div>

        <SubTitle title="Networking" />
        <div className={styles.section}>{renderNetworking()}</div>

        <SubTitle title="Policy" />
        <div className={styles.section}>{renderPolicy()}</div>
      </>
    );
  }),
);
