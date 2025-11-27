import { Renderer } from "@freelensapp/extensions";
import { observer } from "mobx-react";
import { withErrorPage } from "../components/error-page";
import { Exemption, type ExemptionApi } from "../k8s/exemption/exemption-v1alpha1";
import styles from "./exemptions-page.module.scss";
import stylesInline from "./exemptions-page.module.scss?inline";

const {
  Component: { Badge, KubeObjectAge, KubeObjectListLayout, LinkToNamespace, WithTooltip },
} = Renderer;

const KubeObject = Exemption;
type KubeObject = Exemption;
type KubeObjectApi = ExemptionApi;

const sortingCallbacks = {
  name: (object: KubeObject) => object.getName(),
  namespace: (object: KubeObject) => object.getNs(),
  exemptions: (object: KubeObject) => KubeObject.getExemptionCount(object),
  policies: (object: KubeObject) => KubeObject.getPolicyCount(object),
  phase: (object: KubeObject) => KubeObject.getPhase(object),
  age: (object: KubeObject) => object.getCreationTimestamp(),
};

const renderTableHeader: { title: string; sortBy: keyof typeof sortingCallbacks; className?: string }[] = [
  { title: "Name", sortBy: "name" },
  { title: "Namespace", sortBy: "namespace" },
  { title: "Exemptions", sortBy: "exemptions", className: styles.count },
  { title: "Policies", sortBy: "policies", className: styles.count },
  { title: "Phase", sortBy: "phase", className: styles.phase },
  { title: "Age", sortBy: "age", className: styles.age },
];

export interface ExemptionsPageProps {
  extension: Renderer.LensExtension;
}

export const ExemptionsPage = observer((props: ExemptionsPageProps) =>
  withErrorPage(props, () => {
    const store = KubeObject.getStore<KubeObject>();

    const getPhaseColor = (phase: string): string => {
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
    };

    return (
      <>
        <style>{stylesInline}</style>
        <KubeObjectListLayout<KubeObject, KubeObjectApi>
          tableId={`${KubeObject.crd.plural}Table`}
          className={styles.page}
          store={store}
          sortingCallbacks={sortingCallbacks}
          searchFilters={[(object: KubeObject) => object.getSearchFields()]}
          renderHeaderTitle={KubeObject.crd.title}
          renderTableHeader={renderTableHeader}
          renderTableContents={(object: KubeObject) => [
            <WithTooltip>{object.getName()}</WithTooltip>,
            <LinkToNamespace namespace={object.getNs()} />,
            <Badge label={String(KubeObject.getExemptionCount(object))} />,
            <Badge label={String(KubeObject.getPolicyCount(object))} />,
            <Badge label={KubeObject.getPhase(object)} className={getPhaseColor(KubeObject.getPhase(object))} />,
            <KubeObjectAge object={object} key="age" />,
          ]}
        />
      </>
    );
  }),
);
