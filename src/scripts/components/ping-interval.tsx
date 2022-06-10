import { Component, createRef, h, VNode } from 'preact';
import { Subject, takeUntil } from 'rxjs';

import { AppAction } from '../../store/app/app-actions';
import { appStore } from '../../store/app/app-store';
import { didObjectsChange } from '../lib/did-objects-change';
import { filterChanged } from '../lib/filter-changed';
import { PING_MAX_INTERVAL, PING_MIN_INTERVAL } from '../lib/ping-service';

const PING_INTERVAL_NAME = 'ping-interval';

interface PingIntervalState {
  pingInterval: number;
}

export class PingInterval extends Component<{}, {}> {
  private readonly unsubscribeSubject = new Subject<void>();
  private readonly refPingIntervalInput = createRef<HTMLInputElement>();
  private readonly refPingIntervalForm = createRef<HTMLFormElement>();

  constructor(props: never, state: PingIntervalState) {
    super(props, state);
    appStore.state$
      .pipe(takeUntil(this.unsubscribeSubject))
      .pipe(filterChanged())
      .subscribe(({ pingInterval }) => this.setState({ pingInterval }));
  }

  public componentWillUnmount(): void {
    this.unsubscribeSubject.next();
  }

  public shouldComponentUpdate(nextProps: never, nextState: PingIntervalState): boolean {
    return didObjectsChange(this.state, nextState);
  }

  public render(props: never, { pingInterval }: PingIntervalState): VNode {
    return (
      <div class="c-ping-interval">
        <form ref={this.refPingIntervalForm} class="c-ping-interval__form" onSubmit={this.onChangeInput}>
          <label class="c-ping-interval__label" for="ping-interval">
            Ping Interval:
          </label>
          <input
            class={`c-ping-interval__input`}
            id={PING_INTERVAL_NAME}
            name={PING_INTERVAL_NAME}
            type="number"
            value={pingInterval}
            min={`${PING_MIN_INTERVAL}`}
            max={`${PING_MAX_INTERVAL}`}
            required
            placeholder="Milliseconds"
            ref={this.refPingIntervalInput}
            onChange={this.onChangeInput}
          />
        </form>
      </div>
    );
  }

  private readonly onChangeInput = (event: Event): void => {
    event.preventDefault();
    const form = this.refPingIntervalForm.current;
    if (form?.checkValidity()) {
      const data = new FormData(form);
      appStore.dispatch(AppAction.SetPingInterval, {
        pingInterval: parseInt(data.get(PING_INTERVAL_NAME)?.toString() || `${PING_MIN_INTERVAL}`, 10)
      });
    }
  };
}
