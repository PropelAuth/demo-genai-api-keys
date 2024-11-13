import express, { Request } from "express";
import bodyParser from "body-parser";
import { ApiKeyValidateException, initAuth } from '@propelauth/express';
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
    // Set the trial expiration date to 7 days from now
    const date = new Date();
    date.setDate(date.getDate() + 7);
    const userId = req.userClass!.userId;

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

app.post('/api/user/upgrade', auth.requireUser, async (req: Request, res) => {
  try {
    const userId = req.userClass!.userId;
    const result = await auth.updateUserMetadata(userId, {
      properties: {
        "plan_name": 'Paid'
      }
    })
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error });
  }
})

app.post('/api/image/create', auth.requireUser, jsonParser, async (req: Request, res) => {
  try {
    const apiKey = req.body.apiKey;
    const validate = await auth.validateApiKey(apiKey)
    
    // Allow the GenAI request if:
    // - The user is on Free plan and trial hasn't expired OR
    // - The user is on Paid plan
    const userProps = validate.user?.properties;
    const currentDate = new Date();
    const trialExpiresOn = new Date(userProps?.trialExpiresOn as string);
    if (userProps?.planName === 'Free' 
      && currentDate.getTime() > trialExpiresOn.getTime()) {
      throw new Error('Trial expired. Please upgrade to Paid plan.');
    }
    
    // User is permitted to create an image
    // Image creation outside the scope of this example
    // Instead, return a cute puppy picture
    res.json({ imageCreated : "https://picsum.photos/id/237/200/300"});
  } catch (error) {
    // TODO: Clean this up? ie better way to handle errors?
    if (error instanceof ApiKeyValidateException) {
      const errorMessage = JSON.parse(error.message);
      res.status(401).json({ error: errorMessage.api_key_token });
    } else if (error instanceof Error) {
      if (error.message === 'Trial expired. Please upgrade to Paid plan.') {
        res.status(403).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    } else {
      res.status(500).json({ error: 'An unknown error occurred.' });
    }
  } 
})

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
