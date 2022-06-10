import { HostData } from '../models/host-data.interface';
import { HostStatus } from '../models/host-status.enum';
import { isValidHostname } from './is-valid-hostname';

export function parseHostsToStrings(hosts: HostData[]) {
  return hosts.map(({ name }) => name);
}

export function parseHostsToObjects(hostnames: string[]) {
  return hostnames.map(name => ({ name, valid: isValidHostname(name), status: HostStatus.Unknown }));
}
