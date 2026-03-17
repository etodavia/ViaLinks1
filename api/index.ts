import { createApp } from "../server.ts";

export default async function handler(req: any, res: any) {
  try {
    const app = await createApp();
    return app(req, res);
  } catch (err: any) {
    console.error("Vercel Function Initialization Error:", err);
    res.status(500).json({
      error: "Erro na inicialização do servidor (Vercel)",
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
      hint: "Verifique se todas as variáveis de ambiente (STRIPE_SECRET_KEY, FIREBASE_CONFIG) estão configuradas no dashboard da Vercel."
    });
  }
}
