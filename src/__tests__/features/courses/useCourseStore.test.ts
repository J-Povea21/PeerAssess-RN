import { useCourseStore } from "@/src/features/courses/presentation/store/useCourseStore";
import { Course } from "@/src/features/courses/domain/entities/Course";
import { CourseRepository } from "@/src/features/courses/domain/repositories/CourseRepository";

const mockCourse: Course = {
  _id: "course-1",
  name: "Desarrollo Móvil",
  semester: "2026-1",
  status: "active",
  studentCount: 10,
  categoryCount: 2,
  evaluationCount: 3,
  pendingEvaluations: 0,
};

const mockRepo: CourseRepository = {
  getCoursesByStudent: jest.fn().mockResolvedValue([mockCourse]),
  joinCourse: jest.fn().mockResolvedValue(mockCourse),
};

beforeEach(() => {
  useCourseStore.setState({
    courses: [],
    isLoading: false,
    error: null,
    _repo: null,
    _cachedStudentId: null,
    _isFetched: false,
  });
  jest.clearAllMocks();
});

test("fetchCoursesByStudent loads courses into state", async () => {
  useCourseStore.getState().init(mockRepo);
  await useCourseStore.getState().fetchCoursesByStudent("student-1");

  expect(useCourseStore.getState().courses).toEqual([mockCourse]);
  expect(useCourseStore.getState().isLoading).toBe(false);
  expect(useCourseStore.getState().error).toBeNull();
});

test("fetchCoursesByStudent does not re-fetch for same student when courses are loaded", async () => {
  useCourseStore.getState().init(mockRepo);
  await useCourseStore.getState().fetchCoursesByStudent("student-1");
  await useCourseStore.getState().fetchCoursesByStudent("student-1");

  expect(mockRepo.getCoursesByStudent).toHaveBeenCalledTimes(1);
});

test("fetchCoursesByStudent re-fetches for a different student", async () => {
  useCourseStore.getState().init(mockRepo);
  await useCourseStore.getState().fetchCoursesByStudent("student-1");
  await useCourseStore.getState().fetchCoursesByStudent("student-2");

  expect(mockRepo.getCoursesByStudent).toHaveBeenCalledTimes(2);
});

test("joinCourse invalidates cache and refreshes the course list", async () => {
  (mockRepo.getCoursesByStudent as jest.Mock).mockResolvedValue([mockCourse]);
  useCourseStore.getState().init(mockRepo);
  await useCourseStore.getState().fetchCoursesByStudent("student-1");

  jest.clearAllMocks();
  (mockRepo.getCoursesByStudent as jest.Mock).mockResolvedValue([mockCourse]);
  (mockRepo.joinCourse as jest.Mock).mockResolvedValue(mockCourse);

  await useCourseStore.getState().joinCourse("CODE1", "student-1");

  expect(mockRepo.joinCourse).toHaveBeenCalledWith("CODE1", "student-1");
  expect(mockRepo.getCoursesByStudent).toHaveBeenCalledTimes(1);
});

test("fetchCoursesByStudent does not re-fetch when student has zero courses but already fetched", async () => {
  (mockRepo.getCoursesByStudent as jest.Mock).mockResolvedValue([]);
  useCourseStore.getState().init(mockRepo);
  await useCourseStore.getState().fetchCoursesByStudent("student-1");
  await useCourseStore.getState().fetchCoursesByStudent("student-1");

  expect(mockRepo.getCoursesByStudent).toHaveBeenCalledTimes(1);
  expect(useCourseStore.getState().courses).toEqual([]);
});

test("joinCourse sets error state on failure", async () => {
  (mockRepo.joinCourse as jest.Mock).mockRejectedValue(
    new Error("No se encontró un curso con ese código")
  );
  useCourseStore.getState().init(mockRepo);
  await useCourseStore.getState().joinCourse("BADCODE", "student-1");

  expect(useCourseStore.getState().error).toBe("No se encontró un curso con ese código");
});
