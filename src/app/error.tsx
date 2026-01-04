"use client";

import { useEffect } from "react";
import { Alert, Button } from "@mantine/core";
import { BiErrorCircle, BiTimeFive } from "react-icons/bi";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }; 
  reset: () => void;
}) {
  
  const isRateLimit = error.digest?.startsWith("RATE_LIMIT_EXCEEDED");
  
  const minutesWait = isRateLimit ? error.digest?.split(":")[1] : null;

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-lvh h-full w-full flex items-center justify-center p-6">
      <Alert
        variant="light"
        color={isRateLimit ? "orange" : "red"}
        title={isRateLimit ? "Muitas tentativas" : "Erro no sistema"}
        icon={isRateLimit ? <BiTimeFive size={20} /> : <BiErrorCircle size={20} />}
        className="max-w-md"
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm">
            {isRateLimit
              ? `Você fez muitas requisições em pouco tempo. Por segurança, aguarde ${minutesWait || 15} minutos antes de tentar novamente.`
              : "Não foi possível carregar as informações. Nossa equipe já foi notificada."}
          </p>

          <Button 
            onClick={() => reset()} 
            color={isRateLimit ? "orange" : "red"} 
            variant="outline"
            size="xs"
          >
            Tentar Novamente
          </Button>
        </div>
        <code>
            {error.message}
        </code>
      </Alert>
    </div>
  );
}