export class AppError extends Error {
  readonly statusCode: number;
  readonly code: string;

  constructor(message: string, statusCode = 500, code = "INTERNAL_ERROR") {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
  }
}

export function publicError(error: unknown) {
  if (error instanceof AppError) {
    return { code: error.code, message: error.message, status: error.statusCode };
  }

  return {
    code: "INTERNAL_ERROR",
    message: "Something went wrong. Please try again.",
    status: 500,
  };
}
