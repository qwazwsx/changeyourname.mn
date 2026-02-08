import http from "node:http";
import fs from "node:fs";
import crypto from "node:crypto";

const COMMENTS_FILE = "/var/lib/comments/comments.ndjson";

const server = http.createServer(async (req, res) => {
    if (req.method !== "POST" || req.url !== "/comments") {
        res.writeHead(404);
        return res.end();
    }

    let body = "";
    req.on("data", chunk => body += chunk);
    req.on("end", () => {
        try {
            const { text, page } = JSON.parse(body);

            if (
                typeof text !== "string" ||
                text.length < 3 ||
                text.length > 2000 ||
                typeof page !== "string"
            ) {
                res.writeHead(400);
                return res.end();
            }

            const entry = {
                id: crypto.randomUUID(),
                page,
                body: text,
                ts: Math.floor(Date.now() / 1000)
            };

            fs.appendFile(
                COMMENTS_FILE,
                JSON.stringify(entry) + "\n",
                { encoding: "utf8", mode: 0o600 },
                () => { }
            );

            res.writeHead(200);
            res.end("ok");
        } catch {
            res.writeHead(400);
            res.end();
        }
    });
});

server.listen(3333, "127.0.0.1");