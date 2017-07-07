var db = require("../db");

const {
  InvalidRequestError,
  DateRangeError
} = require("../errors/common_errors");
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

function getTimeIfValid(time) {
  if (time) {
    time = new Date(time);
    if (isNaN(time.getTime())) {
      time = undefined;
    }
  }
  return time;
}

exports.getTransactionsForUser = (fbid, start, end) => {
  console.log(start);
  console.log(end);
  start = getTimeIfValid(start);
  end = getTimeIfValid(end);

  if (!fbid) {
    throw InvalidRequestError();
  }
  var query = db("transactions").select("*").where({ fbid: fbid });

  if (!start && !end) {
    return query.andWhereRaw(`date >= now() - interval '1 year'`);
  } else if (start && !end) {
    return query.andWhere("date", ">=", start);
  } else if (start && end && start < end) {
    return query.andWhere("date", ">=", start).andWhere("date", "<=", end);
  } else {
    throw DateRangeError();
  }
};

exports.create = (fbid, amount, date, description) => {
  if (!fbid || !amount || !date || !description) {
    throw InvalidRequestError();
  }

  const transaction = {
    fbid: fbid,
    amount: amount,
    date: getTimeIfValid(date),
    description: description
  };
  return db("transactions").returning("*").insert(transaction).catch(err => {
    throw TransactionCreationError(err);
  });
};
