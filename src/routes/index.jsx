import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "@/features/auth/routes/login-page.jsx";
import SignupRoute from "./auth/signup";
import PostListRoute from "./posts/post-list";
import PostDetailRoute from "./posts/post-detail";
import ProfileEditRoute from "./profile/profile-edit";
import PasswordEditRoute from "./profile/password-edit";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupRoute />} />
        <Route path="/posts" element={<PostListRoute />} />
        <Route path="/posts/:postId" element={<PostDetailRoute />} />
        <Route path="/profile/edit" element={<ProfileEditRoute />} />
        <Route path="/profile/password" element={<PasswordEditRoute />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
