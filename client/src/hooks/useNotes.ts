import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getNotes, getNoteById, createNote, updateNote, deleteNote } from "../api/notes";


const NOTES_KEY = ["notes"];


export function useNotes() {
    return useQuery({
        queryKey: NOTES_KEY,
        queryFn: getNotes
    })
}

export function useNote(id: string | undefined) {
    return useQuery({
        queryKey: ["notes", id],
        queryFn: () => getNoteById(id as string),
        enabled: !!id
    })
}

export function useCreateNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ title, content }: { title: string; content: string }) =>
      createNote(title, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTES_KEY });
    },
  });
}

export function useUpdateNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: { title?: string; content?: string };
    }) => updateNote(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTES_KEY });
    },
  });
}

export function useDeleteNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteNote(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTES_KEY });
    },
  });
}