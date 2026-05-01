type Props = {
  onClick: () => void;
};

export const TodoEditButton: React.FC<Props> = ({ onClick }) => {
  <button className="todo-edit" type="button" onClick={onClick}>
    <svg viewBox="0 0 20 20" focusable="false" aria-hidden="true">
      <path d="M4 13.5V16h2.5L14 8.5 11.5 6 4 13.5Zm11-6 1-1a1.4 1.4 0 0 0 0-2l-.5-.5a1.4 1.4 0 0 0-2 0l-1 1L15 7.5Z" />
    </svg>
  </button>;
};
