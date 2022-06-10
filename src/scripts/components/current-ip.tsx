import { Component, h, VNode } from 'preact';
import { map, Subject, takeUntil } from 'rxjs';

import { appSelectors } from '../../store/app/app-selectors';
import { appStore } from '../../store/app/app-store';
import { filterChanged } from '../lib/filter-changed';
import { HostsGlobalStatus } from '../models/hosts-global-status.enum';

interface CurrentIPState {
  ip: string;
}

export class CurrentIP extends Component<{}, CurrentIPState> {
  private readonly unsubscribeSubject = new Subject<void>();

  constructor(props: never, state: CurrentIPState) {
    super(props, state);
    this.setState({ ip: 'unknown' });
    appStore.state$
      .pipe(takeUntil(this.unsubscribeSubject))
      .pipe(map(appSelectors.globalStatus))
      .pipe(filterChanged())
      .subscribe(status => {
        if ([HostsGlobalStatus.Online, HostsGlobalStatus.Mixed]) {
          this.retrieveIP();
        } else {
          this.setState({ ip: 'unknown' });
        }
      });
  }

  public render(props: never, { ip }: CurrentIPState): VNode {
    return (
      <button class="c-current-ip">
        <label class="c-current-ip__label">IP:</label>
        <input type="text" class="c-current-ip__input" readonly value={ip} />
      </button>
    );
  }

  public componentWillUnmount(): void {
    this.unsubscribeSubject.next();
  }

  private readonly retrieveIP = (): void => {
    fetch('https://api.ipify.org?format=json', { cache: 'no-cache' })
      .then(response => response.json())
      .then(({ ip }) => this.setState({ ip }))
      .catch(err => this.setState({ ip: 'unkown' }));
  };
}
