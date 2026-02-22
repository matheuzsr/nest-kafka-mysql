export function kafkaDeserialize<T>(message: any): T {
  const raw = message?.value ?? message;
  return typeof raw === 'string' ? JSON.parse(raw) : raw;
}
