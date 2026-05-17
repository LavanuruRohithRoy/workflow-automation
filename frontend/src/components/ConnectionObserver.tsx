"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { WifiOff, X } from "lucide-react";

export default function ConnectionObserver() {
  const [offline, setOffline] = useState<boolean>(false);

  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (!error.response || error.code === "ERR_NETWORK") {
          setOffline(true);
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  if (!offline) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-amber-600 text-white px-4 py-3 rounded shadow-lg flex items-center space-x-3 animate-in fade-in slide-in-from-bottom-2 z-[999] max-w-sm">
      <WifiOff className="w-6 h-6 shrink-0" />
      <div className="flex-1">
        <span className="font-bold block text-sm">Connection Warning</span>
        <span className="text-xs opacity-90 block">The backend api server is currently unreachable or wake-up is delayed.</span>
      </div>
      <button 
        onClick={() => setOffline(false)} 
        className="hover:bg-amber-700/50 p-1 rounded-full transition"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
