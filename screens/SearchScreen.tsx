import React, { useState, useRef } from "react";
import { View, TextInput, StyleSheet, ActivityIndicator, TouchableOpacity, Text, I18nManager } from "react-native";
import debounce from "lodash.debounce";
import { observer } from "mobx-react";
import StoreListView from "../components/StoreListView";
import { menuStore } from "../stores/menu";
import { useTranslation } from "react-i18next";
import { useNavigation } from "@react-navigation/native";
import Icon from "../components/icon";

const SearchScreen = observer(() => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);

  const debouncedSearch = useRef(
    debounce(async (q) => {
      if (!q || q.length < 2) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        // Use menuStore to call the API
        const res: any = await menuStore.searchMenu(q);
        setResults(res?.stores || []);
      } catch (e) {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300)
  ).current;

  const onChangeText = (text) => {
    setQuery(text);
    debouncedSearch(text);
  };

  const onClear = () => {
    setQuery("");
    setResults([]);
  };

  const isRTL = I18nManager.isRTL;

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        {/* Chevron right/back icon */}
        <TouchableOpacity
          style={[styles.chevronIcon,]}
          onPress={() => navigation.goBack()}
          accessibilityLabel={t("go_back") || "Go back"}
        >
          <Icon icon="chevron" size={24} style={{ color: "#888" }} />
        </TouchableOpacity>
        <TextInput
          style={[styles.input, isRTL ? { paddingLeft: 36 } : { paddingRight: 36 }]}
          placeholder={t("search")}
          value={query}
          onChangeText={onChangeText}
          autoFocus
        />
        {query.length > 0 && (
          <TouchableOpacity style={styles.clearIcon} onPress={onClear} accessibilityLabel={t("clear_search") || "Clear search"}>
            <Text style={{ fontSize: 20, color: "#888" }}>×</Text>
          </TouchableOpacity>
        )}
      </View>
      {loading && <ActivityIndicator />}
      <StoreListView stores={results} />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  inputContainer: {
    margin: 16,
    position: "relative",
    justifyContent: "center",
  },
  input: {
    padding: 12,
    borderRadius: 16,
    backgroundColor: "#f0f0f0",
    fontSize: 18,
    textAlign: "right",
    // paddingRight or paddingLeft is set dynamically
  },
  clearIcon: {
    position: "absolute",
    right: 12,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
    width: 30,
  },
  chevronIcon: {
    position: "absolute",
    top: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
    width: 30,
    zIndex: 2,
    left:5
  },
});

export default SearchScreen; 