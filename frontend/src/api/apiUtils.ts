interface ApiErrorBody {
  message?: string;
}

export async function parseApiError(
  response: Response,
): Promise<Error> {
  let message =
    `Request failed with status ${response.status}.`;

  try {
    const body =
      (await response.json()) as ApiErrorBody;

    if (body.message) {
      message = body.message;
    }
  } catch {
    // The backend did not return valid JSON.
  }

  return new Error(message);
}