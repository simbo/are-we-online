import { Component, h, VNode } from 'preact';

interface CurrentIPState {
  ip: string;
}

export class CurrentIP extends Component<{}, CurrentIPState> {
  constructor(props: never, state: CurrentIPState) {
    super(props, state);
    this.setState({ ip: 'unknown' });
    this.retrieveIP();
  }

  public render(props: never, { ip }: CurrentIPState): VNode {
    return (
      <button class="c-current-ip" onClick={this.retrieveIP}>
        IP: {ip}
      </button>
    );
  }

  private readonly retrieveIP = (): void => {
    this.setState({ ip: 'retrieving...' });
    fetch('https://api.ipify.org?format=json', { cache: 'no-cache' })
      .then(response => response.json())
      .then(({ ip }) => this.setState({ ip }))
      .catch(err => this.setState({ ip: 'unkown' }));
  };
}
