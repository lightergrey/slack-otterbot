const getMockUserInput = (text, event_id, additionalData) => {
  const defaultData = {
    user: "someUserId",
    channel: "someChannel",
    messages: [
      {
        text,
        isAssertion: true,
        event_id
      }
    ]
  };
  return Object.assign({}, defaultData, additionalData);
};

module.exports = getMockUserInput;
