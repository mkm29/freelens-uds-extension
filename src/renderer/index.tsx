/**
 * Copyright (c) Freelens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { Renderer } from "@freelensapp/extensions";
import { ExamplePreferencesStore } from "../common/store";
import { ClusterConfigDetails } from "./details/clusterconfig-details";
import { ExemptionDetails } from "./details/exemption-details";
import { PackageDetails } from "./details/package-details";
import { ClusterConfigIcon, ExemptionIcon, PackageIcon } from "./icons";
import { ClusterConfig } from "./k8s/clusterconfig/clusterconfig-v1alpha1";
import { Exemption } from "./k8s/exemption/exemption-v1alpha1";
import { Package } from "./k8s/package/package-v1alpha1";
import { ClusterConfigMenuItem, ExemptionMenuItem, PackageMenuItem, type UDSMenuItemProps } from "./menus";
import { ClusterConfigsPage } from "./pages/clusterconfigs-page";
import { ExemptionsPage } from "./pages/exemptions-page";
import { PackagesPage } from "./pages/packages-page";
import { ExamplePreferenceHint, ExamplePreferenceInput } from "./preferences/example-preference";

export default class ExampleRenderer extends Renderer.LensExtension {
  async onActivate() {
    ExamplePreferencesStore.getInstanceOrCreate().loadExtension(this);
  }

  appPreferences = [
    {
      title: "Example Preferences",
      components: {
        Input: () => <ExamplePreferenceInput />,
        Hint: () => <ExamplePreferenceHint />,
      },
    },
  ];

  kubeObjectDetailItems = [
    {
      kind: Package.kind,
      apiVersions: Package.crd.apiVersions,
      priority: 10,
      components: {
        Details: (props: Renderer.Component.KubeObjectDetailsProps<any>) => (
          <PackageDetails {...props} extension={this} />
        ),
      },
    },
    {
      kind: ClusterConfig.kind,
      apiVersions: ClusterConfig.crd.apiVersions,
      priority: 10,
      components: {
        Details: (props: Renderer.Component.KubeObjectDetailsProps<any>) => (
          <ClusterConfigDetails {...props} extension={this} />
        ),
      },
    },
    {
      kind: Exemption.kind,
      apiVersions: Exemption.crd.apiVersions,
      priority: 10,
      components: {
        Details: (props: Renderer.Component.KubeObjectDetailsProps<any>) => (
          <ExemptionDetails {...props} extension={this} />
        ),
      },
    },
  ];

  clusterPages = [
    {
      id: "uds-packages",
      components: {
        Page: () => <PackagesPage extension={this} />,
      },
    },
    {
      id: "uds-clusterconfigs",
      components: {
        Page: () => <ClusterConfigsPage extension={this} />,
      },
    },
    {
      id: "uds-exemptions",
      components: {
        Page: () => <ExemptionsPage extension={this} />,
      },
    },
  ];

  clusterPageMenus = [
    {
      id: "uds-packages",
      title: Package.crd.title,
      target: { pageId: "uds-packages" },
      components: {
        Icon: PackageIcon,
      },
    },
    {
      id: "uds-clusterconfigs",
      title: ClusterConfig.crd.title,
      target: { pageId: "uds-clusterconfigs" },
      components: {
        Icon: ClusterConfigIcon,
      },
    },
    {
      id: "uds-exemptions",
      title: Exemption.crd.title,
      target: { pageId: "uds-exemptions" },
      components: {
        Icon: ExemptionIcon,
      },
    },
  ];

  kubeObjectMenuItems = [
    {
      kind: Package.kind,
      apiVersions: Package.crd.apiVersions,
      components: {
        MenuItem: (props: UDSMenuItemProps<Package>) => <PackageMenuItem {...props} extension={this} />,
      },
    },
    {
      kind: ClusterConfig.kind,
      apiVersions: ClusterConfig.crd.apiVersions,
      components: {
        MenuItem: (props: UDSMenuItemProps<ClusterConfig>) => <ClusterConfigMenuItem {...props} extension={this} />,
      },
    },
    {
      kind: Exemption.kind,
      apiVersions: Exemption.crd.apiVersions,
      components: {
        MenuItem: (props: UDSMenuItemProps<Exemption>) => <ExemptionMenuItem {...props} extension={this} />,
      },
    },
  ];
}
