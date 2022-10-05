const generateRandomString = function() {
  let string = '';
  const alphabet = "abcdefghijklmnopqrstuvwxyz";
  for (let i = 0; i < 6; i++) {
    if (Math.random() < 0.5) {
      string += Math.floor(Math.random() * 10);
    } else {
      string += alphabet[Math.floor(Math.random() * alphabet.length)];
    }
  }
  return string;
};

const findUserEmail = function(email, data) {
  for (let obj in data) {
    let user = data[obj];
    if (email === user.email) {
      return user;
    }
  }
  return null;
};

const urlsForUser = function(id, urlDatabase) {
  let output = {};
  for (let key in urlDatabase) {
    let url = urlDatabase[key];
    if (url.userID === id) {
      output[key] = url;
    }
  }
  return output;
};

module.exports = {generateRandomString, findUserEmail, urlsForUser};