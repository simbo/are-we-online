import { Component, createRef, h, VNode } from 'preact';
import { HostStatus } from '../models/host-status.enum';

interface PingIntervalProps {
  interval: number;
  onIntervalChange: (interval: number) => void;
}

export class PingInterval extends Component<PingIntervalProps, {}> {
  private readonly refPingIntervalInput = createRef<HTMLInputElement>();
  private readonly refPingIntervalForm = createRef<HTMLFormElement>();

  constructor(props: PingIntervalProps, state: never) {
    super(props, state);
    this.setState({ status: HostStatus.Unknown, loading: false });
  }

  public render({ interval }: PingIntervalProps, state: never): VNode {
    return (
      <div class="c-ping-interval">
        <form ref={this.refPingIntervalForm} class="c-ping-interval__form" onSubmit={this.onSubmit}>
          <label class="c-ping-interval__label" for="ping-interval">
            Ping Interval:
          </label>
          <input
            class={`c-ping-interval__input`}
            id="ping-interval"
            name="ping-interval"
            type="number"
            value={interval}
            min="2000"
            max="3600000"
            required
            placeholder="Milliseconds"
            ref={this.refPingIntervalInput}
            onChange={this.onSubmit}
          />
        </form>
      </div>
    );
  }

  private readonly onSubmit = (event: Event): void => {
    event.preventDefault();
    const form = this.refPingIntervalForm.current;
    if (form?.checkValidity()) {
      const data = new FormData(form);
      this.props.onIntervalChange(parseInt(data.get(`ping-interval`)?.toString() || '0', 10));
    }
  };
}
