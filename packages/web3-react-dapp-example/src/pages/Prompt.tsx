import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { apiService } from '../services/api';
import { JobStatus } from '../types';
import { useSearchParams } from 'react-router-dom';

const Container = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 40px 20px;
`;

const Title = styled.h1`
  font-size: 36px;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 12px;
`;

const Subtitle = styled.p`
  font-size: 18px;
  color: #a0aec0;
  margin-bottom: 40px;
`;

const Card = styled.div`
  background: linear-gradient(135deg, #1a365d 0%, #2c5282 100%);
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 24px;
`;

const Label = styled.label`
  display: block;
  font-size: 16px;
  font-weight: 600;
  color: #e2e8f0;
  margin-bottom: 12px;
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 150px;
  padding: 16px;
  background: rgba(0, 0, 0, 0.3);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: #ffffff;
  font-size: 16px;
  font-family: inherit;
  resize: vertical;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: #63b3ed;
  }

  &::placeholder {
    color: #718096;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 20px;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  flex: 1;
  background: ${(props) =>
    props.variant === 'secondary'
      ? 'rgba(255, 255, 255, 0.1)'
      : 'linear-gradient(135deg, #3182CE 0%, #2C5282 100%)'};
  color: white;
  border: ${(props) =>
    props.variant === 'secondary'
      ? '2px solid rgba(255, 255, 255, 0.2)'
      : 'none'};
  padding: 16px 32px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(49, 130, 206, 0.4);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const StatusContainer = styled.div<{ status: string }>`
  background: ${(props) => {
    switch (props.status) {
      case 'completed':
        return 'rgba(72, 187, 120, 0.1)';
      case 'failed':
        return 'rgba(245, 101, 101, 0.1)';
      case 'running':
        return 'rgba(237, 137, 54, 0.1)';
      default:
        return 'rgba(99, 179, 237, 0.1)';
    }
  }};
  border: 1px solid
    ${(props) => {
      switch (props.status) {
        case 'completed':
          return '#68D391';
        case 'failed':
          return '#FC8181';
        case 'running':
          return '#ED8936';
        default:
          return '#63B3ED';
      }
    }};
  border-radius: 12px;
  padding: 20px;
  margin-top: 24px;
`;

const StatusTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #a0aec0;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const StatusText = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 4px;
`;

const OutputContainer = styled.div`
  background: rgba(0, 0, 0, 0.4);
  border-radius: 12px;
  padding: 20px;
  margin-top: 16px;
  border-left: 4px solid #63b3ed;
`;

const OutputText = styled.pre`
  color: #e2e8f0;
  font-size: 16px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-wrap: break-word;
  margin: 0;
  font-family: 'Inter', sans-serif;
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #63b3ed;
  animation: spin 1s ease-in-out infinite;
  margin-right: 12px;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const ModelInfo = styled.div`
  background: rgba(99, 179, 237, 0.1);
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 24px;
  color: #63b3ed;
  font-size: 14px;
`;

const RatePrompt = styled.div`
  text-align: center;
  margin-top: 24px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
`;

export const Prompt: React.FC = () => {
  const [searchParams] = useSearchParams();
  const modelId = searchParams.get('modelId');

  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<JobStatus | null>(null);
  const [pollInterval, setPollInterval] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [pollInterval]);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      alert('Please enter a prompt');
      return;
    }

    try {
      setLoading(true);
      setJobStatus(null);

      const response = await apiService.generateText({
        prompt: prompt.trim(),
        timeout: 300,
      });

      setJobId(response.job_id);
      startPolling(response.job_id);
    } catch (err: any) {
      alert(`Error: ${err.message || 'Failed to start generation'}`);
      setLoading(false);
    }
  };

  const startPolling = (id: string) => {
    const interval = setInterval(async () => {
      try {
        const status = await apiService.getJobStatus(id);
        setJobStatus(status);

        if (status.status === 'completed' || status.status === 'failed') {
          clearInterval(interval);
          setLoading(false);
        }
      } catch (err) {
        console.error('Error polling job status:', err);
      }
    }, 2000);

    setPollInterval(interval);
  };

  const handleClear = () => {
    setPrompt('');
    setJobId(null);
    setJobStatus(null);
    setLoading(false);
    if (pollInterval) {
      clearInterval(pollInterval);
    }
  };

  return (
    <Container>
      <Title>Generate AI Content</Title>
      <Subtitle>Enter your prompt and let the AI work its magic</Subtitle>

      {modelId && <ModelInfo>Using Model #{modelId}</ModelInfo>}

      <Card>
        <Label>Your Prompt</Label>
        <TextArea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Write a short story about a robot discovering emotions..."
          disabled={loading}
        />

        <ButtonContainer>
          <Button onClick={handleGenerate} disabled={loading || !prompt.trim()}>
            {loading ? (
              <>
                <LoadingSpinner /> Generating...
              </>
            ) : (
              'Generate'
            )}
          </Button>
          <Button variant="secondary" onClick={handleClear} disabled={loading}>
            Clear
          </Button>
        </ButtonContainer>
      </Card>

      {jobStatus && (
        <Card>
          <StatusContainer status={jobStatus.status}>
            <StatusTitle>Status</StatusTitle>
            <StatusText>
              {jobStatus.status === 'pending' && '⏳ Pending...'}
              {jobStatus.status === 'running' && '🔄 Running...'}
              {jobStatus.status === 'completed' && '✅ Completed!'}
              {jobStatus.status === 'failed' && '❌ Failed'}
            </StatusText>

            {jobStatus.result?.model_id !== undefined && (
              <div style={{ marginTop: '12px', color: '#A0AEC0' }}>
                Model ID: {jobStatus.result.model_id}
              </div>
            )}

            {jobStatus.status === 'completed' && jobStatus.result?.output && (
              <>
                <OutputContainer>
                  <OutputText>{jobStatus.result.output}</OutputText>
                </OutputContainer>
                <RatePrompt>
                  <p style={{ color: '#E2E8F0', marginBottom: '12px' }}>
                    How was the result? Rate this model!
                  </p>
                  <Button
                    onClick={() =>
                      (window.location.href = `/rate?modelId=${jobStatus.result?.model_id}`)
                    }
                  >
                    Rate Model
                  </Button>
                </RatePrompt>
              </>
            )}

            {jobStatus.status === 'failed' && jobStatus.error && (
              <div style={{ marginTop: '12px', color: '#FC8181' }}>
                Error: {jobStatus.error}
              </div>
            )}
          </StatusContainer>
        </Card>
      )}
    </Container>
  );
};
