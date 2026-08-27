import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { SignupPage } from "../pages/SignupPage";
import * as AuthContext from "../context/AuthContext";

jest.mock("../context/AuthContext");

describe("SignupPage", () => {
  const mockSignup = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (AuthContext.useAuth as jest.Mock).mockReturnValue({
      signup: mockSignup,
      login: jest.fn(),
      logout: jest.fn(),
      accessToken: null,
      loading: false,
    });
  });

  function renderPage() {
    render(
      <MemoryRouter>
        <SignupPage />
      </MemoryRouter>
    );
  }

  it("submits email and password to signup", async () => {
    mockSignup.mockResolvedValue(undefined);
    renderPage();

    await userEvent.type(screen.getByLabelText("Email"), "test@example.com");
    await userEvent.type(screen.getByLabelText("Password"), "password123");
    await userEvent.click(screen.getByRole("button", { name: "Sign up" }));

    await waitFor(() => {
      expect(mockSignup).toHaveBeenCalledWith("test@example.com", "password123");
    });
  });

  it("shows the backend error message on failure", async () => {
    const axiosError = {
      response: { data: { error: "Email already registered" } },
      isAxiosError: true,
    };
    mockSignup.mockRejectedValue(axiosError);
    renderPage();

    await userEvent.type(screen.getByLabelText("Email"), "test@example.com");
    await userEvent.type(screen.getByLabelText("Password"), "password123");
    await userEvent.click(screen.getByRole("button", { name: "Sign up" }));

    expect(await screen.findByText("Email already registered")).toBeInTheDocument();
  });

  it("requires both fields before submitting", async () => {
    renderPage();

    await userEvent.click(screen.getByRole("button", { name: "Sign up" }));

    expect(mockSignup).not.toHaveBeenCalled();
  });
});