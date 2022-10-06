class Url {  //defining a class for Urls to add to database, to simplify adding the getters into each object
  constructor(shortURL, longURL, userID) {
    this.id = shortURL;
    this.longURL = longURL;
    this.userID = userID;
    this.visitLog = {};
  }

  get totalVisits() {
    return Object.keys(this.visitLog).length;
  }

  get uniqueVisits() {
    let visitorIds = [];
    let count = 0;
    for (let key in this.visitLog) {
      let visit = this.visitLog[key];
      if (!visitorIds.includes(visit.visitorID)) {
        count++;
      }
      visitorIds.push(visit.visitorID);
    }
    return count;
  }
}

const urlDatabase = {
  b6UTxQ: new Url('b6UTxQ', "https://www.tsn.ca", "UIDvz757r"),
  i3BoGr: new Url('i3BoGr', 'https://www.google.ca', 'UIDp8a9rv')
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

module.exports = {urlDatabase, users, Url};