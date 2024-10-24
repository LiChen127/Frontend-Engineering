import "./heading.css";
export default () => {
  const el = document.querySelector('h2');
  const div = document.querySelector('div');
  div.classList.add('heading');
  div.textContent = "A DIV WITH CLASSNAME HEADER"
  el.textContent = "WEBPACK MODULE BUNDLER";
  el.addEventListener("click", () => {
    alert('HELLO WEBPCK');
  })
  return el;
}