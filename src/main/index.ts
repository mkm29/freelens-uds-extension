import { Main } from "@freelensapp/extensions";
import { UDSPreferencesStore } from "../common/store";

export default class UDSMain extends Main.LensExtension {
  async onActivate() {
    await UDSPreferencesStore.getInstanceOrCreate().loadExtension(this);
  }
}
