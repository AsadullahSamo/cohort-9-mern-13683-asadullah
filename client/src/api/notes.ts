import { api } from "./client";

export interface Note {
    _id: string
    title: string
    content: string
    user: string
    createdAt: string
    updatedAt: string
}


export async function getNotes(): Promise<Note[]> {
    const res = await api.get("/notes")
    return res.data
}

export async function getNoteById(id: string): Promise<Note> {
    const res = await api.get(`/notes/${id}`)
    return res.data
}

export async function createNote(title: string, content: string): Promise<Note> {
    const res = await api.post("/notes", {title, content})
    return res.data
}

export async function updateNote(id: string, updates: {title?: string, content?: string}): Promise<Note> {
    const res = await api.patch(`/notes/${id}`, updates)
    return res.data
}

export async function deleteNote(id: string): Promise<void> {
  await api.delete(`/notes/${id}`);
}