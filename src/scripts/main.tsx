import { h, render } from 'preact';

import { appStore } from '../store/app/app-store';
import { App } from './components/app';

if (process.env.NODE_ENV !== 'production') {
  appStore.actions$.subscribe(({ name, payload, state }) =>
    console.log('Action:', name, '\nPayload:', payload, '\nState:', state)
  );
}

document.body.className = '';
render(<App />, document.body);
