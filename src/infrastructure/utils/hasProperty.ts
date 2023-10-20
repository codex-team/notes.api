/**
 * Checks if passed variable is an object and has a property with passed name
 *
 * @param obj - object to check
 * @param name - property name
 */
export default function hasProperty<T, N extends string>(obj: T, name: N): obj is T & Record<N, unknown> {
  return typeof obj === 'object' && obj !== null && name in obj;
}
