import { useState } from "react";

type LinkCreateFormProps = {
  onSubmit: (name: string, url: string) => void;
};
// TODO
export function LinkCreateForm({ onSubmit }: LinkCreateFormProps) {
  const [linkName, setLinkName] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(linkName, linkUrl);
      }}
    >
      <input
        placeholder="Link name"
        value={linkName}
        onChange={(event) => setLinkName(event.target.value)}
      />
      <input
        placeholder="example.com"
        value={linkUrl}
        onChange={(event) => setLinkUrl(event.target.value)}
      />
      <button type="submit">Add link</button>
    </form>
  );
}
