/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { ConvexProvider } from "convex/react";
import { ConvexReactClient } from "convex/react";
import QuestionnaireWizard from '../src/QuestionnaireWizard';

// Mock the Convex functions
const mockCreateQuestionnaire = vi.fn().mockResolvedValue('mock-questionnaire-id');
const mockSaveAnswer = vi.fn().mockResolvedValue(null);
const mockCompleteQuestionnaire = vi.fn().mockResolvedValue(null);

vi.mock('convex/react', async () => {
  const actual = await vi.importActual('convex/react');
  return {
    ...actual,
    useMutation: (functionRef: string) => {
      if (functionRef === 'questionnaires:createQuestionnaire') {
        return mockCreateQuestionnaire;
      } else if (functionRef === 'questionnaires:saveAnswer') {
        return mockSaveAnswer;
      } else if (functionRef === 'questionnaires:completeQuestionnaire') {
        return mockCompleteQuestionnaire;
      }
      return vi.fn();
    },
    useQuery: () => ({
      steps: [
        {
          _id: 'step1',
          _creationTime: 1631234567890,
          type: 'text',
          prompt: 'What are your main workflow bottlenecks?',
          prdId: 'step-01-workflow-bottlenecks',
          validation: { required: true, errorMessage: 'This question is required' },
        },
        {
          _id: 'step2',
          _creationTime: 1631234567891,
          type: 'select',
          prompt: 'Which data sources are most important?',
          prdId: 'step-02-data-sources',
          options: ['EMR/EHR', 'Billing', 'Wearables', 'Patient-reported'],
          validation: { required: false },
        },
        {
          _id: 'step3',
          _creationTime: 1631234567892,
          type: 'range_slider_with_labels',
          prompt: 'What is your budget range?',
          prdId: 'step-08-budget-procurement',
          sliderOptions: ['0', '500', '50'],
          labels: ['Low', 'Medium', 'High', 'Very High'],
          validation: { required: true },
        }
      ]
    }),
    ConvexProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    ConvexReactClient: vi.fn(),
  };
});

// Mock toast for notifications
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

describe('QuestionnaireWizard', () => {
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
  });

  test('renders the first question of the questionnaire', async () => {
    const mockClient = {} as ConvexReactClient;

    render(
      <ConvexProvider client={mockClient}>
        <QuestionnaireWizard />
      </ConvexProvider>
    );

    // Wait for component to render with data
    await waitFor(() => {
      expect(screen.getByText('What are your main workflow bottlenecks?')).toBeInTheDocument();
    });

    // Check for progress indicator
    expect(screen.getByText('Question 1 of 3')).toBeInTheDocument();
    expect(screen.getByText('33% complete')).toBeInTheDocument();
  });

  test('cannot proceed when required field is empty', async () => {
    const toast = await import('sonner');
    const mockClient = {} as ConvexReactClient;

    render(
      <ConvexProvider client={mockClient}>
        <QuestionnaireWizard />
      </ConvexProvider>
    );

    // Wait for the component to render
    await waitFor(() => {
      expect(screen.getByText('What are your main workflow bottlenecks?')).toBeInTheDocument();
    });

    // Try to proceed without filling the required field
    const nextButton = screen.getByRole('button', { name: /next/i });
    fireEvent.click(nextButton);

    // Should show an error toast
    expect(toast.toast.error).toHaveBeenCalledWith('This question is required');
  });

  test('navigates to the next question when form is valid', async () => {
    const mockClient = {} as ConvexReactClient;

    render(
      <ConvexProvider client={mockClient}>
        <QuestionnaireWizard />
      </ConvexProvider>
    );

    // Wait for the component to render the first question
    await waitFor(() => {
      expect(screen.getByText('What are your main workflow bottlenecks?')).toBeInTheDocument();
    });

    // Fill in the text field
    const textField = screen.getByRole('textbox');
    fireEvent.change(textField, { target: { value: 'Test response for workflow bottlenecks' } });

    // Click Next
    const nextButton = screen.getByRole('button', { name: /next/i });
    fireEvent.click(nextButton);

    // Expect createQuestionnaire to be called when submitting first answer
    expect(mockCreateQuestionnaire).toHaveBeenCalled();
    expect(mockSaveAnswer).toHaveBeenCalledWith(expect.objectContaining({
      stepId: 'step1',
      value: 'Test response for workflow bottlenecks',
      skipped: false,
    }));

    // Wait for the next question to appear
    await waitFor(() => {
      expect(screen.getByText('Which data sources are most important?')).toBeInTheDocument();
    });

    // Verify progress indicator updated
    expect(screen.getByText('Question 2 of 3')).toBeInTheDocument();
    expect(screen.getByText('67% complete')).toBeInTheDocument();
  });

  test('navigates back to the previous question', async () => {
    const mockClient = {} as ConvexReactClient;

    // Start with a component that has already navigated to the second question
    const { rerender } = render(
      <ConvexProvider client={mockClient}>
        <QuestionnaireWizard />
      </ConvexProvider>
    );

    // Wait for first question to render
    await waitFor(() => {
      expect(screen.getByText('What are your main workflow bottlenecks?')).toBeInTheDocument();
    });

    // Fill in the text field
    const textField = screen.getByRole('textbox');
    fireEvent.change(textField, { target: { value: 'Test response' } });

    // Click Next to go to the second question
    const nextButton = screen.getByRole('button', { name: /next/i });
    fireEvent.click(nextButton);

    // Wait for the next question to appear
    await waitFor(() => {
      expect(screen.getByText('Which data sources are most important?')).toBeInTheDocument();
    });

    // Now click Back
    const backButton = screen.getByRole('button', { name: /back/i });
    fireEvent.click(backButton);

    // Wait for the first question to reappear
    await waitFor(() => {
      expect(screen.getByText('What are your main workflow bottlenecks?')).toBeInTheDocument();
    });

    // Verify progress indicator updated back
    expect(screen.getByText('Question 1 of 3')).toBeInTheDocument();
    expect(screen.getByText('33% complete')).toBeInTheDocument();
  });

  test('submits the questionnaire when all questions are answered', async () => {
    const toast = await import('sonner');
    const mockClient = {} as ConvexReactClient;
    const mockOnComplete = vi.fn();

    render(
      <ConvexProvider client={mockClient}>
        <QuestionnaireWizard onComplete={mockOnComplete} />
      </ConvexProvider>
    );

    // Answer all three questions
    await waitFor(() => {
      expect(screen.getByText('What are your main workflow bottlenecks?')).toBeInTheDocument();
    });

    // Answer first question
    const textField = screen.getByRole('textbox');
    fireEvent.change(textField, { target: { value: 'Test response 1' } });
    let nextButton = screen.getByRole('button', { name: /next/i });
    fireEvent.click(nextButton);

    // Answer second question - select option (optional, can be skipped)
    await waitFor(() => {
      expect(screen.getByText('Which data sources are most important?')).toBeInTheDocument();
    });
    nextButton = screen.getByRole('button', { name: /next/i });
    fireEvent.click(nextButton);

    // Answer third question - range slider
    await waitFor(() => {
      expect(screen.getByText('What is your budget range?')).toBeInTheDocument();
    });

    // Finish the questionnaire
    const finishButton = screen.getByRole('button', { name: /finish/i });
    fireEvent.click(finishButton);

    // Check completion actions
    await waitFor(() => {
      expect(mockCompleteQuestionnaire).toHaveBeenCalled();
      expect(toast.toast.success).toHaveBeenCalledWith('Questionnaire completed!');
      expect(mockOnComplete).toHaveBeenCalled();
    });
  });

  test('allows skipping optional questions', async () => {
    const mockClient = {} as ConvexReactClient;
    vi.spyOn(window, 'confirm').mockImplementation(() => true); // Mock confirm dialog to return true

    render(
      <ConvexProvider client={mockClient}>
        <QuestionnaireWizard />
      </ConvexProvider>
    );

    // Navigate to first question
    await waitFor(() => {
      expect(screen.getByText('What are your main workflow bottlenecks?')).toBeInTheDocument();
    });

    // Fill in the text field and proceed
    const textField = screen.getByRole('textbox');
    fireEvent.change(textField, { target: { value: 'Test response' } });
    let nextButton = screen.getByRole('button', { name: /next/i });
    fireEvent.click(nextButton);

    // Wait for second question (which is optional)
    await waitFor(() => {
      expect(screen.getByText('Which data sources are most important?')).toBeInTheDocument();
    });

    // Click Next without selecting an option (skip the optional question)
    nextButton = screen.getByRole('button', { name: /next/i });
    fireEvent.click(nextButton);

    // Expect confirmation dialog and saveAnswer to be called with skipped=true
    expect(window.confirm).toHaveBeenCalledWith('Skip this question?');
    expect(mockSaveAnswer).toHaveBeenCalledWith(expect.objectContaining({
      stepId: 'step2',
      skipped: true
    }));

    // Should advance to the third question
    await waitFor(() => {
      expect(screen.getByText('What is your budget range?')).toBeInTheDocument();
    });
  });

  test('handles range slider with labels questions', async () => {
    const mockClient = {} as ConvexReactClient;

    render(
      <ConvexProvider client={mockClient}>
        <QuestionnaireWizard />
      </ConvexProvider>
    );

    // Navigate through the first two questions
    await waitFor(() => {
      expect(screen.getByText('What are your main workflow bottlenecks?')).toBeInTheDocument();
    });

    // Fill in the text field and proceed
    const textField = screen.getByRole('textbox');
    fireEvent.change(textField, { target: { value: 'Test response' } });
    let nextButton = screen.getByRole('button', { name: /next/i });
    fireEvent.click(nextButton);

    // Skip the second question
    vi.spyOn(window, 'confirm').mockImplementation(() => true);
    await waitFor(() => {
      expect(screen.getByText('Which data sources are most important?')).toBeInTheDocument();
    });
    nextButton = screen.getByRole('button', { name: /next/i });
    fireEvent.click(nextButton);

    // Reach the range slider question
    await waitFor(() => {
      expect(screen.getByText('What is your budget range?')).toBeInTheDocument();
    });

    // Verify the slider and labels are rendered
    expect(screen.getByRole('slider')).toBeInTheDocument();

    // Check for label rendering - should have all 4 labels
    const labels = ['Low', 'Medium', 'High', 'Very High'];
    labels.forEach(label => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });

    // Verify the format of the slider value (£ because of prdId matching step-08-budget-procurement)
    expect(screen.getByText(/£\d+k/)).toBeInTheDocument();

    // Submit the form with the default slider value
    const finishButton = screen.getByRole('button', { name: /finish/i });
    fireEvent.click(finishButton);

    // Should save answer and complete questionnaire
    expect(mockSaveAnswer).toHaveBeenCalledWith(expect.objectContaining({
      stepId: 'step3',
      skipped: false
    }));
    expect(mockCompleteQuestionnaire).toHaveBeenCalled();
  });

  test('handles select questions', async () => {
    const mockClient = {} as ConvexReactClient;

    render(
      <ConvexProvider client={mockClient}>
        <QuestionnaireWizard />
      </ConvexProvider>
    );

    // Navigate to first question and proceed
    await waitFor(() => {
      expect(screen.getByText('What are your main workflow bottlenecks?')).toBeInTheDocument();
    });
    const textField = screen.getByRole('textbox');
    fireEvent.change(textField, { target: { value: 'Test response' } });
    let nextButton = screen.getByRole('button', { name: /next/i });
    fireEvent.click(nextButton);

    // Reach the select question
    await waitFor(() => {
      expect(screen.getByText('Which data sources are most important?')).toBeInTheDocument();
    });

    // Find the SelectTrigger and click it to open the dropdown
    const selectTrigger = screen.getByRole('combobox');
    fireEvent.click(selectTrigger);

    // Wait for the select content to be visible and choose an option
    await waitFor(() => {
      const option = screen.getByText('EMR/EHR');
      expect(option).toBeInTheDocument();
      fireEvent.click(option);
    });

    // Now submit the form
    nextButton = screen.getByRole('button', { name: /next/i });
    fireEvent.click(nextButton);

    // Should save the selected answer
    expect(mockSaveAnswer).toHaveBeenCalledWith(expect.objectContaining({
      stepId: 'step2',
      value: 'EMR/EHR',
      skipped: false
    }));

    // Should advance to the third question
    await waitFor(() => {
      expect(screen.getByText('What is your budget range?')).toBeInTheDocument();
    });
  });
}); 