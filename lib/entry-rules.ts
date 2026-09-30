export const LIMITS = {
  authorName: { min: 1, max: 20 },
  message: { min: 1, max: 500 },
  password: { min: 4, max: 32 },
} as const;

export type Field = keyof typeof LIMITS;
export type FieldErrors = Partial<Record<Field, string>>;

type Checked<T> = { ok: true; value: T } | { ok: false; fieldErrors: FieldErrors };

function lengthError(field: Field, value: string): string | undefined {
  const { min, max } = LIMITS[field];
  if (value.length >= min && value.length <= max) return undefined;

  switch (field) {
    case "authorName":
      return value.length === 0 ? "이름을 입력해 주세요." : `이름은 ${max}자 이하로 입력해 주세요.`;
    case "message":
      return value.length === 0 ? "메시지를 입력해 주세요." : `메시지는 ${max}자 이하로 입력해 주세요.`;
    case "password":
      return `비밀번호는 ${min}자 이상 ${max}자 이하로 입력해 주세요.`;
  }
}

/**
 * Normalises and checks the given fields. Author name and Message are trimmed;
 * the Entry password is taken exactly as typed.
 */
export function checkFields<T extends Partial<Record<Field, string>>>(fields: T): Checked<T> {
  const value = { ...fields };
  const fieldErrors: FieldErrors = {};

  for (const field of Object.keys(fields) as Field[]) {
    const raw = fields[field] ?? "";
    const normalised = field === "password" ? raw : raw.trim();
    value[field] = normalised as T[Field];
    const error = lengthError(field, normalised);
    if (error) fieldErrors[field] = error;
  }

  return Object.keys(fieldErrors).length > 0 ? { ok: false, fieldErrors } : { ok: true, value };
}
