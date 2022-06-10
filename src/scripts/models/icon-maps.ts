import { HostStatus } from './host-status.enum';
import { HostsGlobalStatus } from './hosts-global-status.enum';

export const hostStatusIcons = {
  [HostStatus.Offline]: '🔴',
  [HostStatus.Online]: '🟢',
  [HostStatus.Unknown]: '❔'
};

export const hostsGlobalStatusIcons = {
  [HostsGlobalStatus.Online]: '🟢',
  [HostsGlobalStatus.Offline]: '🔴',
  [HostsGlobalStatus.Unknown]: '❔',
  [HostsGlobalStatus.Mixed]: '🟠'
};
