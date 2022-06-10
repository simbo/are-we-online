import { Component, h, VNode } from 'preact';
import { Subject, takeUntil } from 'rxjs';

import { AppAction } from '../../store/app/app-actions';
import { appStore } from '../../store/app/app-store';
import { didObjectsChange } from '../lib/did-objects-change';
import { filterChanged } from '../lib/filter-changed';
import { HostData } from '../models/host-data.interface';
import { Host } from './host';

interface HostsListState {
  hosts: HostData[];
}

export class HostsList extends Component<{}, HostsListState> {
  private readonly unsubscribeSubject = new Subject<void>();

  constructor(props: never, state: HostsListState) {
    super(props, state);
    appStore.state$
      .pipe(takeUntil(this.unsubscribeSubject))
      .pipe(filterChanged())
      .subscribe(({ hosts }) => this.setState({ hosts }));
  }

  public shouldComponentUpdate(nextProps: never, nextState: HostsListState): boolean {
    return didObjectsChange(this.state, nextState);
  }

  public componentWillUnmount(): void {
    this.unsubscribeSubject.next();
  }

  public render(props: never, { hosts }: HostsListState): VNode {
    const hostsList = hosts.map((host, i) => <Host id={i} name={host.name} valid={host.valid} />);
    return (
      <div className="c-hosts-list">
        {hostsList}{' '}
        <button class="c-app__add-host" onClick={this.onAddHost}>
          ＋
        </button>
      </div>
    );
  }

  private readonly onAddHost = (): void => {
    appStore.dispatch(AppAction.AddHost);
  };
}
