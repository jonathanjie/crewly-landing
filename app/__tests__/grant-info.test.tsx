import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import GrantInfoPage from "../grant-info/page";

describe("GrantInfoPage", () => {
  it("renders the hero heading", () => {
    render(<GrantInfoPage />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/50% funded/);
  });

  it("displays all 5 use case categories", () => {
    render(<GrantInfoPage />);
    expect(screen.getByText("Knowledge Management")).toBeInTheDocument();
    expect(screen.getByText("Customer Engagement")).toBeInTheDocument();
    expect(screen.getByText("Content Generation")).toBeInTheDocument();
    expect(screen.getByText("Compliance & Analytics")).toBeInTheDocument();
    expect(screen.getByText("Operations Automation")).toBeInTheDocument();
  });

  it("shows eligibility criteria sections", () => {
    render(<GrantInfoPage />);
    expect(screen.getByText(/You qualify if/)).toBeInTheDocument();
    expect(screen.getByText(/Not eligible if/)).toBeInTheDocument();
  });

  it("has a CTA link", () => {
    render(<GrantInfoPage />);
    const links = screen.getAllByRole("link");
    expect(links.length).toBeGreaterThan(0);
  });
});
