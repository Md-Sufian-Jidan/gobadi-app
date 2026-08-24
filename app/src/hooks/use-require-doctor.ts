import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'expo-router';
import type { RootState } from '@/store/store';

export function useRequireDoctor() {
  const user = useSelector((state: RootState) => state.auth.user);
  const router = useRouter();
  const isDoctor = user?.role === 'doctor';

  useEffect(() => {
    if (!isDoctor) {
      router.replace('/');
    }
  }, [isDoctor, router]);

  return isDoctor;
}
