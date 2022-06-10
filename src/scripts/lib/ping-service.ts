import prependHttp from 'prepend-http';
import { BehaviorSubject, Observable } from 'rxjs';

import { HostStatus } from '../models/host-status.enum';
import { isValidHostname } from './is-valid-hostname';

export const PING_MIN_INTERVAL = 2000;
export const PING_MAX_INTERVAL = 3600000;

export interface PingState {
  status: HostStatus;
  responseTime: number;
  loading: boolean;
}

export interface PingProperties {
  hostname: string;
  interval: number;
  paused: boolean;
}

export class PingService {
  private hostname: string = '';
  private interval: number = PING_MIN_INTERVAL;
  private timeout: number = 0;
  private startedAt: number = 0;
  private paused: boolean = false;

  private stateSubject = new BehaviorSubject<PingState>({
    status: HostStatus.Unknown,
    responseTime: 0,
    loading: false
  });

  public constructor() {
    this.ping();
  }

  public get state$(): Observable<PingState> {
    return this.stateSubject.asObservable();
  }

  private get isHostValid(): boolean {
    return isValidHostname(this.hostname);
  }

  public set(properties: Partial<PingProperties>) {
    const prevProps: PingProperties = {
      hostname: this.hostname,
      interval: this.interval,
      paused: this.paused
    };
    const props: PingProperties = {
      ...prevProps,
      ...properties
    };
    if (JSON.stringify(prevProps) === JSON.stringify(props)) {
      return;
    }
    this.hostname = props.hostname;
    this.interval = props.interval;
    this.paused = props.paused;
    this.ping();
  }

  public setHostname(hostname: string): void {
    this.set({ hostname });
  }

  public setInterval(interval: number) {
    this.set({ interval });
  }

  public setPaused(paused: boolean): void {
    this.set({ paused });
  }

  public pause(): void {
    this.setPaused(true);
  }

  public unpause(): void {
    this.setPaused(false);
  }

  private stopPingInterval(): void {
    if (this.timeout) {
      window.clearTimeout(this.timeout);
    }
  }

  private ping(): void {
    this.stopPingInterval();
    if (!this.isHostValid || this.paused) {
      return;
    }
    this.startedAt = Date.now();
    this.stateSubject.next({ ...this.stateSubject.getValue(), loading: true });
    const { hostname, protocol = '', port } = new URL(prependHttp(this.hostname));
    fetch(`${protocol}//${hostname}${port ? `:${port}` : ''}/?${Date.now()}`, {
      mode: 'no-cors',
      cache: 'no-cache'
    })
      .then(() => this.onPong(HostStatus.Online))
      .catch(() => this.onPong(HostStatus.Offline));
  }

  private readonly onPong = (status: HostStatus) => {
    this.stateSubject.next({
      ...this.stateSubject.getValue(),
      status,
      responseTime: Date.now() - this.startedAt,
      loading: false
    });
    this.timeout = window.setTimeout(() => this.ping(), this.interval);
  };
}
