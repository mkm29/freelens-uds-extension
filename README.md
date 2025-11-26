# @mkm29/freelens-uds-extension

<!-- markdownlint-disable MD013 -->

[![Home](https://img.shields.io/badge/%F0%9F%8F%A0-freelens.app-02a7a0)](https://freelens.app)
[![GitHub](https://img.shields.io/github/stars/mkm29/freelens-uds-extension?style=flat&label=GitHub%20%E2%AD%90)](https://github.com/mkm29/freelens-uds-extension)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

<!-- markdownlint-enable MD013 -->

A Freelens extension for managing [Defense Unicorns](https://defenseunicorns.com/)
UDS (Unicorn Delivery Service) Custom Resources. This extension provides UI
support for viewing and managing UDS Package CRs directly within Freelens.

## Features

- **UDS Package List View**: View all UDS Package CRs across namespaces with
  summary counts for SSO clients, network rules, and monitors
- **Package Details Panel**: Detailed view of Package configurations including:
  - SSO client configurations (Keycloak integration)
  - Network policies (allow/expose rules)
  - Prometheus monitoring configurations (ServiceMonitor/PodMonitor)
- **Status Tracking**: Visual indicators for Package phase (Ready, Pending, Failed)

## Requirements

- Kubernetes >= 1.24
- Freelens >= 1.6.0
- UDS Operator installed on the cluster (for actual Package CR support)

## API Supported

- `uds.dev/v1alpha1` - UDS Package Custom Resource

## Quick Start

### Install the CRD (for testing without UDS Operator)

```sh
kubectl apply -f examples/uds-package/crds/customresourcedefinition.yaml
```

### Create sample Package resources

```sh
kubectl apply -f examples/uds-package/test/example.yaml
```

This creates example Package CRs for Grafana, NeuVector, and Loki demonstrating
SSO, network policies, and monitoring configurations.

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
extensions and "UDS Packages" will appear in the cluster sidebar.

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

## Related Resources

- [UDS Documentation](https://uds.defenseunicorns.com/)
- [UDS Package CR Reference](https://uds.defenseunicorns.com/reference/configuration/custom-resources/packages-v1alpha1-cr/)
- [Freelens](https://freelens.app/)
- [Freelens Extensions Wiki](https://github.com/freelensapp/freelens/wiki/Extensions)

## License

Copyright (c) 2025 Defense Unicorns.

[MIT License](https://opensource.org/licenses/MIT)
