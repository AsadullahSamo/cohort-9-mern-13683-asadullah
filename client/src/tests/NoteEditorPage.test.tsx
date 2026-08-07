import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { NoteEditorPage } from "../pages/NoteEditorPage";
import * as useNotesHooks from "../hooks/useNotes";

jest.mock("../hooks/useNotes");

jest.mock("../components/NoteEditor", () => ({
  NoteEditor: ({
    content,
    onChange,
  }: {
    content: string;
    onChange: (html: string) => void;
  }) => (
    <textarea
      data-testid="mock-editor"
      value={content}
      onChange={(e) => onChange(e.target.value)}
    />
  ),
}));

describe("NoteEditorPage", () => {
  const mockCreateMutateAsync = jest.fn();
  const mockUpdateMutateAsync = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useNotesHooks.useCreateNote as jest.Mock).mockReturnValue({
      mutateAsync: mockCreateMutateAsync,
    });
    (useNotesHooks.useUpdateNote as jest.Mock).mockReturnValue({
      mutateAsync: mockUpdateMutateAsync,
    });
  });

  function renderAtPath(path: string) {
    render(
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/notes/new" element={<NoteEditorPage />} />
          <Route path="/notes/:id" element={<NoteEditorPage />} />
          <Route path="/" element={<div>Dashboard</div>} />
        </Routes>
      </MemoryRouter>
    );
  }

  it("renders empty fields for a new note", () => {
    (useNotesHooks.useNote as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: false,
    });
    renderAtPath("/notes/new");

    expect(screen.getByPlaceholderText("Title")).toHaveValue("");
    expect(screen.getByTestId("mock-editor")).toHaveValue("");
  });

  it("creates a note and navigates to dashboard on save", async () => {
    mockCreateMutateAsync.mockResolvedValue(undefined);
    (useNotesHooks.useNote as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: false,
    });
    renderAtPath("/notes/new");

    await userEvent.type(screen.getByPlaceholderText("Title"), "New title");
    await userEvent.type(screen.getByTestId("mock-editor"), "New content");
    await userEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(mockCreateMutateAsync).toHaveBeenCalledWith({
        title: "New title",
        content: "New content",
      });
    });
    expect(await screen.findByText("Dashboard")).toBeInTheDocument();
  });

  it("loads existing note data for editing", () => {
    (useNotesHooks.useNote as jest.Mock).mockReturnValue({
      data: { _id: "1", title: "Existing", content: "Existing content" },
      isLoading: false,
    });
    renderAtPath("/notes/1");

    expect(screen.getByPlaceholderText("Title")).toHaveValue("Existing");
    expect(screen.getByTestId("mock-editor")).toHaveValue("Existing content");
  });

  it("updates a note and navigates to dashboard on save", async () => {
    mockUpdateMutateAsync.mockResolvedValue(undefined);
    (useNotesHooks.useNote as jest.Mock).mockReturnValue({
      data: { _id: "1", title: "Existing", content: "Existing content" },
      isLoading: false,
    });
    renderAtPath("/notes/1");

    await userEvent.clear(screen.getByPlaceholderText("Title"));
    await userEvent.type(screen.getByPlaceholderText("Title"), "Updated title");
    await userEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(mockUpdateMutateAsync).toHaveBeenCalledWith({
        id: "1",
        updates: { title: "Updated title", content: "Existing content" },
      });
    });
  });

  it("navigates to dashboard on cancel without saving", async () => {
    (useNotesHooks.useNote as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: false,
    });
    renderAtPath("/notes/new");

    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(mockCreateMutateAsync).not.toHaveBeenCalled();
    expect(await screen.findByText("Dashboard")).toBeInTheDocument();
  });

  it("shows a loading state while fetching an existing note", () => {
    (useNotesHooks.useNote as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: true,
    });
    renderAtPath("/notes/1");

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });
});