import { useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import tick from '../assets/images/doubletick.png';

/* ================= DATA ================= */

var QUESTIONS = [
  'Physical Energy',
  'Appetite',
  'Body Weight',
  'Digestive Problems',
  'Kidney Problems',
  'Burning or Pain',
  'Thyroid Disorder',
  'Diabetes Problem',
  'Blood Pressure',
  'Blood Health',
  'Fever',
  'Immunity',
  'Nerve Problem',
  'Breathing Problem',
  'Skin Health',
  'Hair Problem',
  'Eye Problem',
  'Mouth Issue',
  'Dental Issue',
  'Breast Health',
  'Menstruation',
  'Sexual Health',
  'Memory Health',
];

var OPTIONS = [
  { emoji: '😁', label: 'Very Low', score: 10 },
  { emoji: '🙂', label: 'Low', score: 8 },
  { emoji: '😐', label: 'Normal', score: 6 },
  { emoji: '😟', label: 'High', score: 4 },
  { emoji: '😡', label: 'Very High', score: 2 },
];

/* ================= COMPONENT ================= */

export default function ProcessPage() {
  let router = useRouter();
  let [answers, setAnswers] = useState({});

  let selectOption = function (questionIndex, score) {
    setAnswers(function (prev) {
      return {
        ...prev,
        [questionIndex]: score,
      };
    });
  };

  let submitAssessment = function () {
    let answeredCount = Object.keys(answers).length;

    if (answeredCount !== QUESTIONS.length) {
      Alert.alert('Incomplete', 'Please answer all questions');
      return;
    }

    let total = 0;
    let i = 0;

    for (i = 0; i < QUESTIONS.length; i++) {
      total = total + (answers[i] !== undefined ? answers[i] : 6);
    }

    let healthScore = total / QUESTIONS.length;

    let immunityIndex = QUESTIONS.indexOf('Immunity');
    let immunityScore =
      answers[immunityIndex] !== undefined
        ? answers[immunityIndex]
        : 6;

    router.push({
      pathname: '/assessment/certificate',
      params: {
        healthScore: healthScore.toFixed(1),
        immunityScore: immunityScore.toFixed(1),
      },
    });
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Process</Text>
      <Text style={styles.subtitle}>
        Answer the following questions
      </Text>

      {QUESTIONS.map(function (question, index) {
        return (
          <View key={index} style={styles.questionBox}>
            <Text style={styles.questionText}>
              {index + 1}. {question}
            </Text>

            <View style={styles.optionsRow}>
              {OPTIONS.map(function (option) {
                let selected = answers[index] === option.score;

                return (
                  <TouchableOpacity
                    key={option.label}
                    style={[
                      styles.option,
                      selected && styles.optionActive,
                    ]}
                    onPress={function () {
                      selectOption(index, option.score);
                    }}
                  >
                    <Text style={styles.emoji}>
                      {option.emoji}
                    </Text>

                    <Text style={styles.optionLabel}>
                      {option.label}
                    </Text>

                    {/* 🔵 Blue Tick from Assets (BOTTOM) */}
                    {selected && (
                      <Image
                        source={tick}
                        style={styles.blueTick}
                        resizeMode="contain"
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        );
      })}

      <TouchableOpacity
        style={styles.submitButton}
        onPress={submitAssessment}
      >
        <Text style={styles.submitText}>Submit</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

/* ================= STYLES ================= */

var styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FAFF',
    padding: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#0B4F8A',
  },
  subtitle: {
    color: '#555',
    marginBottom: 18,
  },
  questionBox: {
    marginBottom: 18,
  },
  questionText: {
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  option: {
    width: '18%',
    alignItems: 'center',
    paddingVertical: 6,
    borderRadius: 12,
    position: 'relative',
  },
  optionActive: {
    backgroundColor: '#CDE7FF',
  },
  emoji: {
    fontSize: 26,
  },
  optionLabel: {
    fontSize: 10,
    textAlign: 'center',
    marginTop: 2,
  },

  /* 🔵 Blue Tick */
  blueTick: {
    width: 38,
    height: 38,
    marginTop: 4,
  },

  submitButton: {
    backgroundColor: '#0B4F8A',
    paddingVertical: 14,
    borderRadius: 30,
    marginVertical: 30,
  },
  submitText: {
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 16,
  },
});
