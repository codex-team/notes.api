/**
 * Checks if passed variable is an object and has a property with passed name
 * @param obj - object to check
 * @param name - property name
 */
export default function hasProperty<Obj, Name extends string>(obj: Obj, name: Name): obj is Obj & Record<Name, unknown> {
  return typeof obj === 'object' && obj !== null && name in obj;
}
