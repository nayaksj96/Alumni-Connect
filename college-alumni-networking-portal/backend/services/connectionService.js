import Connection from '../models/Connection.js';

export const findConnectionBetween = async (a, b) => {
  return Connection.findOne({
    $or: [
      { sender: a, receiver: b },
      { sender: b, receiver: a },
    ],
  });
};

export const isAcceptedConnection = async (a, b) => {
  const c = await Connection.findOne({
    status: 'accepted',
    $or: [
      { sender: a, receiver: b },
      { sender: b, receiver: a },
    ],
  });
  return !!c;
};
