import { distinctUntilChanged, MonoTypeOperatorFunction } from 'rxjs';

export function filterChanged<T, U>(
  selector: (value: T) => U = value => (typeof value === 'object' ? (JSON.stringify(value) as any) : value)
): MonoTypeOperatorFunction<T> {
  return distinctUntilChanged<T, U>((a, b) => a === b, selector);
}
