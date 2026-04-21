import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import {
  router,
  useLocalSearchParams,
} from 'expo-router';
import {
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import BottomNav from '../../components/BottomNav';
import ScreenNav, {
  SCREEN_NAV_CONTENT_PADDING_TOP,
} from '../../components/ScreenNav';
import WellnessDisclaimer from '../../components/WellnessDisclaimer';
import { usePatientProfile } from '../../hooks/use-patient-profile';
import { useAuth } from '../../providers/AuthProvider';
import {
  prepareHealthAlertNotifications,
  saveAcceptedHealthAlertPlan,
} from '../../services/healthAlerts';
import { getLatestDailyImmunitySummary } from '../../services/medhaDataConnect';
import { goBackOrReplace } from '../../services/navigation';
import {
  fetchPersonalizedDietPlan,
  type PersonalizedDietInput,
  type PersonalizedDietPlan,
} from '../../services/personalizedDiet';

type RouteParams = {
  activityLevel?: string | string[];
  dietType?: string | string[];
  eatingHabits?: string | string[];
  mealsPerDay?: string | string[];
  otherPreferences?: string | string[];
};

type ScreenState = {
  errorMessage: string | null;
  loading: boolean;
  plan: PersonalizedDietPlan | null;
};

function getParam(value?: string | string[]) {
  if (Array.isArray(value)) {
    return value[0] ?? '';
  }

  return value ?? '';
}

function formatDietLabel(value: string) {
  const normalized = value.trim().toLowerCase();

  switch (normalized) {
    case 'nonveg':
      return 'Non-vegetarian';
    case 'veg':
      return 'Vegetarian';
    case 'mixed':
      return 'Mixed diet';
    case 'vegan':
      return 'Vegan';
    default:
      if (!normalized) {
        return 'Mixed diet';
      }

      return normalized
        .split(/[\s_-]+/)
        .filter(Boolean)
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
  }
}

function InfoChip({
  icon,
  label,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
}) {
  return (
    <View style={styles.infoChip}>
      <Ionicons color="#177A18" name={icon} size={14} />
      <Text style={styles.infoChipText}>{label}</Text>
    </View>
  );
}

function BulletRow({
  color = '#1E7D20',
  text,
}: {
  color?: string;
  text: string;
}) {
  return (
    <View style={styles.bulletRow}>
      <View style={[styles.bulletDot, { backgroundColor: color }]} />
      <Text style={styles.bulletText}>{text}</Text>
    </View>
  );
}

function SectionTitle({
  icon,
  title,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
}) {
  return (
    <View style={styles.sectionTitleRow}>
      <View style={styles.sectionTitleIcon}>
        <Ionicons color="#157718" name={icon} size={16} />
      </View>
      <Text style={styles.sectionTitleText}>{title}</Text>
    </View>
  );
}

function MealCard({
  card,
}: {
  card: PersonalizedDietPlan['mealCards'][number];
}) {
  return (
    <View style={styles.sectionCard}>
      <View style={styles.cardHeaderRow}>
        <View>
          <Text style={styles.cardTitle}>{card.name}</Text>
          <Text style={styles.cardTime}>{card.time}</Text>
        </View>

        <View style={styles.cardHeaderBadge}>
          <Ionicons color="#157718" name="restaurant" size={15} />
        </View>
      </View>

      <View style={styles.foodPillRow}>
        {card.foods.map(food => (
          <View key={food} style={styles.foodPill}>
            <Text style={styles.foodPillText}>{food}</Text>
          </View>
        ))}
      </View>

      {card.boosterTip ? (
        <View style={styles.inlineNote}>
          <Ionicons color="#23A127" name="leaf" size={15} />
          <Text style={styles.inlineNoteText}>{card.boosterTip}</Text>
        </View>
      ) : null}

      {card.note ? (
        <Text style={styles.cardFootnote}>{card.note}</Text>
      ) : null}
    </View>
  );
}

function SupportCard({
  card,
}: {
  card: PersonalizedDietPlan['supportCards'][number];
}) {
  return (
    <View style={styles.supportCard}>
      <Text style={styles.supportTitle}>{card.title}</Text>
      <Text style={styles.supportDescription}>{card.description}</Text>

      <View style={styles.supportBullets}>
        {card.bullets.map(item => (
          <BulletRow key={item} text={item} />
        ))}
      </View>
    </View>
  );
}

export default function BoosterDietScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { patientAge, patientGender, patientName } = usePatientProfile();
  const params = useLocalSearchParams<RouteParams>();
  const [refreshCount, setRefreshCount] = useState(0);
  const [savingAcceptedPlan, setSavingAcceptedPlan] = useState(false);
  const [state, setState] = useState<ScreenState>({
    errorMessage: null,
    loading: true,
    plan: null,
  });

  const input = useMemo<PersonalizedDietInput>(() => {
    const eatingHabits = getParam(params.eatingHabits) || 'Moderate';
    const mealsPerDay = getParam(params.mealsPerDay) || '3';
    const activityLevel = getParam(params.activityLevel) || 'Lightly active';
    const dietType = formatDietLabel(getParam(params.dietType) || 'mixed');
    const otherPreferences = getParam(params.otherPreferences).trim();

    return {
      activityLevel,
      dietType,
      eatingHabits,
      mealsPerDay,
      otherPreferences: otherPreferences || undefined,
      patient: {
        age: patientAge,
        gender: patientGender !== '--' ? patientGender : undefined,
        name: patientName,
      },
    };
  }, [
    params.activityLevel,
    params.dietType,
    params.eatingHabits,
    params.mealsPerDay,
    params.otherPreferences,
    patientAge,
    patientGender,
    patientName,
  ]);

  useEffect(() => {
    let active = true;

    async function loadPlan() {
      setState(current => ({
        ...current,
        errorMessage: null,
        loading: true,
      }));

      try {
        let immunity:
          | {
              immunityLevel?: string | null;
              immunityScore?: number;
            }
          | null = null;

        try {
          immunity = await getLatestDailyImmunitySummary();
        } catch (error) {
          console.log('Diet plan immunity context unavailable:', error);
        }

        const plan = await fetchPersonalizedDietPlan(
          {
            ...input,
            immunity: immunity
              ? {
                  level: immunity.immunityLevel ?? undefined,
                  score: immunity.immunityScore,
                }
              : undefined,
          },
          user
        );

        if (!active) {
          return;
        }

        setState({
          errorMessage: null,
          loading: false,
          plan,
        });
      } catch (error) {
        if (!active) {
          return;
        }

        setState({
          errorMessage:
            error instanceof Error
              ? error.message
              : 'Could not generate your personalized diet plan.',
          loading: false,
          plan: null,
        });
      }
    }

    void loadPlan();

    return () => {
      active = false;
    };
  }, [input, refreshCount, user]);

  const metaChips = useMemo(
    () => [
      { icon: 'leaf' as const, label: input.dietType },
      { icon: 'restaurant' as const, label: `${input.mealsPerDay} meals/day` },
      { icon: 'walk' as const, label: input.activityLevel },
      { icon: 'fitness' as const, label: input.eatingHabits },
    ],
    [input.activityLevel, input.dietType, input.eatingHabits, input.mealsPerDay]
  );

  const secondaryChips = useMemo(() => {
    const chips = [
      patientAge ? `${patientAge} yrs` : null,
      patientGender !== '--' ? patientGender : null,
      input.otherPreferences ? input.otherPreferences : null,
    ];

    return chips.filter((item): item is string => Boolean(item));
  }, [input.otherPreferences, patientAge, patientGender]);

  async function handleAcceptPlan() {
    if (!state.plan || savingAcceptedPlan) {
      return;
    }

    try {
      setSavingAcceptedPlan(true);
      await saveAcceptedHealthAlertPlan(state.plan, user?.uid);
      await prepareHealthAlertNotifications(true);
      router.push('/(tabs)/healthalert');
    } catch (error) {
      console.log('Accept plan error:', error);
    } finally {
      setSavingAcceptedPlan(false);
    }
  }

  function handleRetry() {
    setRefreshCount(current => current + 1);
  }

  return (
    <View style={styles.screen}>
      <LinearGradient
        colors={['#18B803', '#58CC39']}
        end={{ x: 1, y: 1 }}
        start={{ x: 0, y: 0 }}
        style={StyleSheet.absoluteFillObject}
      />

      <SafeAreaView edges={['bottom']} style={styles.safeArea}>
        <ScreenNav onBackPress={() => goBackOrReplace('/foodpreferance')} />

        <ScrollView
          contentContainerStyle={[
            styles.content,
            {
              paddingTop: SCREEN_NAV_CONTENT_PADDING_TOP,
              paddingBottom: insets.bottom + 118,
            },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.heroCard}>
            <View style={styles.heroCopy}>
              <Text style={styles.heroEyebrow}>Medha Clinic</Text>
              <Text style={styles.heroTitle}>
                {state.plan?.title ?? '30-Day Personalized Wellness Plan'}
              </Text>
              <Text style={styles.heroSubtitle}>
                {state.plan?.subtitle ??
                  'We are building your personalized wellness plan from your lifestyle, food preferences, and recent wellness context.'}
              </Text>
            </View>

            <View style={styles.heroIllustration}>
              <View style={[styles.heroOrb, styles.heroOrbMain]}>
                <Ionicons color="#FFFFFF" name="nutrition" size={30} />
              </View>
              <View style={[styles.heroOrb, styles.heroOrbLeft]}>
                <Ionicons color="#177A18" name="water" size={18} />
              </View>
              <View style={[styles.heroOrb, styles.heroOrbRight]}>
                <Ionicons color="#177A18" name="leaf" size={18} />
              </View>
              <View style={[styles.heroOrb, styles.heroOrbBottom]}>
                <Ionicons color="#177A18" name="restaurant" size={18} />
              </View>
            </View>
          </View>

          <View style={styles.metaCard}>
            <Text style={styles.generatedForText}>Generated for {patientName}</Text>

            <View style={styles.infoChipRow}>
              {metaChips.map(chip => (
                <InfoChip key={chip.label} icon={chip.icon} label={chip.label} />
              ))}
            </View>

            {secondaryChips.length > 0 ? (
              <View style={styles.secondaryChipRow}>
                {secondaryChips.map(chip => (
                  <View key={chip} style={styles.secondaryChip}>
                    <Text style={styles.secondaryChipText}>{chip}</Text>
                  </View>
                ))}
              </View>
            ) : null}

            <Text style={styles.metaIntro}>
              {state.plan?.intro ??
                'Your plan will focus on practical meals, hydration, and simple routine support that match the inputs you just shared.'}
            </Text>
          </View>

          <WellnessDisclaimer className="mt-4" />

          {state.loading ? (
            <View style={styles.loadingCard}>
              <ActivityIndicator color="#18841A" size="large" />
              <Text style={styles.loadingTitle}>Creating your plan...</Text>
              <Text style={styles.loadingSubtitle}>
                Medha Clinic is turning your inputs into a structured wellness support plan.
              </Text>
            </View>
          ) : null}

          {!state.loading && state.errorMessage ? (
            <View style={styles.errorCard}>
              <SectionTitle icon="warning" title="Plan generation paused" />
              <Text style={styles.errorText}>{state.errorMessage}</Text>
              <TouchableOpacity activeOpacity={0.92} onPress={handleRetry} style={styles.retryButton}>
                <Text style={styles.retryButtonText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {!state.loading && state.plan ? (
            <>
              <View style={styles.focusCard}>
                <Text style={styles.focusLabel}>30-day plan focus</Text>
                <Text style={styles.focusText}>{state.plan.focusSummary}</Text>
              </View>

              <View style={styles.sectionBlock}>
                <SectionTitle icon="restaurant" title="Your Daily Meal Flow" />
                {state.plan.mealCards.map(card => (
                  <MealCard key={`${card.name}-${card.time}`} card={card} />
                ))}
              </View>

              <View style={styles.sectionCard}>
                <SectionTitle icon="water" title="Water" />
                <Text style={styles.sectionLeadText}>{state.plan.hydration.target}</Text>
                <View style={styles.sectionBullets}>
                  {state.plan.hydration.tips.map(tip => (
                    <BulletRow key={tip} text={tip} />
                  ))}
                </View>
              </View>

              <View style={styles.sectionCard}>
                <SectionTitle icon="ban" title={state.plan.avoid.title} />
                <View style={styles.sectionBullets}>
                  {state.plan.avoid.items.map(item => (
                    <BulletRow color="#D44B3E" key={item} text={item} />
                  ))}
                </View>
              </View>

              <View style={styles.sectionCard}>
                <SectionTitle
                  icon="trending-up"
                  title={state.plan.improvementTimeline.title}
                />

                <View style={styles.timelineList}>
                  {state.plan.improvementTimeline.phases.map(phase => (
                    <View key={phase.label} style={styles.timelineRow}>
                      <View style={styles.timelineMarker} />
                      <View style={styles.timelineCopy}>
                        <Text style={styles.timelineLabel}>{phase.label}</Text>
                        <Text style={styles.timelineDetail}>{phase.detail}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.sectionBlock}>
                <SectionTitle icon="sparkles" title="Support You Will Also Get" />
                {state.plan.supportCards.map(card => (
                  <SupportCard key={card.title} card={card} />
                ))}
              </View>

              <View style={styles.cautionCard}>
                <Ionicons color="#158019" name="shield-checkmark" size={18} />
                <Text style={styles.cautionText}>{state.plan.caution}</Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.92}
                onPress={handleAcceptPlan}
                style={styles.acceptButton}
              >
                <Text style={styles.acceptButtonText}>
                  {savingAcceptedPlan
                    ? 'Adding to Wellness Alerts...'
                    : state.plan.acceptLabel}
                </Text>
              </TouchableOpacity>

              <View style={styles.contactCard}>
                <Text style={styles.contactTitle}>Availability & Contact</Text>
                <Text style={styles.contactText}>
                  Need help adjusting this plan or choosing boosters? Use the Support
                  section in the app, then manage reminders from Wellness Alerts.
                </Text>
              </View>
            </>
          ) : null}
        </ScrollView>

        <BottomNav />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#19B503',
  },
  safeArea: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  backButton: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  logo: {
    height: 40,
    width: 132,
  },
  headerSpacer: {
    width: 34,
  },
  heroCard: {
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: 28,
    flexDirection: 'row',
    marginTop: 18,
    overflow: 'hidden',
    padding: 18,
  },
  heroCopy: {
    flex: 1,
    paddingRight: 12,
  },
  heroEyebrow: {
    color: 'rgba(255,255,255,0.84)',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '900',
    lineHeight: 34,
    marginTop: 6,
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.92)',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 10,
  },
  heroIllustration: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    width: 106,
  },
  heroOrb: {
    alignItems: 'center',
    backgroundColor: '#EFFFF0',
    borderRadius: 999,
    justifyContent: 'center',
    position: 'absolute',
  },
  heroOrbMain: {
    backgroundColor: '#4BCB39',
    height: 72,
    width: 72,
  },
  heroOrbLeft: {
    height: 34,
    left: 2,
    top: 18,
    width: 34,
  },
  heroOrbRight: {
    height: 32,
    right: 0,
    top: 10,
    width: 32,
  },
  heroOrbBottom: {
    bottom: 6,
    height: 34,
    right: 18,
    width: 34,
  },
  metaCard: {
    backgroundColor: '#F7FFF2',
    borderRadius: 24,
    marginTop: 16,
    padding: 16,
  },
  generatedForText: {
    color: '#176F18',
    fontSize: 12,
    fontWeight: '700',
  },
  infoChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  infoChip: {
    alignItems: 'center',
    backgroundColor: '#E7F8DD',
    borderRadius: 999,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  infoChipText: {
    color: '#166C18',
    fontSize: 12,
    fontWeight: '700',
  },
  secondaryChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  secondaryChip: {
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  secondaryChipText: {
    color: '#267329',
    fontSize: 11,
    fontWeight: '600',
  },
  metaIntro: {
    color: '#255D28',
    fontSize: 13,
    lineHeight: 20,
    marginTop: 12,
  },
  loadingCard: {
    alignItems: 'center',
    backgroundColor: '#F8FFF4',
    borderRadius: 24,
    marginTop: 18,
    paddingHorizontal: 22,
    paddingVertical: 30,
  },
  loadingTitle: {
    color: '#166C18',
    fontSize: 18,
    fontWeight: '800',
    marginTop: 14,
  },
  loadingSubtitle: {
    color: '#4C7050',
    fontSize: 13,
    lineHeight: 20,
    marginTop: 8,
    textAlign: 'center',
  },
  errorCard: {
    backgroundColor: '#FFF8EF',
    borderRadius: 22,
    marginTop: 18,
    padding: 16,
  },
  errorText: {
    color: '#8D4B14',
    fontSize: 13,
    lineHeight: 20,
    marginTop: 12,
  },
  retryButton: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#19811B',
    borderRadius: 999,
    marginTop: 14,
    minWidth: 112,
    paddingHorizontal: 18,
    paddingVertical: 11,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  focusCard: {
    backgroundColor: '#E6FFD9',
    borderRadius: 22,
    marginTop: 18,
    padding: 16,
  },
  focusLabel: {
    color: '#167519',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  focusText: {
    color: '#235F29',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 21,
    marginTop: 8,
  },
  sectionBlock: {
    marginTop: 18,
  },
  sectionCard: {
    backgroundColor: '#F7FFF3',
    borderRadius: 22,
    marginTop: 12,
    padding: 15,
  },
  sectionTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  sectionTitleIcon: {
    alignItems: 'center',
    backgroundColor: '#E5F8DE',
    borderRadius: 999,
    height: 30,
    justifyContent: 'center',
    width: 30,
  },
  sectionTitleText: {
    color: '#176E18',
    fontSize: 17,
    fontWeight: '800',
    marginLeft: 10,
  },
  sectionLeadText: {
    color: '#246227',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
    marginTop: 12,
  },
  sectionBullets: {
    marginTop: 10,
  },
  cardHeaderRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardTitle: {
    color: '#187019',
    fontSize: 16,
    fontWeight: '800',
  },
  cardTime: {
    color: '#5B815B',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  cardHeaderBadge: {
    alignItems: 'center',
    backgroundColor: '#E6F8DE',
    borderRadius: 999,
    height: 30,
    justifyContent: 'center',
    width: 30,
  },
  foodPillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  foodPill: {
    backgroundColor: '#E8FBE1',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  foodPillText: {
    color: '#28702C',
    fontSize: 12,
    fontWeight: '700',
  },
  inlineNote: {
    alignItems: 'center',
    backgroundColor: '#F2FFF0',
    borderRadius: 14,
    flexDirection: 'row',
    marginTop: 12,
    paddingHorizontal: 10,
    paddingVertical: 9,
  },
  inlineNoteText: {
    color: '#27682B',
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 18,
    marginLeft: 8,
  },
  cardFootnote: {
    color: '#658164',
    fontSize: 11,
    lineHeight: 17,
    marginTop: 10,
  },
  bulletRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
  bulletDot: {
    borderRadius: 999,
    height: 8,
    marginRight: 10,
    marginTop: 7,
    width: 8,
  },
  bulletText: {
    color: '#28652C',
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
  },
  timelineList: {
    marginTop: 12,
  },
  timelineRow: {
    flexDirection: 'row',
    marginTop: 10,
  },
  timelineMarker: {
    backgroundColor: '#25A62A',
    borderRadius: 999,
    height: 12,
    marginRight: 12,
    marginTop: 6,
    width: 12,
  },
  timelineCopy: {
    flex: 1,
  },
  timelineLabel: {
    color: '#176E18',
    fontSize: 13,
    fontWeight: '800',
  },
  timelineDetail: {
    color: '#4D7450',
    fontSize: 12,
    lineHeight: 19,
    marginTop: 3,
  },
  supportCard: {
    backgroundColor: '#F7FFF3',
    borderRadius: 22,
    marginTop: 12,
    padding: 15,
  },
  supportTitle: {
    color: '#176E18',
    fontSize: 16,
    fontWeight: '800',
  },
  supportDescription: {
    color: '#4F7653',
    fontSize: 13,
    lineHeight: 20,
    marginTop: 8,
  },
  supportBullets: {
    marginTop: 8,
  },
  cautionCard: {
    alignItems: 'flex-start',
    backgroundColor: '#E9FFE0',
    borderRadius: 18,
    flexDirection: 'row',
    marginTop: 18,
    padding: 14,
  },
  cautionText: {
    color: '#28652C',
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    marginLeft: 10,
  },
  acceptButton: {
    alignItems: 'center',
    backgroundColor: '#0E7D12',
    borderRadius: 999,
    marginTop: 18,
    paddingHorizontal: 18,
    paddingVertical: 15,
  },
  acceptButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  contactCard: {
    backgroundColor: '#F7FFF3',
    borderRadius: 20,
    marginTop: 16,
    padding: 15,
  },
  contactTitle: {
    color: '#176E18',
    fontSize: 15,
    fontWeight: '800',
  },
  contactText: {
    color: '#507853',
    fontSize: 12,
    lineHeight: 19,
    marginTop: 8,
  },
});
