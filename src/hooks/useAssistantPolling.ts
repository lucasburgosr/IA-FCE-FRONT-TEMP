import { useRef, useCallback, useEffect, useState } from 'react';
import axios, { AxiosRequestConfig } from 'axios';

interface UseAssistantPollingProps {
  onSuccess: () => void;
  onError: (message: string) => void;
  axiosConfig: AxiosRequestConfig;
  apiUrl: string;
}

interface RunStatusResponse {
  status: 'queued' | 'in_progress' | 'completed' | 'failed' | 'cancelled' | 'expired' | 'requires_action';
}

export const useAssistantPolling = ({ onSuccess, onError, axiosConfig, apiUrl }: UseAssistantPollingProps) => {
  const [isPolling, setIsPolling] = useState<boolean>(false);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    setIsPolling(false);
  }, []);

  const startPolling = useCallback((threadId: string, runId: string) => {
    console.log("Entrando a la función de sondeo con thread ", threadId, " y run ", runId)
    
    stopPolling();
    setIsPolling(true);

    pollingIntervalRef.current = setInterval(async () => {
      try {
        const statusRes = await axios.get<RunStatusResponse>(
          `${apiUrl}/threads/${threadId}/runs/${runId}/status`,
          axiosConfig
        );
        const { status } = statusRes.data;

        if (status === 'completed') {
          stopPolling();
          onSuccess();
        } else if (['failed', 'cancelled', 'expired'].includes(status)) {
          stopPolling();
          onError("El asistente no pudo completar la solicitud.");
        }
      } catch (pollErr) {
        console.error("Error durante el polling:", pollErr);
        stopPolling();
        onError("Ocurrió un error al verificar el estado de la respuesta.");
      }
    }, 2500);
  }, [stopPolling, onSuccess, onError, axiosConfig, apiUrl]);

  useEffect(() => {
    return () => stopPolling();
  }, [stopPolling]);

  return { isPolling, startPolling };
};