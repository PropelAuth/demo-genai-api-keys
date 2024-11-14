import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import { initAuth, UserMetadata } from "@propelauth/express";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const port = 3000;
const jsonParser = bodyParser.json();

const auth = initAuth({
  authUrl: process.env.PROPELAUTH_AUTH_URL!,
  apiKey: process.env.PROPELAUTH_API_KEY!,
});

app.post("/webhook/stripe", async (req: Request, res) => {
  const event = req.body;
  const userId = event.data.object.metadata.userId;
  switch (event.type) {
    case "customer.subscription.created":
      await updateUserPlan(userId, "Paid");
      break;
    case "customer.subscription.deleted":
      await updateUserPlan(userId, "Free");
      break;
  }

  // Return a response to acknowledge receipt of the event
  res.json({ received: true });
});

const updateUserPlan = async (userId: string, planName: string) => {
  await auth.updateUserMetadata(userId, {
    properties: {
      plan_name: planName,
    },
  });
};

app.post("/api/image/create", jsonParser, async (req: Request, res: Response) => {
  const apiKey = req.body.apiKey;
  const validatedUser = await validateApiKey(apiKey, res);
  await validateGenAIRequest(validatedUser, res);

  // User is permitted to create an image
  // Image creation outside the scope of this example
  // Instead, return a cute puppy picture
  res.json({ imageCreated: "https://picsum.photos/id/237/200/300" });
});

/* Allow the GenAI request if:
- The user is on Free plan and created date isn't past 7 days OR
- The user is on Paid plan */
const validateGenAIRequest = async (validatedUser: UserMetadata, res: Response) => {
  const userCreatedDate = new Date(validatedUser.createdAt * 1000);
  const trialExpirationDate = new Date();
  trialExpirationDate.setDate(userCreatedDate.getDate() + 7);
  const todaysDate = new Date();

  const planName = validatedUser.properties?.planName ?? "Free";
  if (planName === "Free" && todaysDate.getTime() > trialExpirationDate.getTime()) {
    res.status(403).json({ error: "Trial expired. Please upgrade to Paid plan." });
    return;
  }
};

async function validateApiKey(apiKey: string, res: Response) {
  try {
    return (await auth.validatePersonalApiKey(apiKey)).user;
  } catch (error) {
    res.status(401).json({ error: "Invalid API key" });
    throw new Error("Invalid API key");
  }
}

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
