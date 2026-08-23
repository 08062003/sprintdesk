import { useEffect, useRef } from 'react';
import { useNotificationStore } from '../store/notificationStore';
import { useToast } from './useToast';

const POLLING_INTERVAL = 5000; // 5 seconds
const API_URL = 'https://jsonplaceholder.typicode.com/posts?_limit=5';

export function useNotificationPolling() {
  const {
    addNotification,
    setPolling,
    setLastPollTimestamp,
    isPanelOpen,
  } = useNotificationStore();
  // Use a ref to the latest 'info' function so we don't cause the effect to re-run
  // when the toast helpers change identity
  const { info } = useToast();
  const infoRef = useRef(info);
  infoRef.current = info;

  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastProcessedPostId = useRef<number | null>(null);

  useEffect(() => {
    const startPolling = () => {
      setPolling(true);

      pollingIntervalRef.current = setInterval(async () => {
        try {
          const response = await fetch(API_URL);
          if (!response.ok) return;

          const posts = await response.json();
          const latestPostId = posts[0]?.id;

          if (latestPostId && lastProcessedPostId.current !== null) {
            // If we have a new post ID, treat it as a new notification
            if (latestPostId > lastProcessedPostId.current) {
              const newPost = posts.find((p: any) => p.id === latestPostId);

              if (newPost) {
                addNotification({
                  title: 'New Update',
                  message: newPost.title.substring(0, 50) + '...',
                  type: 'info',
                  read: false,
                  source: 'api',
                });

                // Show toast if panel is closed
                if (!isPanelOpen && infoRef.current) {
                  infoRef.current('New notification received', newPost.title.substring(0, 30) + '...');
                }
              }
            }
          }

          lastProcessedPostId.current = latestPostId;
          setLastPollTimestamp(Date.now());
        } catch (error) {
          console.error('Polling error:', error);
        }
      }, POLLING_INTERVAL);
    };

    const stopPolling = () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      setPolling(false);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopPolling();
      } else {
        startPolling();
      }
    };

    // Start polling initially
    startPolling();

    // Set up visibility change listener
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      stopPolling();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [addNotification, setPolling, setLastPollTimestamp, isPanelOpen]);

  // Do not subscribe to store selectors here — the hook is intended to run as a daemon.
  return;
}
