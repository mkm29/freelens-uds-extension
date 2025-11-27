import { Renderer } from "@freelensapp/extensions";
import { observer } from "mobx-react";
import { UDSPreferencesStore } from "../../common/store";

const {
  Component: { Checkbox },
} = Renderer;

const preferences = UDSPreferencesStore.getInstanceOrCreate<UDSPreferencesStore>();

export const UDSPreferenceInput = observer(() => {
  return (
    <Checkbox
      label="Enable UDS extension features"
      value={preferences.enabled}
      onChange={(v) => {
        preferences.enabled = v;
      }}
    />
  );
});

export const UDSPreferenceHint = () => <span>Enable or disable UDS extension features.</span>;
