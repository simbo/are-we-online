import { Component, createRef, h, VNode } from 'preact';
import { Subject, takeUntil } from 'rxjs';

import { AppAction } from '../../store/app/app-actions';
import { appStore } from '../../store/app/app-store';
import { didObjectsChange } from '../lib/did-objects-change';
import { filterChanged } from '../lib/filter-changed';
import { PingService } from '../lib/ping-service';
import { HostStatus } from '../models/host-status.enum';
import { hostStatusIcons } from '../models/icon-maps';

interface HostProps {
  id: number;
  name: string;
  valid: boolean;
}

interface HostState {
  status: HostStatus;
  responseTime?: number;
  loading: boolean;
}

export class Host extends Component<HostProps, HostState> {
  private readonly refHostInput = createRef<HTMLInputElement>();
  private readonly refHostForm = createRef<HTMLFormElement>();
  private readonly pingService = new PingService();
  private readonly unsubscribeSubject = new Subject<void>();

  constructor(props: HostProps, state: HostState) {
    super(props, state);
    appStore.state$
      .pipe(takeUntil(this.unsubscribeSubject))
      .pipe(filterChanged())
      .subscribe(({ hosts, pingInterval, pingPaused }) => {
        this.pingService.set({
          hostname: hosts[this.props.id]?.name || '',
          interval: pingInterval,
          paused: pingPaused
        });
      });
    this.setState({ status: HostStatus.Unknown });
    this.pingService.state$
      .pipe(takeUntil(this.unsubscribeSubject))
      .pipe(filterChanged())
      .subscribe(({ status, responseTime, loading }) => {
        this.setState({ status, responseTime, loading });
      });
  }

  public shouldComponentUpdate(nextProps: HostProps, nextState: HostState): boolean {
    return didObjectsChange(this.props, nextProps, this.state, nextState);
  }

  public componentDidUpdate(prevProps: HostProps, prevState: HostState) {
    if (this.state.status !== prevState.status) {
      appStore.dispatch(AppAction.SetHostStatus, { id: this.props.id, status: this.state.status });
    }
  }

  public render({ id, name, valid }: HostProps, { status, responseTime, loading }: HostState): VNode {
    return (
      <div class="c-host">
        <div
          class={`c-host__status c-host__status--${status}`}
          title={status === HostStatus.Online && !!responseTime ? `${responseTime}ms` : ''}
        >
          {hostStatusIcons[status]}
          <div class={`c-host__loading-bar ${loading ? 'c-host__loading-bar--loading' : ''}`}></div>
        </div>
        <form ref={this.refHostForm} class="c-host__form" onSubmit={this.onChangeInput}>
          <input
            class={`c-host__input c-host__input--${valid ? 'valid' : 'invalid'}`}
            id={`host-${id}`}
            name={`host-${id}`}
            type="text"
            value={name}
            placeholder="Hostname (e.g. google.com)"
            ref={this.refHostInput}
            onChange={this.onChangeInput}
            onKeyDown={this.onKeyDownInput}
            onFocus={this.onFocusInput}
            onBlur={this.onBlurInput}
          />
        </form>
        <button class="c-host__button c-host__button--remove" type="button" onClick={this.onClickRemove}>
          ✕
        </button>
      </div>
    );
  }

  public componentDidMount(): void {
    if (!this.props.valid) {
      this.refHostInput.current?.focus();
    }
  }

  public componentWillUnmount(): void {
    this.pingService.pause();
    this.unsubscribeSubject.next();
  }

  private readonly onClickRemove = (): void => {
    appStore.dispatch(AppAction.RemoveHost, { id: this.props.id });
  };

  private readonly onKeyDownInput = (): void => {
    this.pingService.pause();
  };

  private readonly onFocusInput = (): void => {
    this.pingService.pause();
  };

  private readonly onBlurInput = (): void => {
    this.pingService.unpause();
  };

  private readonly onChangeInput = (event: Event): void => {
    event.preventDefault();
    const form = this.refHostForm.current;
    if (form?.checkValidity()) {
      const data = new FormData(form);
      appStore.dispatch(AppAction.SetHostname, {
        id: this.props.id,
        name: data.get(`host-${this.props.id}`)?.toString() || ''
      });
    }
  };
}
