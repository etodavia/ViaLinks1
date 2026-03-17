export default function handler(req: any, res: any) {
  res.status(200).json({ 
    message: "Standalone API is working!",
    time: new Date().toISOString(),
    env: process.env.NODE_ENV
  });
}
