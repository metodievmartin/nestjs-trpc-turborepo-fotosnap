export const PG_ERROR_CODES = {
  FOREIGN_KEY_VIOLATION: '23503',
  UNIQUE_VIOLATION: '23505',
  NOT_NULL_VIOLATION: '23502',
  CHECK_VIOLATION: '23514',
} as const;

function getPgCode(e: unknown): string | undefined {
  return (e as any)?.cause?.code ?? (e as any)?.code;
}

export function isForeignKeyViolation(e: unknown): boolean {
  return getPgCode(e) === PG_ERROR_CODES.FOREIGN_KEY_VIOLATION;
}

export function isUniqueViolation(e: unknown): boolean {
  return getPgCode(e) === PG_ERROR_CODES.UNIQUE_VIOLATION;
}

export function isNotNullViolation(e: unknown): boolean {
  return getPgCode(e) === PG_ERROR_CODES.NOT_NULL_VIOLATION;
}

export function isCheckViolation(e: unknown): boolean {
  return getPgCode(e) === PG_ERROR_CODES.CHECK_VIOLATION;
}
