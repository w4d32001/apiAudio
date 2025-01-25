const responseMessages = {
  success: (message, data = null) => ({
    status: "success",
    message,
    data,
  }),
  error: (message, data = null) => ({
    status: "error",
    message,
    data,
  }),
};

export default responseMessages;
