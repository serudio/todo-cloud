import { type FormEvent } from "react";

type LinkCreateFormProps = {
  name: string;
  url: string;
  onNameChange: (name: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onUrlChange: (url: string) => void;
};

export function LinkCreateForm({
  name,
  url,
  onNameChange,
  onSubmit,
  onUrlChange,
}: LinkCreateFormProps) {
  return (
    <form className="link-form" onSubmit={onSubmit}>
      <input
        placeholder="Link name"
        value={name}
        onChange={(event) => onNameChange(event.target.value)}
      />
      <input
        placeholder="example.com"
        value={url}
        onChange={(event) => onUrlChange(event.target.value)}
      />
      <button type="submit">Add link</button>
    </form>
  );
}
