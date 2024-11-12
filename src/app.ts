import express, { Request } from "express";
import bodyParser from "body-parser";
import { initAuth } from '@propelauth/express';
import dotenv from 'dotenv'
dotenv.config()

const app = express();
const port = 3000
const jsonParser = bodyParser.json()

const auth = initAuth({
  authUrl: process.env.PROPELAUTH_AUTH_URL!,
  apiKey: process.env.PROPELAUTH_API_KEY!,
})

app.post('/api/user/signup', auth.requireUser, async (req: Request, res) => {
  try {
    const userId = req.userClass!.userId;
    // Set the trial expiration date to 7 days from now
    const date = new Date();
    date.setDate(date.getDate() + 7);

    const result = await auth.updateUserMetadata(userId, {
      properties: {
        "plan_name": 'Free',
        // YYYY-MM-DD format is required
        "trial_expires_on": date.toISOString().split('T')[0]
      }
    })
    res.json(result);
  }
  catch (error) {
    res.status(500).json({ error: error });
  }
})

app.post('/api/user/upgrade', auth.requireUser, jsonParser, async (req: Request, res) => {
  try {
    const userId = req.userClass!.userId;
    const result = await auth.updateUserMetadata(userId, {
      properties: {
        "plan": 'Paid',
        // Remove expiration
        "trial_expires_on": "0000-00-00"
      }
    })
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error });
  }
})

// app.post('/api/image/create', auth.requireUser, async (req: Request, res) => {
//   try {
//     const userId = req.userClass!.userId;
    
//     const validate = await auth.validateApiKey()
    
//     const result = await auth.createImage(userId, {
//       name: 'My Image',
//       url: 'https://example.com/image.png'
//     })
//     res.json(result);
//   } catch (error) {
//     res.status(500).json({ error: error });
//   } 
// })

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
