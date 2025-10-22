import { describe, it, expect } from 'vitest';
import type { ReasoningDetail } from '@example/types';

describe('ReasoningDetail types', () => {
  it('should accept reasoning.summary format', () => {
    // Arrange
    const summaryDetail: ReasoningDetail = {
      type: 'reasoning.summary',
      summary: 'Model analyzed the problem systematically',
      id: 'sum-123',
      format: 'openai-responses-v1',
      index: 0,
    };

    // Assert
    expect(summaryDetail.type).toBe('reasoning.summary');
    expect(summaryDetail.summary).toBe('Model analyzed the problem systematically');
    expect(summaryDetail.id).toBe('sum-123');
  });

  it('should accept reasoning.text format', () => {
    // Arrange
    const textDetail: ReasoningDetail = {
      type: 'reasoning.text',
      text: 'Step 1: Parse the input...',
      signature: 'sig-abc',
      id: 'text-456',
      format: 'anthropic-claude-v1',
      index: 1,
    };

    // Assert
    expect(textDetail.type).toBe('reasoning.text');
    expect(textDetail.text).toBe('Step 1: Parse the input...');
    expect(textDetail.signature).toBe('sig-abc');
  });

  it('should accept reasoning.encrypted format', () => {
    // Arrange
    const encryptedDetail: ReasoningDetail = {
      type: 'reasoning.encrypted',
      data: 'base64encodeddata==',
      id: 'enc-789',
      format: 'xai-responses-v1',
      index: 2,
    };

    // Assert
    expect(encryptedDetail.type).toBe('reasoning.encrypted');
    expect(encryptedDetail.data).toBe('base64encodeddata==');
  });

  it('should allow null values for optional id and signature fields', () => {
    // Arrange
    const detailWithNulls: ReasoningDetail = {
      type: 'reasoning.text',
      text: 'Some reasoning',
      signature: null,
      id: null,
      format: 'unknown',
    };

    // Assert
    expect(detailWithNulls.id).toBeNull();
    expect(detailWithNulls.signature).toBeNull();
  });

  it('should allow index to be omitted', () => {
    // Arrange
    const detailWithoutIndex: ReasoningDetail = {
      type: 'reasoning.summary',
      summary: 'Quick summary',
      id: 'test',
      format: 'unknown',
    };

    // Assert
    expect(detailWithoutIndex.index).toBeUndefined();
  });
});
