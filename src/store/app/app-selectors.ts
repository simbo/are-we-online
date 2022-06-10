import { Selectors } from 'small-store';

import { HostStatus } from '../../scripts/models/host-status.enum';
import { HostsGlobalStatus } from '../../scripts/models/hosts-global-status.enum';
import { AppState } from './app-state.interface';

export const appSelectors: Selectors<AppState> = {
  globalStatus: ({ hosts }): HostsGlobalStatus => {
    hosts = hosts.filter(host => host.valid);
    if (hosts.length === 0) {
      return HostsGlobalStatus.Unknown;
    } else if (hosts.every(host => host.status === HostStatus.Online)) {
      return HostsGlobalStatus.Online;
    } else if (hosts.every(host => host.status === HostStatus.Offline)) {
      return HostsGlobalStatus.Offline;
    } else if (hosts.every(host => host.status === HostStatus.Unknown)) {
      return HostsGlobalStatus.Unknown;
    } else {
      return HostsGlobalStatus.Mixed;
    }
  }
};
