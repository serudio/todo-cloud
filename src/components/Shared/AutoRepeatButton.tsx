type Props = {
  onClick: () => void;
};
export const AutoRepeatButton: React.FC<Props> = ({ onClick }) => {
  return (
    <button
      className="todo-repeat"
      title="Repeat at midnight"
      type="button"
      onClick={onClick}
    >
      <svg viewBox="0 0 20 20" focusable="false" aria-hidden="true">
        <path d="M15.8 5.4A6.7 6.7 0 0 0 4.4 4.1l1.2 1.2a5 5 0 0 1 8.9 2.9H12l3.6 3.6 3.6-3.6h-2.9a6.7 6.7 0 0 0-.5-2.8ZM4.2 14.6a6.7 6.7 0 0 0 11.4 1.3l-1.2-1.2a5 5 0 0 1-8.9-2.9H8L4.4 8.2.8 11.8h2.9c0 1 .2 1.9.5 2.8Z" />
      </svg>
    </button>
  );
};
