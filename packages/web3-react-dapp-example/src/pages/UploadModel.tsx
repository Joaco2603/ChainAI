import React, { useState } from 'react';
import styled from 'styled-components';
import { apiService } from '../services/api';
import { useNavigate } from 'react-router-dom';

const Container = styled.div`
  max-width: 700px;
  margin: 0 auto;
  padding: 40px 20px;
`;

const Title = styled.h1`
  font-size: 36px;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 12px;
  text-align: center;
`;

const Subtitle = styled.p`
  font-size: 18px;
  color: #a0aec0;
  margin-bottom: 40px;
  text-align: center;
`;

const Card = styled.div`
  background: linear-gradient(135deg, #1a365d 0%, #2c5282 100%);
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const FormGroup = styled.div`
  margin-bottom: 32px;
`;

const Label = styled.label`
  display: block;
  font-size: 16px;
  font-weight: 600;
  color: #e2e8f0;
  margin-bottom: 12px;
`;

const Input = styled.input`
  width: 100%;
  padding: 16px;
  background: rgba(0, 0, 0, 0.3);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: #ffffff;
  font-size: 16px;
  font-family: 'Courier New', monospace;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: #63b3ed;
  }

  &::placeholder {
    color: #718096;
    font-family: 'Inter', sans-serif;
  }
`;

const HelpText = styled.div`
  font-size: 14px;
  color: #a0aec0;
  margin-top: 8px;
  line-height: 1.5;
`;

const InfoBox = styled.div`
  background: rgba(99, 179, 237, 0.1);
  border: 1px solid rgba(99, 179, 237, 0.3);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 32px;
`;

const InfoTitle = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #63b3ed;
  margin-bottom: 12px;
`;

const InfoList = styled.ul`
  margin: 0;
  padding-left: 20px;
  color: #a0aec0;
  font-size: 14px;
  line-height: 1.8;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 32px;
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

const SuccessMessage = styled.div`
  background: rgba(72, 187, 120, 0.1);
  border: 1px solid #68d391;
  border-radius: 12px;
  padding: 20px;
  color: #68d391;
  margin-bottom: 24px;
  text-align: center;

  strong {
    display: block;
    font-size: 18px;
    margin-bottom: 8px;
  }
`;

const ErrorMessage = styled.div`
  background: rgba(245, 101, 101, 0.1);
  border: 1px solid #fc8181;
  border-radius: 12px;
  padding: 20px;
  color: #feb2b2;
  margin-bottom: 24px;
  text-align: center;
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

const ExampleBox = styled.div`
  background: rgba(0, 0, 0, 0.4);
  border-radius: 8px;
  padding: 12px;
  margin-top: 12px;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  color: #68d391;
  border-left: 3px solid #68d391;
`;

export const UploadModel: React.FC = () => {
  const navigate = useNavigate();
  const [dockerImageUrl, setDockerImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [modelId, setModelId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!dockerImageUrl.trim()) {
      setError('Please enter a Docker image URL');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await apiService.uploadModel({
        docker_image_url: dockerImageUrl.trim(),
      });

      setSuccess(true);
      setModelId(response.model_id);

      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (err: any) {
      setError(
        err.response?.data?.detail || err.message || 'Failed to upload model'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setDockerImageUrl('');
    setSuccess(false);
    setModelId(null);
    setError(null);
  };

  return (
    <Container>
      <Title>Upload AI Model</Title>
      <Subtitle>Register your AI model on the Avalanche blockchain</Subtitle>

      <Card>
        {success && modelId !== null && (
          <SuccessMessage>
            <strong>✅ Model Registered Successfully!</strong>
            <div>Model ID: #{modelId}</div>
            <div style={{ fontSize: '14px', marginTop: '8px' }}>
              Redirecting to home...
            </div>
          </SuccessMessage>
        )}

        {error && (
          <ErrorMessage>
            <strong>Error:</strong> {error}
          </ErrorMessage>
        )}

        <InfoBox>
          <InfoTitle>📋 Docker Image Requirements</InfoTitle>
          <InfoList>
            <li>
              Must accept input via environment variable{' '}
              <code>INPUT_PROMPT</code>
            </li>
            <li>
              Must output results to stdout in JSON format:{' '}
              <code>{`{"output": "result"}`}</code>
            </li>
            <li>Must be publicly accessible or in a configured registry</li>
            <li>Should have reasonable resource requirements (&lt; 2GB RAM)</li>
          </InfoList>
          <ExampleBox>Example: myregistry/my-ai-model:v1.0</ExampleBox>
        </InfoBox>

        <form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="dockerImageUrl">Docker Image URL *</Label>
            <Input
              id="dockerImageUrl"
              type="text"
              value={dockerImageUrl}
              onChange={(e) => setDockerImageUrl(e.target.value)}
              placeholder="registry.example.com/username/model-name:tag"
              disabled={loading || success}
              required
            />
            <HelpText>
              Enter the full Docker image URL including the registry,
              repository, and tag. The image must be accessible to the backend
              service.
            </HelpText>
          </FormGroup>

          <ButtonContainer>
            <Button
              type="submit"
              disabled={loading || success || !dockerImageUrl.trim()}
            >
              {loading ? (
                <>
                  <LoadingSpinner /> Uploading...
                </>
              ) : success ? (
                '✅ Uploaded!'
              ) : (
                'Upload Model'
              )}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={success ? () => navigate('/') : handleReset}
              disabled={loading}
            >
              {success ? 'Go to Home' : 'Reset'}
            </Button>
          </ButtonContainer>
        </form>

        <InfoBox style={{ marginTop: '32px', marginBottom: '0' }}>
          <InfoTitle>💡 What happens next?</InfoTitle>
          <InfoList>
            <li>Your model will be registered on the Avalanche blockchain</li>
            <li>A unique Model ID will be assigned</li>
            <li>Users can discover and rate your model</li>
            <li>Your model can be selected for AI generation tasks</li>
            <li>You'll earn reputation as users rate your model</li>
          </InfoList>
        </InfoBox>
      </Card>
    </Container>
  );
};
