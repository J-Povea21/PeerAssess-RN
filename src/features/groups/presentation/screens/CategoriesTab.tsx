import React, { useEffect } from "react";
import { Text, FlatList, TouchableOpacity } from "react-native";
import { useGroupStore } from "../useGroupStore";
import { useAuthStore } from "../../../auth/presentation/useAuthStore";
import { useNavigation } from "@react-navigation/native";

export default function CategoriesTab({
  courseId,
}: {
  courseId: string;
}) {
  const navigation = useNavigation<any>();

  const { categoriesByCourse, loadCategories } =
    useGroupStore();

  const { canonicalUserId } = useAuthStore();

  const categories =
    categoriesByCourse[courseId] || [];

  useEffect(() => {
    loadCategories(courseId);
  }, [courseId, loadCategories]);

  return (
    <FlatList
      data={categories}
      keyExtractor={(item) => item._id}
      renderItem={({ item }) => (
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("GroupList", {
              categoryId: item._id,
              title: item.name,
              studentId: canonicalUserId,
            })
          }
          style={{
            padding: 16,
            borderBottomWidth: 1,
          }}
        >
          <Text>{item.name}</Text>
        </TouchableOpacity>
      )}
    />
  );
}