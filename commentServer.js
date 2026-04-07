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
            let { text, object } = JSON.parse(body);

            console.log(5555, text, object)

            if (text === undefined && object === undefined) {
                res.writeHead(400);
                return res.end();
            }

            if (!text) text = ""
            if (!object) object = null


            if (
                (typeof text !== "string" && !object) &&
                text.length < 3 ||
                text.length > 2000
            ) {
                res.writeHead(400);
                return res.end();
            }

            if (
                (typeof object !== "object" && !text) &&
                object === null ||
                Array.isArray(object)
            ) {
                res.writeHead(400);
                return res.end();
            }

            const entry = {
                id: crypto.randomUUID(),
                text,
                object,
                ts: Math.floor(Date.now() / 1000)
            };

            console.log(entry)

            fs.appendFile(
                COMMENTS_FILE,
                JSON.stringify(entry) + "\n",
                { encoding: "utf8", mode: 0o600 },
                () => { }
            )

            res.writeHead(200);
            res.end("ok");
        } catch (err) {
            console.log(err)
            res.writeHead(400);
            res.end();
        }
    });
});

server.listen(3333, "127.0.0.1");