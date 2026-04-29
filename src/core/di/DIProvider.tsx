import React, { createContext, ReactNode, useContext, useMemo } from "react";

import { AuthLocalDataSourceImpl } from "@/src/features/auth/data/datasources/local/AuthLocalDataSourceImpl";
import { AuthRemoteDataSourceImpl } from "@/src/features/auth/data/datasources/remote/AuthRemoteDataSourceImpl";
import { AuthRepositoryImpl } from "@/src/features/auth/data/repositories/AuthRepositoryImpl";
import { useAuthStore } from "@/src/features/auth/presentation/store/useAuthStore";
import { CourseLocalDataSourceImpl } from "@/src/features/courses/data/datasources/local/CourseLocalDataSourceImpl";
import { CourseRemoteDataSourceImpl } from "@/src/features/courses/data/datasources/remote/CourseRemoteDataSourceImpl";
import { CourseRepositoryImpl } from "@/src/features/courses/data/repositories/CourseRepositoryImpl";
import { useCourseStore } from "@/src/features/courses/presentation/store/useCourseStore";
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

    return c;
  }, []);

  return <DIContext.Provider value={container}>{children}</DIContext.Provider>;
}

export function useDI() {
  const context = useContext(DIContext);
  if (!context) throw new Error("useDI must be used inside DIProvider");
  return context;
}