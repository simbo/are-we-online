import { HostData } from '../../scripts/models/host-data.interface';

export interface AppState {
  hosts: HostData[];
  pingInterval: number;
  pingPaused: boolean;
}
