export type Result<T> = { isError: false; data: T } | { isError: true; error: unknown };

export const isSuccess = <T>(obj: Result<T>): obj is { isError: false; data: T } => obj.isError === false;
