import express from "express";
import { S3 } from "aws-sdk";

const s3 = new S3({
    accessKeyId: "fa2e55656d3b7d59f49fb1fed9b4821e",
    secretAccessKey: "85b8e82a4a34833eb05a3b6dabe1d786ce5bbc6afc22b1412b8fbf7238ac9f2a",
    endpoint: "https://eee4fc24210a2c5e6dfee11c9ff9798d.r2.cloudflarestorage.com"
})

const app = express();

app.get("/*", async (req, res) => {
    // id.100xdevs.com
    const host = req.hostname;

    const id = host.split(".")[0];
    const filePath = req.path;

    const contents = await s3.getObject({
        Bucket: "vercel",
        Key: `dist/${id}${filePath}`
    }).promise();
    
    const type = filePath.endsWith("html") ? "text/html" : filePath.endsWith("css") ? "text/css" : "application/javascript"
    res.set("Content-Type", type);

    res.send(contents.Body);
})

app.listen(3001);