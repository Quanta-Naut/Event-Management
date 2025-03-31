import express from 'express';
import serverless from 'netlify-lambda';
import { app } from '../../dist/index.js'; // Import your Express app

const handler = serverless(app);
export { handler };