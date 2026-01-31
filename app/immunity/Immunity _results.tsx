import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { fetchImmunityResult } from "../../services/openai";

export default function ImmunityResult() {
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState(false);

async function handleFetch() {
  setLoading(true);
  setResult("");

  const prompt = `
How to treat naturopathy immunity based on daily and weekly immunity check results.
`;

  try {
    const aiText = await fetchImmunityResult(prompt);
    setResult(aiText);
  } catch (error: any) {
    console.log("ERROR:", error.message);
    setResult(error.message || "Failed to load result.");
  }

  setLoading(false);
}


  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text
        style={{
          fontSize: 20,
          fontWeight: "700",
          color: "#0b4ea2",
          marginBottom: 12,
        }}
      >
        Immunity Check Result
      </Text>

      <TouchableOpacity
        onPress={handleFetch}
        style={{
          backgroundColor: "#1fa2ff",
          padding: 14,
          borderRadius: 12,
          alignItems: "center",
        }}
      >
        <Text style={{ color: "#fff", fontSize: 16 }}>
          Get Immunity Result
        </Text>
      </TouchableOpacity>

      {loading && (
        <ActivityIndicator
          size="large"
          color="#1fa2ff"
          style={{ marginTop: 20 }}
        />
      )}

      {!loading && result !== "" && (
        <View
          style={{
            marginTop: 20,
            backgroundColor: "#fff",
            padding: 16,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: "#dce9f9",
          }}
        >
          <Text
            style={{
              color: "#1f3c66",
              fontSize: 14,
              lineHeight: 20,
            }}
          >
            {result}
          </Text>
        </View>
      )}
    </ScrollView>
  );
}
