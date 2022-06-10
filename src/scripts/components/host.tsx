import { Component, createRef, h, VNode } from 'preact';
import { HostStatus } from '../models/host-status.enum';
import prependHttp from 'prepend-http';

interface HostProps {
  id: number;
  name: string;
  valid: boolean;
  interval: number;
  paused: boolean;
  onHostNameChange: (id: number, name: string) => void;
  onHostStatusChange: (id: number, status: HostStatus) => void;
  onHostRemove: (id: number) => void;
}

interface HostState {
  status: HostStatus;
  responseTime?: number;
  loading: boolean;
}

const statusSymbols = {
  [HostStatus.Offline]: '🔴',
  [HostStatus.Online]: '🟢',
  [HostStatus.Unknown]: '❔'
};

export class Host extends Component<HostProps, HostState> {
  private readonly refHostInput = createRef<HTMLInputElement>();
  private readonly refHostForm = createRef<HTMLFormElement>();

  private pingTimeout?: number;
  private pingStart?: number;

  constructor(props: HostProps, state: HostState) {
    super(props, state);
    this.setState({ status: HostStatus.Unknown, loading: false });
  }

  public render({ id, name, valid }: HostProps, { status, responseTime, loading }: HostState): VNode {
    return (
      <div class={`c-host ${loading ? 'c-host--loading' : ''}`}>
        <div
          class={`c-host__status c-host__status--${status}`}
          title={status === HostStatus.Online || (loading && responseTime !== undefined) ? `${responseTime}ms` : ''}
        >
          {statusSymbols[status]}
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
    if (!this.props.paused) {
      this.startPing();
    }
  }

  public componentDidUpdate(prevProps: HostProps, prevState: HostState): boolean {
    if (this.props.name !== prevProps.name || this.props.interval !== prevProps.interval) {
      this.startPing();
    } else if (this.props.paused !== prevProps.paused) {
      if (this.props.paused) {
        this.stopPing();
      } else {
        this.startPing();
      }
    }
    return true;
  }

  private readonly onClickRemove = (): void => {
    this.props.onHostRemove(this.props.id);
  };

  private readonly onKeyDownInput = (): void => {
    this.stopPing();
  };

  private readonly onFocusInput = (): void => {
    this.stopPing();
  };

  private readonly onBlurInput = (): void => {
    this.startPing();
  };

  private readonly onChangeInput = (event: Event): void => {
    event.preventDefault();
    const form = this.refHostForm.current;
    if (form?.checkValidity()) {
      const data = new FormData(form);
      this.props.onHostNameChange(this.props.id, data.get(`host-${this.props.id}`)?.toString() || '');
    }
  };

  private startPing(): void {
    this.stopPing();
    if (!this.props.valid) {
      return;
    }
    this.pingStart = new Date().getTime();
    this.setState({ loading: true });
    const { hostname, protocol = '', port } = new URL(prependHttp(this.props.name));
    fetch(`${protocol}//${hostname}${port ? `:${port}` : ''}/?${Date.now()}`, {
      mode: 'no-cors',
      cache: 'no-cache'
    })
      .then(() => this.onPong(HostStatus.Online))
      .catch(() => this.onPong(HostStatus.Offline));
  }

  private stopPing(): void {
    if (this.pingTimeout) {
      clearTimeout(this.pingTimeout);
    }
  }

  private onPong(status: HostStatus.Online | HostStatus.Offline): void {
    this.setState({ status, responseTime: new Date().getTime() - (this.pingStart || 0), loading: false });
    this.props.onHostStatusChange(this.props.id, status);
    this.pingTimeout = setTimeout(() => this.startPing(), this.props.interval);
  }
}
