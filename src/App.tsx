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
import { listsPath, navigate, pointsPath, useRoute } from "./hooks/route.ts";
import { useIsMobile } from "./hooks/mobile.ts";
import { ListsPage } from "./components/Lists/ListsPage";
import { ListPage } from "./components/Lists/ListPage";
import { ListEditor } from "./components/Lists/ListEditor";
import { PointsPage } from "./components/Points/PointsPage";
import { GoalPage } from "./components/Points/GoalPage";

// A page wrapper for routes that are not the todo cloud itself.
const PageLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Box sx={{ bgcolor: "background.body", color: "text.primary", minHeight: "100vh" }}>
    <Box sx={{ width: "min(1100px, calc(100% - 32px))", margin: "0 auto", paddingTop: 2, paddingBottom: 4 }}>
      {children}
    </Box>
  </Box>
);

export default function App() {
  const route = useRoute();
  const isMobile = useIsMobile();
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
    isCloudSortedByName,
    handleCloudSortClick,
    search,
    setSearch,

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

  // Share links open without an account, so this route comes before the auth gate.
  if (route.name === "shared") {
    return (
      <PageLayout>
        <ListEditor shareToken={route.shareToken} />
      </PageLayout>
    );
  }

  if (!session) return <AuthCard />;
  if (isLoadingSession) return <LoadingComponent loading />;

  if (route.name === "lists") {
    return (
      <PageLayout>
        <ListsPage userId={session.user.id} />
      </PageLayout>
    );
  }

  if (route.name === "list") {
    return (
      <PageLayout>
        <ListPage userId={session.user.id} listId={route.listId} />
      </PageLayout>
    );
  }

  if (route.name === "points") {
    return (
      <PageLayout>
        <PointsPage userId={session.user.id} />
      </PageLayout>
    );
  }

  if (route.name === "goal") {
    return (
      <PageLayout>
        <GoalPage userId={session.user.id} goalId={route.goalId} />
      </PageLayout>
    );
  }

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
          // The add-task bar is fixed to the bottom, so the last task needs room to
          // scroll clear of it instead of ending up underneath.
          paddingBottom: { xs: 10, md: 12 },
          minHeight: "calc(100vh - 16px)",
          width: "min(1300px, calc(100% - 16px))",
          display: "flex",
          justifyContent: "center",
          gap: 2,
          margin: "0 auto",
        }}
      >
        <Drawer open={showTopMenu} onClose={handleTopMenuClick} anchor="top">
          <LinksCard links={links} updateLinks={updateLinks} setNotification={setNotification} search={search} />
        </Drawer>
        <Drawer
          open={showLeftMenu}
          onClose={handleLeftMenuClick}
          variant={isMobile ? "temporary" : "persistent"}
          anchor="left"
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              width: 250,
              p: 1,
            }}
          >
            <TagsCard
              tags={tags}
              updateTags={updateTags}
              setNotification={setNotification}
              search={search}
              onDeleteTag={deleteTag}
            />
            <LinksCard links={links} updateLinks={updateLinks} setNotification={setNotification} search={search} />
            <NotNowList tags={tags} todos={todos} updateTodo={updateTodo} search={search} />
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
            onListsClick={() => navigate(listsPath)}
            onPointsClick={() => navigate(pointsPath)}
            isCloudSortedByName={isCloudSortedByName}
            onCloudSortClick={handleCloudSortClick}
            search={search}
            onSearchChange={setSearch}
            email={session.user.email}
          />
          <TodoCloud
            todos={todos}
            updateTodo={updateTodo}
            isLoadingTodos={isLoadingTodos}
            isSortedByName={isCloudSortedByName}
            search={search}
            tags={tags}
            deleteTodo={deleteTodo}
          />
        </Box>

        <Drawer
          open={showRightMenu}
          onClose={handleRightMenuClick}
          anchor="right"
          variant={isMobile ? "temporary" : "persistent"}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              width: 250,
              p: 1,
            }}
          >
            <DoneCard todos={todos} updateTodo={updateTodo} tags={tags} search={search} onDeleteTodo={deleteTodo} />
            <DeletedCard
              deletedTodos={deletedTodos}
              search={search}
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
