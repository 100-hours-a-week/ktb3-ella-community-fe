import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Layout from "@/components/layout/layout.jsx";
import LoginPage from "@/features/auth/routes/login-page.jsx";
import SignUpPage from "@/features/auth/routes/signup-page";
import PostList from "@/features/posts/routes/post-list";
import PostDetail from "@/features/posts/routes/post-detail";
import PostCreate from "@/features/posts/routes/post-create";
import PostUpdate from "@/features/posts/routes/post-update";
import ProfileEdit from "@/features/users/routes/profile-edit.jsx";
import PasswordEdit from "@/features/users/routes/password-edit.jsx";
import ProtectedRoute from "@/components/protected-route.jsx";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/posts" element={<PostList />} />
            <Route path="/posts/:postId" element={<PostDetail />} />
            <Route path="/post-create" element={<PostCreate />} />
            <Route path="/posts/:postId/edit" element={<PostUpdate />} />
            <Route path="/profile/edit" element={<ProfileEdit />} />
            <Route path="/profile/password" element={<PasswordEdit />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
