import React from 'react'; // Add React import for JSX
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import QuestionnaireList from '../src/QuestionnaireList'; // Adjust path if needed
import { Id } from '../convex/_generated/dataModel'; // Adjust path if needed
import { api } from '../convex/_generated/api'; // Import api for mutation type
import type { ConvexReactClient, ReactMutation } from 'convex/react';

// Mock Convex hooks
vi.mock('convex/react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('convex/react')>();
  return {
    ...actual,
    useQuery: vi.fn(),
    useMutation: vi.fn(),
  };
});

// Helper to type the mocked hooks
// Let type inference work for useQuery or adjust if specific type is known
const mockedUseQuery = vi.mocked((await import('convex/react')).useQuery);
// Use the specific API function type for useMutation
const mockedUseMutation = vi.mocked((await import('convex/react')).useMutation<typeof api.questionnaires.deleteQuestionnaire>);

// Define a more complete mock for the mutation
const mockDeleteMutation = vi.fn() as unknown as ReactMutation<typeof api.questionnaires.deleteQuestionnaire>;
// Add the missing property
mockDeleteMutation.withOptimisticUpdate = vi.fn().mockReturnThis();


describe('QuestionnaireList', () => {
  it('should NOT render a "Start New Questionnaire" button', () => {
    // Arrange: Mock hooks to return an empty list and the improved mutation mock
    mockedUseQuery.mockReturnValue([]); // No questionnaires
    mockedUseMutation.mockReturnValue(mockDeleteMutation);

    // Act: Render the component
    render(<QuestionnaireList onStartNew={vi.fn()} />);

    // Assert: Check that the button is NOT present
    const startButton = screen.queryByRole('button', { name: /start new questionnaire/i });
    expect(startButton).toBeNull();
  });

  it('should render "Your Questionnaires" heading', () => {
    // Arrange
    mockedUseQuery.mockReturnValue([]);
    mockedUseMutation.mockReturnValue(mockDeleteMutation);

    // Act
    render(<QuestionnaireList onStartNew={vi.fn()} />);

    // Assert
    expect(screen.getByRole('heading', { name: /your questionnaires/i })).toBeInTheDocument();
  });

  it('should show message when no questionnaires are completed', () => {
    // Arrange
    mockedUseQuery.mockReturnValue([]); // No questionnaires at all
    mockedUseMutation.mockReturnValue(mockDeleteMutation);

    // Act
    render(<QuestionnaireList onStartNew={vi.fn()} />);

    // Assert
    expect(screen.getByText(/you haven't completed any questionnaires yet./i)).toBeInTheDocument();
  });

  // Add more tests as needed for displaying completed items, delete functionality etc.
}); 