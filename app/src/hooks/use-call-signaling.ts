import { useEffect, useState, useCallback } from 'react';
import { socketManager } from '@/lib/socket-manager';
import { useRouter } from 'expo-router';

interface IncomingCall {
  appointmentId: number;
  doctorName: string;
  channelName: string;
}

export function useCallSignaling(userId: number | undefined) {
  const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!userId) return;

    const handleCallStarted = (payload: {
      appointmentId: number;
      doctorName: string;
      channelName: string;
    }) => {
      setIncomingCall(payload);
    };

    const handleCallEnded = () => {
      setIncomingCall(null);
    };

    const handleCallResponse = (payload: { accepted: boolean; appointmentId: number }) => {
      if (payload.accepted) {
        router.push({
          pathname: '/video-call',
          params: { appointmentId: String(payload.appointmentId) },
        });
      }
    };

    socketManager.on('callStarted', handleCallStarted);
    socketManager.on('callEnded', handleCallEnded);
    socketManager.on('callResponse', handleCallResponse);

    return () => {
      socketManager.off('callStarted', handleCallStarted);
      socketManager.off('callEnded', handleCallEnded);
      socketManager.off('callResponse', handleCallResponse);
    };
  }, [userId, router]);

  const acceptCall = useCallback(() => {
    if (incomingCall) {
      socketManager.emit('callResponse', {
        accepted: true,
        appointmentId: incomingCall.appointmentId,
      });
      setIncomingCall(null);
      router.push({
        pathname: '/video-call',
        params: { appointmentId: String(incomingCall.appointmentId) },
      });
    }
  }, [incomingCall, router]);

  const rejectCall = useCallback(() => {
    if (incomingCall) {
      socketManager.emit('callResponse', {
        accepted: false,
        appointmentId: incomingCall.appointmentId,
      });
      setIncomingCall(null);
    }
  }, [incomingCall]);

  return { incomingCall, acceptCall, rejectCall };
}
