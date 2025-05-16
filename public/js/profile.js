import { config,loginPage,profileHTML,formatSize} from './index.js'
import { login } from './login.js'
import { query } from "./query.js";

let members = [];

export async function ProfilePage() {
  members = [];
    const jwt = localStorage.getItem("jwt");
  
    if (!jwt) {
      document.body.innerHTML = loginPage;
      login()
      return;
    };
  
    try {
      const response = await fetch(config.ENDPOINTS.GRAPHQL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify({ query }),
      });
  
      const result = await response.json();
      console.log("hhhh",result);
      if (result.errors) {
        throw new Error("Failed to fetch user data");
      }



      const Data = result.data.user;
      if (!Data) {
        throw new Error("No user data found");
      }
      Data.forEach(Element => {
        config.USER_DATA.username = Element.login;
        config.USER_DATA.firstName = Element.firstName;
        config.USER_DATA.lastName = Element.lastName;
        config.USER_DATA.email = Element.email;
        config.USER_DATA.auditRatio = (parseFloat(Element.auditRatio)).toFixed(1);
        config.USER_DATA.totalUp = parseFloat(Element.totalUp)
        config.USER_DATA.totalDown = parseFloat(Element.totalDown)
        config.USER_DATA.successrojects = Element.finished_projects.length;
        config.USER_DATA.finished_projects = Element.finished_projects;
        config.USER_DATA.XP = formatSize(parseFloat(Element.transactions_aggregate.aggregate.sum.amount), "XP");
      });

      config.USER_DATA.finished_projects.forEach(project => {
        project.group.members.forEach(member => {
          const userlogin = member.userLogin;
          if (userlogin !== config.USER_DATA.username) {
            let existingMember = members.find(m => m.userlogin === userlogin);
            if (!existingMember) {
              members.push({ userlogin, times: 1 });
            } else {
              existingMember.times++;
            }
          }
        });
      });

      document.body.innerHTML = profileHTML(config.USER_DATA);
      const graph1 = document.getElementById("svg-chart1");
      createSVG(graph1, "graph1", members.length);
      const svg1 = document.getElementById("svg-graph1");
      
      createGRAPH(svg1, members);
      const graph2 = document.getElementById("chart2");
      createAuditRatio(config.USER_DATA, graph2);
      document.getElementById("btn-logout").addEventListener("click", () => {
        localStorage.removeItem("jwt");
        document.body.innerHTML = loginPage;
        login();
      });
    } catch (error) {
      console.error("Failed to render profile page:", error);
      document.body.innerHTML = loginPage;
      login()
      return;
    }
  }

  function createSVG(graph, id, dataLength) {
    const barWidth = 30;
    const barSpacing = 15;
    const minWidth = 400;
    const graphHeight = 300;

    const graphWidth = Math.max(minWidth, dataLength * (barWidth + barSpacing) + 20);

    const svgElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svgElement.setAttribute("id", `svg-${id}`);
    svgElement.setAttribute("width", graphWidth);
    svgElement.setAttribute("height", "100%");
    svgElement.setAttribute("viewBox", `0 0 ${graphWidth} ${graphHeight}`);
    svgElement.setAttribute("preserveAspectRatio", "xMinYMin meet");
    graph.appendChild(svgElement);
}

  function createGRAPH(svg, DATA) {
    if (!DATA.length) return;
  
    DATA.sort((a, b) => b.times - a.times);
  
    const maxTimes = DATA[0].times;
    const barWidth = 30;
    const barSpacing = 15;
    const graphHeight = 280;
    const baseX = 0;
    const NamesAndTimes = document.getElementById("names-and-times");
  
    DATA.forEach((item, index) => {
  
      const barHeight = (item.times / maxTimes) * 250;
      const x = baseX + index * (barWidth + barSpacing);
      const y = graphHeight - barHeight;
  
      const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      rect.setAttribute("x", x);
      rect.setAttribute("y", y);
      rect.setAttribute("width", barWidth);
      rect.setAttribute("height", barHeight);
      rect.setAttribute("fill", "#9b0072");
      rect.setAttribute("cursor", "pointer");
      rect.setAttribute("rx", 5); // Add border radius
      rect.setAttribute("ry", 5); // Add border radius
      rect.setAttribute("stroke", "#d266b5"); // Add border color
      rect.setAttribute("stroke-width", 3);   // Add border thickness
  
      rect.addEventListener("mouseover", () => {
        NamesAndTimes.textContent = `${item.userlogin}: ${item.times} times`;
      });
  
      svg.appendChild(rect);
    });
  }
  
  function createAuditRatio(USER_DATA, graph2) {
    const widthUp = USER_DATA.totalUp
    const widthDown = USER_DATA.totalDown
    const totalwidth = widthUp + widthDown;
  
    const svgString = `
    <svg width="300" height="150" xmlns="http://www.w3.org/2000/svg">
      <rect x="10" y="60" width="${(widthUp / (totalwidth)) * 200}" height="30" fill="#009319" />
      <rect x="${10 + (widthUp / (totalwidth)) * 200}" y="60" width="${(widthDown / (totalwidth)) * 200}" height="30" fill="#a00c20" />
  
      <text x="10" y="40" font-size="20" fill="black">Your ratio : <tspan fill="black">${USER_DATA.auditRatio}</tspan></text>
      <text x="10" y="105" font-size="14" fill="#black">Up: ${formatSize(USER_DATA.totalUp)}</text>
      <text x="110" y="105" font-size="14" fill="#black">Down: ${formatSize(USER_DATA.totalDown)}</text>
    </svg>`
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svgString, "image/svg+xml");
    const svgElement = svgDoc.documentElement;
    graph2.appendChild(svgElement);
  }