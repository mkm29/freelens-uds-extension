# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a Freelens extension for UDS (Unicorn Delivery Service) by Defense Unicorns. It extends the Freelens Kubernetes IDE with custom resource support for:

- **UDS Package CR** (`uds.dev/v1alpha1`): The primary Defense Unicorns Package resource with support for:
  - Network policies (allow/expose rules)
  - SSO client configuration (Keycloak integration)
  - Prometheus monitoring (ServiceMonitor/PodMonitor)
- **Example CRDs** (`example.freelens.app/v1alpha1`, `v1alpha2`): Template resources for extension development

## Essential Commands

### Development
```sh
pnpm i                  # Install dependencies
pnpm build              # Build extension (runs type:check first)
pnpm pack:dev           # Build and pack for local testing (bumps prerelease version)
```

### Linting & Type Checking
```sh
pnpm lint:check         # Run Biome and Prettier checks
pnpm lint:fix           # Auto-fix linting issues
pnpm type:check         # TypeScript type checking
pnpm trunk:check        # Run Trunk static analysis
pnpm knip:check         # Check for unused dependencies/exports
```

### Cleaning
```sh
pnpm clean              # Remove build output (out/)
pnpm clean:all          # Remove out/, node_modules/, tgz files, and scss.d.ts files
```

## Architecture

### Extension Entry Points
- **Main process** (`src/main/index.ts`): Extends `Main.LensExtension`, loads the preferences store on activation
- **Renderer process** (`src/renderer/index.tsx`): Extends `Renderer.LensExtension`, registers UI components:
  - `appPreferences`: Extension settings in Freelens preferences
  - `clusterPages`: Custom pages in the cluster view
  - `clusterPageMenus`: Sidebar menu items
  - `kubeObjectDetailItems`: Detail panels for K8s resources
  - `kubeObjectMenuItems`: Context menu items for K8s resources

### Key Patterns

**UDS Package Support**:
- `src/renderer/k8s/package/package-v1alpha1.ts` - Package CR type definitions and helper methods
- `src/renderer/pages/packages-page.tsx` - List view with SSO, Network, and Monitor counts
- `src/renderer/details/package-details.tsx` - Detailed view of all Package sections

**Multi-version CRD Support**: The extension supports multiple API versions (v1alpha1, v1alpha2) with version-specific components:
- `src/renderer/k8s/example/example-v1alpha1.ts` - K8s object class definitions
- `src/renderer/pages/examples-page-v1alpha1.tsx` - List pages
- `src/renderer/details/example-details-v1alpha1.tsx` - Detail views
- `src/renderer/menus/example-active-toggle-menu-item-v1alpha1.tsx` - Context menus

**State Management**: Uses MobX with the `@observable accessor` decorator pattern. Shared state lives in `src/common/store/`.

**Build System**: electron-vite with separate main/preload (renderer) configs. Modules from the host app (`@freelensapp/extensions`, `mobx`, `react`, etc.) are externalized and accessed via global variables.

### Directory Structure
```text
src/
├── common/           # Shared code between main and renderer
│   └── store/        # MobX stores (preferences)
├── main/             # Main process entry (index.ts)
└── renderer/         # Renderer process
    ├── components/   # Reusable React components
    ├── details/      # KubeObject detail panels
    ├── icons/        # SVG icons as React components
    ├── k8s/          # Kubernetes API definitions (LensExtensionKubeObject subclasses)
    ├── menus/        # Context menu items
    ├── pages/        # Cluster pages
    └── preferences/  # App preference components
```

### Testing CRDs

**UDS Package CR** (primary):
```sh
kubectl apply -f examples/uds-package/crds/customresourcedefinition.yaml
kubectl apply -f examples/uds-package/test/example.yaml
```

**Example CRDs** (development template):
```sh
kubectl apply -f examples/v1alpha1/crds/customresourcedefinition.yaml
kubectl apply -f examples/v1alpha1/test/example.yaml
```

## Build Output
- `out/main/index.js` - Main process bundle (CommonJS)
- `out/renderer/index.js` - Renderer process bundle (CommonJS)
- Package manifest points to these via `main` and `renderer` fields in package.json
