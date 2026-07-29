console.log("Hello World");
console.log("This is a sample code snippet from LocalRepo/index.js");

const btn = document.getElementById("prompt-btn");
const output = document.getElementById("output");

btn.addEventListener("click", () => {
  output.textContent = `Hello, ${prompt("What is your name?")}!`;
});
