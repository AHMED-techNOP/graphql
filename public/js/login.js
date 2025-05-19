import { config } from './index.js'
import { ProfilePage } from './profile.js';

export function login() {
    const loginForm = document.getElementById("login-form");
    loginForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const username = document.getElementById("username").value;
      const password = document.getElementById("password").value;
      submit(username, password);
    })
}

async function submit(username, password) {
    const credentials = btoa(`${username}:${password}`);
    try {
      const response = await fetch(config.ENDPOINTS.SIGNIN, {
        method: "POST",
        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/json"
        },
      });
      
      if (!response.ok) {
        console.log(response);
        
        document.getElementById("error-message").innerHTML = `Invalid credentials. Please try again.`;
        setTimeout(() => {
          document.getElementById("error-message").innerHTML = ``;
        }, 3000);
        return;
      }
  
      const data = await response.json();
      console.log("login:", data);
      localStorage.setItem("jwt", data); // Store JWT in localStorage
      ProfilePage()
    } catch (error) {
      document.getElementById("error-message").innerHTML = `Invalid credentials. Please try again.`;
    }
}


 // Appeler la fonction pour exécuter la requête
  