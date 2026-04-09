import { S3 } from "aws-sdk";
import fs from "fs";

const s3 = new S3({
    accessKeyId: "fa2e55656d3b7d59f49fb1fed9b4821e",
    secretAccessKey: "85b8e82a4a34833eb05a3b6dabe1d786ce5bbc6afc22b1412b8fbf7238ac9f2a",
    endpoint: "https://eee4fc24210a2c5e6dfee11c9ff9798d.r2.cloudflarestorage.com"
})

// fileName => output/12312/src/App.jsx
// filePath => /Users/harkiratsingh/vercel/dist/output/12312/src/App.jsx
export const uploadFile = async (fileName: string, localFilePath: string) => {
    const fileContent = fs.readFileSync(localFilePath);
    const response = await s3.upload({
        Body: fileContent,
        Bucket: "vercel",
        Key: fileName,
    }).promise();
    console.log(response);
}