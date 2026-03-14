import { useEffect, useRef, useState } from 'react';
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

import { detectCategory } from '@/constants/categoryKeywords';
import { generateGoalStatements, generateKeywords } from '@/services/suggestions';

const BORDER_RADIUS = 8;
const CHIP_RADIUS = 16;
const INPUT_BORDER_WIDTH = 1;
const DEBOUNCE_MS = 600;
const CATEGORIES = ['Family', 'Health', 'Money', 'Career', 'Travel', 'Others'] as const;
const TOTAL_STEPS = 4;

type Category = (typeof CATEGORIES)[number];

type Props = {
  futureSelf?: FutureSelf[];
  goal: Goal | undefined;
  onClose: () => void;
  onSave: (goal: Goal, futureSelf?: FutureSelf) => void;
  visible: boolean;
};

function GoalWizard({ futureSelf, goal, onClose, onSave, visible }: Props) {
  const { backgrounds, colors, fonts, gutters, layout } = useTheme();

  // Step state
  const [step, setStep] = useState(1);

  // Step 1 — Intent
  const [intent, setIntent] = useState('');
  const [statementSuggestions, setStatementSuggestions] = useState<string[]>([]);
  const [loadingStatements, setLoadingStatements] = useState(false);
  const isInitialLoad = useRef(false);
  const statementDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Step 2 — Goal Statement
  const [statement, setStatement] = useState('');

  // Step 3 — Future Vision
  const [vision, setVision] = useState('');

  // Step 4 — Review
  const [category, setCategory] = useState<Category>('Others');
  const [keywords, setKeywords] = useState<string[]>([]);
  const [customKeyword, setCustomKeyword] = useState('');
  const [loadingKeywords, setLoadingKeywords] = useState(false);
  const keywordDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // Reset all state when modal opens
  useEffect(() => {
    if (!visible) return;
    isInitialLoad.current = true;
    setStep(1);
    setIntent(goal?.statement ?? '');
    setStatementSuggestions([]);
    setLoadingStatements(false);
    setStatement(goal?.statement ?? '');
    const existing5yr = futureSelf?.find(f => f.timeframe === '5yr');
    setVision(existing5yr?.narrative ?? '');
    setCategory((goal?.category as Category | undefined) ?? 'Others');
    setKeywords(goal?.keywords ?? []);
    setCustomKeyword('');
    setError('');
    setSaving(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  // Step 1: generate goal statement suggestions from intent (debounced)
  useEffect(() => {
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      return;
    }
    const trimmed = intent.trim();
    if (!trimmed) {
      setStatementSuggestions([]);
      return;
    }
    if (statementDebounceRef.current) clearTimeout(statementDebounceRef.current);
    setLoadingStatements(true);
    statementDebounceRef.current = setTimeout(async () => {
      const suggestions = await generateGoalStatements(trimmed);
      setStatementSuggestions(suggestions);
      setLoadingStatements(false);
    }, DEBOUNCE_MS);
    return () => {
      if (statementDebounceRef.current) clearTimeout(statementDebounceRef.current);
    };
  }, [intent]);

  // Step 4: auto-detect category and generate keywords when arriving at step 4
  useEffect(() => {
    if (step !== 4) return;
    const trimmed = statement.trim();
    if (!trimmed) return;
    setCategory(detectCategory(trimmed) as Category);
    if (keywordDebounceRef.current) clearTimeout(keywordDebounceRef.current);
    setLoadingKeywords(true);
    keywordDebounceRef.current = setTimeout(async () => {
      const kws = await generateKeywords(`${intent} ${trimmed}`);
      setKeywords(kws);
      setLoadingKeywords(false);
    }, DEBOUNCE_MS);
    return () => {
      if (keywordDebounceRef.current) clearTimeout(keywordDebounceRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  function handleBack() {
    if (step === 1) {
      if (intent.trim()) {
        Alert.alert('Discard goal?', 'Your progress will be lost.', [
          { style: 'cancel', text: 'Keep editing' },
          { onPress: onClose, style: 'destructive', text: 'Discard' },
        ]);
      } else {
        onClose();
      }
      return;
    }
    setStep(s => s - 1);
  }

  function handleNext() {
    setError('');
    if (step === 1) {
      if (!intent.trim()) return;
      if (!statement) setStatement(intent.trim());
      setStep(2);
      return;
    }
    if (step === 2) {
      if (!statement.trim()) {
        setError('Please enter your goal.');
        return;
      }
      setStep(3);
      return;
    }
    if (step === 3) {
      setStep(4);
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

  function renderProgress() {
    return (
      <View style={[layout.row, layout.itemsCenter, { alignSelf: 'center', gap: 8, marginBottom: 16 }]}>
        {Array.from({ length: TOTAL_STEPS }, (_, i) => (
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

  return (
    <Modal animationType="slide" onRequestClose={handleBack} transparent visible={visible}>
      <View style={[layout.flex_1, { backgroundColor: 'rgba(0,0,0,0.4)' }]} />
      <View
        style={[
          backgrounds.gray50,
          gutters.paddingHorizontal_24,
          gutters.paddingTop_24,
          gutters.paddingBottom_40,
          { position: 'absolute', bottom: 0, left: 0, right: 0 },
        ]}
      >
        {renderProgress()}

        {/* Back / Close button */}
        <Pressable onPress={handleBack} style={{ alignSelf: 'flex-start', marginBottom: 8 }}>
          <Text style={[fonts.size_14, { color: colors.gray400 }]}>
            {step === 1 ? '✕ Close' : '← Back'}
          </Text>
        </Pressable>

        {/* ── STEP 1: Intent ── */}
        {step === 1 && (
          <View>
            <Text style={[fonts.size_16, fonts.bold, fonts.gray800, gutters.marginBottom_12]}>
              What do you want to achieve in your life?
            </Text>
            <TextInput
              autoFocus
              multiline
              onChangeText={setIntent}
              placeholder="Describe what matters to you..."
              placeholderTextColor={colors.gray400}
              style={[
                fonts.size_14,
                fonts.gray800,
                gutters.paddingVertical_8,
                { borderBottomWidth: INPUT_BORDER_WIDTH, borderColor: colors.gray200 },
              ]}
              testID="wizard-intent-input"
              value={intent}
            />
            {loadingStatements && (
              <ActivityIndicator
                color={colors.purple500}
                size="small"
                style={gutters.marginTop_12}
              />
            )}
          </View>
        )}

        {/* ── STEP 2: Goal Statement ── */}
        {step === 2 && (
          <View>
            <Text style={[fonts.size_16, fonts.bold, fonts.gray800, gutters.marginBottom_12]}>
              Here's your goal — make it yours
            </Text>
            {loadingStatements ? (
              <ActivityIndicator color={colors.purple500} size="small" style={gutters.marginBottom_12} />
            ) : (
              statementSuggestions.map(s => (
                <Pressable
                  key={s}
                  onPress={() => setStatement(s)}
                  style={[
                    gutters.paddingHorizontal_12,
                    gutters.paddingVertical_12,
                    {
                      backgroundColor: statement === s ? colors.purple100 : colors.gray200,
                      borderColor: statement === s ? colors.purple500 : 'transparent',
                      borderRadius: BORDER_RADIUS,
                      borderWidth: 1,
                      marginBottom: 8,
                    },
                  ]}
                >
                  <Text style={[fonts.size_14, fonts.gray800]}>{s}</Text>
                </Pressable>
              ))
            )}
            <TextInput
              multiline
              onChangeText={setStatement}
              placeholder="Or write your own goal..."
              placeholderTextColor={colors.gray400}
              style={[
                fonts.size_14,
                fonts.gray800,
                gutters.paddingVertical_8,
                gutters.marginTop_8,
                { borderBottomWidth: INPUT_BORDER_WIDTH, borderColor: colors.gray200 },
              ]}
              testID="wizard-statement-input"
              value={statement}
            />
            {error ? (
              <Text style={[fonts.size_12, gutters.marginTop_8, { color: colors.red500 }]}>
                {error}
              </Text>
            ) : null}
          </View>
        )}

        {/* ── STEP 3: Future Vision ── */}
        {step === 3 && (
          <View>
            <Text style={[fonts.size_16, fonts.bold, fonts.gray800, gutters.marginBottom_12]}>
              Where will you be in 5 years if you achieve this?
            </Text>
            <TextInput
              autoFocus
              multiline
              onChangeText={setVision}
              placeholder="Describe your future self..."
              placeholderTextColor={colors.gray400}
              style={[
                fonts.size_14,
                fonts.gray800,
                gutters.paddingVertical_8,
                { borderBottomWidth: INPUT_BORDER_WIDTH, borderColor: colors.gray200 },
              ]}
              testID="wizard-vision-input"
              value={vision}
            />
          </View>
        )}

        {/* ── STEP 4: Review ── */}
        {step === 4 && (
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={[fonts.size_16, fonts.bold, fonts.gray800, gutters.marginBottom_16]}>
              Review your goal
            </Text>

            <Text style={[fonts.size_12, fonts.gray400]}>Goal</Text>
            <Text style={[fonts.size_14, fonts.gray800, gutters.marginBottom_16]}>
              {statement}
            </Text>

            <Text style={[fonts.size_12, fonts.gray400]}>5-year vision</Text>
            <Text style={[fonts.size_14, fonts.gray800, gutters.marginBottom_16]}>
              {vision.trim() || 'Not set'}
            </Text>

            <Text style={[fonts.size_12, fonts.gray400, gutters.marginBottom_8]}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={gutters.marginBottom_16}>
              {CATEGORIES.map(cat => (
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
                  <Text
                    style={[
                      fonts.size_12,
                      { color: category === cat ? colors.gray50 : colors.gray800 },
                    ]}
                  >
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

            <View style={[layout.row, layout.itemsCenter, gutters.marginBottom_16]}>
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
              <Text style={[fonts.size_12, gutters.marginBottom_8, { color: colors.red500 }]}>
                {error}
              </Text>
            ) : null}
          </ScrollView>
        )}

        {/* Navigation buttons */}
        <View style={[layout.row, gutters.marginTop_24]}>
          {step === 3 && (
            <Pressable
              onPress={() => setStep(4)}
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
            onPress={step === 4 ? handleSave : handleNext}
            style={[
              layout.flex_1,
              backgrounds.purple500,
              gutters.paddingVertical_12,
              { alignItems: 'center', borderRadius: BORDER_RADIUS, opacity: saving ? 0.6 : 1 },
            ]}
            testID={step === 4 ? 'wizard-save' : 'wizard-next'}
          >
            {saving ? (
              <ActivityIndicator color={colors.gray50} size="small" />
            ) : (
              <Text style={[fonts.size_14, fonts.bold, fonts.gray50]}>
                {step === 4 ? 'Save' : 'Next'}
              </Text>
            )}
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

export default GoalWizard;
