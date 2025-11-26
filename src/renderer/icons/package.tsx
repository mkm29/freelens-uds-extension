import { Renderer } from "@freelensapp/extensions";
import svgIcon from "./package.svg?raw";

const {
  Component: { Icon },
} = Renderer;

export function PackageIcon(props: Renderer.Component.IconProps) {
  return <Icon {...props} svg={svgIcon} />;
}
