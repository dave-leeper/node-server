// eslint-disable-next-line import/no-unresolved
const I18N = require('./I18n');
const Strings = require('./strings');

const ErrorLookup = [
  {
    titleId: Strings.ERROR_MESSAGE_FILE_NAME,
    messageId: Strings.ERROR_MESSAGE_FILE_ALREADY_EXISTS,
    error: { status: 409 },
  },
];

function Error() {}
Error.get = function (errorId, titleData, messageData, error) {
  if ((!Number.isInteger(errorId)) || (errorId < 0) || (errorId >= ErrorLookup.length)) return null;
  const errorInfo = ErrorLookup[errorId];
  let title = I18N.get(errorInfo.titleId);
  let message = I18N.get(errorInfo.messageId);

  if (titleData) title = I18N.format(title, titleData);
  if (messageData) message = I18N.format(message, messageData);
  const errorObj = { title, message, error: errorInfo.error };
  if (error && error.stack) errorObj.error.stack = error.stack;
  return errorObj;
};

module.exports = Error;
