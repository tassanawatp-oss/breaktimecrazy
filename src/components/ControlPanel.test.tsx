import { render, screen, fireEvent, within } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ControlPanel from "./ControlPanel";
import { invoke } from "@tauri-apps/api/core";

// Type cast invoke mock
const mockedInvoke = vi.mocked(invoke);

describe("ControlPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders work and break duration controls when idle", () => {
    render(<ControlPanel remaining={0} status="Idle" />);
    
    expect(screen.getByText(/Work Duration/i)).toBeInTheDocument();
    expect(screen.getByText(/Break Duration/i)).toBeInTheDocument();
    
    // Check for presets
    expect(screen.getByRole("button", { name: "15" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "25" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "45" })).toBeInTheDocument();
    
    expect(screen.getByRole("button", { name: "5" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "10" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "15" })).toBeInTheDocument();
  });

  it("updates work duration when clicking a preset", () => {
    render(<ControlPanel remaining={0} status="Idle" />);
    
    const preset45 = screen.getByRole("button", { name: "45" });
    fireEvent.click(preset45);
    
    const startButton = screen.getByRole("button", { name: /Start Work/i });
    fireEvent.click(startButton);
    
    expect(mockedInvoke).toHaveBeenCalledWith("start_timer", expect.objectContaining({
      workMins: 45
    }));
  });

  it("updates break duration when clicking a preset", () => {
    render(<ControlPanel remaining={0} status="Idle" />);
    
    // Find the break duration section and then find the "15" button within it
    const breakSection = screen.getByText(/Break Duration/i).closest('div');
    const preset15 = within(breakSection!).getByRole("button", { name: "15" });
    fireEvent.click(preset15);
    
    const startButton = screen.getByRole("button", { name: /Start Work/i });
    fireEvent.click(startButton);
    
    expect(mockedInvoke).toHaveBeenCalledWith("start_timer", expect.objectContaining({
      breakMins: 15
    }));
  });

  it("calls start_timer with custom work and break durations", async () => {
    render(<ControlPanel remaining={0} status="Idle" />);
    
    const workInput = screen.getAllByRole("spinbutton")[0];
    const breakInput = screen.getAllByRole("spinbutton")[1];
    
    fireEvent.change(workInput, { target: { value: "30" } });
    fireEvent.change(breakInput, { target: { value: "10" } });
    
    const startButton = screen.getByRole("button", { name: /Start Work/i });
    fireEvent.click(startButton);
    
    expect(mockedInvoke).toHaveBeenCalledWith("start_timer", {
      workMins: 30,
      breakMins: 10
    });
  });
});
