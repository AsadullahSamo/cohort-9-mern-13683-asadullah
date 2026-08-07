import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { LoginPage } from "../pages/LoginPage";
import * as AuthContext from "../context/AuthContext";

jest.mock("../context/AuthContext");

describe("LoginPage", () => {
  const mockLogin = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (AuthContext.useAuth as jest.Mock).mockReturnValue({
      signup: jest.fn(),
      login: mockLogin,
      logout: jest.fn(),
      accessToken: null,
      loading: false,
    });
  });

  function renderPage() {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );
  }

  it("submits email and password to login", async () => {
    mockLogin.mockResolvedValue(undefined);
    renderPage();

    await userEvent.type(screen.getByPlaceholderText("Email"), "test@example.com");
    await userEvent.type(screen.getByPlaceholderText("Password"), "password123");
    await userEvent.click(screen.getByRole("button", { name: "Log in" }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith("test@example.com", "password123");
    });
  });

  it("shows the backend error message on failure", async () => {
    const axiosError = {
      response: { data: { error: "Invalid credentials" } },
      isAxiosError: true,
    };
    mockLogin.mockRejectedValue(axiosError);
    renderPage();

    await userEvent.type(screen.getByPlaceholderText("Email"), "test@example.com");
    await userEvent.type(screen.getByPlaceholderText("Password"), "wrongpass");
    await userEvent.click(screen.getByRole("button", { name: "Log in" }));

    expect(await screen.findByText("Invalid credentials")).toBeInTheDocument();
  });

  it("requires both fields before submitting", async () => {
    renderPage();

    await userEvent.click(screen.getByRole("button", { name: "Log in" }));

    expect(mockLogin).not.toHaveBeenCalled();
  });
});