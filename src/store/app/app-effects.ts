import { Effects } from 'small-store';

import { parseHostsToStrings } from '../../scripts/lib/parse-hosts';
import { storage } from '../../scripts/lib/storage';
import { AppAction, AppActionPayloads } from './app-actions';
import { AppState } from './app-state.interface';

function storeHostnames(state: AppState) {
  storage.set({ hostnames: parseHostsToStrings(state.hosts) });
}

function storePingInterval(state: AppState) {
  storage.set({ pingInterval: state.pingInterval });
}
export const appEffects: Effects<AppState, AppAction, AppActionPayloads> = {
  [AppAction.SetHostname]: (action, state, dispatch) => storeHostnames(state),
  [AppAction.RemoveHost]: (action, state, dispatch) => storeHostnames(state),
  [AppAction.ResetHosts]: (action, state, dispatch) => storeHostnames(state),
  [AppAction.SetPingInterval]: (action, state, dispatch) => storePingInterval(state)
};
