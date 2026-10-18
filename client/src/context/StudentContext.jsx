/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { courseId, enrollmentApi } from '../lib/api';
import { getCompletedLessonIds, getCourseLessons } from '../lib/courseLesson';

const StudentContext = createContext(null);

export function StudentProvider({ children }) {
    const { user } = useAuth();
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const refreshEnrollments = useCallback(async () => {
        if (user?.role !== 'student') return;
        setLoading(true);
        try {
            setEnrollments(await enrollmentApi.mine());
            setError('');
        } catch (requestError) {
            setError(requestError.message);
            setEnrollments([]);
        } finally {
            setLoading(false);
        }
    }, [user?.role]);

    useEffect(() => {
        if (user?.role !== 'student') return;
        let active = true;
        enrollmentApi.mine()
            .then((result) => {
                if (!active) return;
                setEnrollments(result);
                setError('');
            })
            .catch((requestError) => {
                if (!active) return;
                setError(requestError.message);
                setEnrollments([]);
            })
            .finally(() => {
                if (active) setLoading(false);
            });
        return () => { active = false; };
    }, [user?.role]);

    const enrolledCourses = enrollments
        .filter((enrollment) => enrollment.course)
        .map((enrollment) => ({ ...enrollment.course, enrollmentId: enrollment._id, progress: enrollment.progress, completedLessons: getCompletedLessonIds(enrollment) }));
    const getEnrollment = (id) => enrollments.find((enrollment) => courseId(enrollment.course) === String(id));
    const isEnrolled = (id) => Boolean(getEnrollment(id));
    const getCompleted = (id) => getCompletedLessonIds(getEnrollment(id));
    const getProgress = (id) => getEnrollment(id)?.progress || 0;

    const enroll = async (id) => {
        await enrollmentApi.enroll(id);
        await refreshEnrollments();
    };

    const toggleLesson = async (id, lessonId) => {
        const enrollment = getEnrollment(id);
        if (!enrollment) return;
        const completedLessons = getCompletedLessonIds(enrollment);
        const nextLessons = completedLessons.includes(lessonId)
            ? completedLessons.filter((lesson) => lesson !== lessonId)
            : [...completedLessons, lessonId];
        const lessonCount = getCourseLessons(enrollment.course).length;
        const progress = lessonCount ? Math.round((nextLessons.length / lessonCount) * 100) : 0;

        setEnrollments((current) => current.map((item) => item._id === enrollment._id
            ? { ...item, completedLessons: nextLessons, progress }
            : item));
        try {
            await enrollmentApi.updateProgress(enrollment._id, { completedLessons: nextLessons, progress });
        } catch (requestError) {
            await refreshEnrollments();
            throw requestError;
        }
    };

    const value = { enrolledCourses, isEnrolled, enroll, getProgress, getCompleted, toggleLesson, loading, error, refreshEnrollments };
    return <StudentContext.Provider value={value}>{children}</StudentContext.Provider>;
}

export const useStudent = () => useContext(StudentContext);
