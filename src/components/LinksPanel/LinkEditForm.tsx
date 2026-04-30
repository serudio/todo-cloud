import { type FormEvent, type KeyboardEvent, type RefObject } from "react";

type LinkEditFormProps = {
  inputRef: RefObject<HTMLInputElement | null>;
  name: string;
  url: string;
  onCancel: () => void;
  onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  onNameChange: (name: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onUrlChange: (url: string) => void;
};

export function LinkEditForm({
  inputRef,
  name,
  url,
  onCancel,
  onKeyDown,
  onNameChange,
  onSubmit,
  onUrlChange,
}: LinkEditFormProps) {
  return (
    <form className="link-edit-form" onSubmit={onSubmit}>
      <input
        ref={inputRef}
        value={name}
        onChange={(event) => onNameChange(event.target.value)}
        onKeyDown={onKeyDown}
      />
      <input
        value={url}
        onChange={(event) => onUrlChange(event.target.value)}
        onKeyDown={onKeyDown}
      />
      <div className="link-edit-actions">
        <button type="submit">Save</button>
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
