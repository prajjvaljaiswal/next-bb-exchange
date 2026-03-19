"use client";
import { useEffect } from "react";
import { useSocketContext } from "@/context/SocketContext";

export function useSocket(event, handler) {
  const { socket } = useSocketContext();

  useEffect(() => {
    if (!socket || !event || !handler) return;
    socket.on(event, handler);
    return () => socket.off(event, handler);
  }, [socket, event, handler]);
}

export function useSocketConnected() {
  return useSocketContext().connected;
}
