/**
 * Checks for null/undefined/''/{}
 *
 * @param v value to check
 */
export default function notEmpty<T>(v: T | undefined | null | object): v is T {
  return v !== undefined && v !== null && v !== '' && (typeof v !== 'object' || Object.keys(v).length > 0);
}
