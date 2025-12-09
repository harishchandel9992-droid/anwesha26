"use client";
import { useAuthUser } from "../context/AuthUserContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import toast from "react-hot-toast";

export default function ProtectedRoute({ requiredRole, children }) {
    const { currentUser, loading } = useAuthUser();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (!currentUser) {
                toast.error("Login required");
                router.replace("/login");
            } else if (requiredRole && currentUser.role !== requiredRole && currentUser.role !== "admin") {
                toast.error("Unauthorized access");
                router.replace("/profile");
            }
        }
    }, [loading, currentUser]);

    if (loading) return <div>Checking access...</div>;

    return <>{children}</>;
}
