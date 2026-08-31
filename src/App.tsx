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
import { Box, Drawer } from "@mui/material";
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

    showLeftMenu,
    handleLeftMenuClick,
    showRightMenu,
    handleRightMenuClick,
    showTopMenu,
    handleTopMenuClick,

    todos,
    deletedTodos,
    deleteTodo,
    updateTodo,
    updateTodos,
    clearDeletedItems,
    removeDeletedItem,
    restoreDeletedItem,
    isLoadingTodos,

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
        updateTodos={updateTodos}
        setNotification={setNotification}
      />

      <Box
        sx={{
          paddingTop: 1,
          minHeight: "calc(100vh - 16px)",
          width: "min(1300px, calc(100% - 32px))",
          display: "flex",
          justifyContent: "center",
          gap: 2,
          margin: "0 auto",
        }}
      >
        <Drawer open={showTopMenu} onClose={handleTopMenuClick} anchor="top">
          <LinksCard links={links} updateLinks={updateLinks} setNotification={setNotification} />
        </Drawer>
        <Drawer open={showLeftMenu} onClose={handleLeftMenuClick} variant="persistent" anchor="left">
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              width: 250,
              p: 1,
            }}
          >
            <TagsCard tags={tags} updateTags={updateTags} setNotification={setNotification} onDeleteTag={deleteTag} />
            <LinksCard links={links} updateLinks={updateLinks} setNotification={setNotification} />
            <NotNowList tags={tags} todos={todos} updateTodo={updateTodo} />
            <NotesCard notes={notes} setNotes={updateNotes} />
          </Box>
        </Drawer>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            flex: 1,
            maxWidth: 1000,
          }}
        >
          <Header
            isLoadingTodos={isLoadingTodos}
            onRefresh={refreshTodoList}
            onLeftMenuClick={handleLeftMenuClick}
            onRightMenuClick={handleRightMenuClick}
            onTopMenuClick={handleTopMenuClick}
            email={session.user.email}
          />
          <TodoCloud todos={todos} updateTodo={updateTodo} isLoadingTodos={isLoadingTodos} tags={tags} />
        </Box>

        <Drawer open={showRightMenu} onClose={handleRightMenuClick} anchor="right" variant="persistent">
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              width: 250,
              p: 1,
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
        </Drawer>
      </Box>
    </Box>
  );
}
