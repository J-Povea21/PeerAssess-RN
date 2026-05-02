import React from "react";
import { View, Text } from "react-native";

type Member = {
  name: string;
  email: string;
};

const MemberRow = ({ member }: { member: Member }) => {
  const initials = getInitials(member.name);

  return (
    <View style={{ flexDirection: "row", padding: 16 }}>
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: "#ccc",
          justifyContent: "center",
          alignItems: "center",
          marginRight: 12,
        }}
      >
        <Text>{initials}</Text>
      </View>

      <View>
        <Text>{member.name}</Text>
        <Text>{member.email}</Text>
      </View>
    </View>
  );
};

function getInitials(name: string) {
  if (!name) return "?";

  const parts = name.trim().split(" ");

  if (parts.length === 1) {
    return parts[0][0].toUpperCase();
  }

  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export default MemberRow;