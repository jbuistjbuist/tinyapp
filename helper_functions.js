//generates a random string for use with ID generation

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

//returns the user object if the user email is found in the data, else returns null

const getUserByEmail = function(email, data) {
  for (let obj in data) {
    let user = data[obj];
    if (email === user.email) {
      return user;
    }
  }
  return null;
};

//locates all of the url objects associated with a provided user ID, and returns an object containing the matching URLS

const urlsForUser = function(id, urlDatabase) {
  let output = {};
  for (let key in urlDatabase) {
    let url = urlDatabase[key];
    if (url.userID === id) {
      output[key] = {...url, totalVisits: urlDatabase[key].totalVisits, uniqueVisits: urlDatabase[key].uniqueVisits};
    }
  }
  return output;
};

//checks if a user is logged in and has access to a given url (here: id) in order to be able to edit or delete it

const canEditDelete = function(req, users, urlDatabase) {
  const id = req.params.id;
  const user = users[req.session.user_id];
  
  if (!user) {
    return false;
  }

  if (!urlDatabase[id]) {
    return false;
  }

  const userUrlIds = Object.keys(urlsForUser(user.id, urlDatabase));

  if (!userUrlIds.includes(id)) {
    return false;
  }

  return true;
};

module.exports = {generateRandomString, getUserByEmail, urlsForUser, canEditDelete};