import { ProfilePage } from './profile.js'
import {login} from './login.js'

const config = {
  ENDPOINTS: {
    SIGNIN: "https://learn.zone01oujda.ma/api/auth/signin",
    GRAPHQL: "https://learn.zone01oujda.ma/api/graphql-engine/v1/graphql"
  },
  
  USER_DATA : {
    username: "",
    firstName: "",
    lastName: "",
    email: "",
    auditRatio: "",
    totalUp: "",
    totalDown: "",
    successrojects: 0,
    finished_projects: [],
    XP: 0,
  }
};

const loginPage = `
  <div class="auth-wrapper">
    <div class="auth-box">
      <h1>Login</h1>
      <form id="login-form">
        <input type="text" id="username" placeholder="Username or Email" required />
        <input type="password" id="password" placeholder="Password" required />
        <button type="submit" style= >Login</button>
      </form>
      <p id="error-message"></p>
    </div>
  </div>
`;

const profileHTML = (userData) => `
<header>
    <div class="header-container">
        <div class="logo-section">
            <img src="public/css/images/logo.png" alt="Logo" class="logo-image">
             <h1>Welcome, ${userData.firstName} ${userData.lastName}!</h1>
        </div>
        <button id="btn-logout">Logout</button>
    </div>
</header>
<div class="profile-wrapper">
    <div class="info-wrapper">
        <div class="personal-details">
            <h2>Personal Information</h2>
            <p><strong>Username: </strong>${userData.username}</p>
            <p><strong>Email: </strong>${userData.email}</p>
            <p><strong>Your XP: </strong>${userData.XP}</p>
        </div>
        <div class="completed-projects">
            <h2>completed-projects</h2>
            ${userData.finished_projects.map(project => {
                const path = (project.group.path).split('/').pop();
                return `<p>${path}</p>`;
            }).join('')}
        </div>
        <div class="ongoing-projects">
            <h2>Number of Completed Projects</h2>
            ${userData.successrojects}
        </div>
    </div>
    <div class="charts-wrapper">
        <div class="chart" id="chart1">
            <div class="chart-title">
                <h2>You Worked With:</h2>
                <p id="names-and-times"></p>
            </div>
            <div id="svg-chart1"></div>
        </div>
        <div class="chart" id="chart2">
            <!-- Additional chart content can go here -->
        </div>
    </div>
</div>
`;




function formatSize(sizeInBytes, xp) {
  var result;
  if (sizeInBytes < 1000) {
    result = sizeInBytes + " B";
  } else if (sizeInBytes < 1000 * 1000) {
    if (xp === "XP") {
      result = Math.floor(sizeInBytes / 1000) + " kB";
    } else {
      result = (sizeInBytes / 1000).toFixed(2) + " KB";
    }
  } else {
    if (xp === "XP") {
      result = Math.floor(sizeInBytes / 1000 / 1000) + " MB";
    } else {
      sizeInBytes = (sizeInBytes / 1000 / 1000).toFixed(3);
      result = sizeInBytes.slice(0, 4) + " MB";
    }
  }
  return result;
}

function isLoging() {
  if (localStorage.getItem("jwt")) {
    ProfilePage();
  } else {
    document.body.innerHTML = loginPage;
    login()
  }
}




isLoging()
export {formatSize,profileHTML,loginPage, config}
