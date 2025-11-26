import { Renderer } from "@freelensapp/extensions";
import svgIcon from "./clusterconfig.svg?raw";

const {
  Component: { Icon },
} = Renderer;

export function ClusterConfigIcon(props: Renderer.Component.IconProps) {
  return <Icon {...props} svg={svgIcon} />;
}
