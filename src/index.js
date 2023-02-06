import createBareServer from '@tomphttp/bare-server-node';
import { fileURLToPath } from "url";
import { createServer as createHttpsServer } from "node:https";
import { createServer as createHttpServer } from "node:http";
import { readFileSync, existsSync } from "node:fs";
import serveStatic from "serve-static";

// The following message MAY NOT be removed
console.log("Incognito\nThis program comes with ABSOLUTELY NO WARRANTY.\nThis is free software, and you are welcome to redistribute it\nunder the terms of the GNU General Public License as published by\nthe Free Software Foundation, either version 3 of the License, or\n(at your option) any later version.\n\nYou should have received a copy of the GNU General Public License\nalong with this program. If not, see <https://www.gnu.org/licenses/>.\n");

const bare = createBareServer("/bare/");
const serve = serveStatic(fileURLToPath(new URL("../static/", import.meta.url)), { fallthrough: false });
const loginInfo = JSON.parse(readFileSync(new URL("./login.json", import.meta.url)))
var server, PORT;
if (existsSync("../ssl/key.pem") && existsSync("../ssl/cert.pem")) {
  server = createHttpsServer({
    key: readFileSync("../ssl/key.pem"),
    cert: readFileSync("../ssl/cert.pem")
  });
  PORT = 443;
} else { server = createHttpServer(); PORT = (process.env.PORT || 8080); }

server.on("request", (req, res) => {
  if (bare.shouldRoute(req)) bare.routeRequest(req, res); else {
    switch (req.url) {
      case "/auth":
        let body = [];
        req.on('data', (chunk) => {
          body.push(chunk);
        }).on('end', () => {
          body = Buffer.concat(body).toString();
          console.log(JSON.parse(body))
          if (JSON.parse(body).password == loginInfo.password){
            res.end(JSON.stringify({ "login": true,"name":loginInfo.name }))
          }else{res.end(JSON.stringify({ "login": false }))}
          // at this point, `body` has the entire request body stored in it as a string
        });
        break;
      default:
        serve(req, res, (err) => {
          res.writeHead(err?.statusCode || 500, null, {
            "Content-Type": "text/plain",
          });
          res.end('Error')
        })
        break;
    }
  }
});

server.on("upgrade", (req, socket, head) => {
  if (bare.shouldRoute(req, socket, head)) bare.routeUpgrade(req, socket, head); else socket.end();
});

server.on('listening', () => {
  const addr = server.address();

  console.log(`Server running on port ${addr.port}`)
  console.log('');
  console.log('You can now view it in your browser.')
  console.log(`Current Login is ${loginInfo.username}, ${loginInfo.password}`)
  /* Code for listing IPS from website-aio */
  console.log(`Local: http://${addr.family === 'IPv6' ? `[${addr.address}]` : addr.address}:${addr.port}`);
  try { console.log(`On Your Network: http://${address.ip()}:${addr.port}`); } catch (err) {/* Can't find LAN interface */ };
  if (process.env.REPL_SLUG && process.env.REPL_OWNER) console.log(`Replit: https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`);
});

server.listen({ port: PORT })