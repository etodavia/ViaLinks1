export default function (req: any, res: any) {
  res.json({ 
    status: "alive", 
    time: new Date().toISOString(), 
    runtime: "vercel-serverless",
    message: "If you see this, Vercel routing is working correctly."
  });
}
