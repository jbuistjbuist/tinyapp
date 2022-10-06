////calling dependencies
const express = require("express");
const app = express();
const cookieParser = require('cookie-parser');
const {urlDatabase, users} = require('./sitedata');
const {generateRandomString, findUserEmail, urlsForUser, canEditDelete} = require('./helper_functions');

////defining port
const PORT = 8080;


////setting view engine
app.set("view engine", "ejs");

///middleware to translate request body and handle cookies
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

////  DEFINING ROUTING   /////

//for now, redirect requests to home to /urls

app.get("/", (req, res) => {
  let user = users[req.cookies["user_id"]];
  
  if (user) {
    res.redirect(302, "/urls");
  } else {
    res.redirect(302, "/login");
  }
});

//function to get urls in JSON (deprecated)

// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });

//will render HTML template with list of urls, unless the user is not logged in in which case it will desplay error message

app.get("/urls", (req, res) => {
  const user = users[req.cookies["user_id"]];

  if (user) {
    const userUrls = urlsForUser(user.id, urlDatabase);
    const templateVars = {urls : userUrls, user};
    res.render("urls_index", templateVars);
  } else {
    const templateVars = {message: "You must be logged in to view this page", error: "401"};
    res
      .status(401)
      .render("error_page", templateVars);
  }
});

//will generate a new short url, store in database, and redirect to /urls if the user is logged in, else will display error message

app.post("/urls", (req, res) => {
  const user = users[req.cookies["user_id"]];

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
  if (!req.cookies["user_id"]) {
    res.render("urls_registration");
  } else {
    res.redirect(302, "/urls");
  }
  
});

//when receiving a post from registration page, create a new user in users object and set a user_id cookie.
//notify user if they didnt fill out the form or user already exists

app.post("/register", (req, res) => {
  if (req.body.email && req.body.password) {
    if (!findUserEmail(req.body.email, users)) {
      const randomID = `UID${generateRandomString()}`;
      users[randomID] = {id : randomID, email : req.body.email, password : req.body.password};
      res
        .cookie('user_id', randomID)
        .redirect(302, '/urls');
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
  if (!req.cookies["user_id"]) {
    res.render('urls_login');
  } else {
    res.redirect(302, "/urls");
  }
});

//check if login information is correct (email registered and password correct). if not, display an error message

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = findUserEmail(email, users);
  
  if (user && user.password === password) {

    res
      .cookie('user_id', user.id)
      .redirect(302, '/urls');
  } else {

    const templateVars = {message : "User authentication failed", error : '403'};
    res.status(403);
    res.render('error_page', templateVars);
  }
});

//when user pressed logout button, will clear user_id cookie and redirect to /urls.

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect(302, '/urls');
});

//to access the page for submitting a new url. if user is not logged in, redirect to login page

app.get("/urls/new", (req, res) => {
  let user = users[req.cookies["user_id"]];

  if (user) {
    const templateVars = { user };
    res.render("urls_new", templateVars);
  } else {
    res.redirect(302, "/login");
  }

});

//will show a page with info for just requested url and option to edit long url. if user does not have access to the url, will display an error

app.get("/urls/:id", (req, res) => {
  const user = users[req.cookies["user_id"]];
  let userUrlIds;
  if (user) {
    userUrlIds = Object.keys(urlsForUser(user.id, urlDatabase));
  }

  if (user && userUrlIds.includes(req.params.id)) {
    const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id].longURL, user : users[req.cookies["user_id"]]};
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

app.post("/urls/:id", (req, res) => {
  const newUrl = req.body.newUrl;
  const user = users[req.cookies["user_id"]];

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

app.post("/urls/:id/delete", (req, res) => {
  const user = users[req.cookies["user_id"]];

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
    const templateVars = { message: `The page you are looking for does not exist`, error : '404', user : users[req.cookies['user_id']]};
    res
      .status(404)
      .render("error_page", templateVars);
  }
});



//listen at port 8080

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});