////calling dependencies
const express = require("express");
const app = express();
const bcrypt = require("bcryptjs");
const cookieSession = require('cookie-session');
const methodOverride = require('method-override');
const {urlDatabase, users} = require('./sitedata');
const {generateRandomString, getUserByEmail, urlsForUser, canEditDelete} = require('./helper_functions');

////defining port
const PORT = 8080;


////setting view engine
app.set("view engine", "ejs");

///middleware to translate request body and handle cookies, and override methods
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(cookieSession({
  name: 'session',
  keys: ['hello', 'world']
}));

////  DEFINING ROUTING   /////

//for now, redirect requests to home to /urls, or login if not logged in

app.get("/", (req, res) => {
  let user = users[req.session.user_id];
  
  if (user) {
    res.redirect(302, "/urls");
  } else {
    res.redirect(302, "/login");
  }
});

//will render HTML template with list of urls, unless the user is not logged in in which case it will desplay error message

app.get("/urls", (req, res) => {
  const user = users[req.session.user_id];

  if (user) {
    const userUrls = urlsForUser(user.id, urlDatabase);
    const templateVars = {urls : userUrls, user};
    res.render("urls_index", templateVars);
  } else {
    res.redirect(302, '/login');
  }
});

//will generate a new short url, store in database, and redirect to /urls if the user is logged in, else will display error message

app.post("/urls", (req, res) => {
  const user = users[req.session.user_id];

  if (user) {
    const shortURL = generateRandomString();
    const longURL = req.body.longURL;
    urlDatabase[shortURL] = { longURL, userID : user.id };
    res.redirect(302, `/urls/${shortURL}`);
  } else {
    const templateVars = {message : 'You do not have permission to modify this URL. Please log in to continue', error : '401'};
    res
      .status(401)
      .render("error_page", templateVars);
  }
});

//route to the registration page. if already logged in, will redirect to /urls page

app.get("/register", (req, res) => {
  if (!req.session.user_id) {
    res.render("urls_registration");
  } else {
    res.redirect(302, "/urls");
  }
  
});

//when receiving a post from registration page, create a new user in users object and set a user_id cookie.
//notify user if they didnt fill out the form or user already exists

app.post("/register", (req, res) => {
  if (req.body.email && req.body.password) {
    if (!getUserByEmail(req.body.email, users)) {
      const randomID = `UID${generateRandomString()}`;
      const hashedPwd = bcrypt.hashSync(req.body.password, 10);
      users[randomID] = {id : randomID, email : req.body.email, hashedPwd};
      // eslint-disable-next-line camelcase
      req.session.user_id = randomID;
      res.redirect(302, '/urls');
    } else {
      const message = `User already exists! Please log in to access your account`;
      const templateVars = { message, error : '400' };
      res
        .status(400).render('error_page', templateVars);
    }
  } else {
    const message = 'Please fill out the email and password fields to register';
    const templateVars = { message, error : '400' };
    res
      .status(400).render('error_page', templateVars);
  }
});

//GET the login page. if user is already logged in, redirect to /urls

app.get("/login", (req, res) => {
  if (!req.session.user_id) {
    res.render('urls_login');
  } else {
    res.redirect(302, "/urls");
  }
});

//check if login information is correct (email registered and password correct). if not, display an error message

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(email, users);
  
  if (user && bcrypt.compareSync(password, user.hashedPwd)) {
    // eslint-disable-next-line camelcase
    req.session.user_id = user.id;
    res.redirect(302, '/urls');

  } else {

    const templateVars = {message : "User authentication failed", error : '403'};
    res.status(403);
    res.render('error_page', templateVars);
  }
});

//when user pressed logout button, will clear user_id cookie and redirect to /urls.

app.post("/logout", (req, res) => {
  delete req.session.user_id;
  res.redirect(302, '/urls');
});

//to access the page for submitting a new url. if user is not logged in, redirect to login page

app.get("/urls/new", (req, res) => {
  let user = users[req.session.user_id];

  if (user) {
    const templateVars = { user };
    res.render("urls_new", templateVars);
  } else {
    res.redirect(302, "/login");
  }

});

//will show a page with info for just requested url and option to edit long url. if user does not have access to the url, will display an error

app.get("/urls/:id", (req, res) => {
  const user = users[req.session.user_id];
  let userUrlIds;
  if (user) {
    userUrlIds = Object.keys(urlsForUser(user.id, urlDatabase));
  }

  if (user && userUrlIds.includes(req.params.id)) {
    const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id].longURL, user };
    res.render("urls_show", templateVars);
  } else {
    const templateVars = {message : 'You do not have permission to view this URL', error : '401', user};
    res
      .status(401)
      .render("error_page", templateVars);
  }
});

//upon submitting edit form, shorturl is associated to new provided longURL. if the user is not logged in or does not own the url
//(or it doesnt exist), will throw an error.

app.put("/urls/:id", (req, res) => {
  const newUrl = req.body.newUrl;
  const user = users[req.session.user_id];

  if (canEditDelete(req, users, urlDatabase)) {
    urlDatabase[req.params.id].longURL = newUrl;
    res.redirect(302, "/urls");
  } else {
    const templateVars = {message: 'You are not authorized to edit this URL', error: "401", user};
    res
      .status(401)
      .render("error_page", templateVars);
    return;
  }
});

//will delete long and short url from database when user presses delete button. if the user is not logged in or does not own the url
//(or it doesnt exist), will throw an error.

app.delete("/urls/:id/delete", (req, res) => {
  const user = users[req.session.user_id];

  if (canEditDelete(req, users, urlDatabase)) {
    delete urlDatabase[req.params.id];
    res.redirect(302, "/urls");

  } else {
    const templateVars = {message: 'You are not authorized to edit this URL', error: "401", user};
    res
      .status(401)
      .render("error_page", templateVars);
    return;
  }
});

//will redirect to the actual longURL website if it exists, or will render an error page

app.get("/u/:id", (req, res) => {
  if (urlDatabase[req.params.id]) {
    const longURL = urlDatabase[req.params.id].longURL;
    res.redirect(302, longURL);
  } else {
    const templateVars = { message: `The page you are looking for does not exist`, error : '404', user : users[req.session.user_id]};
    res
      .status(404)
      .render("error_page", templateVars);
  }
});



//listen at port 8080

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});