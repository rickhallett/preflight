import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import QuestionnaireWizard from '../src/QuestionnaireWizard';
import * as convexReact from 'convex/react';
import { api } from '../convex/_generated/api';
import { toast } from 'sonner';

// Mock the Convex API
vi.mock('convex/react', async () => {
  const actual = await vi.importActual('convex/react');
  return {
    ...actual,
    useQuery: vi.fn(),
    useMutation: vi.fn(),
  };
});

// Mock the toast notifications
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

// Define mock step types for testing
const mockTextStep = {
  _id: 'text_step_id',
  prdId: 'step-01-text',
  index: 0,
  type: 'text',
  prompt: 'Enter your text response',
  validation: { required: true },
};

const mockSelectStep = {
  _id: 'select_step_id',
  prdId: 'step-02-select',
  index: 1,
  type: 'select',
  prompt: 'Select an option',
  options: ['Option A', 'Option B', 'Option C'],
};

const mockRadioStep = {
  _id: 'radio_step_id',
  prdId: 'step-03-radio',
  index: 2,
  type: 'radio',
  prompt: 'Choose one option',
  options: ['Yes', 'No', 'Maybe'],
};

// Mock steps array
const mockSteps = [mockTextStep, mockSelectStep, mockRadioStep];

describe('QuestionnaireWizard Core', () => {
  // Mock functions
  const mockCreateQuestionnaire = vi.fn().mockResolvedValue('mock_questionnaire_id');
  const mockSaveAnswer = vi.fn().mockResolvedValue(null);
  const mockCompleteQuestionnaire = vi.fn().mockResolvedValue(null);
  const mockOnComplete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup mock for useQuery to return mockSteps
    (convexReact.useQuery as any).mockReturnValue(mockSteps);

    // Setup useMutation mocks with type annotation
    (convexReact.useMutation as any).mockImplementation((functionReference: any) => {
      if (functionReference === api.questionnaires.createQuestionnaire) {
        return mockCreateQuestionnaire;
      } else if (functionReference === api.questionnaires.saveAnswer) {
        return mockSaveAnswer;
      } else if (functionReference === api.questionnaires.completeQuestionnaire) {
        return mockCompleteQuestionnaire;
      }
      return vi.fn();
    });
  });

  test('renders loading state when steps are undefined', () => {
    (convexReact.useQuery as any).mockReturnValue(undefined);

    render(<QuestionnaireWizard />);
    expect(screen.getByText('Loading steps...')).toBeInTheDocument();
  });

  test('renders empty state when no steps are found', () => {
    (convexReact.useQuery as any).mockReturnValue([]);

    render(<QuestionnaireWizard />);
    expect(screen.getByText('No questionnaire steps found.')).toBeInTheDocument();
  });

  test('renders the first question correctly', () => {
    render(<QuestionnaireWizard />);

    // Check progress indicator
    expect(screen.getByText('Question 1 of 3')).toBeInTheDocument();

    // Check question prompt
    expect(screen.getByText(mockTextStep.prompt)).toBeInTheDocument();

    // Check that required indicator is shown
    expect(screen.getByText('* Required')).toBeInTheDocument();

    // Check that a textarea is rendered for text type
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  test('navigates to the next question when Next is clicked', async () => {
    render(<QuestionnaireWizard />);

    // Fill in the text field
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'Test response' } });

    // Click Next
    const nextButton = screen.getByRole('button', { name: /next/i });
    fireEvent.click(nextButton);

    // Wait for mutations to complete and check for the next question
    await waitFor(() => {
      // Verify createQuestionnaire was called
      expect(mockCreateQuestionnaire).toHaveBeenCalled();

      // Verify saveAnswer was called with correct data
      expect(mockSaveAnswer).toHaveBeenCalledWith(expect.objectContaining({
        questionnaireId: 'mock_questionnaire_id',
        stepId: mockTextStep._id,
        value: 'Test response',
        skipped: false,
      }));

      // Check that we're now on the second question
      expect(screen.getByText(mockSelectStep.prompt)).toBeInTheDocument();
    });
  });

  test('validates required fields', async () => {
    // Mock window.confirm to always return false (don't allow skipping)
    const originalConfirm = window.confirm;
    window.confirm = vi.fn(() => false);

    // Mock toast.error
    const toastError = vi.spyOn(toast, 'error');

    try {
      render(<QuestionnaireWizard />);

      // Don't enter anything in the required field
      const nextButton = screen.getByRole('button', { name: /next/i });
      fireEvent.click(nextButton);

      // Check that error is shown and no navigation happens
      await waitFor(() => {
        expect(toastError).toHaveBeenCalled();
        expect(mockSaveAnswer).not.toHaveBeenCalled();
        // Still on the first question
        expect(screen.getByText(mockTextStep.prompt)).toBeInTheDocument();
      });
    } finally {
      window.confirm = originalConfirm;
    }
  });

  test('completes the questionnaire after the last question', async () => {
    render(<QuestionnaireWizard onComplete={mockOnComplete} />);

    // Complete all steps
    for (let i = 0; i < mockSteps.length; i++) {
      // Different input handling based on question type
      if (mockSteps[i].type === 'text') {
        fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Test response' } });
      } else if (mockSteps[i].type === 'select') {
        // For select, first click to open dropdown then select an option
        const selectTrigger = screen.getByRole('combobox');
        fireEvent.click(selectTrigger);
        await waitFor(() => {
          const option = screen.getByRole('option', { name: 'Option A' });
          fireEvent.click(option);
        });
      } else if (mockSteps[i].type === 'radio') {
        // For radio, select the first option
        const radioButtons = screen.getAllByRole('radio');
        fireEvent.click(radioButtons[0]);
      }

      // Click Next/Finish button
      const buttonText = i === mockSteps.length - 1 ? /finish/i : /next/i;
      const button = screen.getByRole('button', { name: buttonText });
      fireEvent.click(button);

      // Wait for API call to complete
      await waitFor(() => {
        expect(mockSaveAnswer).toHaveBeenCalledTimes(i + 1);
      });
    }

    // Verify questionnaire was completed
    await waitFor(() => {
      expect(mockCompleteQuestionnaire).toHaveBeenCalledWith({
        questionnaireId: 'mock_questionnaire_id',
      });
      expect(mockOnComplete).toHaveBeenCalled();
    });
  });
}); 