import React, { useState } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { motion } from 'framer-motion';
import { Check, X, AlertCircle } from 'lucide-react';

export const CheckoutForm = ({ clientSecret, amount, onCancel }: { clientSecret: string, amount: number, onCancel: () => void }) => {
  const stripe = useStripe();
  const elements = useElements();

  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/?success=true`,
      },
    }) as any;

    if (error) {
      if (error.type === "card_error" || error.type === "validation_error") {
        setMessage(error.message || "Ocorreu um erro na validação.");
      } else {
        setMessage("Ocorreu um erro inesperado.");
      }
    } else if (paymentIntent && (paymentIntent.status === "succeeded" || paymentIntent.status === "processing")) {
      window.location.href = `${window.location.origin}/?success=true&payment_intent=${paymentIntent.id}`;
    }

    setIsLoading(false);
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center space-y-6">
        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center">
          <Check className="w-10 h-10 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold text-white">Pagamento Confirmado!</h2>
        <p className="text-slate-400">Seu acesso será liberado em instantes. Você receberá um e-mail com as instruções.</p>
        <button 
          onClick={() => window.location.reload()}
          className="bg-vialinks-orange text-white px-8 py-3 rounded-xl font-bold"
        >
          Ir para o Dashboard
        </button>
      </div>
    );
  }

  return (
    <form id="payment-form" onSubmit={handleSubmit} className="p-4 space-y-4">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-white mb-2">Finalizar Pagamento</h2>
        <p className="text-sm text-slate-400">
          Total: <span className="text-white font-bold">{amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
        </p>
      </div>

      <PaymentElement id="payment-element" options={{ layout: 'accordion' }} />

      {message && (
        <div className="bg-red-500/10 border border-red-500/50 p-4 rounded-xl flex items-center gap-3 text-red-500 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p>{message}</p>
        </div>
      )}

      <div className="flex flex-col gap-3 pt-4">
        <button
          disabled={isLoading || !stripe || !elements}
          id="submit"
          className="w-full bg-vialinks-orange text-white py-4 rounded-xl font-black uppercase tracking-widest hover:bg-vialinks-orange/90 transition-all shadow-lg shadow-vialinks-orange/20 flex items-center justify-center gap-3 disabled:opacity-50"
        >
          {isLoading ? (
            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            "Pagar Agora"
          )}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="w-full text-slate-500 hover:text-white transition-colors text-sm font-bold py-2"
        >
          Cancelar e voltar
        </button>
      </div>
      
      <p className="text-[10px] text-center text-slate-500">
        Pagamento 100% seguro processado por Stripe. Ao clicar em Pagar Agora, você concorda com nossos termos.
      </p>
    </form>
  );
};
