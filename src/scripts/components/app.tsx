import { Component, h, VNode } from 'preact';
import { map, Subject, takeUntil, tap } from 'rxjs';

import { AppAction } from '../../store/app/app-actions';
import { appSelectors } from '../../store/app/app-selectors';
import { appStore } from '../../store/app/app-store';
import { filterChanged } from '../lib/filter-changed';
import { HostsGlobalStatus } from '../models/hosts-global-status.enum';
import { hostsGlobalStatusIcons } from '../models/icon-maps';
import { CurrentIP } from './current-ip';
import { HostsList } from './hosts-list';
import { PingInterval } from './ping-interval';

export class App extends Component<{}, {}> {
  private readonly unsubscribeSubject = new Subject<void>();
  private faviconElement = Array.from(document.getElementsByTagName('link')).filter(el => el.rel === 'icon')[0];

  constructor(props: never, state: never) {
    super(props, state);
    appStore.state$
      .pipe(takeUntil(this.unsubscribeSubject))
      .pipe(map(appSelectors.globalStatus))
      .pipe(filterChanged())
      .subscribe(globalStatus => this.setFavicon(globalStatus));
    window.addEventListener('blur', this.onBlurWindow);
    window.addEventListener('focus', this.onFocusWindow);
  }

  public render(props: never, state: never): VNode {
    return (
      <div class="c-app">
        <HostsList />
        <div className="c-app__bar">
          <PingInterval />
          <CurrentIP />
          <button class="c-app__reset-defaults" onClick={this.onResetHosts}>
            Reset Hosts
          </button>
        </div>
      </div>
    );
  }

  public componentWillUnmount(): void {
    this.unsubscribeSubject.next();
    window.removeEventListener('blur', this.onBlurWindow);
    window.removeEventListener('focus', this.onFocusWindow);
  }

  private readonly onBlurWindow = () => {
    appStore.dispatch(AppAction.PingPause);
  };

  private readonly onFocusWindow = () => {
    appStore.dispatch(AppAction.PingUnpause);
  };

  private readonly onResetHosts = (): void => {
    if (confirm('Reset hosts list?')) {
      appStore.dispatch(AppAction.ResetHosts);
    }
  };

  private setFavicon(globalStatus: HostsGlobalStatus) {
    this.faviconElement.href = `data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>${hostsGlobalStatusIcons[globalStatus]}</text></svg>`;
  }
}
