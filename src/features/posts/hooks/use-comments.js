import { useCallback, useState } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import {
  createComment,
  deleteComment,
  getComments,
  updateComment,
} from "@/features/posts/api/comment-api.js";

export const useComments = (postId) => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["comments", postId, page],
    queryFn: () => getComments({ postId, page }),
    placeholderData: keepPreviousData,
  });

  const invalidateComments = useCallback(() => {
    queryClient.invalidateQueries(["comments", postId]);
  }, [postId, queryClient]);

  const createMutation = useMutation({
    mutationFn: (content) => createComment({ postId, content }),
    onSuccess: () => {
      invalidateComments();
      setPage(1);
    },
    onError: () => alert("댓글 등록에 실패했습니다."),
  });

  const updateMutation = useMutation({
    mutationFn: ({ commentId, content }) =>
      updateComment({ commentId, content }),
    onSuccess: invalidateComments,
    onError: (error) => {
      if (error.status === 403) alert("수정 권한이 없습니다.");
      else alert("댓글 수정 실패");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (commentId) => deleteComment({ commentId }),
    onSuccess: invalidateComments,
    onError: (error) => {
      if (error.status === 403) alert("삭제 권한이 없습니다.");
      else alert("댓글 삭제 실패");
    },
  });

  const handleCreate = useCallback(
    (content, options) => createMutation.mutate(content, options),
    [createMutation]
  );

  const handleUpdate = useCallback(
    (payload, options) => updateMutation.mutate(payload, options),
    [updateMutation]
  );

  const handleDelete = useCallback(
    (commentId, options) => deleteMutation.mutate(commentId, options),
    [deleteMutation]
  );

  return {
    page,
    setPage,
    comments: data?.content || [],
    totalPages: data?.totalPages || 1,
    isLoading,
    createComment: handleCreate,
    isCreating: createMutation.isPending,
    updateComment: handleUpdate,
    isUpdating: updateMutation.isPending,
    deleteComment: handleDelete,
    isDeleting: deleteMutation.isPending,
  };
};
