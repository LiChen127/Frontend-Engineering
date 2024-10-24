export var name = "foo module";

setTimeout(() => {
  name = "foo module be changed after 1s";
  console.log(name);
}, 1000);