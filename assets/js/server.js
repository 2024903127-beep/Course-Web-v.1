const http = require("http");
const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..", "..");

const server = http.createServer((req, res) => {
    const urlPath = decodeURIComponent((req.url || "/").split("?")[0]);
    const relativePath = urlPath === "/" ? "/index.html" : urlPath;
    const safePath = path.normalize(relativePath).replace(/^(\.\.[\/\\])+/, "");
    let filePath = path.join(rootDir, safePath);

    // Handle directory requests
    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
        filePath = path.join(filePath, "index.html");
    }

    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404);
            res.end("File not found");
            return;
        }

        // Set content type based on file extension
        const ext = path.extname(filePath);
        let contentType = "text/html";
        switch (ext) {
            case ".css": contentType = "text/css"; break;
            case ".js": contentType = "text/javascript"; break;
            case ".json": contentType = "application/json"; break;
            case ".png": contentType = "image/png"; break;
            case ".jpg": contentType = "image/jpeg"; break;
            case ".jpeg": contentType = "image/jpeg"; break;
            case ".svg": contentType = "image/svg+xml"; break;
        }

        res.writeHead(200, { "Content-Type": contentType });
        res.end(data);
    });
});

server.listen(3000, () => {
    console.log("🚀 Premium Dashboard Server running at http://localhost:3000");
    console.log("📱 Test the dashboard at: http://localhost:3000/pages/dashboard.html");
    console.log("🧪 Run tests at: http://localhost:3000/dashboard-test.html");
});
