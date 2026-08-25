import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getSocket } from "../../socket";

export function useNoteSync() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    function handleChange() {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    }

    socket.on("note:created", handleChange);
    socket.on("note:updated", handleChange);
    socket.on("note:deleted", handleChange);

    return () => {
      socket.off("note:created", handleChange);
      socket.off("note:updated", handleChange);
      socket.off("note:deleted", handleChange);
    };
  }, [queryClient]);
}