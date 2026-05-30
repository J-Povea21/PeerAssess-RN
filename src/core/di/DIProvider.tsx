import React, { createContext, ReactNode, useContext, useMemo } from "react";

import { AuthLocalDataSourceImpl } from "@/src/features/auth/data/datasources/local/AuthLocalDataSourceImpl";
import { AuthRemoteDataSourceImpl } from "@/src/features/auth/data/datasources/remote/AuthRemoteDataSourceImpl";
import { AuthRepositoryImpl } from "@/src/features/auth/data/repositories/AuthRepositoryImpl";
import { useAuthStore } from "@/src/features/auth/presentation/store/useAuthStore";
import { CourseLocalDataSourceImpl } from "@/src/features/courses/data/datasources/local/CourseLocalDataSourceImpl";
import { CourseRemoteDataSourceImpl } from "@/src/features/courses/data/datasources/remote/CourseRemoteDataSourceImpl";
import { CourseRepositoryImpl } from "@/src/features/courses/data/repositories/CourseRepositoryImpl";
import { useCourseStore } from "@/src/features/courses/presentation/store/useCourseStore";
import { GroupLocalDataSourceImpl } from "@/src/features/groups/data/datasources/local/GroupLocalDataSourceImpl";
import { GroupRemoteDataSourceImpl } from "@/src/features/groups/data/datasources/remote/GroupRemoteDataSourceImpl";
import { GroupRepositoryImpl } from "@/src/features/groups/data/repositories/GroupRepositoryImpl";
import { useGroupStore } from "@/src/features/groups/presentation/store/useGroupStore";
import { EvaluationRemoteDataSourceImpl } from "@/src/features/evaluations/data/datasources/remote/EvaluationRemoteDataSourceImpl";
import { EvaluationRepositoryImpl } from "@/src/features/evaluations/data/repositories/EvaluationRepositoryImpl";
import { useEvaluationStore } from "@/src/features/evaluations/presentation/store/useEvaluationStore";
import { AnalyticsRemoteDataSourceImpl } from "@/src/features/analytics/data/datasources/remote/AnalyticsRemoteDataSourceImpl";
import { AnalyticsRepositoryImpl } from "@/src/features/analytics/data/repositories/AnalyticsRepositoryImpl";
import { useAnalyticsStore } from "@/src/features/analytics/presentation/store/useAnalyticsStore";
import Container from "./container";
import { TOKENS } from "./tokens";

const DIContext = createContext<Container | null>(null);

export function DIProvider({ children }: { children: ReactNode }) {
  const container = useMemo(() => {
    const c = new Container();

    const useLocal = __DEV__ && process.env.EXPO_PUBLIC_USE_LOCAL_AUTH === "true";

    // Auth
    const authDS = useLocal ? new AuthLocalDataSourceImpl() : new AuthRemoteDataSourceImpl();
    const authRepo = new AuthRepositoryImpl(authDS);
    c.register(TOKENS.AuthRemoteDS, authDS).register(TOKENS.AuthRepo, authRepo);
    useAuthStore.getState().init(authRepo);

    // Courses
    const courseDS = useLocal ? new CourseLocalDataSourceImpl() : new CourseRemoteDataSourceImpl();
    const courseRepo = new CourseRepositoryImpl(courseDS);
    c.register(TOKENS.CourseRemoteDS, courseDS).register(TOKENS.CourseRepo, courseRepo);
    useCourseStore.getState().init(courseRepo);

    // Groups
    const groupDS = useLocal ? new GroupLocalDataSourceImpl() : new GroupRemoteDataSourceImpl();
    const groupRepo = new GroupRepositoryImpl(groupDS);
    c.register(TOKENS.GroupRemoteDS, groupDS).register(TOKENS.GroupRepo, groupRepo);
    useGroupStore.getState().init(groupRepo);

    // Evaluations
    const evaluationDS = new EvaluationRemoteDataSourceImpl();
    const evaluationRepo = new EvaluationRepositoryImpl(evaluationDS);
    c.register(TOKENS.EvaluationRemoteDS, evaluationDS)
     .register(TOKENS.EvaluationRepo, evaluationRepo);
    useEvaluationStore.getState().init(evaluationRepo);

    // Analytics (teacher) — aggregates existing tables, no auth dependency needed
    const analyticsDS = new AnalyticsRemoteDataSourceImpl();
    const analyticsRepo = new AnalyticsRepositoryImpl(analyticsDS);
    c.register(TOKENS.AnalyticsRemoteDS, analyticsDS)
     .register(TOKENS.AnalyticsRepo, analyticsRepo);
    useAnalyticsStore.getState().init(analyticsRepo);

    return c;
  }, []);

  return <DIContext.Provider value={container}>{children}</DIContext.Provider>;
}

export function useDI() {
  const context = useContext(DIContext);
  if (!context) throw new Error("useDI must be used inside DIProvider");
  return context;
}