////calling dependencies
const express = require("express");
const app = express();

////defining port
const PORT = 8080;


////setting view engine
app.set("view engine", "ejs");

///middleware to translate request body
app.use(express.urlencoded({ extended: true }));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

///defining routing

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const templateVars = {urls : urlDatabase};
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  console.log(req);
  res.send("ok");
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  console.log(req);
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id]};
  res.render("urls_show", templateVars);
});



//listen at port 8080

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});