////calling dependencies
const express = require("express");
const app = express();
const cookieParser = require('cookie-parser');
const {urlDatabase, users} = require('./sitedata');
const {generateRandomString} = require('./helper_functions');

////defining port
const PORT = 8081;


////setting view engine
app.set("view engine", "ejs");

///middleware to translate request body and handle cookies
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

////  DEFINING ROUTING   /////

//for now, redirect requests to home to /urls

app.get("/", (req, res) => {
  res.redirect(302, "/urls");
});

//function to get urls in JSON

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//will render HTML template with list of urls shortened

app.get("/urls", (req, res) => {
  const templateVars = {urls : urlDatabase, username : req.cookies["username"]};
  res.render("urls_index", templateVars);
});

//will generate a new short url, store in database, and redirect to /urls

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.get("/register", (req, res) => {
  res.render("urls_registration");
});

app.post("/register", (req, res) => {
  const randomID = `UID${generateRandomString()}`;
  users[randomID] = {id : randomID, email : req.body.email, password : req.body.password};
  res
    .cookie('user_id', randomID)
    .redirect('/urls');
});

//when user submits login form, will store username as cookie with name username and redirect to /urls

app.post("/login", (req, res) => {
  const username = req.body.username;
  res
    .cookie('username', username)
    .redirect(302, '/urls');
});

//when user pressed logout button, will clear username cookie and redirect to /urls. login form should reappear

app.post("/logout", (req, res) => {
  res.clearCookie('username');
  res.redirect(302, '/urls');
});

//to submit a new url.

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

//will show a page with info for just requested url and option to edit long url

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], username : req.cookies["username"]};
  res.render("urls_show", templateVars);
});

//upon submitting edit form, shorturl is associated to new provided longURL

app.post("/urls/:id", (req, res) => {
  const newUrl = req.body.newUrl;
  urlDatabase[req.params.id] = newUrl;
  res.redirect(302, "/urls");
});

//will delete long and short url from database when user presses delete button

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect(302, "/urls");
});

//will redirect to the actual longURL website

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});



//listen at port 8080

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});