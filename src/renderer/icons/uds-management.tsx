import { Renderer } from "@freelensapp/extensions";
import svgIcon from "./doug.svg?raw";

const {
  Component: { Icon },
} = Renderer;

export function UDSManagementIcon(props: Renderer.Component.IconProps) {
  return <Icon {...props} svg={svgIcon} />;
}
