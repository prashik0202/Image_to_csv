/*
 * Install the Generative AI SDK
 *
 * $ npm install @google/generative-ai
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleAIFileManager } from "@google/generative-ai/server";

import os from "os";
import { writeFile } from "fs/promises";
import { join } from "path";
import { NextResponse } from "next/server";

const apiKey = process.env.GEMINI_API_KEY!;
const genAI = new GoogleGenerativeAI(apiKey);
const fileManager = new GoogleAIFileManager(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-pro-002",
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file") as File;
  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  /**
   * The file.arrayBuffer() method reads the uploaded file as an ArrayBuffer.
   * Since it's asynchronous, the await keyword is used.
   * Buffer.from() converts this ArrayBuffer into a Node.js Buffer,
   *  which is used to handle binary data in Node.js.
   */
  const buffer = Buffer.from(await file.arrayBuffer());
  // get the operating system's temporary directory path.
  const tempDir = os.tmpdir();
  /**
   * combines the temporary directory path (tempDir) and the name of the uploaded file (file.name)
   * to form the full path where the file will be stored temporarily.
   */
  const tempFilePath = join(tempDir, file.name);
  await writeFile(tempFilePath, buffer);

  // now upload the image to google gemini model
  const uploadResponse = await fileManager.uploadFile(tempFilePath, {
    mimeType: file.type, // i.e jpg/jpeg
    displayName: file.name,
  });
  // console.log(
  //   `Uploaded file ${uploadResponse.file.displayName} as: ${uploadResponse.file.name}`
  // );

  // Generate content using text and the URI reference for the uploaded file.
  const chatSession = model.startChat({
    generationConfig,
    // safetySettings: Adjust safety settings
    // See https://ai.google.dev/gemini-api/docs/safety-settings
    history: [
      {
        role: "user",
        parts: [
          {
            fileData: {
              mimeType: uploadResponse.file.mimeType,
              fileUri: uploadResponse.file.uri,
            },
          },
          { text: "Extract tabular data form image in JSON format" },
        ],
      },
      {
        role: "model",
        parts: [
          {
            text: '```json\n[\n  {\n    "Object": "potato #1",\n    "Salt Solution (g)": "0g/50ml",\n    "mass #1": "3g",\n    "mass #2": "11g",\n    "change": "8g"\n  },\n  {\n    "Object": "potato #2",\n    "Salt Solution (g)": "0.5g/50ml",\n    "mass #1": "3g",\n    "mass #2": "6g",\n    "change": "3g"\n  },\n  {\n    "Object": "potato #3",\n    "Salt Solution (g)": "2.5g/50ml",\n    "mass #1": "3g",\n    "mass #2": "5g",\n    "change": "2g"\n  }\n]\n```',
          },
        ],
      },
    ],
  });

  const result = await chatSession.sendMessage(
    "Extract tabular data form image in JSON format"
  );
  // console.log(result.response.text());
  const cleanResponse = result.response.text().replace(/```json|```/g, "");
  console.log(cleanResponse);

  return new NextResponse(cleanResponse);
}
