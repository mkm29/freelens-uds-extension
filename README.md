# @mkm29/freelens-uds-extension

<!-- markdownlint-disable MD013 -->

[![Home](https://img.shields.io/badge/%F0%9F%8F%A0-freelens.app-02a7a0)](https://freelens.app)
[![GitHub](https://img.shields.io/github/stars/mkm29/freelens-uds-extension?style=flat&label=GitHub%20%E2%AD%90)](https://github.com/mkm29/freelens-uds-extension)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

<!-- markdownlint-enable MD013 -->

A Freelens extension for managing [Defense Unicorns](https://defenseunicorns.com/)
UDS (Unicorn Delivery Service) Custom Resources. This extension provides UI
support for viewing and managing UDS Package, ClusterConfig, and Exemption CRs
directly within Freelens.

## Features

### Unified Navigation

All UDS resources are organized under a single **"UDS"** menu in the
cluster sidebar, providing quick access to:

- Packages
- Cluster Configs
- Exemptions

### UDS Package Support

- **UDS Package List View**: View all UDS Package CRs across namespaces with
  summary counts for SSO clients, network rules, and monitors
- **Package Details Panel**: Detailed view of Package configurations including:
  - SSO client configurations (Keycloak integration)
  - Network policies (allow/expose rules) with clickable links to Freelens
    built-in Network Policies view
  - Generated NetworkPolicies list with direct navigation to each policy
  - Prometheus monitoring configurations (ServiceMonitor/PodMonitor)
- **Status Tracking**: Visual indicators for Package phase (Ready, Pending, Failed)

### UDS ClusterConfig Support

- **ClusterConfig List View**: View all UDS ClusterConfig CRs with cluster name,
  domain, and phase information
- **ClusterConfig Details Panel**: Detailed view of cluster-level configurations:
  - Attributes (cluster name, tags)
  - Expose settings (domain, admin domain, CA certificate)
  - Networking (Kube API CIDR, node CIDRs)
  - Policy (namespace exemption settings)

### UDS Exemption Support

- **Exemption List View**: View all UDS Exemption CRs across namespaces with
  policy counts and namespace information
- **Exemption Details Panel**: Detailed view of policy exemption configurations:
  - Exemption matchers (pod/service name patterns, namespaces)
  - Exempted policies list
  - Title and description for each exemption
- **Context Menu Actions**: Copy YAML manifest with labels/annotations, copy
  policy names

## Requirements

- Kubernetes >= 1.29
- Freelens >= 1.6.0
- UDS Operator installed on the cluster
  (for actual `Package|Clusterconfig|Exemption` CR support)

## API Supported

- `uds.dev/v1alpha1` - UDS Package Custom Resource
- `uds.dev/v1alpha1` - UDS ClusterConfig Custom Resource
- `uds.dev/v1alpha1` - UDS Exemption Custom Resource

## Quick Start

### Install the CRDs (for testing without UDS Operator)

```sh
# Install Package CRD
kubectl apply -f examples/uds-package/crds/customresourcedefinition.yaml

# Install ClusterConfig CRD
kubectl apply -f examples/uds-clusterconfig/crds/customresourcedefinition.yaml

# Install Exemption CRD
kubectl apply -f examples/uds-exemption/crds/customresourcedefinition.yaml
```

### Create sample resources

```sh
# Create sample Package resources
kubectl apply -f examples/uds-package/test/example.yaml

# Create sample ClusterConfig resource
kubectl apply -f examples/uds-clusterconfig/test/example.yaml

# Create sample Exemption resource
kubectl apply -f examples/uds-exemption/test/example.yaml
```

This creates example Package CRs for Grafana, NeuVector, and Loki demonstrating
SSO, network policies, and monitoring configurations. It also creates an example
ClusterConfig CR demonstrating cluster-level UDS configuration, and an example
Exemption CR demonstrating policy exemptions for Istio components.

## Install

### From npm (when published)

Open Freelens and go to Extensions (`Ctrl`+`Shift`+`E` or `Cmd`+`Shift`+`E`),
and install `@mkm29/freelens-uds-extension`.

### From source

Build and install locally (see [Build from source](#build-from-the-source) below).

## Build from the source

You can build the extension using this repository.

### Prerequisites

Use [NVM](https://github.com/nvm-sh/nvm) or
[mise-en-place](https://mise.jdx.dev/) or
[windows-nvm](https://github.com/coreybutler/nvm-windows) to install the
required Node.js version.

From the root of this repository:

```sh
nvm install
# or
mise install
# or
winget install CoreyButler.NVMforWindows
nvm install 22.16.0
nvm use 22.16.0
```

Install pnpm:

```sh
corepack install
# or
curl -fsSL https://get.pnpm.io/install.sh | sh -
# or
winget install pnpm.pnpm
```

### Build extension

```sh
pnpm i
pnpm build
pnpm pack
```

One script to build then pack the extension to test:

```sh
pnpm pack:dev
```

### Install built extension

The tarball for the extension will be placed in the current directory. In
Freelens, navigate to the Extensions list and provide the path to the tarball
to be loaded, or drag and drop the extension tarball into the Freelens window.
After loading for a moment, the extension should appear in the list of enabled
extensions and a "UDS" menu will appear in the cluster sidebar with
sub-items for Packages, Cluster Configs, and Exemptions.

### Check code statically

```sh
pnpm lint:check
```

or

```sh
pnpm trunk:check
```

and

```sh
pnpm build
pnpm knip:check
```

## UDS Package CR Structure

The UDS Package CR supports three main configuration sections:

### Network

Configure network policies and ingress exposure:

```yaml
spec:
  network:
    allow:
      - direction: Ingress
        selector:
          app: my-app
        remoteGenerated: IntraNamespace
        ports:
          - 8080
    expose:
      - service: my-service
        port: 443
        host: my-app
        domain: uds.dev
```

### SSO

Configure Keycloak SSO client integration:

```yaml
spec:
  sso:
    - clientId: my-app
      protocol: openid-connect
      redirectUris:
        - https://my-app.uds.dev/callback
      groups:
        - name: /UDS Core/Admin
```

### Monitor

Configure Prometheus monitoring:

```yaml
spec:
  monitor:
    - kind: ServiceMonitor
      path: /metrics
      portName: http-metrics
      selector:
        app: my-app
```

## UDS ClusterConfig CR Structure

The UDS ClusterConfig CR defines cluster-level configuration for UDS deployments.
Note: The resource requires a fixed metadata name of `uds-cluster-config`.

### Attributes

Identify and categorize your cluster:

```yaml
spec:
  attributes:
    clusterName: production-cluster
    tags:
      - production
      - us-west-2
```

### Expose

Configure service exposure domains:

```yaml
spec:
  expose:
    domain: uds.example.com
    adminDomain: admin.uds.example.com
    caCert: |
      -----BEGIN CERTIFICATE-----
      ...
      -----END CERTIFICATE-----
```

### Networking

Override automatic network discovery:

```yaml
spec:
  networking:
    kubeApiCIDR: "10.0.0.0/24"
    kubeNodeCIDRs:
      - "10.0.1.0/24"
      - "10.0.2.0/24"
```

### Policy

Configure UDS policy settings:

```yaml
spec:
  policy:
    allowAllNsExemptions: false
```

## UDS Exemption CR Structure

The UDS Exemption CR defines policy exemptions for specific workloads that need
to bypass certain Pepr policies. Exemptions are typically created in the
`uds-policy-exemptions` namespace.

### Exemptions

Define exemptions with matchers and policies:

```yaml
spec:
  exemptions:
    - title: Istio CNI exemptions
      description: Exemptions necessary for Istio CNI to manage network configurations
      matcher:
        kind: pod
        name: istio-cni-node.*
        namespace: istio-system
      policies:
        - RequireNonRootUser
        - RestrictVolumeTypes
        - DisallowHostNamespaces
        - RestrictCapabilities
```

### Matcher Options

The matcher field supports:

- `kind`: Resource kind (`pod` or `service`)
- `name`: Resource name pattern (supports regex, e.g., `istio-cni-node.*`)
- `namespace`: Target namespace for the exemption

### Available Policies

Common policies that can be exempted:

- `DisallowPrivileged` - Disallow privileged containers
- `RequireNonRootUser` - Require non-root user
- `DropAllCapabilities` - Drop all Linux capabilities
- `RestrictVolumeTypes` - Restrict volume types
- `RestrictCapabilities` - Restrict Linux capabilities
- `DisallowHostNamespaces` - Disallow host namespaces
- `RestrictHostPathWrite` - Restrict hostPath write access
- `RestrictHostPorts` - Restrict host port usage
- `RestrictSELinuxType` - Restrict SELinux types

## Related Resources

- [UDS Documentation](https://uds.defenseunicorns.com/)
- [UDS Package CR Reference](https://uds.defenseunicorns.com/reference/configuration/custom-resources/packages-v1alpha1-cr/)
- [UDS ClusterConfig CR Reference](https://uds.defenseunicorns.com/reference/configuration/custom-resources/clusterconfig-v1alpha1-cr/)
- [UDS Exemption CR Reference](https://uds.defenseunicorns.com/reference/configuration/custom-resources/exemptions-v1alpha1-cr/)
- [Freelens](https://freelens.app/)
- [Freelens Extensions Wiki](https://github.com/freelensapp/freelens/wiki/Extensions)

## License

Copyright (c) 2025 Defense Unicorns.

[MIT License](https://opensource.org/licenses/MIT)
