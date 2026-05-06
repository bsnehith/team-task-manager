import clsx from "clsx";

const statusColorMap = {
  TODO: "bg-slate-700/80 text-slate-100",
  IN_PROGRESS: "bg-amber-500/20 text-amber-300",
  DONE: "bg-emerald-500/20 text-emerald-300",
};

export default function StatusBadge({ status = "TODO" }) {
  return (
    <span
      className={clsx(
        "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
        statusColorMap[status] || statusColorMap.TODO,
      )}
    >
      {status.replace("_", " ")}
    </span>
  );
}
