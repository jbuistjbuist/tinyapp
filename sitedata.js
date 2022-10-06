//database for URL information
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "UID53xyab",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "UID67xy12",
  },
};

//dataBase for user information

const users = {
  UIDvz757r: {
    id: 'UIDvz757r',
    email: 'user@example.com',
    hashedPwd: '$2a$10$AP/2RZKc1Ds2cp2yYsRnleKQfCgizte5t2z6CzcNvAsUDTEyLRs6S' //purple-monkey-dinosaur
  },
  UIDp8a9rv: {
    id: 'UIDp8a9rv',
    email: 'user2@example.com',
    hashedPwd: '$2a$10$wu5D6sflttPUNL4pMC5vTukvf.eIc6OMobhFmWa6QaXwFP06ueCRe' //dishwasher-funk
  },
  UIDr59uw6: {
    id: 'UIDr59uw6',
    email: 'hi@hi.com',
    hashedPwd: '$2a$10$3HpmOxjZIHEjgZd0dbVNHeT0z8pMcBke.NuvqKMOeSYbKFHJnqivm' //password is 1234
  }
};

module.exports = {urlDatabase, users};