# Tutorial: Securing a GenAI Service with API Key Validation and Trial Management

This is the reference app for the ["Securing a GenAI Service with API Key Validation and Trial Management"](https://propelauth.com/post/securing-genai-service-with-api-key-validation) tutorial. Follow along to create a system where users can sign up for a free 7-day trial, upgrade to a paid plan, and use their API key to generate images.

## What You'll Build

We'll build an image generation API similar to Midjourney. To complete this tutorial, we’ll leverage PropelAuth’s [API Key Authentication](https://docs.propelauth.com/overview/authentication/api-keys), [custom user properties](https://docs.propelauth.com/overview/user-management/user-properties#custom-user-properties), and [account management features](https://docs.propelauth.com/getting-started/basics/hosted-pages#user-account-page). We’ll also create an Express API with endpoints to simulate Stripe payment processing and image creation.

## Components

- Web framework and API: [Express.js](https://expressjs.com/)
- API Key authentication and login/account management: [PropelAuth](https://propelauth.com)

## How to Run

1. Clone this repository.
1. In a terminal, change directory into the repo: `cd demo-genai-api-keys`.
1. Install all packages: `npm install`.
1. Build then run on localhost: `npm run dev`.
