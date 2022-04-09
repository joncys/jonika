export const isDefined = <Value>(
  value: Value | undefined | null
): value is Value => {
  return value !== null && value !== undefined
}
