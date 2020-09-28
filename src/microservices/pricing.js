const Files = require('../util/files');
const I18n = require('../util/i18n');
const Log = require('../util/log');
const Strings = require('../util/strings');

class Pricing {
  do(reqInfo) {
    return new Promise((inResolve, inReject) => {
      const { body } = reqInfo;
      let price = 0.0;
      const taxes = 0.0;

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
        const bookPath = `./public/files/comics/${book.id}/${book.issue}`;
        if (!Files.existsSync(bookPath)) {
          const message = Strings.format(I18n.get(Strings.ERROR_MESSAGE_INVALID_BOOK_ISSUE), book.issue);
          if (Log.will(Log.ERROR)) Log.error(message);
          inReject && inReject({ status: 400, send: message });
          return;
        }
      }

      const prices = [];
      for (let i = books.length - 1; i >= 0; i--) {
        const book = books[i];
        const bookPath = `./public/files/comics/${book.id}/${book.issue}/manifest.json`;
        prices.push(this.getPrice(bookPath));
      }
      Promise.all(prices).then((values) => {
        price = values.reduce((a, b) => a + b, 0);
        inResolve && inResolve({ status: 200, send: { subtotal: price.toFixed(2), taxes: taxes.toFixed(2) } });
      }).catch((error) => {
        const message = Strings.format(I18n.get(Strings.ERROR_MESSAGE_ERROR_READING_BOOKS), Log.stringify(error));
        if (Log.will(Log.ERROR)) Log.error(message);
        inReject && inReject({ status: 500, send: message });
      });
    });
  }

  getPrice(bookPath) {
    return new Promise((inResolve, inReject) => {
      let book = Files.readFileSync(bookPath);
      try {
        book = JSON.parse(book);
      } catch (error) {
        const message = Strings.format(I18n.get(Strings.ERROR_MESSAGE_ERROR_READING_BOOKS), Log.stringify(error));
        if (Log.will(Log.ERROR)) Log.error(message);
        inReject && inReject({ status: 500, send: message });
        return;
      }
      inResolve(parseFloat(book.price));
    });
  }
}
module.exports = Pricing;
