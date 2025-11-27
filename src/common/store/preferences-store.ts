import { Common } from "@freelensapp/extensions";
import { makeObservable, observable } from "mobx";

export interface UDSPreferencesModel {
  enabled: boolean;
}

export class UDSPreferencesStore extends Common.Store.ExtensionStore<UDSPreferencesModel> {
  @observable accessor enabled = false;

  constructor() {
    super({
      configName: "uds-preferences-store",
      defaults: {
        enabled: false,
      },
    });
    makeObservable(this);
  }

  fromStore({ enabled }: UDSPreferencesModel): void {
    this.enabled = enabled;
  }

  toJSON(): UDSPreferencesModel {
    return {
      enabled: this.enabled,
    };
  }
}
