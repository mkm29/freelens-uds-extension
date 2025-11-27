import { Renderer } from "@freelensapp/extensions";
import { observer } from "mobx-react";
import { withErrorPage } from "../components/error-page";
import styles from "./exemption-details.module.scss";
import stylesInline from "./exemption-details.module.scss?inline";

import type { Exemption, ExemptionItem } from "../k8s/exemption/exemption-v1alpha1";

const {
  Component: { Badge, DrawerItem, SubTitle, Table, TableCell, TableHead, TableRow },
} = Renderer;

export interface ExemptionDetailsProps extends Renderer.Component.KubeObjectDetailsProps<Exemption> {
  extension: Renderer.LensExtension;
}

export const ExemptionDetails = observer((props: ExemptionDetailsProps) =>
  withErrorPage(props, () => {
    const { object } = props;

    const renderExemptionItems = (exemptions?: ExemptionItem[]) => {
      if (!exemptions || exemptions.length === 0) {
        return <div className={styles.empty}>No exemptions configured</div>;
      }

      return (
        <div className={styles.exemptionsList}>
          {exemptions.map((exemption, idx) => (
            <div key={idx} className={styles.exemptionItem}>
              <div className={styles.exemptionHeader}>
                <Badge label={exemption.matcher?.kind || "unknown"} />
                {exemption.title && <span className={styles.title}>{exemption.title}</span>}
              </div>
              {exemption.description && <div className={styles.description}>{exemption.description}</div>}
              <div className={styles.exemptionDetails}>
                <div className={styles.matcherSection}>
                  <strong>Matcher:</strong>
                  <div className={styles.matcherDetails}>
                    <span>
                      <code>{exemption.matcher?.namespace || "N/A"}</code>/
                      <code>{exemption.matcher?.name || "N/A"}</code>
                    </span>
                  </div>
                </div>
                <div className={styles.policiesSection}>
                  <strong>Policies ({exemption.policies?.length || 0}):</strong>
                  <div className={styles.policiesList}>
                    {exemption.policies?.map((policy, pIdx) => (
                      <Badge key={pIdx} label={policy} className={styles.policyBadge} />
                    )) || <span className={styles.empty}>None</span>}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    };

    const renderPolicySummary = () => {
      const exemptions = object.spec?.exemptions ?? [];
      const policyCount: Record<string, number> = {};

      exemptions.forEach((exemption) => {
        exemption.policies?.forEach((policy) => {
          policyCount[policy] = (policyCount[policy] || 0) + 1;
        });
      });

      const sortedPolicies = Object.entries(policyCount).sort((a, b) => b[1] - a[1]);

      if (sortedPolicies.length === 0) {
        return <div className={styles.empty}>No policies</div>;
      }

      return (
        <Table className={styles.table}>
          <TableHead>
            <TableCell className={styles.policyName}>Policy</TableCell>
            <TableCell className={styles.policyCount}>Count</TableCell>
          </TableHead>
          {sortedPolicies.map(([policy, count], idx) => (
            <TableRow key={idx}>
              <TableCell className={styles.policyName}>{policy}</TableCell>
              <TableCell className={styles.policyCount}>
                <Badge label={String(count)} />
              </TableCell>
            </TableRow>
          ))}
        </Table>
      );
    };

    const exemptions = object.spec?.exemptions ?? [];
    const podExemptions = exemptions.filter((e) => e.matcher?.kind === "pod");
    const serviceExemptions = exemptions.filter((e) => e.matcher?.kind === "service");

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
        <DrawerItem name="Total Exemptions">{exemptions.length}</DrawerItem>

        <SubTitle title="Policy Summary" />
        <div className={styles.section}>{renderPolicySummary()}</div>

        <SubTitle title={`Pod Exemptions (${podExemptions.length})`} />
        <div className={styles.section}>{renderExemptionItems(podExemptions)}</div>

        <SubTitle title={`Service Exemptions (${serviceExemptions.length})`} />
        <div className={styles.section}>{renderExemptionItems(serviceExemptions)}</div>
      </>
    );
  }),
);
