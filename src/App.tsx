import { SetupRequired } from "./components/AppState/SetupRequired";
import { AuthCard } from "./components/AuthCard";
import { DeletedCard } from "./components/DeletedCard/DeletedCard";
import { DoneCard } from "./components/DoneCard/DoneCard";
import { LinksCard } from "./components/LinksCard/LinksCard";
import { NotesCard } from "./components/NotesCard.tsx";
import { NotNowList } from "./components/NotNowList.tsx";
import { TagsCard } from "./components/Tags/TagsCard";
import { TodoCloud } from "./components/TodoCloud/TodoCloud";
import { isSupabaseConfigured } from "./supabase";
import { Box } from "@mui/material";
import { Header } from "./components/Layout";
import { AddTask } from "./components/TodoCloud/AddTask.tsx";
import { LoadingComponent } from "./components/Layout/LoadingComponent.tsx";
import { useAppInit } from "./hooks/app.ts";
import { NotificationsToast } from "./components/Layout/NotificationAlert";

export default function App() {
  const {
    session,
    isLoadingSession,

    saveError,

    refreshTodoList,

    todos,
    deletedTodos,
    addTodoText,
    deleteTodo,
    updateTodo,
    clearDeletedItems,
    removeDeletedItem,
    restoreDeletedItem,
    isLoadingTodos,
    text,
    setText,

    tags,
    deleteTag,
    updateTags,

    links,
    notes,

    updateLinks,
    updateNotes,

    notification,
    setNotification,
    closeNotification,
  } = useAppInit();

  if (!isSupabaseConfigured) return <SetupRequired />;
  if (!session) return <AuthCard />;
  if (isLoadingSession) return <LoadingComponent loading />;

  return (
    <Box sx={{ bgcolor: "background.body", color: "text.primary" }}>
      {saveError && <p>{saveError}</p>}

      <NotificationsToast notification={notification} onClose={closeNotification} />

      <AddTask
        todos={todos}
        isLoadingTodos={isLoadingTodos}
        text={text}
        onAddTodoText={addTodoText}
        onTextChange={setText}
      />

      <Box
        sx={{
          paddingTop: 2,
          minHeight: "calc(100vh - 16px)",
          width: "min(1300px, calc(100% - 32px))",
          display: "flex",
          gap: 2,
          margin: "0 auto",
        }}
      >
        <Box
          sx={{
            gap: 2,
            display: "flex",
            flexDirection: "column",
            width: 230,
            minWidth: 230,
            maxHeight: "calc(100vh - 24px)",
          }}
        >
          <TagsCard tags={tags} updateTags={updateTags} setNotification={setNotification} onDeleteTag={deleteTag} />
          <LinksCard links={links} updateLinks={updateLinks} setNotification={setNotification} />
          <NotNowList tags={tags} todos={todos} updateTodo={updateTodo} />
          <NotesCard notes={notes} setNotes={updateNotes} />
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
          <Header isLoadingTodos={isLoadingTodos} onRefresh={refreshTodoList} email={session.user.email} />
          <TodoCloud todos={todos} updateTodo={updateTodo} isLoadingTodos={isLoadingTodos} tags={tags} />
        </Box>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            width: 250,
            minWidth: 250,
            maxHeight: "calc(100vh - 24px)",
          }}
        >
          <DoneCard todos={todos} updateTodo={updateTodo} tags={tags} onDeleteTodo={deleteTodo} />
          <DeletedCard
            deletedTodos={deletedTodos}
            onClear={clearDeletedItems}
            onRemoveDeletedTodo={removeDeletedItem}
            onRestoreDeletedTodo={restoreDeletedItem}
          />
        </Box>
      </Box>
    </Box>
  );
}
