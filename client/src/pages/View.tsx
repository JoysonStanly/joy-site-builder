import { useCallback, useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { Loader2Icon } from "lucide-react";
import ProjectPreview from "../components/ProjectPreview";
import type { Project } from "../types";
import api from "@/configs/axios";
import { toast } from "sonner";
import { AxiosError } from "axios";

const getDevice = (): string => {
  const ua = navigator.userAgent;
  if (/tablet|ipad|playbook|silk/i.test(ua)) return 'Tablet';
  if (/mobile|iphone|ipod|android|blackberry|mini|windows\sce|palm/i.test(ua)) return 'Mobile';
  return 'Desktop';
};

const getReferrer = (): string => {
  const ref = document.referrer;
  if (!ref) return 'Direct';
  try {
    const url = new URL(ref);
    return url.hostname;
  } catch {
    return 'Direct';
  }
};

const View = () => {
  const { projectId } = useParams();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(true);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    startTimeRef.current = Date.now();
  }, []);

  const fetchCode = useCallback(async () => {
    if (!projectId) {
      setLoading(false);
      return;
    }

    try {
      const { data } = await api.get(`/api/project/published/${projectId}`);
      setCode(data.code);
      setLoading(false);

      // Track view with device, referrer, country
      await api.post(`/api/analytics/track`, {
        projectId,
        eventType: 'view',
        device: getDevice(),
        referrer: getReferrer(),
      });

    } catch (error: unknown) {
      const message = error instanceof AxiosError
        ? error.response?.data?.message
        : error instanceof Error
          ? error.message
          : undefined;
      toast.error(message || 'Failed to load preview');
      console.log(error);
    }
  }, [projectId]);

  const trackClick = async () => {
    if (!projectId) {
      return;
    }

    try {
      await api.post(`/api/analytics/track`, {
        projectId,
        eventType: 'click',
        device: getDevice(),
        referrer: getReferrer(),
      });
    } catch (error) {
      console.log(error);
    }
  };

  // Track duration when user leaves
  useEffect(() => {
    void fetchCode();

    const handleUnload = async () => {
      const duration = startTimeRef.current > 0
        ? Math.round((Date.now() - startTimeRef.current) / 1000)
        : 0;

      if (!projectId) {
        return;
      }

      navigator.sendBeacon(
        `${import.meta.env.VITE_API_URL}/api/analytics/track`,
        JSON.stringify({ projectId, eventType: 'duration', duration, device: getDevice(), referrer: getReferrer() })
      );
    };

    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, [fetchCode, projectId]);

  if (loading) {
    return (
      <div className='flex items-center justify-center h-screen'>
        <Loader2Icon className='size-7 animate-spin text-indigo-200' />
      </div>
    );
  }

  return (
    <div className="h-screen" onClick={trackClick}>
      {code && <ProjectPreview project={{ current_code: code } as Project} isGenerating={false} showEditorPanel={false} />}
    </div>
  );
};

export default View;