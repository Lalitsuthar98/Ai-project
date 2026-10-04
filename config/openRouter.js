
// config/openRouter.js

import { OpenRouter } from "@openrouter/sdk";

const apiKey = process.env.OPENROUTER_API_KEY;

if (!apiKey || apiKey.trim() === "") {
  throw new Error("OPENROUTER_API_KEY is missing in .env");
}

const openrouter = new OpenRouter({
  apiKey,
});

export default openrouter;