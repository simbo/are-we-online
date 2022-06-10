import { Actions } from 'small-store';

import { DEFAULT_HOSTNAMES } from '../../scripts/lib/defaults';
import { parseHostsToObjects } from '../../scripts/lib/parse-hosts';
import { HostStatus } from '../../scripts/models/host-status.enum';
import { AppState } from './app-state.interface';

export enum AppAction {
  AddHost = 'addHost',
  RemoveHost = 'removeHost',
  SetHostname = 'setHostname',
  SetHostStatus = 'setHostStatus',
  ResetHosts = 'resetHosts',
  SetPingInterval = 'setPingInterval',
  PingPause = 'pingPause',
  PingUnpause = 'pingUnpause'
}

export interface AppActionPayloads {
  [AppAction.RemoveHost]: {
    id: number;
  };
  [AppAction.SetHostname]: {
    id: number;
    name: string;
  };
  [AppAction.SetHostStatus]: {
    id: number;
    status: HostStatus;
  };
  [AppAction.SetPingInterval]: {
    pingInterval: number;
  };
}

export const appActions: Actions<AppState, AppAction, AppActionPayloads> = {
  [AppAction.AddHost]: () => state => {
    const hosts = [...state.hosts, { name: '', valid: false, status: HostStatus.Unknown }];
    return { ...state, hosts };
  },

  [AppAction.RemoveHost]:
    ({ id }) =>
    state => {
      const hosts = [...state.hosts];
      if (hosts[id]) {
        hosts.splice(id, 1);
      }
      return { ...state, hosts };
    },

  [AppAction.SetHostname]:
    ({ id, name }) =>
    state => {
      const hosts = [...state.hosts];
      if (hosts[id]) {
        hosts[id] = { ...hosts[id], name };
      }
      return { ...state, hosts };
    },

  [AppAction.SetHostStatus]:
    ({ id, status }) =>
    state => {
      const hosts = [...state.hosts];
      if (hosts[id]) {
        hosts[id] = { ...hosts[id], status };
      }
      return { ...state, hosts };
    },

  [AppAction.ResetHosts]: () => ({ hosts: parseHostsToObjects(DEFAULT_HOSTNAMES) }),

  [AppAction.PingPause]: () => ({
    pingPaused: true
  }),

  [AppAction.PingUnpause]: () => ({
    pingPaused: false
  }),

  [AppAction.SetPingInterval]: ({ pingInterval }) => ({
    pingInterval
  })
};
