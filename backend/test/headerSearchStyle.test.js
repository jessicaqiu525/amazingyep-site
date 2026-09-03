const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const styles = fs.readFileSync(path.join(__dirname, '..', '..', 'style.css'), 'utf8');

test('header search hides the browser clear control', () => {
  assert.match(styles, /input\[type="search"\]::\-webkit-search-cancel-button/);
  assert.match(styles, /input\[type="search"\]::\-webkit-search-decoration/);
});

test('header search neutralizes the browser autofill tint', () => {
  assert.match(styles, /\.nav-search input:\-webkit-autofill/);
  assert.match(styles, /box-shadow: 0 0 0 1000px #fff inset/);
});
