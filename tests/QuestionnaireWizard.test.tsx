import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import QuestionnaireWizard from '@/QuestionnaireWizard';
import { useAuth } from '@clerk/clerk-react';
import { api } from "../convex/_generated/api";
import { Mock } from 'vitest';

// Mock the module, defining the mock structure inside the factory
vi.mock('../convex/_generated/api', () => ({
  api: {
    steps: {
      list: vi.fn(),
    },
    questionnaires: {
      createQuestionnaire: vi.fn(),
      saveAnswer: vi.fn(),
      completeQuestionnaire: vi.fn(),
    },
  }
}));

// Mock Clerk's useAuth hook
vi.mock('@clerk/clerk-react', () => ({
  useAuth: vi.fn(() => ({ isSignedIn: true, userId: 'test-user-id' })),
}));

// Mock steps data (including step-01)
const mockSteps = [
  {
    _id: 'step1_id',
    prdId: 'step-01-workflow-bottlenecks',
    index: 0,
    title: 'Workflow Bottlenecks & Pain-Points',
    prompt: 'Walk me through the most time-consuming part of a typical patient visit.',
    type: 'text',
    options: null,
  },
  {
    _id: 'step2_id',
    prdId: 'step-02-some-other-step',
    index: 1,
    title: 'Next Step',
    prompt: 'What is the next thing?',
    type: 'select',
    options: ['A', 'B'],
  },
];

describe('QuestionnaireWizard', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Configure mocks directly on the imported (now mocked) api object
    // Cast is needed here because TS sees the original type, but we know it's a mock
    (api.steps.list as Mock).mockReturnValue(mockSteps as any);
    (api.questionnaires.createQuestionnaire as Mock).mockResolvedValue('new_q_id');
    (api.questionnaires.saveAnswer as Mock).mockResolvedValue(null);
    (api.questionnaires.completeQuestionnaire as Mock).mockResolvedValue(null);

    (useAuth as Mock).mockReturnValue({ isSignedIn: true, userId: 'test-user-id' });
  });

  test('should render the first step (text input) correctly', () => {
    render(<QuestionnaireWizard />); // Render directly
    expect(screen.getByText(mockSteps[0].prompt)).toBeInTheDocument();
    const textarea = screen.getByRole('textbox');
    expect(textarea).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /back/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /next/i })).toBeEnabled();
  });

  test('should call saveAnswer and navigate to next step on Next click', async () => {
    render(<QuestionnaireWizard />); // Render directly

    const textarea = screen.getByRole('textbox');
    const nextButton = screen.getByRole('button', { name: /next/i });
    const testInput = "This is the bottleneck description.";

    fireEvent.change(textarea, { target: { value: testInput } });
    fireEvent.click(nextButton);

    // Check the mocked API functions
    await waitFor(() => {
      expect(api.questionnaires.createQuestionnaire).toHaveBeenCalledTimes(1);
    });
    await waitFor(() => {
      expect(api.questionnaires.saveAnswer).toHaveBeenCalledTimes(1);
      const fieldName = mockSteps[0].prdId ?? mockSteps[0]._id;
      expect(api.questionnaires.saveAnswer).toHaveBeenCalledWith({
        questionnaireId: 'new_q_id',
        stepId: mockSteps[0]._id,
        value: { [fieldName]: testInput },
        skipped: false,
      });
    });

    expect(screen.getByText(mockSteps[1].prompt)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /back/i })).toBeEnabled();
  });

  test('should pass correct value shape to saveAnswer', async () => {
    render(<QuestionnaireWizard />);
    const textarea = screen.getByRole('textbox');
    const nextButton = screen.getByRole('button', { name: /next/i });
    const testInput = "Bottleneck text";

    fireEvent.change(textarea, { target: { value: testInput } });
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(api.questionnaires.saveAnswer).toHaveBeenCalledTimes(1);
      // Verify the arguments passed to the actual saveAnswer mutation
      expect(api.questionnaires.saveAnswer).toHaveBeenCalledWith(expect.objectContaining({
        value: testInput, // saveAnswer likely expects the direct value, not the whole form object
        skipped: false,
      }));
    });
  });

  // TODO: Add tests for:
  // - Back button functionality
  // - Skipping a question
  // - Finishing the questionnaire on the last step
  // - Rendering other input types (select, multiselect) based on mockSteps
  // - Form validation errors (if complex validation is added)
}); 