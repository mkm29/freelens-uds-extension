import { Renderer } from "@freelensapp/extensions";
import { observer } from "mobx-react";
import { withErrorPage } from "../components/error-page";
import { ClusterConfig, type ClusterConfigApi } from "../k8s/clusterconfig/clusterconfig-v1alpha1";
import styles from "./clusterconfigs-page.module.scss";
import stylesInline from "./clusterconfigs-page.module.scss?inline";

const {
  Component: { Badge, KubeObjectAge, KubeObjectListLayout, WithTooltip },
} = Renderer;

const KubeObject = ClusterConfig;
type KubeObject = ClusterConfig;
type KubeObjectApi = ClusterConfigApi;

const sortingCallbacks = {
  name: (object: KubeObject) => object.getName(),
  clusterName: (object: KubeObject) => KubeObject.getClusterName(object),
  domain: (object: KubeObject) => KubeObject.getDomain(object),
  phase: (object: KubeObject) => KubeObject.getPhase(object),
  age: (object: KubeObject) => object.getCreationTimestamp(),
};

const renderTableHeader: { title: string; sortBy: keyof typeof sortingCallbacks; className?: string }[] = [
  { title: "Name", sortBy: "name" },
  { title: "Cluster Name", sortBy: "clusterName" },
  { title: "Domain", sortBy: "domain", className: styles.domain },
  { title: "Phase", sortBy: "phase", className: styles.phase },
  { title: "Age", sortBy: "age", className: styles.age },
];

export interface ClusterConfigsPageProps {
  extension: Renderer.LensExtension;
}

export const ClusterConfigsPage = observer((props: ClusterConfigsPageProps) =>
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
            <WithTooltip>{KubeObject.getClusterName(object)}</WithTooltip>,
            <WithTooltip>{KubeObject.getDomain(object) || "N/A"}</WithTooltip>,
            <Badge label={KubeObject.getPhase(object)} className={getPhaseColor(KubeObject.getPhase(object))} />,
            <KubeObjectAge object={object} key="age" />,
          ]}
        />
      </>
    );
  }),
);
