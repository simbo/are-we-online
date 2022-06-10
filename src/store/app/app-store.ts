import { createContext } from 'preact';
import { Store } from 'small-store';

import { DEFAULT_HOSTNAMES, DEFAULT_PING_INTERVAL } from '../../scripts/lib/defaults';
import { parseHostsToObjects } from '../../scripts/lib/parse-hosts';
import { storage } from '../../scripts/lib/storage';
import { AppAction, AppActionPayloads, appActions } from './app-actions';
import { appEffects } from './app-effects';
import { AppState } from './app-state.interface';

const { hostnames, pingInterval } = storage.get({ hostnames: DEFAULT_HOSTNAMES, pingInterval: DEFAULT_PING_INTERVAL });
const hosts = parseHostsToObjects(hostnames);

const initialState: AppState = {
  hosts,
  pingInterval,
  pingPaused: false
};

export const appStore = new Store<AppState, AppAction, AppActionPayloads>(initialState, appActions, appEffects);

export const appStoreContext = createContext(initialState);
