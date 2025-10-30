import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { apiService } from '../services/api';
import { StarRating } from '../components/StarRating';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Model } from '../types';

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
  text-align: center;
`;

const ModelInfo = styled.div`
  background: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 32px;
  text-align: left;
`;

const InfoLabel = styled.div`
  font-size: 12px;
  color: #a0aec0;
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const InfoValue = styled.div`
  font-size: 16px;
  color: #e2e8f0;
  word-break: break-all;
`;

const ModelId = styled.div`
  font-size: 48px;
  font-weight: 700;
  color: #63b3ed;
  margin-bottom: 24px;
`;

const RatingSection = styled.div`
  margin: 40px 0;
`;

const RatingLabel = styled.div`
  font-size: 20px;
  font-weight: 600;
  color: #e2e8f0;
  margin-bottom: 24px;
`;

const StarContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
`;

const SelectedRating = styled.div`
  font-size: 18px;
  color: #63b3ed;
  margin-top: 12px;
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

const CurrentRating = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 16px;
  background: rgba(99, 179, 237, 0.1);
  border-radius: 8px;
  margin-bottom: 24px;
`;

const RatingItem = styled.div`
  text-align: center;

  .label {
    font-size: 12px;
    color: #a0aec0;
    margin-bottom: 4px;
  }

  .value {
    font-size: 20px;
    font-weight: 600;
    color: #ffffff;
  }
`;

export const RateModel: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const modelId = searchParams.get('modelId');

  const [model, setModel] = useState<Model | null>(null);
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingModel, setLoadingModel] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (modelId) {
      loadModel(parseInt(modelId));
    }
  }, [modelId]);

  const loadModel = async (id: number) => {
    try {
      setLoadingModel(true);
      const modelData = await apiService.getModel(id);
      setModel(modelData);
    } catch (err: any) {
      setError(err.message || 'Failed to load model');
    } finally {
      setLoadingModel(false);
    }
  };

  const handleSubmit = async () => {
    if (!modelId || rating === 0) {
      setError('Please select a rating');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await apiService.rateModel({
        model_id: parseInt(modelId),
        rating,
      });

      setSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to submit rating');
    } finally {
      setLoading(false);
    }
  };

  if (!modelId) {
    return (
      <Container>
        <Card>
          <ErrorMessage>No model ID provided</ErrorMessage>
          <Button onClick={() => navigate('/')}>Go Home</Button>
        </Card>
      </Container>
    );
  }

  if (loadingModel) {
    return (
      <Container>
        <Card>
          <LoadingSpinner />
          <div style={{ color: '#A0AEC0', marginTop: '12px' }}>
            Loading model...
          </div>
        </Card>
      </Container>
    );
  }

  return (
    <Container>
      <Title>Rate AI Model</Title>
      <Subtitle>Your feedback helps improve the ecosystem</Subtitle>

      <Card>
        {success && (
          <SuccessMessage>
            ✅ Rating submitted successfully! Redirecting...
          </SuccessMessage>
        )}

        {error && <ErrorMessage>{error}</ErrorMessage>}

        <ModelId>Model #{modelId}</ModelId>

        {model && (
          <>
            <CurrentRating>
              <RatingItem>
                <div className="label">Current Rating</div>
                <div className="value">{model.average_rating.toFixed(1)}</div>
              </RatingItem>
              <RatingItem>
                <div className="label">Total Ratings</div>
                <div className="value">{model.rating_count}</div>
              </RatingItem>
              <RatingItem>
                <div className="label">Times Used</div>
                <div className="value">{model.times_selected}</div>
              </RatingItem>
            </CurrentRating>

            <ModelInfo>
              <InfoLabel>Docker Image</InfoLabel>
              <InfoValue style={{ fontFamily: 'monospace', fontSize: '14px' }}>
                {model.docker_image_url}
              </InfoValue>
            </ModelInfo>
          </>
        )}

        <RatingSection>
          <RatingLabel>How would you rate this model?</RatingLabel>

          <StarContainer>
            <StarRating
              rating={rating}
              size={48}
              interactive={!loading && !success}
              onRatingChange={setRating}
            />
          </StarContainer>

          {rating > 0 && (
            <SelectedRating>
              You selected {rating} star{rating !== 1 ? 's' : ''}
            </SelectedRating>
          )}
        </RatingSection>

        <ButtonContainer>
          <Button
            onClick={handleSubmit}
            disabled={loading || success || rating === 0}
          >
            {loading ? (
              <>
                <LoadingSpinner /> Submitting...
              </>
            ) : (
              'Submit Rating'
            )}
          </Button>
          <Button
            variant="secondary"
            onClick={() => navigate('/')}
            disabled={loading}
          >
            Cancel
          </Button>
        </ButtonContainer>
      </Card>
    </Container>
  );
};
