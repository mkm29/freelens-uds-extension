import { Renderer } from "@freelensapp/extensions";
import { observer } from "mobx-react";
import { getPhaseColor } from "../../common/utils";
import { withErrorPage } from "../components/error-page";
import { Package, type PackageApi } from "../k8s/package/package-v1alpha1";
import styles from "./packages-page.module.scss";
import stylesInline from "./packages-page.module.scss?inline";

const {
  Component: { Badge, KubeObjectAge, KubeObjectListLayout, LinkToNamespace, WithTooltip },
} = Renderer;

const KubeObject = Package;
type KubeObject = Package;
type KubeObjectApi = PackageApi;

const sortingCallbacks = {
  name: (object: KubeObject) => object.getName(),
  namespace: (object: KubeObject) => object.getNs(),
  ssoClients: (object: KubeObject) => KubeObject.getSSOClientCount(object),
  networkRules: (object: KubeObject) => KubeObject.getNetworkRuleCount(object),
  monitors: (object: KubeObject) => KubeObject.getMonitorCount(object),
  phase: (object: KubeObject) => KubeObject.getPhase(object),
  age: (object: KubeObject) => object.getCreationTimestamp(),
};

const renderTableHeader: { title: string; sortBy: keyof typeof sortingCallbacks; className?: string }[] = [
  { title: "Name", sortBy: "name" },
  { title: "Namespace", sortBy: "namespace" },
  { title: "SSO Clients", sortBy: "ssoClients", className: styles.count },
  { title: "Network Rules", sortBy: "networkRules", className: styles.count },
  { title: "Monitors", sortBy: "monitors", className: styles.count },
  { title: "Phase", sortBy: "phase", className: styles.phase },
  { title: "Age", sortBy: "age", className: styles.age },
];

export interface PackagesPageProps {
  extension: Renderer.LensExtension;
}

export const PackagesPage = observer((props: PackagesPageProps) =>
  withErrorPage(props, () => {
    const store = KubeObject.getStore<KubeObject>();

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
            <Badge label={String(KubeObject.getSSOClientCount(object))} />,
            <Badge label={String(KubeObject.getNetworkRuleCount(object))} />,
            <Badge label={String(KubeObject.getMonitorCount(object))} />,
            <Badge label={KubeObject.getPhase(object)} className={getPhaseColor(KubeObject.getPhase(object))} />,
            <KubeObjectAge object={object} key="age" />,
          ]}
        />
      </>
    );
  }),
);
