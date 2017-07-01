var db = require("../db");

const { InvalidRequestError } = require("../errors/common_errors");
const { TransactionCreationError } = require("../errors/transaction_errors");

exports.get = transactionid => {
  if (!transactionid) {
    throw InvalidRequestError();
  }

  return db("transactions")
    .first("*")
    .where({ transaction_id: transactionid })
    .then(transaction => {
      if (!transaction) {
        throw TransactionNotFoundError();
      }
      return transaction;
    });
};

exports.create = (fbid, amount, date, description) => {
  if (!fbid || !amount || !date || !description) {
    throw InvalidRequestError();
  }
  const transaction = {
    fbid: fbid,
    amount: amount,
    date: date,
    description: description
  };
  return db("transactions").returning("*").insert(transaction).catch(err => {
    console.log(err);
    throw TransactionCreationError(err);
  });
};
