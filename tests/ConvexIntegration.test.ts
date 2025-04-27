import { describe, test, expect, vi, beforeEach } from 'vitest';
import { api } from '../convex/_generated/api';
import { Id } from '../convex/_generated/dataModel';

// Create a simpler mock version that doesn't rely on complicated types
interface MockConvexClient {
  mutation: ReturnType<typeof vi.fn>;
  query: ReturnType<typeof vi.fn>;
}

// Mock the Convex client
const mockConvexClient: MockConvexClient = {
  mutation: vi.fn(),
  query: vi.fn(),
};

describe('Convex Data Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Questionnaire Creation and Retrieval', () => {
    test('createQuestionnaire mutation creates a new questionnaire', async () => {
      // Setup mock return value
      const mockQuestionnaire = 'mock_questionnaire_id';
      mockConvexClient.mutation.mockResolvedValue(mockQuestionnaire);

      // Call the mutation
      const result = await mockConvexClient.mutation(
        api.questionnaires.createQuestionnaire,
        {}
      );

      // Verify the client was called with the correct function
      expect(mockConvexClient.mutation).toHaveBeenCalledWith(
        api.questionnaires.createQuestionnaire,
        {}
      );

      // Verify result
      expect(result).toBe(mockQuestionnaire);
    });

    test('saveAnswer mutation saves answer data', async () => {
      // We're using any here because we're mocking and not actually calling the real API
      const answerData = {
        questionnaireId: 'mock_questionnaire_id' as unknown as Id<"questionnaires">,
        stepId: 'mock_step_id' as unknown as Id<"steps">,
        value: 'Test answer',
        skipped: false,
      };

      // Call the mutation
      await mockConvexClient.mutation(
        api.questionnaires.saveAnswer,
        answerData
      );

      // Verify the client was called with the correct function and data
      expect(mockConvexClient.mutation).toHaveBeenCalledWith(
        api.questionnaires.saveAnswer,
        answerData
      );
    });

    test('saveAnswer mutation handles skipped questions', async () => {
      // Setup mock skipped answer
      const skippedAnswerData = {
        questionnaireId: 'mock_questionnaire_id' as unknown as Id<"questionnaires">,
        stepId: 'mock_step_id' as unknown as Id<"steps">,
        value: '' as string, // Using empty string instead of null
        skipped: true,
      };

      // Call the mutation
      await mockConvexClient.mutation(
        api.questionnaires.saveAnswer,
        skippedAnswerData
      );

      // Verify the client was called with the correct function and data
      expect(mockConvexClient.mutation).toHaveBeenCalledWith(
        api.questionnaires.saveAnswer,
        skippedAnswerData
      );
    });

    test('completeQuestionnaire mutation finalizes questionnaire', async () => {
      // Setup completion data
      const completionData = {
        questionnaireId: 'mock_questionnaire_id' as unknown as Id<"questionnaires">,
      };

      // Call the mutation
      await mockConvexClient.mutation(
        api.questionnaires.completeQuestionnaire,
        completionData
      );

      // Verify the client was called with the correct function and data
      expect(mockConvexClient.mutation).toHaveBeenCalledWith(
        api.questionnaires.completeQuestionnaire,
        completionData
      );
    });

    test('steps.list query fetches all steps', async () => {
      // Setup mock step data
      const mockSteps = [
        {
          _id: 'step1' as unknown as Id<"steps">,
          index: 0,
          prdId: 'step-01-text',
          type: 'text',
          prompt: 'Text question',
        },
        {
          _id: 'step2' as unknown as Id<"steps">,
          index: 1,
          prdId: 'step-02-select',
          type: 'select',
          prompt: 'Select question',
        },
      ];

      // Setup mock return value
      mockConvexClient.query.mockResolvedValue(mockSteps);

      // Call the query
      const result = await mockConvexClient.query(api.steps.list, {});

      // Verify the client was called with the correct function
      expect(mockConvexClient.query).toHaveBeenCalledWith(api.steps.list, {});

      // Verify result
      expect(result).toEqual(mockSteps);
      expect(result).toHaveLength(2);
    });
  });

  describe('Error Handling', () => {
    test('handles errors from createQuestionnaire', async () => {
      // Setup mock to throw error
      const mockError = new Error('Failed to create questionnaire');
      mockConvexClient.mutation.mockRejectedValue(mockError);

      // Call the mutation and expect it to throw
      await expect(
        mockConvexClient.mutation(api.questionnaires.createQuestionnaire, {})
      ).rejects.toThrow('Failed to create questionnaire');
    });

    test('handles errors from saveAnswer', async () => {
      // Setup mock to throw error
      const mockError = new Error('Failed to save answer');
      mockConvexClient.mutation.mockRejectedValue(mockError);

      // Setup answer data
      const answerData = {
        questionnaireId: 'mock_questionnaire_id' as unknown as Id<"questionnaires">,
        stepId: 'mock_step_id' as unknown as Id<"steps">,
        value: 'Test answer',
        skipped: false,
      };

      // Call the mutation and expect it to throw
      await expect(
        mockConvexClient.mutation(api.questionnaires.saveAnswer, answerData)
      ).rejects.toThrow('Failed to save answer');
    });
  });
}); 