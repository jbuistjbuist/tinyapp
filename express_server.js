////calling dependencies
const express = require("express");
const app = express();
const cookieParser = require('cookie-parser');

////defining port
const PORT = 8080;


////setting view engine
app.set("view engine", "ejs");

///middleware to translate request body and handle cookies
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

///username database
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

///generate random string as stand in for shortened URL

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

///defining routing

app.get("/", (req, res) => {
  res.redirect(302, "/urls");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const templateVars = {urls : urlDatabase};
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  console.log(urlDatabase);
  res.redirect(`/urls/${shortURL}`);
});

app.post("/login", (req, res) => {
  const username = req.body.username;
  console.log(req.body.username);
  res
    .cookie('username', username)
    .redirect(302, '/urls');
});

app.get("/urls/new", (req, res) => {
  res.render(302, "urls_new");
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id]};
  res.render("urls_show", templateVars);
});

app.post("/urls/:id", (req, res) => {
  const newUrl = req.body.newUrl;
  urlDatabase[req.params.id] = newUrl;
  res.redirect(302, "/urls");
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect(302, "/urls");
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});



//listen at port 8080

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});