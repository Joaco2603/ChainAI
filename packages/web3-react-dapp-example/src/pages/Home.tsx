import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { apiService } from '../services/api';
import { Model } from '../types';
import { StarRating } from '../components/StarRating';
import { useNavigate } from 'react-router-dom';

const Container = styled.div`
  max-width: 1200px;
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

const ModelsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 24px;
  margin-top: 32px;
`;

const ModelCard = styled.div`
  background: linear-gradient(135deg, #1a365d 0%, #2c5282 100%);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  cursor: pointer;
  border: 1px solid rgba(255, 255, 255, 0.1);

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.4);
    border-color: rgba(255, 255, 255, 0.2);
  }
`;

const ModelHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
`;

const ModelId = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #63b3ed;
  background: rgba(99, 179, 237, 0.1);
  padding: 4px 12px;
  border-radius: 12px;
`;

const StatusBadge = styled.span<{ active: boolean }>`
  font-size: 12px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 12px;
  background: ${(props) =>
    props.active ? 'rgba(72, 187, 120, 0.2)' : 'rgba(245, 101, 101, 0.2)'};
  color: ${(props) => (props.active ? '#68D391' : '#FC8181')};
`;

const DockerImage = styled.div`
  font-size: 14px;
  color: #e2e8f0;
  margin-bottom: 16px;
  word-break: break-all;
  font-family: 'Courier New', monospace;
  background: rgba(0, 0, 0, 0.3);
  padding: 8px 12px;
  border-radius: 8px;
  border-left: 3px solid #63b3ed;
`;

const StatsContainer = styled.div`
  display: flex;
  gap: 24px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

const Stat = styled.div`
  display: flex;
  flex-direction: column;
`;

const StatLabel = styled.span`
  font-size: 12px;
  color: #a0aec0;
  margin-bottom: 4px;
`;

const StatValue = styled.span`
  font-size: 18px;
  font-weight: 600;
  color: #ffffff;
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px;
  font-size: 18px;
  color: #a0aec0;
`;

const ErrorMessage = styled.div`
  background: rgba(245, 101, 101, 0.1);
  border: 1px solid #fc8181;
  border-radius: 12px;
  padding: 20px;
  color: #feb2b2;
  text-align: center;
  margin-top: 40px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #a0aec0;

  h3 {
    font-size: 24px;
    margin-bottom: 12px;
    color: #e2e8f0;
  }

  p {
    font-size: 16px;
    margin-bottom: 24px;
  }
`;

const ActionButton = styled.button`
  background: linear-gradient(135deg, #3182ce 0%, #2c5282 100%);
  color: white;
  border: none;
  padding: 12px 32px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(49, 130, 206, 0.4);
  }
`;

export const Home: React.FC = () => {
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getTopModels(20);
      setModels(response.models);
    } catch (err: any) {
      setError(err.message || 'Failed to load models');
      console.error('Error loading models:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleModelClick = (modelId: number) => {
    navigate(`/prompt?modelId=${modelId}`);
  };

  if (loading) {
    return (
      <Container>
        <LoadingSpinner>Loading models...</LoadingSpinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Title>AI Model Registry</Title>
        <ErrorMessage>
          <strong>Error:</strong> {error}
        </ErrorMessage>
      </Container>
    );
  }

  return (
    <Container>
      <Title>AI Model Registry</Title>
      <Subtitle>
        Explore and interact with decentralized AI models on Avalanche
      </Subtitle>

      {models.length === 0 ? (
        <EmptyState>
          <h3>No Models Available</h3>
          <p>Be the first to upload an AI model to the registry!</p>
          <ActionButton onClick={() => navigate('/upload')}>
            Upload Model
          </ActionButton>
        </EmptyState>
      ) : (
        <ModelsGrid>
          {models.map((model) => (
            <ModelCard
              key={model.model_id}
              onClick={() => handleModelClick(model.model_id)}
            >
              <ModelHeader>
                <ModelId>Model #{model.model_id}</ModelId>
                <StatusBadge active={model.is_active}>
                  {model.is_active ? 'Active' : 'Inactive'}
                </StatusBadge>
              </ModelHeader>

              <DockerImage>{model.docker_image_url}</DockerImage>

              <StarRating rating={model.average_rating} size={24} />

              <StatsContainer>
                <Stat>
                  <StatLabel>Ratings</StatLabel>
                  <StatValue>{model.rating_count}</StatValue>
                </Stat>
                <Stat>
                  <StatLabel>Times Used</StatLabel>
                  <StatValue>{model.times_selected}</StatValue>
                </Stat>
              </StatsContainer>
            </ModelCard>
          ))}
        </ModelsGrid>
      )}
    </Container>
  );
};
