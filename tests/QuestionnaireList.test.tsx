/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { ConvexProvider } from "convex/react";
import { ConvexReactClient } from "convex/react";
import QuestionnaireList from '../src/QuestionnaireList';

// Mock the Convex functions
const mockUseQuery = vi.fn();

vi.mock('convex/react', async () => {
  const actual = await vi.importActual('convex/react');
  return {
    ...actual,
    useMutation: () => vi.fn(),
    useQuery: mockUseQuery,
    ConvexProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    ConvexReactClient: vi.fn(),
  };
});

describe('QuestionnaireList', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock implementation
    mockUseQuery.mockReturnValue([
      {
        _id: 'q1',
        _creationTime: 1631234567890,
        userId: 'user1',
        completed: true,
        completedAt: 1631234599999,
      },
      {
        _id: 'q2',
        _creationTime: 1631234567891,
        userId: 'user1',
        completed: true,
        completedAt: 1631234600000,
      }
    ]);
  });

  test('renders a list of completed questionnaires', async () => {
    const mockClient = {} as ConvexReactClient;
    const mockOnStartNew = vi.fn();

    render(
      <ConvexProvider client={mockClient}>
        <QuestionnaireList onStartNew={mockOnStartNew} />
      </ConvexProvider>
    );

    // Wait for the component to render
    await waitFor(() => {
      // Should display the title
      expect(screen.getByText(/Completed Intakes/i)).toBeInTheDocument();

      // Should show questionnaire dates from the mock data
      const dateElements = screen.getAllByText(/completed on/i);
      expect(dateElements.length).toBe(2);
    });
  });

  test('displays message when no questionnaires exist', async () => {
    // Override the mock to return an empty array
    mockUseQuery.mockReturnValueOnce([]);
    const mockClient = {} as ConvexReactClient;
    const mockOnStartNew = vi.fn();

    render(
      <ConvexProvider client={mockClient}>
        <QuestionnaireList onStartNew={mockOnStartNew} />
      </ConvexProvider>
    );

    // Wait for the component to render
    await waitFor(() => {
      expect(screen.getByText(/no completed intakes/i)).toBeInTheDocument();
    });
  });
}); 