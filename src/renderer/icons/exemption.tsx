import { Renderer } from "@freelensapp/extensions";
import svgIcon from "./exemption.svg?raw";

const {
  Component: { Icon },
} = Renderer;

export function ExemptionIcon(props: Renderer.Component.IconProps) {
  return <Icon {...props} svg={svgIcon} />;
}
