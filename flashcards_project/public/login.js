function login() {
  let request = new XMLHttpRequest();
  request.open("GET", "auth/google", true);
  request.onload = () => console.log("Login success");
  request.onerror = () => console.log("Login error");
  request.send();
}
