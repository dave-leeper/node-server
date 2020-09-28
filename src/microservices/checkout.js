const Files = require('../util/files');
const I18n = require('../util/i18n');
const Log = require('../util/log');
const Strings = require('../util/strings');

class AddUser {
  do(reqInfo) {
    return new Promise((inResolve, inReject) => {
      const { body } = reqInfo;

      if (!body.username) {
        const message = Strings.format(I18n.get(Strings.ERROR_MESSAGE_INCORRECT_USER_NAME), body.username);
        if (Log.will(Log.ERROR)) Log.error(message);
        inReject && inReject({ status: 400, send: message });
        return;
      }
      const userPath = `./private/users/${body.username}`;
      if (!Files.existsSync(userPath)) {
        const message = I18n.get(Strings.ERROR_MESSAGE_INCORRECT_USER_NAME);
        if (Log.will(Log.ERROR)) Log.error(message);
        inReject && inReject({ status: 400, send: message });
        return;
      }
      if (!body.books) {
        const message = I18n.get(Strings.ERROR_MESSAGE_BOOK_LIST_REQUIRED);
        if (Log.will(Log.ERROR)) Log.error(message);
        inReject && inReject({ status: 400, send: message });
        return;
      }
      let books;
      try {
        books = JSON.parse(body.books);
      } catch (error) {
        const message = I18n.get(Strings.ERROR_MESSAGE_BOOK_LIST_REQUIRED);
        if (Log.will(Log.ERROR)) Log.error(message);
        inReject && inReject({ status: 400, send: message });
        return;
      }
      if (!Array.isArray(books)) {
        const message = I18n.get(Strings.ERROR_MESSAGE_BOOK_LIST_REQUIRED);
        if (Log.will(Log.ERROR)) Log.error(message);
        inReject && inReject({ status: 400, send: message });
        return;
      }
      for (let i = books.length - 1; i >= 0; i--) {
        const book = books[i];
        let bookPath = `./public/files/comics/${book.id}`;
        if (!Files.existsSync(bookPath)) {
          const message = Strings.format(I18n.get(Strings.ERROR_MESSAGE_INVALID_BOOK_ID), book.id);
          if (Log.will(Log.ERROR)) Log.error(message);
          inReject && inReject({ status: 400, send: message });
          return;
        }
        bookPath += (`/${book.issue}`);
        if (!Files.existsSync(bookPath)) {
          const message = Strings.format(I18n.get(Strings.ERROR_MESSAGE_INVALID_BOOK_ISSUE), book.issue);
          if (Log.will(Log.ERROR)) Log.error(message);
          inReject && inReject({ status: 400, send: message });
          return;
        }
      }

      const successReadCallback = (data) => {
        let owned;
        try {
          owned = JSON.parse(data);
        } catch (error) {
          const message = Strings.format(I18n.get(Strings.ERROR_MESSAGE_ERROR_READING_OWNED_BOOKS), Log.stringify(error));
          if (Log.will(Log.ERROR)) Log.error(message);
          inReject && inReject({ status: 500, send: message });
          return;
        }
        const now = new Date();
        const transactionDate = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
        for (let i = books.length - 1; i >= 0; i--) {
          const book = books[i];
          let hasBook = false;
          for (let j = owned.length - 1; j >= 0; j--) {
            const ownedBook = owned[j];
            if (book.id === ownedBook.id && book.issue === ownedBook.issue) {
              hasBook = true;
              break;
            }
          }
          if (hasBook) continue;
          const newBook = { id: book.id, issue: book.issue, transactionDate };
          owned.push(newBook);
        }
        const successCallback = () => {
          const message = I18n.get(Strings.SUCCESS_MESSAGE_BOOKS_ADDED);
          const newUserPath = `./private/users/${body.username}`;
          Files.writeFileSync(`${newUserPath}/cart.json`, '[]');
          inResolve && inResolve({ status: 200, send: message });
        };
        const failCallback = (error) => {
          const message = Strings.format(I18n.get(Strings.ERROR_MESSAGE_BOOKS_ADD_FAILED), Log.stringify(error));
          if (Log.will(Log.ERROR)) Log.error(message);
          inReject && inReject({ status: 500, send: message });
        };
        Files.writeFileLock(
          `${userPath}/owned.json`,
          JSON.stringify(owned, null, 3),
          5,
          successCallback,
          failCallback,
        );
      };
      const failReadCallback = (error) => {
        const message = Strings.format(I18n.get(Strings.ERROR_MESSAGE_ERROR_READING_OWNED_BOOKS), Log.stringify(error));
        if (Log.will(Log.ERROR)) Log.error(message);
        inReject && inReject({ status: 500, send: message });
      };
      Files.readFileLock(`${userPath}/owned.json`, 5, successReadCallback, failReadCallback);
    });
  }
}
module.exports = AddUser;
