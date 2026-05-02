import React, { useMemo } from "react";
import { FlatList } from "react-native";

import { useGroupStore } from "../useGroupStore";
import MemberRow from "../components/MemberRow";

type MemberUI = {
  name: string;
  email: string;
};

const MembersTab = () => {
  const { memberships } = useGroupStore();

  const uniqueMembers = useMemo(() => {
    const map = new Map<string, MemberUI>();

    memberships.forEach((member: any) => {
      if (!member?.email || !member?.name) return;

      if (!map.has(member.email)) {
        map.set(member.email, {
          name: member.name,
          email: member.email,
        });
      }
    });

    return Array.from(map.values());
  }, [memberships]);

  return (
    <FlatList<MemberUI>
      data={uniqueMembers}
      keyExtractor={(item) => item.email}
      renderItem={({ item }) => (
        <MemberRow member={item} />
      )}
    />
  );
};

export default MembersTab;