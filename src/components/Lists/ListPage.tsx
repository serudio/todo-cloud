import { useState } from "react";
import { useDecisionLists } from "../../hooks/lists";
import { listsPath, navigate } from "../../hooks/route";
import { ListEditor } from "./ListEditor";
import { ShareDialog } from "./ShareDialog";

type Props = {
  userId: string;
  listId: string;
};

export const ListPage: React.FC<Props> = ({ userId, listId }) => {
  const { lists } = useDecisionLists(userId);
  const [isSharing, setIsSharing] = useState(false);
  const shareToken = lists.find((list) => list.id === listId)?.shareToken ?? null;

  return (
    <>
      <ListEditor listId={listId} onBack={() => navigate(listsPath)} onShare={() => setIsSharing(true)} />
      <ShareDialog shareToken={isSharing ? shareToken : null} onClose={() => setIsSharing(false)} />
    </>
  );
};
