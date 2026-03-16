// src/screens/Goals/components/GoalWizard.tsx

import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

import type { FutureSelf, Goal } from '@/store/schemas';

import { useTheme } from '@/theme';

import {
  LIFE_AREA_TO_CATEGORY,
  LIFE_AREAS,
} from '@/constants/goalWizard';
import {
  generateGoalQuestion,
  generateKeywords,
  generateNarrowerSubAreas,
  generateSubAreas,
  synthesizeGoalStatement,
} from '@/services/suggestions';

const BORDER_RADIUS = 8;
const CHIP_RADIUS = 16;
const INPUT_BORDER_WIDTH = 1;
const ADD_STEPS = 9;
const EDIT_STEPS = 3;

type Props = {
  futureSelf?: FutureSelf[];
  goal: Goal | undefined;
  onClose: () => void;
  onSave: (goal: Goal, futureSelf?: FutureSelf) => void;
  visible: boolean;
};

function GoalWizard({ futureSelf, goal, onClose, onSave, visible }: Props) {
  const { backgrounds, colors, fonts, gutters, layout } = useTheme();
  const isEditMode = goal !== undefined;
  const totalSteps = isEditMode ? EDIT_STEPS : ADD_STEPS;

  const [step, setStep] = useState(1);

  // Screen 1 — Life Area
  const [lifeArea, setLifeArea] = useState('');

  // Screen 2 — Sub-area L1
  const [subArea1, setSubArea1] = useState('');
  const [subAreaOptions1, setSubAreaOptions1] = useState<string[]>([]);
  const [loadingSubAreas1, setLoadingSubAreas1] = useState(false);

  // Screen 3 — Sub-area L2
  const [subArea2, setSubArea2] = useState('');
  const [subAreaOptions2, setSubAreaOptions2] = useState<string[]>([]);
  const [loadingSubAreas2, setLoadingSubAreas2] = useState(false);

  // Screens 4–6 — Dynamic Questions
  const [questions, setQuestions] = useState<{ question: string; options: string[] }[]>([]);
  const [answers, setAnswers] = useState<string[]>(['', '', '']);
  const [loadingQuestion, setLoadingQuestion] = useState(false);

  // Screen 7 / Edit step 1 — Goal Statement
  const [statement, setStatement] = useState('');
  const [loadingStatement, setLoadingStatement] = useState(false);

  // Screen 8 / Edit step 2 — Vision
  const [vision, setVision] = useState('');

  // Screen 9 / Edit step 3 — Review
  const [category, setCategory] = useState('');
  const [keywords, setKeywords] = useState<string[]>([]);
  const [customKeyword, setCustomKeyword] = useState('');
  const [loadingKeywords, setLoadingKeywords] = useState(false);

  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // ── Reset on open ──
  useEffect(() => {
    if (!visible) return;
    setStep(1);
    setError('');
    setSaving(false);
    setCustomKeyword('');
    if (isEditMode) {
      setStatement(goal.statement);
      setCategory(goal.category);
      setKeywords(goal.keywords);
      const existing5yr = futureSelf?.find(f => f.timeframe === '5yr');
      setVision(existing5yr?.narrative ?? '');
    } else {
      setLifeArea('');
      setSubArea1('');
      setSubAreaOptions1([]);
      setSubArea2('');
      setSubAreaOptions2([]);
      setQuestions([]);
      setAnswers(['', '', '']);
      setStatement('');
      setVision('');
      setCategory('');
      setKeywords([]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  // ── Fetch sub-areas L1 on step 2 ──
  useEffect(() => {
    if (step !== 2 || isEditMode || !lifeArea.trim()) return;
    setLoadingSubAreas1(true);
    generateSubAreas(lifeArea).then(areas => {
      setSubAreaOptions1(areas);
      setLoadingSubAreas1(false);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  // ── Fetch sub-areas L2 on step 3 ──
  useEffect(() => {
    if (step !== 3 || isEditMode || !lifeArea.trim() || !subArea1.trim()) return;
    setSubAreaOptions2([]);
    setLoadingSubAreas2(true);
    generateNarrowerSubAreas(lifeArea, subArea1).then(areas => {
      setSubAreaOptions2(areas);
      setLoadingSubAreas2(false);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  // ── Fetch dynamic question on steps 4–6 ──
  useEffect(() => {
    if (step < 4 || step > 6 || isEditMode) return;
    const questionNumber = (step - 3) as 1 | 2 | 3;
    setLoadingQuestion(true);
    generateGoalQuestion({
      lifeArea,
      previousAnswers: answers.slice(0, questionNumber - 1),
      questionNumber,
      subArea1,
      subArea2,
    }).then(q => {
      setQuestions(prev => {
        const updated = [...prev];
        updated[questionNumber - 1] = q;
        return updated;
      });
      setLoadingQuestion(false);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  // ── Synthesize goal statement on step 7 ──
  useEffect(() => {
    if (step !== 7 || isEditMode) return;
    setLoadingStatement(true);
    synthesizeGoalStatement({ answers, lifeArea, subArea1, subArea2 }).then(s => {
      setStatement(s);
      setLoadingStatement(false);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  // ── Set category + fetch keywords on review step ──
  useEffect(() => {
    const reviewStep = isEditMode ? 3 : 9;
    if (step !== reviewStep || !statement.trim()) return;
    if (!isEditMode) {
      setCategory(LIFE_AREA_TO_CATEGORY[lifeArea] ?? lifeArea);
      setLoadingKeywords(true);
      generateKeywords(statement).then(kws => {
        setKeywords(kws);
        setLoadingKeywords(false);
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  // ── Navigation ──
  function handleBack() {
    if (step === 1) {
      if (!isEditMode && lifeArea.trim()) {
        Alert.alert('Discard goal?', 'Your progress will be lost.', [
          { style: 'cancel', text: 'Keep editing' },
          { onPress: onClose, style: 'destructive', text: 'Discard' },
        ]);
      } else {
        onClose();
      }
      return;
    }
    setError('');
    setStep(s => s - 1);
  }

  function handleNext() {
    setError('');
    if (!isEditMode) {
      if (step === 1) {
        if (!lifeArea.trim()) return;
        setStep(2);
        return;
      }
      if (step === 2) {
        if (!subArea1.trim()) return;
        // Clear L2 and downstream when L1 changes
        setSubArea2('');
        setSubAreaOptions2([]);
        setAnswers(['', '', '']);
        setQuestions([]);
        setStep(3);
        return;
      }
      if (step === 3) {
        if (!subArea2.trim()) return;
        // Clear Q&A when L2 changes
        setAnswers(['', '', '']);
        setQuestions([]);
        setStep(4);
        return;
      }
      if (step >= 4 && step <= 6) {
        const idx = step - 4;
        if (!answers[idx]?.trim()) return;
        setStep(step + 1);
        return;
      }
      if (step === 7) {
        if (!statement.trim()) {
          setError('Please enter your goal.');
          return;
        }
        setStep(8);
        return;
      }
      if (step === 8) {
        setStep(9);
        return;
      }
    } else {
      if (step === 1) {
        if (!statement.trim()) {
          setError('Please enter your goal.');
          return;
        }
        setStep(2);
        return;
      }
      if (step === 2) {
        setStep(3);
        return;
      }
    }
  }

  async function handleSave() {
    if (keywords.length === 0) {
      setError('Add at least one keyword.');
      return;
    }
    setError('');
    setSaving(true);
    const saved: Goal = {
      archivedAt: goal?.archivedAt,
      category,
      createdAt: goal?.createdAt ?? new Date().toISOString(),
      id: goal?.id ?? Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      keywords,
      statement: statement.trim(),
    };
    const savedFutureSelf: FutureSelf | undefined = vision.trim()
      ? { goalId: saved.id, narrative: vision.trim(), timeframe: '5yr' }
      : undefined;
    setSaving(false);
    onSave(saved, savedFutureSelf);
  }

  function addCustomKeyword() {
    const trimmed = customKeyword.trim().toLowerCase();
    if (!trimmed || keywords.includes(trimmed)) return;
    setKeywords(prev => [...prev, trimmed]);
    setCustomKeyword('');
  }

  function removeKeyword(kw: string) {
    setKeywords(prev => prev.filter(k => k !== kw));
  }

  // ── Helpers ──
  function renderProgress() {
    return (
      <View style={[layout.row, layout.itemsCenter, { alignSelf: 'center', gap: 8, marginBottom: 16 }]}>
        {Array.from({ length: totalSteps }, (_, i) => (
          <View
            key={i}
            style={{
              backgroundColor: i + 1 === step ? colors.purple500 : colors.gray200,
              borderRadius: 4,
              height: 8,
              width: i + 1 === step ? 20 : 8,
            }}
          />
        ))}
      </View>
    );
  }

  function renderChips(
    options: string[],
    selected: string,
    onSelect: (v: string) => void,
    testPrefix: string,
  ) {
    return (
      <View style={[layout.row, { flexWrap: 'wrap', marginBottom: 8 }]}>
        {options.map((opt, i) => (
          <Pressable
            key={opt}
            onPress={() => onSelect(opt)}
            style={[
              gutters.paddingHorizontal_12,
              gutters.paddingVertical_8,
              {
                backgroundColor: selected === opt ? colors.purple500 : colors.gray200,
                borderRadius: CHIP_RADIUS,
                marginBottom: 8,
                marginRight: 8,
              },
            ]}
            testID={`${testPrefix}-${i}`}
          >
            <Text style={[fonts.size_14, { color: selected === opt ? colors.gray50 : colors.gray800 }]}>
              {opt}
            </Text>
          </Pressable>
        ))}
      </View>
    );
  }

  function renderTextInput(
    value: string,
    onChange: (v: string) => void,
    placeholder: string,
    testID: string,
    multiline = false,
    autoFocus = false,
  ) {
    return (
      <TextInput
        autoFocus={autoFocus}
        multiline={multiline}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={colors.gray400}
        style={[
          fonts.size_14,
          fonts.gray800,
          gutters.paddingVertical_8,
          gutters.marginTop_8,
          { borderBottomWidth: INPUT_BORDER_WIDTH, borderColor: colors.gray200 },
        ]}
        testID={testID}
        value={value}
      />
    );
  }

  // Step flags
  const isReviewStep = isEditMode ? step === 3 : step === 9;
  const isVisionStep = isEditMode ? step === 2 : step === 8;
  const isStatementStep = isEditMode ? step === 1 : step === 7;
  const isQuestionStep = !isEditMode && step >= 4 && step <= 6;
  const currentQuestionIdx = step - 4; // 0, 1, 2

  return (
    <Modal animationType="slide" onRequestClose={handleBack} transparent visible={visible}>
      <View style={[layout.flex_1, { backgroundColor: 'rgba(0,0,0,0.4)' }]} />
      <View
        style={[
          backgrounds.gray50,
          gutters.paddingHorizontal_24,
          gutters.paddingTop_24,
          gutters.paddingBottom_40,
          { maxHeight: '85%', position: 'absolute', bottom: 0, left: 0, right: 0 },
        ]}
      >
        {renderProgress()}

        <Pressable onPress={handleBack} style={{ alignSelf: 'flex-start', marginBottom: 8 }}>
          <Text style={[fonts.size_14, { color: colors.gray400 }]}>
            {step === 1 ? '✕ Close' : '← Back'}
          </Text>
        </Pressable>

        <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          {/* ── Screen 1: Life Area ── */}
          {!isEditMode && step === 1 && (
            <View>
              <Text style={[fonts.size_16, fonts.bold, fonts.gray800, gutters.marginBottom_16]}>
                What do you want to achieve in your life?
              </Text>
              <View style={[layout.row, { flexWrap: 'wrap', marginBottom: 16 }]}>
                {LIFE_AREAS.map(area => (
                  <Pressable
                    key={area}
                    onPress={() => setLifeArea(area)}
                    style={[
                      gutters.paddingHorizontal_12,
                      gutters.paddingVertical_8,
                      {
                        backgroundColor: lifeArea === area ? colors.purple500 : colors.gray200,
                        borderRadius: BORDER_RADIUS,
                        marginBottom: 8,
                        marginRight: 8,
                      },
                    ]}
                    testID={`wizard-area-${area}`}
                  >
                    <Text style={[fonts.size_12, { color: lifeArea === area ? colors.gray50 : colors.gray800 }]}>
                      {area}
                    </Text>
                  </Pressable>
                ))}
              </View>
              {renderTextInput(
                lifeArea,
                setLifeArea,
                'Or describe what matters to you...',
                'wizard-lifearea-input',
              )}
            </View>
          )}

          {/* ── Screen 2: Sub-area L1 ── */}
          {!isEditMode && step === 2 && (
            <View>
              <Text style={[fonts.size_16, fonts.bold, fonts.gray800, gutters.marginBottom_16]}>
                What aspect of {lifeArea}?
              </Text>
              {loadingSubAreas1
                ? <ActivityIndicator color={colors.purple500} size="small" style={gutters.marginBottom_12} />
                : renderChips(subAreaOptions1, subArea1, setSubArea1, 'wizard-sub1')
              }
              {renderTextInput(subArea1, setSubArea1, 'Or type your own...', 'wizard-subarea1-input')}
            </View>
          )}

          {/* ── Screen 3: Sub-area L2 ── */}
          {!isEditMode && step === 3 && (
            <View>
              <Text style={[fonts.size_16, fonts.bold, fonts.gray800, gutters.marginBottom_16]}>
                More specifically...
              </Text>
              {loadingSubAreas2
                ? <ActivityIndicator color={colors.purple500} size="small" style={gutters.marginBottom_12} />
                : subAreaOptions2.length > 0
                  ? renderChips(subAreaOptions2, subArea2, setSubArea2, 'wizard-sub2')
                  : null
              }
              {renderTextInput(subArea2, setSubArea2, 'Describe more specifically...', 'wizard-subarea2-input')}
            </View>
          )}

          {/* ── Screens 4–6: Dynamic Questions ── */}
          {isQuestionStep && (
            <View>
              {loadingQuestion || !questions[currentQuestionIdx] ? (
                <ActivityIndicator color={colors.purple500} size="small" style={gutters.marginBottom_12} />
              ) : (
                <>
                  <Text style={[fonts.size_16, fonts.bold, fonts.gray800, gutters.marginBottom_16]}>
                    {questions[currentQuestionIdx].question}
                  </Text>
                  {renderChips(
                    questions[currentQuestionIdx].options,
                    answers[currentQuestionIdx] ?? '',
                    v => {
                      const updated = [...answers];
                      updated[currentQuestionIdx] = v;
                      setAnswers(updated);
                    },
                    `wizard-answer-${currentQuestionIdx + 1}`,
                  )}
                </>
              )}
              {renderTextInput(
                answers[currentQuestionIdx] ?? '',
                v => {
                  const updated = [...answers];
                  updated[currentQuestionIdx] = v;
                  setAnswers(updated);
                },
                'Type your answer...',
                `wizard-answer-input-${currentQuestionIdx}`,
              )}
            </View>
          )}

          {/* ── Screen 7 / Edit Step 1: Goal Statement ── */}
          {isStatementStep && (
            <View>
              <Text style={[fonts.size_16, fonts.bold, fonts.gray800, gutters.marginBottom_12]}>
                {isEditMode ? 'Edit your goal' : "Here's your goal — make it yours"}
              </Text>
              {loadingStatement ? (
                <ActivityIndicator color={colors.purple500} size="small" style={gutters.marginTop_12} />
              ) : (
                renderTextInput(
                  statement,
                  setStatement,
                  'Your goal...',
                  'wizard-statement-input',
                  true,
                  !isEditMode,
                )
              )}
              {error ? (
                <Text style={[fonts.size_12, gutters.marginTop_8, { color: colors.red500 }]}>{error}</Text>
              ) : null}
            </View>
          )}

          {/* ── Screen 8 / Edit Step 2: Vision ── */}
          {isVisionStep && (
            <View>
              <Text style={[fonts.size_16, fonts.bold, fonts.gray800, gutters.marginBottom_12]}>
                Where will you be in 5 years if you achieve this?
              </Text>
              {renderTextInput(vision, setVision, 'Describe your future self...', 'wizard-vision-input', true, true)}
            </View>
          )}

          {/* ── Screen 9 / Edit Step 3: Review ── */}
          {isReviewStep && (
            <View>
              <Text style={[fonts.size_16, fonts.bold, fonts.gray800, gutters.marginBottom_16]}>
                Review your goal
              </Text>

              <Text style={[fonts.size_12, fonts.gray400]}>Goal</Text>
              <Text style={[fonts.size_14, fonts.gray800, gutters.marginBottom_16]}>{statement}</Text>

              <Text style={[fonts.size_12, fonts.gray400]}>5-year vision</Text>
              <Text style={[fonts.size_14, fonts.gray800, gutters.marginBottom_16]}>
                {vision.trim() || 'Not set'}
              </Text>

              <Text style={[fonts.size_12, fonts.gray400, gutters.marginBottom_8]}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={gutters.marginBottom_16}>
                {LIFE_AREAS.map(cat => (
                  <Pressable
                    key={cat}
                    onPress={() => setCategory(cat)}
                    style={[
                      gutters.paddingHorizontal_12,
                      gutters.paddingVertical_8,
                      {
                        backgroundColor: category === cat ? colors.purple500 : colors.gray200,
                        borderRadius: BORDER_RADIUS,
                        marginRight: 8,
                      },
                    ]}
                    testID={`wizard-category-${cat}`}
                  >
                    <Text style={[fonts.size_12, { color: category === cat ? colors.gray50 : colors.gray800 }]}>
                      {cat}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>

              <Text style={[fonts.size_12, fonts.gray400, gutters.marginBottom_8]}>Keywords</Text>
              {loadingKeywords ? (
                <ActivityIndicator color={colors.purple500} size="small" style={gutters.marginBottom_8} />
              ) : (
                <View style={[layout.row, { flexWrap: 'wrap', marginBottom: 8 }]}>
                  {keywords.map(kw => (
                    <Pressable
                      key={kw}
                      onPress={() => removeKeyword(kw)}
                      style={[
                        gutters.paddingHorizontal_12,
                        gutters.paddingVertical_8,
                        {
                          backgroundColor: colors.purple500,
                          borderRadius: CHIP_RADIUS,
                          marginBottom: 6,
                          marginRight: 6,
                        },
                      ]}
                    >
                      <Text style={[fonts.size_12, { color: colors.gray50 }]}>{kw} ✕</Text>
                    </Pressable>
                  ))}
                </View>
              )}

              <View style={[layout.row, layout.itemsCenter, gutters.marginBottom_8]}>
                <TextInput
                  onChangeText={setCustomKeyword}
                  onSubmitEditing={addCustomKeyword}
                  placeholder="Add a keyword..."
                  placeholderTextColor={colors.gray400}
                  returnKeyType="done"
                  style={[
                    layout.flex_1,
                    fonts.size_14,
                    fonts.gray800,
                    gutters.paddingVertical_8,
                    { borderBottomWidth: INPUT_BORDER_WIDTH, borderColor: colors.gray200 },
                  ]}
                  testID="wizard-custom-keyword"
                  value={customKeyword}
                />
                <Pressable
                  onPress={addCustomKeyword}
                  style={[gutters.paddingHorizontal_12, gutters.paddingVertical_8, { marginLeft: 8 }]}
                >
                  <Text style={[fonts.size_16, { color: colors.purple500 }]}>+</Text>
                </Pressable>
              </View>

              {error ? (
                <Text style={[fonts.size_12, gutters.marginBottom_8, { color: colors.red500 }]}>{error}</Text>
              ) : null}
            </View>
          )}

        </ScrollView>

        {/* ── Navigation buttons ── */}
        <View style={[layout.row, gutters.marginTop_24]}>
          {isVisionStep && (
            <Pressable
              onPress={() => setStep(s => s + 1)}
              style={[
                layout.flex_1,
                backgrounds.gray100,
                gutters.paddingVertical_12,
                { alignItems: 'center', borderRadius: BORDER_RADIUS, marginRight: 8 },
              ]}
              testID="wizard-skip"
            >
              <Text style={[fonts.size_14, fonts.gray400]}>Skip</Text>
            </Pressable>
          )}
          <Pressable
            disabled={saving}
            onPress={isReviewStep ? handleSave : handleNext}
            style={[
              layout.flex_1,
              backgrounds.purple500,
              gutters.paddingVertical_12,
              { alignItems: 'center', borderRadius: BORDER_RADIUS, opacity: saving ? 0.6 : 1 },
            ]}
            testID={isReviewStep ? 'wizard-save' : 'wizard-next'}
          >
            {saving ? (
              <ActivityIndicator color={colors.gray50} size="small" />
            ) : (
              <Text style={[fonts.size_14, fonts.bold, fonts.gray50]}>
                {isReviewStep ? 'Save' : 'Next'}
              </Text>
            )}
          </Pressable>
        </View>

      </View>
    </Modal>
  );
}

export default GoalWizard;
