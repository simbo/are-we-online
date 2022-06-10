import { HostStatus } from './host-status.enum';

export interface HostData {
  name: string;
  valid: boolean;
  status: HostStatus;
}
