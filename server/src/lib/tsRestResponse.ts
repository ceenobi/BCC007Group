const createTsRestResponse = <T extends number>(status: T, body: any) => {
  return {
    status: status as T,
    body,
  };
};

const createTsRestSuccess = <T extends number>(status: T, data: any) => {
  return createTsRestResponse(status, data);
};

const createTsRestError = <T extends number>(
  status: T,
  error: string,
  details?: any
) => {
  return createTsRestResponse(status, {
    success: false,
    message: error,
    ...(details && { details }),
  });
};

export { createTsRestResponse, createTsRestSuccess, createTsRestError };
