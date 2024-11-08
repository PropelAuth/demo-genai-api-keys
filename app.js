import express from "express"
import { initAuth } from '@propelauth/express';
import dotenv from 'dotenv'
dotenv.config()

const app = express();
const port = 4000

const auth = initAuth({
  authUrl: process.env.PROPELAUTH_AUTH_URL,
  apiKey: process.env.PROPELAUTH_API_KEY,
})

app.post('/api/user/signup', async (req, res) => {
  try {
    const apiKeyResponse = await auth.validateApiKey(req.headers.authorization)
    res.json(`Hello, ${apiKeyResponse.user.email}`)
  } catch (error) {
    console.log(error)
    res.status(401)
    res.json("Incorrect API Key")
  }
})

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
