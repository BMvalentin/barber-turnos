export function serializarDatos<T>(data: T): T {
  return JSON.parse(
    JSON.stringify(data, (_, value) =>
      typeof value === "object" && value?.constructor?.name === "Decimal"
        ? value.toNumber()
        : value
    )
  );
}
