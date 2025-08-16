"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Alert,
  CircularProgress,
  LinearProgress,
  Chip,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Paper,
  Divider,
} from '@mui/material';
import {
  Quiz as QuizIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Refresh as RefreshIcon,
  ArrowBack as ArrowBackIcon,
  EmojiEvents as TrophyIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { useAuth } from '../../../../contexts/AuthContext';

interface Question {
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
}

interface QuizData {
  skill: string;
  category: string;
  questions: Question[];
}

interface Skill {
  _id: string;
  name: string;
  category: string;
  proficiency: number;
}

const API_URL = "https://protfolio-hub.vercel.app/api";

function TestSkill() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const skillId = params.id as string;

  // State management
  const [skill, setSkill] = useState<Skill | null>(null);
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingQuestions, setGeneratingQuestions] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<{
    correctAnswers: number;
    totalQuestions: number;
    percentage: number;
    newProficiency: number;
  } | null>(null);
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [shuffledAnswers, setShuffledAnswers] = useState<string[][]>([]);

  useEffect(() => {
    fetchSkillDetails();
  }, [skillId]);

  const fetchSkillDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/skill/skill/${skillId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch skill details');
      }

      const data = await response.json();
      setSkill(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const generateQuestions = async () => {
    try {
      setGeneratingQuestions(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/ai/generate-questions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          skill: skill?.name,
          category: skill?.category,
          num_questions: 10,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate questions');
      }

      const data = await response.json();
      
      if (data.success) {
        setQuizData(data.data);
        setSelectedAnswers(new Array(data.data.questions.length).fill(''));
        setCurrentQuestionIndex(0);
        setShowResults(false);
        
        // Generate shuffled answers for all questions
        const shuffled = data.data.questions.map((question: Question) => {
          const answers = [...question.incorrect_answers, question.correct_answer];
          return answers.sort(() => Math.random() - 0.5);
        });
        setShuffledAnswers(shuffled);
      } else {
        throw new Error(data.message || 'Failed to generate questions');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setGeneratingQuestions(false);
    }
  };

  const handleAnswerSelect = (answer: string) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestionIndex] = answer;
    setSelectedAnswers(newAnswers);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < (quizData?.questions.length || 0) - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const calculateResults = () => {
    if (!quizData) return;

    let correctCount = 0;
    quizData.questions.forEach((question, index) => {
      if (selectedAnswers[index] === question.correct_answer) {
        correctCount++;
      }
    });

    const percentage = Math.round((correctCount / quizData.questions.length) * 100);
    
    // Calculate new proficiency based on current proficiency and quiz performance
    const currentProficiency = skill?.proficiency || 0;
    const quizWeight = 0.3; // Quiz contributes 30% to proficiency update
    const currentWeight = 0.7; // Current proficiency contributes 70%
    
    const newProficiency = Math.round(
      (currentProficiency * currentWeight) + (percentage * quizWeight)
    );

    return {
      correctAnswers: correctCount,
      totalQuestions: quizData.questions.length,
      percentage,
      newProficiency: Math.min(100, Math.max(0, newProficiency)),
    };
  };

  const submitQuiz = async () => {
    try {
      setSubmitting(true);
      const quizResults = calculateResults();
      
      if (!quizResults) {
        throw new Error('Failed to calculate results');
      }

      setResults(quizResults);
      setShowResults(true);

      // Update skill proficiency
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/skill/${skillId}/proficiency`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          proficiency: quizResults.newProficiency,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update proficiency');
      }

      // Update local skill data
      if (skill) {
        setSkill({
          ...skill,
          proficiency: quizResults.newProficiency,
        });
      }

      setShowResultDialog(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const resetQuiz = () => {
    setQuizData(null);
    setSelectedAnswers([]);
    setCurrentQuestionIndex(0);
    setShowResults(false);
    setResults(null);
    setShowResultDialog(false);
    setShuffledAnswers([]);
  };

  const getCurrentQuestion = () => {
    if (!quizData || !quizData.questions[currentQuestionIndex]) return null;
    return quizData.questions[currentQuestionIndex];
  };

  const getAllAnswers = (questionIndex: number) => {
    return shuffledAnswers[questionIndex] || [];
  };

  const isAnswerSelected = (answer: string) => {
    return selectedAnswers[currentQuestionIndex] === answer;
  };

  const isAnswerCorrect = (answer: string) => {
    const question = getCurrentQuestion();
    return question?.correct_answer === answer;
  };

  const getProgressPercentage = () => {
    if (!quizData) return 0;
    return ((currentQuestionIndex + 1) / quizData.questions.length) * 100;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => router.back()}
        >
          Go Back
        </Button>
      </Box>
    );
  }

  if (!skill) {
    return (
      <Box p={3}>
        <Alert severity="warning">Skill not found</Alert>
      </Box>
    );
  }

  return (
    <Box p={3} maxWidth="800px" mx="auto">
      {/* Header */}
      <Box display="flex" alignItems="center" mb={3}>
        <IconButton onClick={() => router.back()} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Skill Test: {skill.name}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Category: {skill.category} | Current Proficiency: {skill.proficiency}%
          </Typography>
        </Box>
      </Box>

      {/* Quiz not started */}
      {!quizData && !showResults && (
        <Card>
          <CardContent>
            <Box textAlign="center" py={4}>
              <QuizIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                Ready to test your {skill.name} skills?
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                This test will generate 5 questions based on your skill level and category. 
                Your proficiency will be updated based on your performance.
              </Typography>
              <Button
                variant="contained"
                size="large"
                startIcon={<QuizIcon />}
                onClick={generateQuestions}
                disabled={generatingQuestions}
              >
                {generatingQuestions ? 'Generating Questions...' : 'Start Test'}
              </Button>
              
              {/* Loading state when generating questions */}
              {generatingQuestions && (
                <Box display="flex" justifyContent="center" alignItems="center" mt={2}>
                  <CircularProgress size={24} sx={{ mr: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    Generating questions for {skill?.name}...
                  </Typography>
                </Box>
              )}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Quiz in progress */}
      {quizData && !showResults && (
        <Card>
          <CardContent>
            {/* Progress bar */}
            <Box mb={3}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="body2" color="text.secondary">
                  Question {currentQuestionIndex + 1} of {quizData.questions.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {Math.round(getProgressPercentage())}%
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={getProgressPercentage()} 
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>

            {/* Question */}
            <Typography variant="h6" gutterBottom>
              {getCurrentQuestion()?.question}
            </Typography>

            {/* Answer options */}
            <FormControl component="fieldset" sx={{ width: '100%', mt: 2 }}>
              <RadioGroup
                value={selectedAnswers[currentQuestionIndex] || ''}
                onChange={(e) => handleAnswerSelect(e.target.value)}
              >
                {getCurrentQuestion() && getAllAnswers(currentQuestionIndex).map((answer, index) => (
                  <FormControlLabel
                    key={index}
                    value={answer}
                    control={<Radio />}
                    label={answer}
                    sx={{
                      border: '1px solid',
                      borderColor: isAnswerSelected(answer) ? 'primary.main' : 'divider',
                      borderRadius: 1,
                      p: 1,
                      mb: 1,
                      '&:hover': {
                        borderColor: 'primary.main',
                        backgroundColor: 'action.hover',
                      },
                    }}
                  />
                ))}
              </RadioGroup>
            </FormControl>

            {/* Navigation buttons */}
            <Box display="flex" justifyContent="space-between" mt={3}>
              <Button
                variant="outlined"
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}
              >
                Previous
              </Button>
              
              {currentQuestionIndex === quizData.questions.length - 1 ? (
                <Button
                  variant="contained"
                  onClick={submitQuiz}
                  disabled={selectedAnswers.some(answer => answer === '') || submitting}
                >
                  {submitting ? 'Submitting...' : 'Submit Quiz'}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNextQuestion}
                  disabled={!selectedAnswers[currentQuestionIndex]}
                >
                  Next
                </Button>
              )}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {showResults && results && (
        <Card>
          <CardContent>
            <Box textAlign="center" py={3}>
              <TrophyIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
              <Typography variant="h4" gutterBottom>
                Quiz Complete!
              </Typography>
              
              <Stack spacing={2} alignItems="center" mt={3}>
                <Box>
                  <Typography variant="h6" color="primary">
                    Score: {results.correctAnswers}/{results.totalQuestions}
                  </Typography>
                  <Typography variant="h3" color="primary" fontWeight="bold">
                    {results.percentage}%
                  </Typography>
                </Box>

                <Box display="flex" alignItems="center" gap={1}>
                  <Typography variant="body1">Previous Proficiency:</Typography>
                  <Chip label={`${skill.proficiency}%`} color="default" />
                </Box>

                <Box display="flex" alignItems="center" gap={1}>
                  <Typography variant="body1">New Proficiency:</Typography>
                  <Chip 
                    label={`${results.newProficiency}%`} 
                    color={results.newProficiency > skill.proficiency ? 'success' : 'default'}
                    icon={results.newProficiency > skill.proficiency ? <TrendingUpIcon /> : undefined}
                  />
                </Box>
              </Stack>

              <Box mt={4} display="flex" gap={2} justifyContent="center">
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={resetQuiz}
                >
                  Take Another Test
                </Button>
                <Button
                  variant="contained"
                  startIcon={<ArrowBackIcon />}
                  onClick={() => router.back()}
                >
                  Back to Skills
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Result Dialog */}
      <Dialog open={showResultDialog} onClose={() => setShowResultDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <CheckCircleIcon color="success" />
            Proficiency Updated Successfully!
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography>
            Your {skill.name} proficiency has been updated from {skill.proficiency}% to {results?.newProficiency}%.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowResultDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default TestSkill;