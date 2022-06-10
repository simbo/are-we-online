import { Component, h, VNode } from 'preact';
import { isValidHostname } from '../functions/is-valid-hostname';
import { HostData } from '../models/host-data.interface';
import { HostStatus } from '../models/host-status.enum';
import { CurrentIP } from './current-ip';
import { Host } from './host';
import { PingInterval } from './ping-interval';

interface AppState {
  hosts: HostData[];
  interval: number;
  paused: boolean;
}

const DEFAULT_HOSTNAMES = ['1.1.1.1', 'google.com'];
const STORAGE_KEY_HOSTS = 'awo_hosts';
const DEFAULT_INTERVAL = 5000;
const STORAGE_KEY_INTERVAL = 'awo_interval';

enum FaviconStatus {
  Online = '🟢',
  Offline = '🔴',
  Unknown = '❔',
  Mixed = '🟠'
}

export class App extends Component<{}, AppState> {
  private elFavicon = Array.from(document.getElementsByTagName('link')).filter(el => el.rel === 'icon')[0];

  constructor(props: never, state: AppState) {
    super(props, state);
    const hosts = this.parseHostnames(
      JSON.parse(localStorage.getItem(STORAGE_KEY_HOSTS) || JSON.stringify(DEFAULT_HOSTNAMES))
    );
    const interval = JSON.parse(localStorage.getItem(STORAGE_KEY_INTERVAL) || JSON.stringify(DEFAULT_INTERVAL));
    this.setState({ hosts, interval, paused: false });
    window.addEventListener('blur', this.onBlurWindow);
    window.addEventListener('focus', this.onFocusWindow);
  }

  public render(props: never, { hosts, interval, paused }: AppState): VNode {
    const hostsList = hosts.map((host, i) => (
      <Host
        id={i}
        name={host.name}
        valid={host.valid}
        interval={interval}
        paused={paused}
        onHostNameChange={this.onHostNameChange}
        onHostStatusChange={this.onHostStatusChange}
        onHostRemove={this.onHostRemove}
      />
    ));
    return (
      <div class="c-app">
        <div className="c-app__hosts-list">
          {hostsList}
          <button class="c-app__add-host" onClick={this.onAddHost}>
            ＋
          </button>
        </div>
        <div className="c-app__bar">
          <PingInterval interval={interval} onIntervalChange={this.onIntervalChange} />
          <CurrentIP />
          <button class="c-app__reset-defaults" onClick={this.onResetToDefaultHosts}>
            Reset Hosts
          </button>
        </div>
      </div>
    );
  }

  public componentWillUnmount(): void {
    window.removeEventListener('blur', this.onBlurWindow);
    window.removeEventListener('focus', this.onFocusWindow);
  }

  private readonly onBlurWindow = () => {
    this.setState({ paused: true });
  };

  private readonly onFocusWindow = () => {
    this.setState({ paused: false });
  };

  private readonly onAddHost = (): void => {
    const hosts = [...this.state.hosts, { name: '', valid: false, status: HostStatus.Unknown }];
    this.setState({ hosts });
  };

  private readonly onResetToDefaultHosts = (): void => {
    if (confirm('Reset hosts list?')) {
      this.setState({ hosts: this.parseHostnames(DEFAULT_HOSTNAMES) });
      this.storeHostNames();
    }
  };

  private readonly onHostNameChange = (id: number, name: string): void => {
    const hosts = [...this.state.hosts];
    hosts[id] = { ...hosts[id], name };
    this.setState({ hosts });
    this.storeHostNames();
  };

  private readonly onHostStatusChange = (id: number, status: HostStatus): void => {
    const hosts = [...this.state.hosts];
    hosts[id] = { ...hosts[id], status };
    this.setState({ hosts });
    this.updateFavicon();
  };

  private readonly onHostRemove = (id: number): void => {
    const hosts = [...this.state.hosts];
    hosts.splice(id, 1);
    this.setState({ hosts });
    this.storeHostNames();
  };

  private readonly onIntervalChange = (interval: number): void => {
    this.setState({ interval });
    localStorage.setItem(STORAGE_KEY_INTERVAL, JSON.stringify(interval));
  };

  private storeHostNames() {
    localStorage.setItem(
      STORAGE_KEY_HOSTS,
      JSON.stringify(this.state.hosts.filter(({ valid }) => valid).map(({ name }) => name))
    );
  }

  private parseHostnames(names: string[]): HostData[] {
    return names.map(name => ({ name, valid: isValidHostname(name), status: HostStatus.Unknown }));
  }

  private updateFavicon() {
    const hosts = this.state.hosts.filter(host => host.valid);
    let icon: string;
    if (hosts.length === 0) {
      icon = FaviconStatus.Unknown;
    } else if (hosts.every(host => host.status === HostStatus.Online)) {
      icon = FaviconStatus.Online;
    } else if (hosts.every(host => host.status === HostStatus.Offline)) {
      icon = FaviconStatus.Offline;
    } else {
      icon = FaviconStatus.Mixed;
    }
    console.log(hosts.map(host => host.status));
    console.log(icon);
    this.elFavicon.href = `data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>${icon}</text></svg>`;
  }
}
