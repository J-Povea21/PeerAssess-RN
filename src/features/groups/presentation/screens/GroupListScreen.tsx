import React, { useEffect } from "react";
import { View, Text, FlatList } from "react-native";
import { useRoute } from "@react-navigation/native";

import { useGroupStore } from "../useGroupStore";

export default function GroupListScreen() {
  const route = useRoute<any>();

  const { categoryId, studentId } = route.params;

  const {
    groupsByCategory,
    loadGroups,
    loadMemberships,
    getUserGroupForCategory,
  } = useGroupStore();

  const groups = groupsByCategory[categoryId] || [];

  useEffect(() => {
    loadGroups(categoryId);
    loadMemberships(studentId);
  }, [categoryId]);

  const userGroupId =
    getUserGroupForCategory(categoryId);

  return (
    <FlatList
      data={groups}
      keyExtractor={(item) => item._id}
      renderItem={({ item }) => {
        const isUserGroup =
          item._id === userGroupId;

        return (
          <View
            style={{
              padding: 16,
              borderBottomWidth: 1,
              backgroundColor: isUserGroup
                ? "#d0f0ff"
                : "white",
            }}
          >
            <Text>
              {item.name}
              {isUserGroup && " (Tu grupo)"}
            </Text>
          </View>
        );
      }}
    />
  );
}