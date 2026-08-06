import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { DashboardPage } from "../pages/DashboardPage";
import * as AuthContext from "../context/AuthContext";
import * as useNotesHooks from "../hooks/useNotes";

jest.mock("../context/AuthContext");
jest.mock("../hooks/useNotes");

describe("DashboardPage", () => {
  const mockLogout = jest.fn();
  const mockMutate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useNotesHooks.useNotes as jest.Mock).mockReturnValue({
      data: [{
        _id: "1",
        title: "My note",
        content: "content",
        user: "u1",
        createdAt: "",
        updatedAt: "",
      }],
      isLoading: false,
      isError: false,
    });
    (AuthContext.useAuth as jest.Mock).mockReturnValue({
      logout: mockLogout,
      login: jest.fn(),
      signup: jest.fn(),
      accessToken: "fake-token",
      loading: false,
    });
    (useNotesHooks.useDeleteNote as jest.Mock).mockReturnValue({
      mutate: mockMutate,
    });
  });

  function renderPage() {
    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    );
  }

  it("shows a loading state", () => {
    (useNotesHooks.useNotes as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    });
    renderPage();

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("shows an error state", () => {
    (useNotesHooks.useNotes as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    });
    renderPage();

    expect(screen.getByText("Failed to load notes.")).toBeInTheDocument();
  });

  it("shows an empty state when there are no notes", () => {
    (useNotesHooks.useNotes as jest.Mock).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    });
    renderPage();

    expect(screen.getByText("No notes yet. Create your first note.")).toBeInTheDocument();
  });

  it("renders notes with plain-text content snippets", () => {
    (useNotesHooks.useNotes as jest.Mock).mockReturnValue({
      data: [
        {
          _id: "1",
          title: "My note",
          content: "<p>Some <strong>bold</strong> text</p>",
          user: "u1",
          createdAt: "",
          updatedAt: "",
        },
      ],
      isLoading: false,
      isError: false,
    });
    renderPage();

    expect(screen.getByText("My note")).toBeInTheDocument();
    expect(screen.getByText("Some bold text")).toBeInTheDocument();
  });

  it("asks for confirmation before deleting, then deletes on confirm", async () => {
    renderPage();

    await userEvent.click(
      screen.getAllByRole("button", { name: "Delete" })[0]
    );

    expect(mockMutate).not.toHaveBeenCalled();

    await userEvent.click(
      within(screen.getByRole("dialog"))
        .getByRole("button", { name: "Delete" })
    );

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith("1", expect.any(Object));
    });
  });

  it("does not delete when cancel is clicked", async () => {
    (useNotesHooks.useNotes as jest.Mock).mockReturnValue({
      data: [
        {
          _id: "1",
          title: "My note",
          content: "content",
          user: "u1",
          createdAt: "",
          updatedAt: "",
        },
      ],
      isLoading: false,
      isError: false,
    });
    renderPage();

    await userEvent.click(screen.getByText("Delete"));
    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(mockMutate).not.toHaveBeenCalled();
    expect(
      screen.queryByText("Delete this note? This cannot be undone.")
    ).not.toBeInTheDocument();
  });
});