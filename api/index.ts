import { createApp } from "../server.js";

export default async function handler(req, res) {
  try {
    const app = await createApp();
    return app(req, res);
  } catch (err: any) {
    console.error("Vercel Function Error:", err);
    res.status(500).json({
      error: "Erro na inicialização do servidor",
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
}
