/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import QuestionnaireWizard from '../src/QuestionnaireWizard';
import { toast } from 'sonner';

// Mock modules before importing them
vi.mock('convex/react', () => ({
  useQuery: vi.fn(),
  useMutation: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

// Now import the mocked modules
import * as convexReact from 'convex/react';

// Create a mock API to use in tests
const mockApi = {
  steps: {
    list: "steps.list",
  },
  questionnaires: {
    createQuestionnaire: "questionnaires.createQuestionnaire",
    saveAnswer: "questionnaires.saveAnswer",
    completeQuestionnaire: "questionnaires.completeQuestionnaire",
  }
};

// Mock steps data
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

const mockSteps = [mockTextStep, mockSelectStep, mockRadioStep];

describe('QuestionnaireWizard', () => {
  // Mock function implementations
  const mockCreateQuestionnaire = vi.fn().mockResolvedValue('mock_questionnaire_id');
  const mockSaveAnswer = vi.fn().mockResolvedValue(null);
  const mockCompleteQuestionnaire = vi.fn().mockResolvedValue(null);
  const mockOnComplete = vi.fn();

  beforeEach(() => {
    // Reset DOM between tests
    document.body.innerHTML = '';
    vi.clearAllMocks();

    // Setup mock for useQuery to return mockSteps
    (convexReact.useQuery as any).mockReturnValue(mockSteps);

    // Setup useMutation mocks
    (convexReact.useMutation as any).mockImplementation((functionReference: any) => {
      if (functionReference === mockApi.questionnaires.createQuestionnaire) {
        return mockCreateQuestionnaire;
      } else if (functionReference === mockApi.questionnaires.saveAnswer) {
        return mockSaveAnswer;
      } else if (functionReference === mockApi.questionnaires.completeQuestionnaire) {
        return mockCompleteQuestionnaire;
      }
      return vi.fn();
    });
  });

  test('renders loading state when steps are undefined', () => {
    (convexReact.useQuery as any).mockReturnValue(undefined);
    const { container } = render(<QuestionnaireWizard />);

    // Debug output to see what's in the DOM
    console.log('Container HTML:', container.innerHTML);

    // Check for loading text in the container HTML
    expect(container.innerHTML).toContain('Loading steps...');
  });

  // Add more tests here as needed
}); 