//writing test for "getUserByEmail" function as required in compass

const { assert } = require("chai");
const { getUserByEmail } = require("../helper_functions");

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {

  it('should return a user with valid email', () => {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    assert.equal(expectedUserID, user.id);
  });

  it("should return null if the email is not associated with a user", () => {
    //NOTE: compass tells us to return null in one exercise, and undefined in another. I have chosen to return null.
    const user = getUserByEmail('fun@fun.ca', testUsers);
    assert.equal(user, null);
  });

});


